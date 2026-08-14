import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { ContinueSessionRequestSchema } from '../domain/schema.js';
import { generateTurn } from '../ai/turn.js';
import { applyTurn } from '../domain/reducer.js';
import { jsonResponse, toSessionView } from '../shared/http.js';
import { ValidationError, NotFoundError, ConflictError, GoneError } from '../shared/errors.js';
import { logger } from '../shared/logger.js';
import { getSession, saveSession, VersionConflictError } from '../persistence/sessions.js';

export async function handleContinueAdventure(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> {
  const origin = event.headers?.['origin'];
  const sessionId = event.pathParameters?.['sessionId'];
  if (!sessionId) {
    throw new ValidationError('Missing sessionId');
  }

  const body = event.body ? JSON.parse(event.body) as unknown : undefined;
  const parsed = ContinueSessionRequestSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '),
    );
  }

  const { choiceId, expectedVersion } = parsed.data;

  // Load session from DynamoDB
  const session = await getSession(sessionId);
  if (!session) {
    throw new NotFoundError('Session not found');
  }

  // Check version for optimistic locking
  if (session.version !== expectedVersion) {
    throw new ConflictError('Session version mismatch. The page may be stale.');
  }

  // Check if session already ended
  if (session.status === 'ended') {
    throw new GoneError('This adventure has already ended.');
  }

  // Resolve choice ID to text
  const choice = session.currentScene.choices.find((c) => c.id === choiceId);
  if (!choice) {
    throw new ValidationError(`Unknown choice ID: ${choiceId}`);
  }

  logger.info('Continuing adventure', {
    sessionId,
    chapter: session.chapter,
    choiceId,
    choiceText: choice.text,
  });

  // Generate next chapter
  const turn = await generateTurn(session, choice.text);
  const now = new Date().toISOString();
  const nextSession = applyTurn(session, turn, choice.text, now);

  // Store updated session
  try {
    await saveSession(nextSession);
  } catch (err) {
    if (err instanceof VersionConflictError) {
      throw new ConflictError('Session version mismatch. The page may be stale.');
    }
    throw err;
  }

  logger.info('Adventure continued', {
    sessionId,
    chapter: nextSession.chapter,
    status: nextSession.status,
  });

  return jsonResponse(200, toSessionView(nextSession as unknown as Record<string, unknown>), origin);
}
