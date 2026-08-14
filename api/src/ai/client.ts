import OpenAI from 'openai';
import { logger } from '../shared/logger.js';

let cachedClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (cachedClient) return cachedClient;

  const apiKey = process.env['OPENAI_API_KEY'];
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  cachedClient = new OpenAI({ apiKey, timeout: 24000 });
  logger.info('OpenAI client initialized');
  return cachedClient;
}

export function getModel(): string {
  return process.env['OPENAI_MODEL'] || 'gpt-4o-mini';
}
