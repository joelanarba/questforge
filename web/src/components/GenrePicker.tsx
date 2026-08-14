import { useState } from 'react';
import { Swords, Rocket, Search } from 'lucide-react';

interface Genre {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
}

const GENRES: Genre[] = [
  {
    id: 'fantasy',
    name: 'Dark Fantasy',
    description: 'A crumbling kingdom where old magic stirs beneath forgotten ruins.',
    icon: Swords,
  },
  {
    id: 'scifi',
    name: 'Deep Space',
    description: 'A derelict station on the edge of known space. Something went wrong.',
    icon: Rocket,
  },
  {
    id: 'noir',
    name: 'Neo-Noir',
    description: 'Rain-slicked streets, corrupt officials, and a case that smells wrong.',
    icon: Search,
  },
];

export function GenrePicker({ onSelect }: { onSelect: (genre: string) => void }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12 animate-fade-in">
        <h1
          className="text-5xl md:text-6xl font-bold mb-4 tracking-wide"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent-light)' }}
        >
          QuestForge
        </h1>
        <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
          Choose your world. Shape your story.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {GENRES.map((genre, index) => (
          <button
            key={genre.id}
            id={`genre-${genre.id}`}
            onClick={() => onSelect(genre.id)}
            onMouseEnter={() => setHoveredId(genre.id)}
            onMouseLeave={() => setHoveredId(null)}
            className="text-left p-6 rounded-xl border transition-all duration-300 cursor-pointer animate-slide-up"
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both',
              backgroundColor: hoveredId === genre.id ? 'var(--color-bg-hover)' : 'var(--color-bg-card)',
              borderColor: hoveredId === genre.id ? 'var(--color-accent)' : 'var(--color-border)',
              boxShadow: hoveredId === genre.id ? '0 0 30px var(--color-accent-glow)' : 'none',
              transform: hoveredId === genre.id ? 'translateY(-4px)' : 'translateY(0)',
            }}
          >
            <div className="mb-4">
              <genre.icon className="w-8 h-8" style={{ color: hoveredId === genre.id ? 'var(--color-accent)' : 'var(--color-text-muted)' }} />
            </div>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
            >
              {genre.name}
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              {genre.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
