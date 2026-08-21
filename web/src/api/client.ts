const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface Choice {
  id: string;
  text: string;
}

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
  world: { flags: Record<string, boolean>; secrets: string[]; events: string[] };
  npcs: Record<string, NpcState>;
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  error: { code: string; message: string };
}

class QuestForgeClient {
  async startSession(playerId: string, genre: string, archetype: string): Promise<GameSession> {
    const res = await fetch(`${BASE_URL}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, genre, archetype }),
    });
    if (!res.ok) {
      const err = await res.json() as ApiError;
      throw new Error(err.error?.message || `HTTP ${res.status}`);
    }
    return res.json() as Promise<GameSession>;
  }

  async getSession(sessionId: string): Promise<GameSession> {
    const res = await fetch(`${BASE_URL}/sessions/${sessionId}`);
    if (!res.ok) {
      const err = await res.json() as ApiError;
      throw new Error(err.error?.message || `HTTP ${res.status}`);
    }
    return res.json() as Promise<GameSession>;
  }

  async continueSession(
    sessionId: string,
    playerId: string,
    choiceId: string,
    expectedVersion: number,
  ): Promise<GameSession> {
    const res = await fetch(`${BASE_URL}/sessions/${sessionId}/choices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId, choiceId, expectedVersion }),
    });
    if (res.status === 409) {
      // Version conflict, re-fetch
      return this.getSession(sessionId);
    }
    if (!res.ok) {
      const err = await res.json() as ApiError;
      throw new Error(err.error?.message || `HTTP ${res.status}`);
    }
    return res.json() as Promise<GameSession>;
  }

  async listSessions(playerId: string): Promise<GameSession[]> {
    const res = await fetch(`${BASE_URL}/players/${playerId}/sessions`);
    if (!res.ok) {
      const err = await res.json() as ApiError;
      throw new Error(err.error?.message || `HTTP ${res.status}`);
    }
    const data = await res.json() as { sessions: GameSession[] };
    return data.sessions;
  }

  async getDailyQuest(): Promise<any> {
    const res = await fetch(`${BASE_URL}/daily-quest`);
    if (res.status === 404) {
      return null;
    }
    if (!res.ok) {
      const err = await res.json() as ApiError;
      throw new Error(err.error?.message || `HTTP ${res.status}`);
    }
    return res.json();
  }
}

export const apiClient = new QuestForgeClient();
