import type { AiTurn } from './schema.js';
import type { GameSession, RecentScene } from './state.js';
import { DEFAULTS } from './state.js';
import { logger } from '../shared/logger.js';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function truncateOnSentence(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  const truncated = text.slice(0, maxLen);
  const lastPeriod = truncated.lastIndexOf('.');
  if (lastPeriod > maxLen * 0.5) {
    return truncated.slice(0, lastPeriod + 1);
  }
  return truncated;
}

export function applyTurn(
  session: GameSession,
  turn: AiTurn,
  chosenChoice: string | null,
  now: string,
): GameSession {
  const next = structuredClone(session);
  const newChapter = session.chapter + 1;

  // Build recent scene from the outgoing current scene
  if (session.currentScene.story && chosenChoice !== null) {
    const recentScene: RecentScene = {
      chapter: session.currentScene.chapter,
      title: session.currentScene.title,
      excerpt: session.currentScene.story.slice(0, DEFAULTS.RECENT_SCENES_EXCERPT_LENGTH),
      chosen: chosenChoice,
    };
    next.recentScenes = [...session.recentScenes, recentScene].slice(
      -DEFAULTS.RECENT_SCENES_COUNT,
    );
  }

  // Update chapter and version
  next.chapter = newChapter;
  next.version = session.version + 1;
  next.title = turn.chapterTitle;
  next.updatedAt = now;
  next.gsi1sk = now;

  // Update current scene
  next.currentScene = {
    chapter: newChapter,
    title: turn.chapterTitle,
    story: turn.story,
    choices: turn.isEnding ? [] : turn.choices,
  };

  // Apply state changes (deltas only, whitelisted keys)
  if (turn.stateChanges) {
    const allowedKeys = ['health', 'gold', 'reputation'] as const;
    for (const key of allowedKeys) {
      const delta = turn.stateChanges[key];
      if (delta !== undefined) {
        const clamped = clamp(delta, -50, 50);
        if (key === 'health') {
          next.player.health = clamp(
            session.player.health + clamped,
            0,
            session.player.maxHealth,
          );
        } else if (key === 'gold') {
          next.player.gold = Math.max(0, session.player.gold + clamped);
        } else if (key === 'reputation') {
          next.player.reputation = clamp(
            session.player.reputation + clamped,
            DEFAULTS.REPUTATION_MIN,
            DEFAULTS.REPUTATION_MAX,
          );
        }
      }
    }
    // Log unknown keys
    const unknownKeys = Object.keys(turn.stateChanges).filter(
      (k) => !(['health', 'gold', 'reputation'] as string[]).includes(k),
    );
    if (unknownKeys.length > 0) {
      logger.warn('Unknown stateChanges keys dropped', {
        sessionId: session.sessionId,
        keys: unknownKeys,
      });
    }
  }

  // Inventory add
  for (const item of turn.inventoryAdd) {
    const trimmed = item.slice(0, DEFAULTS.ITEM_MAX_CHARS);
    if (next.player.inventory.length >= DEFAULTS.MAX_INVENTORY) {
      const dropped = next.player.inventory.shift();
      next.world.events.push(`Lost ${dropped} to make room for ${trimmed}.`);
    }
    next.player.inventory.push(trimmed);
  }

  // Inventory remove
  for (const item of turn.inventoryRemove) {
    const idx = next.player.inventory.findIndex(
      (i) => i.toLowerCase() === item.toLowerCase(),
    );
    if (idx !== -1) {
      next.player.inventory.splice(idx, 1);
    }
  }

  // NPC updates
  for (const npcUpdate of turn.npcUpdates) {
    const existing = next.npcs[npcUpdate.id];
    if (existing) {
      existing.disposition = clamp(
        existing.disposition + clamp(npcUpdate.dispositionDelta, -50, 50),
        DEFAULTS.DISPOSITION_MIN,
        DEFAULTS.DISPOSITION_MAX,
      );
      existing.lastSeenChapter = newChapter;
      existing.note = npcUpdate.note;
      existing.name = npcUpdate.name;
    } else if (Object.keys(next.npcs).length < DEFAULTS.MAX_NPCS) {
      next.npcs[npcUpdate.id] = {
        name: npcUpdate.name,
        disposition: clamp(npcUpdate.dispositionDelta, DEFAULTS.DISPOSITION_MIN, DEFAULTS.DISPOSITION_MAX),
        lastSeenChapter: newChapter,
        note: npcUpdate.note,
      };
    }
  }

  // Secrets (deduplicated case-insensitively)
  for (const secret of turn.secretsDiscovered) {
    const lower = secret.toLowerCase();
    if (
      next.world.secrets.length < DEFAULTS.MAX_SECRETS &&
      !next.world.secrets.some((s) => s.toLowerCase() === lower)
    ) {
      next.world.secrets.push(secret.slice(0, 200));
    }
  }

  // Events (FIFO capped)
  for (const event of turn.events) {
    next.world.events.push(event.slice(0, 200));
  }
  if (next.world.events.length > DEFAULTS.MAX_EVENTS) {
    next.world.events = next.world.events.slice(-DEFAULTS.MAX_EVENTS);
  }

  // Summary
  next.summary = truncateOnSentence(turn.summaryUpdate, DEFAULTS.MAX_SUMMARY_CHARS);

  // Handle ending
  if (turn.isEnding) {
    next.status = 'ended';
    next.endingReason = 'finale';
  }

  // Handle death
  if (next.player.health <= 0) {
    next.status = 'ended';
    next.endingReason = 'death';
    next.currentScene.choices = [];
  }

  // Handle max chapters
  const maxChapters = parseInt(process.env['MAX_CHAPTERS'] || '25', 10);
  if (newChapter >= maxChapters) {
    next.status = 'ended';
    next.endingReason = 'finale';
    next.currentScene.choices = [];
  }

  return next;
}
