import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { jsonResponse, toSessionView } from '../shared/http.js';
import { ValidationError, NotFoundError } from '../shared/errors.js';
import { getSession } from '../persistence/sessions.js';

export async function handleGetSession(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> {
  const origin = event.headers?.['origin'];
  const sessionId = event.pathParameters?.['sessionId'];
  if (!sessionId) {
    throw new ValidationError('Missing sessionId');
  }

  const session = await getSession(sessionId);
  if (!session) {
    throw new NotFoundError('Session not found');
  }

  return jsonResponse(200, toSessionView(session as unknown as Record<string, unknown>), origin);
}
