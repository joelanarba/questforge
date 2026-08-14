export function InventoryPanel({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <div
      className="mt-4 p-4 rounded-lg border"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-border)',
      }}
    >
      <h3
        className="text-xs uppercase tracking-widest mb-3"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Inventory
      </h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="px-3 py-1 rounded-full text-xs"
            style={{
              backgroundColor: 'var(--color-bg-hover)',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
