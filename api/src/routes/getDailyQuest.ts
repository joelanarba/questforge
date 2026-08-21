import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { jsonResponse, errorResponse } from '../shared/http.js';
import { logger } from '../shared/logger.js';

const TABLE_NAME = process.env['TABLE_NAME'] || 'questforge';
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export async function handleGetDailyQuest(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> {
  const origin = event.headers?.['origin'];

  try {
    // Query the most recent daily quest
    // Since sk is DATE#YYYY-MM-DD, a backward scan will return the latest date
    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: 'pk = :pk AND begins_with(sk, :skPrefix)',
        ExpressionAttributeValues: {
          ':pk': 'DAILY_QUEST',
          ':skPrefix': 'DATE#',
        },
        ScanIndexForward: false, // Newest date first
        Limit: 1,
      }),
    );

    const dailyQuest = result.Items?.[0];

    if (!dailyQuest) {
      return jsonResponse(404, { error: { code: 'NOT_FOUND', message: 'No daily quest available' } }, origin);
    }

    return jsonResponse(200, dailyQuest, origin);
  } catch (error) {
    logger.error('Failed to get daily quest', { error: String(error) });
    return errorResponse(error, origin);
  }
}
