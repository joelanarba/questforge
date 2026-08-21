import { useState, useCallback, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { GenrePicker } from './components/GenrePicker';
import { ArchetypePicker } from './components/ArchetypePicker';
import { SceneView } from './components/SceneView';
import { ChoiceList } from './components/ChoiceList';
import { StatusBar } from './components/StatusBar';
import { LoadingScene } from './components/LoadingScene';
import { ErrorState } from './components/ErrorState';
import { EndingView } from './components/EndingView';
import { InventoryPanel } from './components/InventoryPanel';
import { AdventureList } from './components/AdventureList';
import { apiClient } from './api/client';
import type { GameSession } from './api/client';
import { getPlayerId, getSessionId, setSessionId, clearSessionId } from './state/session';

type Screen = 'landing' | 'genre' | 'archetype' | 'loading' | 'playing' | 'error' | 'adventureList';

export function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [genre, setGenre] = useState<string>('');
  const [session, setSession] = useState<GameSession | null>(null);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dailyQuest, setDailyQuest] = useState<any>(null);

  // Try to resume an existing session on mount
  useEffect(() => {
    // Fetch daily quest
    apiClient.getDailyQuest().then(dq => {
      if (dq) {
        setDailyQuest(dq);
      }
    }).catch(err => {
      console.error('Failed to fetch daily quest:', err);
    });

    const savedSessionId = getSessionId();
    if (savedSessionId) {
      setScreen('loading');
      apiClient
        .getSession(savedSessionId)
        .then((s) => {
          setSession(s);
          setScreen('playing');
        })
        .catch(() => {
          clearSessionId();
          setScreen('landing');
        });
    }
  }, []);

  const handleGenreSelect = useCallback((g: string) => {
    setGenre(g);
    setScreen('archetype');
  }, []);

  const handleArchetypeSelect = useCallback(
    async (archetype: string) => {
      setScreen('loading');
      setError('');
      try {
        const playerId = getPlayerId();
        const s = await apiClient.startSession(playerId, genre, archetype);
        setSession(s);
        setSessionId(s.sessionId);
        setScreen('playing');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to start adventure');
        setScreen('error');
      }
    },
    [genre],
  );

  const handleChoice = useCallback(
    async (choiceId: string) => {
      if (!session || isSubmitting) return;
      setIsSubmitting(true);
      setError('');
      try {
        const playerId = getPlayerId();
        const s = await apiClient.continueSession(
          session.sessionId,
          playerId,
          choiceId,
          session.version,
        );
        setSession(s);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to continue adventure');
      } finally {
        setIsSubmitting(false);
      }
    },
    [session, isSubmitting],
  );

  const handleNewAdventure = useCallback(() => {
    clearSessionId();
    setSession(null);
    setGenre('');
    setScreen('landing');
    setError('');
  }, []);

  const handleRetry = useCallback(() => {
    setError('');
    if (session) {
      setScreen('playing');
    } else if (genre) {
      setScreen('archetype');
    } else {
      setScreen('landing');
    }
  }, [session, genre]);

  const handleResumeSession = useCallback((sessionIdToResume: string) => {
    setScreen('loading');
    setError('');
    apiClient
      .getSession(sessionIdToResume)
      .then((s) => {
        setSession(s);
        setSessionId(s.sessionId);
        setScreen('playing');
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load session');
        setScreen('error');
      });
  }, []);

  const handleStartDaily = useCallback(
    async (quest: any) => {
      setScreen('loading');
      setError('');
      try {
        const playerId = getPlayerId();
        const s = await apiClient.startSession(playerId, quest.genreId, quest.archetypeId);
        setSession(s);
        setSessionId(s.sessionId);
        setScreen('playing');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to start daily quest');
        setScreen('error');
      }
    },
    [],
  );

  if (screen === 'landing') {
    return (
      <LandingPage 
        onStart={() => setScreen('genre')} 
        onStartDaily={handleStartDaily}
        onViewPast={() => setScreen('adventureList')} 
        hasPlayerId={!!getPlayerId()} 
        dailyQuest={dailyQuest}
      />
    );
  }

  if (screen === 'adventureList') {
    return (
      <AdventureList 
        onSelect={handleResumeSession} 
        onBack={() => setScreen('landing')} 
      />
    );
  }

  if (screen === 'genre') {
    return <GenrePicker onSelect={handleGenreSelect} />;
  }

  if (screen === 'archetype') {
    return (
      <ArchetypePicker
        genre={genre}
        onSelect={handleArchetypeSelect}
        onBack={() => setScreen('genre')}
      />
    );
  }

  if (screen === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingScene />
      </div>
    );
  }

  if (screen === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <ErrorState message={error} onRetry={handleRetry} />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingScene />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header
        className="sticky top-0 z-10 px-4 py-3 border-b"
        style={{
          backgroundColor: 'var(--color-bg-primary)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <h1
            className="text-lg font-bold"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent-light)' }}
          >
            QuestForge
          </h1>
          <button
            id="new-adventure-header"
            onClick={handleNewAdventure}
            className="text-xs px-3 py-1 rounded border transition-colors duration-200 cursor-pointer"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-muted)',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-accent)';
              e.currentTarget.style.color = 'var(--color-text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.color = 'var(--color-text-muted)';
            }}
          >
            New Adventure
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        <StatusBar player={session.player} chapter={session.chapter} />

        <div className="mt-6">
          {isSubmitting ? (
            <LoadingScene />
          ) : (
            <>
              <SceneView scene={session.currentScene} />

              {session.status === 'ended' ? (
                <EndingView session={session} onNewAdventure={handleNewAdventure} />
              ) : (
                <ChoiceList
                  choices={session.currentScene.choices}
                  onChoose={handleChoice}
                  disabled={isSubmitting}
                />
              )}
            </>
          )}
        </div>

        {error && (
          <div
            className="mt-4 p-3 rounded-lg text-sm"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--color-danger)',
              color: 'var(--color-danger)',
            }}
          >
            {error}
          </div>
        )}

        <InventoryPanel items={session.player.inventory} />
      </main>
    </div>
  );
}
