import { useState } from 'react';
import { Shield, Book, Ghost } from 'lucide-react';

interface Archetype {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
}

const ARCHETYPES: Archetype[] = [
  {
    id: 'survivor',
    name: 'The Survivor',
    description: 'Tough, resourceful, and driven by self-preservation above all.',
    icon: Shield,
  },
  {
    id: 'scholar',
    name: 'The Scholar',
    description: 'Curious, observant, and willing to take risks for knowledge.',
    icon: Book,
  },
  {
    id: 'outsider',
    name: 'The Outsider',
    description: 'Distrusted by locals, carrying secrets, with nothing left to lose.',
    icon: Ghost,
  },
];

export function ArchetypePicker({
  genre,
  onSelect,
  onBack,
}: {
  genre: string;
  onSelect: (archetype: string) => void;
  onBack: () => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const genreLabel =
    genre === 'fantasy' ? 'Dark Fantasy' : genre === 'scifi' ? 'Deep Space' : 'Neo-Noir';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12 animate-fade-in">
        <p className="text-sm uppercase tracking-widest mb-2" style={{ color: 'var(--color-accent-light)' }}>
          {genreLabel}
        </p>
        <h1
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
        >
          Who are you?
        </h1>
        <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
          Your archetype shapes how the world sees you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {ARCHETYPES.map((arch, index) => (
          <button
            key={arch.id}
            id={`archetype-${arch.id}`}
            onClick={() => onSelect(arch.id)}
            onMouseEnter={() => setHoveredId(arch.id)}
            onMouseLeave={() => setHoveredId(null)}
            className="text-left p-6 rounded-xl border transition-all duration-300 cursor-pointer animate-slide-up"
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both',
              backgroundColor: hoveredId === arch.id ? 'var(--color-bg-hover)' : 'var(--color-bg-card)',
              borderColor: hoveredId === arch.id ? 'var(--color-accent)' : 'var(--color-border)',
              boxShadow: hoveredId === arch.id ? '0 0 30px var(--color-accent-glow)' : 'none',
              transform: hoveredId === arch.id ? 'translateY(-4px)' : 'translateY(0)',
            }}
          >
            <div className="mb-4">
              <arch.icon className="w-8 h-8" style={{ color: hoveredId === arch.id ? 'var(--color-accent)' : 'var(--color-text-muted)' }} />
            </div>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
            >
              {arch.name}
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              {arch.description}
            </p>
          </button>
        ))}
      </div>

      <button
        id="back-to-genres"
        onClick={onBack}
        className="mt-8 px-6 py-2 text-sm rounded-lg border transition-colors duration-200 cursor-pointer"
        style={{
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-secondary)',
          backgroundColor: 'transparent',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-accent)';
          e.currentTarget.style.color = 'var(--color-text-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-border)';
          e.currentTarget.style.color = 'var(--color-text-secondary)';
        }}
      >
        Back to Genres
      </button>
    </div>
  );
}
