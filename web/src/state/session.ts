const PLAYER_ID_KEY = 'questforge_player_id';
const SESSION_ID_KEY = 'questforge_session_id';

export function getPlayerId(): string {
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id = `anon_${crypto.randomUUID()}`;
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
}

export function getSessionId(): string | null {
  return localStorage.getItem(SESSION_ID_KEY);
}

export function setSessionId(id: string): void {
  localStorage.setItem(SESSION_ID_KEY, id);
}

export function clearSessionId(): void {
  localStorage.removeItem(SESSION_ID_KEY);
}
