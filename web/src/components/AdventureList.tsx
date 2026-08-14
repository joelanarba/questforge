import { useEffect, useState } from 'react';
import { BookOpen, AlertCircle, ArrowLeft } from 'lucide-react';
import { apiClient } from '../api/client';
import type { GameSession } from '../api/client';
import { getPlayerId } from '../state/session';

interface AdventureListProps {
  onSelect: (sessionId: string) => void;
  onBack: () => void;
}

export function AdventureList({ onSelect, onBack }: AdventureListProps) {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const playerId = getPlayerId();
        const data = await apiClient.listSessions(playerId);
        setSessions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load past adventures');
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div
        className="max-w-xl w-full rounded-2xl border p-8 shadow-2xl relative"
        style={{
          backgroundColor: 'var(--color-bg-primary)',
          borderColor: 'var(--color-border)',
        }}
      >
        <button
          onClick={onBack}
          className="absolute top-6 left-6 p-2 rounded-lg transition-colors cursor-pointer"
          style={{
            color: 'var(--color-text-muted)',
            backgroundColor: 'var(--color-bg-secondary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-text-muted)';
          }}
        >
          <ArrowLeft size={20} />
        </button>

        <div className="text-center mb-8 mt-2">
          <BookOpen
            size={40}
            className="mx-auto mb-4"
            style={{ color: 'var(--color-accent)' }}
          />
          <h2
            className="text-3xl font-bold mb-2"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--color-text-primary)',
            }}
          >
            Past Adventures
          </h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Resume a previous quest or start anew.
          </p>
        </div>

        {error && (
          <div
            className="mb-6 p-4 rounded-lg flex gap-3 items-center"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--color-danger)',
              color: 'var(--color-danger)',
            }}
          >
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2"
              style={{ borderColor: 'var(--color-accent)' }}
            />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
            <p>You have no past adventures recorded.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {sessions.map((session) => (
              <button
                key={session.sessionId}
                onClick={() => onSelect(session.sessionId)}
                className="w-full p-4 rounded-xl text-left border transition-all duration-200 cursor-pointer flex flex-col"
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  borderColor: 'var(--color-border)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-accent)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div className="flex justify-between items-center mb-1">
                  <span
                    className="font-bold text-lg"
                    style={{
                      fontFamily: 'var(--font-display)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {session.title || 'Untitled Adventure'}
                  </span>
                  <span
                    className="text-xs px-2 py-1 rounded-full capitalize"
                    style={{
                      backgroundColor: 'var(--color-bg-tertiary)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    {session.status}
                  </span>
                </div>
                <div
                  className="flex gap-4 text-sm mt-2"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  <span className="capitalize">{session.genre}</span>
                  <span>•</span>
                  <span>Chapter {session.chapter}</span>
                  <span>•</span>
                  <span>{new Date(session.updatedAt).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
