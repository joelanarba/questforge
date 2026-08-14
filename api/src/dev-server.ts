import express from 'express';
import { handler } from './handler.js';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env');
if (existsSync(envPath)) {
  config({ path: envPath });
}

const app = express();
app.use(express.json());

// Convert Express req/res to a mock APIGatewayProxyEventV2
function toEvent(req: express.Request): APIGatewayProxyEventV2 {
  return {
    version: '2.0',
    routeKey: `${req.method} ${req.path}`,
    rawPath: req.path,
    rawQueryString: '',
    headers: req.headers as Record<string, string>,
    requestContext: {
      accountId: 'local',
      apiId: 'local',
      domainName: 'localhost',
      domainPrefix: 'localhost',
      http: {
        method: req.method,
        path: req.path,
        protocol: 'HTTP/1.1',
        sourceIp: '127.0.0.1',
        userAgent: req.headers['user-agent'] || '',
      },
      requestId: `local-${Date.now()}`,
      routeKey: `${req.method} ${req.path}`,
      stage: '$default',
      time: new Date().toISOString(),
      timeEpoch: Date.now(),
    },
    pathParameters: extractPathParams(req.path),
    body: req.body ? JSON.stringify(req.body) : undefined,
    isBase64Encoded: false,
  };
}

function extractPathParams(path: string): Record<string, string> {
  // Match /sessions/:sessionId and /sessions/:sessionId/choices
  const sessionMatch = path.match(/^\/sessions\/([^/]+)/);
  if (sessionMatch && sessionMatch[1]) {
    return { sessionId: sessionMatch[1] };
  }
  return {};
}

app.all('*', async (req, res) => {
  const event = toEvent(req);
  const result = await handler(event);

  if (typeof result === 'object' && result !== null && 'statusCode' in result) {
    const response = result as { statusCode: number; headers?: Record<string, string>; body?: string };
    if (response.headers) {
      for (const [key, value] of Object.entries(response.headers)) {
        res.setHeader(key, String(value));
      }
    }
    res.status(response.statusCode).send(response.body || '');
  } else {
    res.status(200).send(result);
  }
});

const PORT = process.env['PORT'] || 3001;
app.listen(PORT, () => {
  console.log(`QuestForge API dev server running on http://localhost:${PORT}`);
});
