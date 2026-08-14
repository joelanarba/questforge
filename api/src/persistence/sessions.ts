import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, QueryCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import type { GameSession } from '../domain/state.js';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env['TABLE_NAME'] || 'questforge';

export class VersionConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VersionConflictError';
  }
}

export async function getSession(sessionId: string): Promise<GameSession | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { pk: `SESSION#${sessionId}`, sk: 'META' },
    }),
  );
  return (result.Item as GameSession) || null;
}

export async function saveSession(session: GameSession): Promise<void> {
  const condition = session.version > 0
    ? 'attribute_exists(pk) AND version = :expectedVersion'
    : 'attribute_not_exists(pk)';

  const ExpressionAttributeValues = session.version > 0
    ? { ':expectedVersion': session.version - 1 }
    : undefined;

  try {
    // Write both META and CHAPTER record
    // The CHAPTER record doesn't need optimistic locking since it's immutable
    const chapterSk = `CHAPTER#${String(session.chapter).padStart(6, '0')}`;
    const chapterItem = {
      pk: session.pk,
      sk: chapterSk,
      sessionId: session.sessionId,
      chapter: session.chapter,
      title: session.title,
      story: session.currentScene.story,
      choices: session.currentScene.choices,
      events: session.world.events,
      createdAt: session.updatedAt,
      expiresAt: session.expiresAt
    };

    await docClient.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Put: {
              TableName: TABLE_NAME,
              Item: session,
              ConditionExpression: condition,
              ExpressionAttributeValues,
            }
          },
          {
            Put: {
              TableName: TABLE_NAME,
              Item: chapterItem
            }
          }
        ]
      })
    );
  } catch (error: any) {
    if (
      error.name === 'ConditionalCheckFailedException' || 
      error.name === 'TransactionCanceledException' && error.message.includes('ConditionalCheckFailed')
    ) {
      throw new VersionConflictError('Session version mismatch');
    }
    throw error;
  }
}

export async function listPlayerSessions(playerId: string): Promise<GameSession[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'gsi1',
      KeyConditionExpression: 'gsi1pk = :pk',
      ExpressionAttributeValues: {
        ':pk': `PLAYER#${playerId}`,
      },
      ScanIndexForward: false, // Newest first
      Limit: 20,
    }),
  );
  return (result.Items || []) as GameSession[];
}
