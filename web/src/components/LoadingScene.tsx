export function LoadingScene() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="flex gap-2 mb-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-full animate-pulse-glow"
            style={{
              backgroundColor: 'var(--color-accent)',
              animationDelay: `${i * 300}ms`,
            }}
          />
        ))}
      </div>
      <p
        className="text-lg"
        style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-display)' }}
      >
        The story unfolds...
      </p>
    </div>
  );
}
