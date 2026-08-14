import type { GameSession } from '../api/client';

export function EndingView({
  session,
  onNewAdventure,
}: {
  session: GameSession;
  onNewAdventure: () => void;
}) {
  const reason = session.endingReason;
  const title = reason === 'death' ? 'You have fallen.' : 'The End';
  const subtitle =
    reason === 'death'
      ? 'Your journey ends here, but another awaits.'
      : `After ${session.chapter} chapters, your story reaches its conclusion.`;

  return (
    <div className="text-center py-12 animate-fade-in">
      <h2
        className="text-4xl font-bold mb-4"
        style={{
          fontFamily: 'var(--font-display)',
          color: reason === 'death' ? 'var(--color-danger)' : 'var(--color-accent-light)',
        }}
      >
        {title}
      </h2>
      <p className="text-lg mb-8" style={{ color: 'var(--color-text-secondary)' }}>
        {subtitle}
      </p>
      <button
        id="new-adventure-button"
        onClick={onNewAdventure}
        className="px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-300 cursor-pointer"
        style={{
          backgroundColor: 'var(--color-accent)',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-display)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-accent-light)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-accent)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        Begin a New Adventure
      </button>
    </div>
  );
}
