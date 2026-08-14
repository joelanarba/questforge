import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { StartSessionRequestSchema } from '../domain/schema.js';
import { createInitialSession } from '../domain/state.js';
import { generateTurn } from '../ai/turn.js';
import { applyTurn } from '../domain/reducer.js';
import { generateSessionId } from '../shared/ids.js';
import { jsonResponse } from '../shared/http.js';
import { toSessionView } from '../shared/http.js';
import { ValidationError } from '../shared/errors.js';
import { logger } from '../shared/logger.js';
import { saveSession } from '../persistence/sessions.js';

export async function handleStartAdventure(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> {
  const origin = event.headers?.['origin'];
  const body = event.body ? JSON.parse(event.body) as unknown : undefined;
  const parsed = StartSessionRequestSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '),
    );
  }

  const { playerId, genre, archetype } = parsed.data;
  const sessionId = generateSessionId();
  const now = new Date().toISOString();

  logger.info('Starting new adventure', { sessionId, playerId, genre, archetype });

  let session = createInitialSession({ sessionId, playerId, genre, archetype, now });

  // Generate chapter 1
  const turn = await generateTurn(session, null);
  session = applyTurn(session, turn, null, now);

  // Store in DynamoDB
  await saveSession(session);

  logger.info('Adventure started', { sessionId, chapter: session.chapter });

  return jsonResponse(201, toSessionView(session as unknown as Record<string, unknown>), origin);
}
