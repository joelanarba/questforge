import { useState } from 'react';
import type { Choice } from '../api/client';

export function ChoiceList({
  choices,
  onChoose,
  disabled,
}: {
  choices: Choice[];
  onChoose: (choiceId: string) => void;
  disabled: boolean;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (choices.length === 0) return null;

  return (
    <div className="mt-8 space-y-3">
      <p
        className="text-sm uppercase tracking-widest mb-4"
        style={{ color: 'var(--color-text-muted)' }}
      >
        What do you do?
      </p>
      {choices.map((choice, index) => (
        <button
          key={choice.id}
          id={`choice-${choice.id}`}
          onClick={() => !disabled && onChoose(choice.id)}
          disabled={disabled}
          onMouseEnter={() => !disabled && setHoveredId(choice.id)}
          onMouseLeave={() => setHoveredId(null)}
          className="w-full text-left px-5 py-4 rounded-lg border transition-all duration-200 animate-slide-up"
          style={{
            animationDelay: `${index * 80}ms`,
            animationFillMode: 'both',
            backgroundColor: disabled
              ? 'var(--color-bg-secondary)'
              : hoveredId === choice.id
                ? 'var(--color-bg-hover)'
                : 'var(--color-bg-card)',
            borderColor: disabled
              ? 'var(--color-border)'
              : hoveredId === choice.id
                ? 'var(--color-accent)'
                : 'var(--color-border)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
          }}
        >
          <span
            className="inline-block w-8 font-bold text-sm"
            style={{ color: 'var(--color-accent-light)' }}
          >
            {choice.id}.
          </span>
          <span style={{ color: 'var(--color-text-primary)' }}>
            {choice.text}
          </span>
        </button>
      ))}
    </div>
  );
}
