import type { Choice } from './schema.js';

export interface PlayerState {
  health: number;
  maxHealth: number;
  gold: number;
  reputation: number;
  inventory: string[];
}

export interface NpcState {
  name: string;
  disposition: number;
  lastSeenChapter: number;
  note: string;
}

export interface WorldState {
  flags: Record<string, boolean>;
  secrets: string[];
  events: string[];
}

export interface SceneState {
  chapter: number;
  title: string;
  story: string;
  choices: Choice[];
}

export interface RecentScene {
  chapter: number;
  title: string;
  excerpt: string;
  chosen: string;
}

export interface GameSession {
  sessionId: string;
  playerId: string;
  genre: string;
  archetype: string;
  chapter: number;
  version: number;
  status: 'active' | 'ended';
  endingReason: 'death' | 'finale' | 'abandoned' | null;
  title: string;
  summary: string;
  recentScenes: RecentScene[];
  currentScene: SceneState;
  player: PlayerState;
  world: WorldState;
  npcs: Record<string, NpcState>;
  createdAt: string;
  updatedAt: string;
  expiresAt: number;
  // DynamoDB keys
  pk: string;
  sk: string;
  gsi1pk: string;
  gsi1sk: string;
}

export const DEFAULTS = {
  MAX_HEALTH: 100,
  STARTING_HEALTH: 100,
  STARTING_GOLD: 20,
  STARTING_REPUTATION: 0,
  MAX_INVENTORY: 12,
  MAX_SECRETS: 15,
  MAX_EVENTS: 25,
  MAX_NPCS: 12,
  MAX_SUMMARY_CHARS: 900,
  MAX_CHAPTERS: 25,
  ITEM_MAX_CHARS: 40,
  REPUTATION_MIN: -100,
  REPUTATION_MAX: 100,
  DISPOSITION_MIN: -100,
  DISPOSITION_MAX: 100,
  RECENT_SCENES_COUNT: 2,
  RECENT_SCENES_EXCERPT_LENGTH: 400,
  SESSION_TTL_DAYS: 30,
} as const;

export function createInitialSession(params: {
  sessionId: string;
  playerId: string;
  genre: string;
  archetype: string;
  now: string;
}): GameSession {
  const { sessionId, playerId, genre, archetype, now } = params;
  const ttl = Math.floor(new Date(now).getTime() / 1000) + DEFAULTS.SESSION_TTL_DAYS * 86400;

  return {
    sessionId,
    playerId,
    genre,
    archetype,
    chapter: 0,
    version: 0,
    status: 'active',
    endingReason: null,
    title: '',
    summary: '',
    recentScenes: [],
    currentScene: { chapter: 0, title: '', story: '', choices: [] },
    player: {
      health: DEFAULTS.STARTING_HEALTH,
      maxHealth: DEFAULTS.MAX_HEALTH,
      gold: DEFAULTS.STARTING_GOLD,
      reputation: DEFAULTS.STARTING_REPUTATION,
      inventory: [],
    },
    world: { flags: {}, secrets: [], events: [] },
    npcs: {},
    createdAt: now,
    updatedAt: now,
    expiresAt: ttl,
    pk: `SESSION#${sessionId}`,
    sk: 'META',
    gsi1pk: `PLAYER#${playerId}`,
    gsi1sk: now,
  };
}
