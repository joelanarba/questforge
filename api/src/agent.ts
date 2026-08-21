import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { getOpenAIClient, getModel } from './ai/client.js';
import { GENRES, ARCHETYPES } from './domain/content.js';
import { logger } from './shared/logger.js';

const TABLE_NAME = process.env['TABLE_NAME'] || 'questforge';
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Fetch the OpenAI API key from SSM at cold start
const ssmParamName = process.env['OPENAI_API_KEY_PARAM'];
if (ssmParamName && !process.env['OPENAI_API_KEY']) {
  try {
    const ssmClient = new SSMClient({});
    const command = new GetParameterCommand({ Name: ssmParamName, WithDecryption: true });
    const response = await ssmClient.send(command);
    if (response.Parameter?.Value) {
      process.env['OPENAI_API_KEY'] = response.Parameter.Value;
      logger.info('Loaded OpenAI API key from SSM');
    }
  } catch (error) {
    logger.error('Failed to load OpenAI API key from SSM', { error: String(error) });
  }
}

const DAILY_QUEST_SCHEMA = {
  name: 'daily_quest',
  strict: true,
  schema: {
    type: 'object' as const,
    properties: {
      title: { type: 'string' as const },
      tagline: { type: 'string' as const },
      story: { type: 'string' as const },
      choices: {
        type: 'array' as const,
        items: {
          type: 'object' as const,
          properties: {
            id: { type: 'string' as const, enum: ['A', 'B', 'C'] },
            text: { type: 'string' as const },
          },
          required: ['id', 'text'],
          additionalProperties: false,
        },
      },
    },
    required: ['title', 'tagline', 'story', 'choices'],
    additionalProperties: false,
  },
};

export async function handler(event: any): Promise<void> {
  logger.info('Daily Quest Agent triggered', { event });

  try {
    const date = new Date();
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Pick genre and archetype based on the day of the week to ensure variety
    const genre = GENRES[dayOfWeek % GENRES.length]!;
    const archetype = ARCHETYPES[dayOfWeek % ARCHETYPES.length]!;

    logger.info('Generating daily quest', { dateString, genre: genre.id, archetype: archetype.id });

    const openAiClient = getOpenAIClient();
    const model = getModel();

    const systemPrompt = `You are a creative writer generating a "Quest of the Day" for an interactive text adventure game.
Genre: ${genre.name} - ${genre.description}
Theme: ${genre.toneBlock}

Archetype: ${archetype.name} - ${archetype.description}
Theme: ${archetype.toneBlock}

Generate a short prologue (150-200 words) that sets up an interesting situation.
Provide exactly 3 choices for the player to begin their journey.
Provide a catchy title (max 40 chars) and a short tagline (max 100 chars).
Write in second person, present tense.`;

    const response = await openAiClient.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate the daily quest prologue.' },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: DAILY_QUEST_SCHEMA,
      },
      temperature: 0.8,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const questData = JSON.parse(content);

    const dailyQuestItem = {
      pk: 'DAILY_QUEST',
      sk: `DATE#${dateString}`,
      genreId: genre.id,
      archetypeId: archetype.id,
      ...questData,
      createdAt: new Date().toISOString(),
      expiresAt: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // Expire after 7 days
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: dailyQuestItem,
      })
    );

    logger.info('Successfully saved daily quest', { dateString, title: questData.title });
  } catch (error) {
    logger.error('Failed to generate daily quest', { error: String(error) });
    throw error;
  }
}
