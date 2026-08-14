export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div
        className="p-6 rounded-xl border max-w-md text-center"
        style={{
          backgroundColor: 'var(--color-bg-card)',
          borderColor: 'var(--color-danger)',
        }}
      >
        <h3
          className="text-xl font-semibold mb-3"
          style={{ color: 'var(--color-danger)', fontFamily: 'var(--font-display)' }}
        >
          Something went wrong
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          {message}
        </p>
        {onRetry && (
          <button
            id="retry-button"
            onClick={onRetry}
            className="px-6 py-2 rounded-lg font-medium transition-colors duration-200 cursor-pointer"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-text-primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-accent-light)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-accent)';
            }}
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
