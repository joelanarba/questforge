import type { APIGatewayProxyResultV2 } from 'aws-lambda';
import { AppError } from './errors.js';
import { logger } from './logger.js';

export function jsonResponse(
  statusCode: number,
  body: unknown,
  origin?: string,
): APIGatewayProxyResultV2 {
  const allowedOrigin = getAllowedOrigin(origin);
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...(allowedOrigin
        ? {
            'Access-Control-Allow-Origin': allowedOrigin,
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
          }
        : {}),
    },
    body: JSON.stringify(body),
  };
}

export function errorResponse(
  error: unknown,
  origin?: string,
): APIGatewayProxyResultV2 {
  if (error instanceof AppError) {
    return jsonResponse(
      error.statusCode,
      { error: { code: error.code, message: error.message } },
      origin,
    );
  }
  logger.error('Unhandled error', {
    error: error instanceof Error ? error.message : String(error),
  });
  return jsonResponse(
    500,
    { error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' } },
    origin,
  );
}

function getAllowedOrigin(requestOrigin?: string): string | undefined {
  if (!requestOrigin) return undefined;
  const allowed = (process.env['ALLOWED_ORIGIN'] || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim());
  return allowed.includes(requestOrigin) ? requestOrigin : undefined;
}

// Strip DynamoDB internal fields from session before sending to client
export function toSessionView(session: Record<string, unknown>): Record<string, unknown> {
  const {
    pk: _pk,
    sk: _sk,
    gsi1pk: _gsi1pk,
    gsi1sk: _gsi1sk,
    expiresAt: _exp,
    ...view
  } = session;
  return view;
}
