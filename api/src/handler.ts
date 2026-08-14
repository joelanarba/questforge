import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { handleStartAdventure } from './routes/startAdventure.js';
import { handleContinueAdventure } from './routes/continueAdventure.js';
import { handleGetSession } from './routes/getSession.js';
import { handleListSessions } from './routes/listSessions.js';
import { jsonResponse, errorResponse } from './shared/http.js';
import { logger } from './shared/logger.js';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

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

export async function handler(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> {
  const method = event.requestContext?.http?.method || '';
  const path = event.rawPath || '';
  const origin = event.headers?.['origin'];
  const requestId = event.requestContext?.requestId || 'local';

  logger.info('Request received', { method, path, requestId });
  const start = Date.now();

  try {
    // CORS preflight
    if (method === 'OPTIONS') {
      return jsonResponse(204, null, origin);
    }

    // Route dispatch
    if (method === 'POST' && path === '/sessions') {
      return await handleStartAdventure(event);
    }

    if (method === 'GET' && path.match(/^\/sessions\/[^/]+$/)) {
      return await handleGetSession(event);
    }

    if (method === 'POST' && path.match(/^\/sessions\/[^/]+\/choices$/)) {
      return await handleContinueAdventure(event);
    }

    if (method === 'GET' && path.match(/^\/players\/[^/]+\/sessions$/)) {
      return await handleListSessions(event);
    }

    return jsonResponse(404, { error: { code: 'NOT_FOUND', message: 'Route not found' } }, origin);
  } catch (error) {
    return errorResponse(error, origin);
  } finally {
    logger.info('Request completed', {
      method,
      path,
      requestId,
      durationMs: Date.now() - start,
    });
  }
}
