import { getOpenAIClient, getModel } from './client.js';
import { AiTurnSchema } from '../domain/schema.js';
import type { AiTurn } from '../domain/schema.js';
import type { GameSession } from '../domain/state.js';
import { buildSystemPrompt, buildUserPrompt } from './prompt.js';
import { AiError } from '../shared/errors.js';
import { logger } from '../shared/logger.js';

// Response JSON schema
const AI_TURN_JSON_SCHEMA = {
  name: 'ai_turn',
  strict: true,
  schema: {
    type: 'object' as const,
    properties: {
      chapterTitle: { type: 'string' as const },
      story: { type: 'string' as const },
      choices: {
        type: 'array' as const,
        items: {
          type: 'object' as const,
          properties: {
            id: { type: 'string' as const, enum: ['A', 'B', 'C', 'D'] },
            text: { type: 'string' as const },
          },
          required: ['id', 'text'],
          additionalProperties: false,
        },
      },
      stateChanges: {
        type: 'object' as const,
        properties: {
          health: { type: ['integer', 'null'] as const },
          gold: { type: ['integer', 'null'] as const },
          reputation: { type: ['integer', 'null'] as const },
        },
        required: ['health', 'gold', 'reputation'],
        additionalProperties: false,
      },
      inventoryAdd: { type: 'array' as const, items: { type: 'string' as const } },
      inventoryRemove: { type: 'array' as const, items: { type: 'string' as const } },
      npcUpdates: {
        type: 'array' as const,
        items: {
          type: 'object' as const,
          properties: {
            id: { type: 'string' as const },
            name: { type: 'string' as const },
            dispositionDelta: { type: 'integer' as const },
            note: { type: 'string' as const },
          },
          required: ['id', 'name', 'dispositionDelta', 'note'],
          additionalProperties: false,
        },
      },
      secretsDiscovered: { type: 'array' as const, items: { type: 'string' as const } },
      events: { type: 'array' as const, items: { type: 'string' as const } },
      summaryUpdate: { type: 'string' as const },
      isEnding: { type: 'boolean' as const },
    },
    required: [
      'chapterTitle', 'story', 'choices', 'stateChanges',
      'inventoryAdd', 'inventoryRemove', 'npcUpdates',
      'secretsDiscovered', 'events', 'summaryUpdate', 'isEnding',
    ],
    additionalProperties: false,
  },
};

export async function generateTurn(
  session: GameSession,
  chosenChoiceText: string | null,
): Promise<AiTurn> {
  const client = getOpenAIClient();
  const model = getModel();
  const systemPrompt = buildSystemPrompt(session);
  const userPrompt = buildUserPrompt(session, chosenChoiceText);

  logger.debug('Generating turn', {
    sessionId: session.sessionId,
    chapter: session.chapter + 1,
    model,
  });

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const messages: Array<{ role: 'system' | 'user'; content: string }> = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ];

      if (attempt === 1 && lastError) {
        messages.push({
          role: 'user',
          content: `Your previous response failed validation: ${lastError.message}. Please fix these issues and respond again.`,
        });
      }

      const response = await client.chat.completions.create({
        model,
        messages,
        response_format: {
          type: 'json_schema',
          json_schema: AI_TURN_JSON_SCHEMA,
        },
        temperature: 0.8,
        max_tokens: 1500,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      const parsed = JSON.parse(content) as unknown;
      const validated = AiTurnSchema.parse(parsed);

      logger.debug('Turn generated successfully', {
        sessionId: session.sessionId,
        chapter: session.chapter + 1,
        attempt,
      });

      return validated;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      logger.error('Turn generation failed', {
        sessionId: session.sessionId,
        chapter: session.chapter + 1,
        attempt,
        error: lastError.message.slice(0, 2000),
      });

      if (attempt === 1) {
        throw new AiError(
          'The story engine could not generate a valid response. Please try again.',
        );
      }
    }
  }

  // TypeScript requires this but the loop always returns or throws
  throw new AiError('Unexpected error in turn generation.');
}
