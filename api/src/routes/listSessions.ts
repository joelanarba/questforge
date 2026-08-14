import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { jsonResponse, toSessionView } from '../shared/http.js';
import { ValidationError } from '../shared/errors.js';
import { listPlayerSessions } from '../persistence/sessions.js';

export async function handleListSessions(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> {
  const origin = event.headers?.['origin'];
  // Extract playerId from the path: /players/{playerId}/sessions
  const playerId = event.pathParameters?.['playerId'];
  if (!playerId) {
    throw new ValidationError('Missing playerId');
  }

  const sessions = await listPlayerSessions(playerId);

  const sessionViews = sessions.map((s) => toSessionView(s as unknown as Record<string, unknown>));

  return jsonResponse(200, { sessions: sessionViews }, origin);
}
