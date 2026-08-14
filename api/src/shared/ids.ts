import { randomUUID } from 'node:crypto';

export function generateSessionId(): string {
  return randomUUID();
}

export function generatePlayerId(): string {
  return `anon_${randomUUID()}`;
}

export function padChapter(chapter: number): string {
  return String(chapter).padStart(6, '0');
}
