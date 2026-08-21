import { Compass, Sparkles, Map, BookOpen, Calendar } from 'lucide-react';

export interface DailyQuest {
  title: string;
  tagline: string;
  genreId: string;
  archetypeId: string;
}

interface LandingPageProps {
  onStart: () => void;
  onStartDaily?: (quest: DailyQuest) => void;
  onViewPast?: () => void;
  hasPlayerId: boolean;
  dailyQuest: DailyQuest | null;
}

export function LandingPage({ onStart, onStartDaily, onViewPast, hasPlayerId, dailyQuest }: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[var(--color-bg-primary)] to-[var(--color-bg-secondary)] overflow-y-auto">
      <div className="max-w-3xl w-full text-center animate-fade-in py-12">
        <div className="flex justify-center mb-6">
          <Compass className="w-16 h-16" style={{ color: 'var(--color-accent)' }} />
        </div>
        
        <h1
          className="text-6xl md:text-7xl font-bold mb-6 tracking-wide"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
        >
          QuestForge
        </h1>
        
        <p className="text-xl md:text-2xl mb-10 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          An infinite tapestry of interactive stories powered by AI. 
          Choose your genre, pick an archetype, and let the journey unfold.
        </p>

        {dailyQuest && (
          <div className="mb-12 p-6 rounded-2xl border bg-[var(--color-bg-card)] shadow-lg max-w-2xl mx-auto border-[var(--color-accent)] animate-slide-up">
            <div className="flex items-center justify-center gap-2 mb-4 text-[var(--color-accent)] font-bold">
              <Calendar size={24} />
              <h2 className="text-xl" style={{ fontFamily: 'var(--font-display)' }}>Quest of the Day</h2>
            </div>
            <h3 className="text-2xl font-bold mb-2 text-[var(--color-text-primary)]">{dailyQuest.title}</h3>
            <p className="text-[var(--color-text-secondary)] italic mb-6">"{dailyQuest.tagline}"</p>
            <button
              onClick={() => onStartDaily && onStartDaily(dailyQuest)}
              className="w-full py-3 rounded-lg font-bold text-lg transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-1 bg-[var(--color-accent)] text-[var(--color-bg-card)]"
            >
              Play Today's Quest
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
          <div className="flex items-center gap-3 text-lg" style={{ color: 'var(--color-text-muted)' }}>
            <Map className="w-6 h-6" />
            <span>Endless Worlds</span>
          </div>
          <div className="flex items-center gap-3 text-lg" style={{ color: 'var(--color-text-muted)' }}>
            <Sparkles className="w-6 h-6" />
            <span>Dynamic Choices</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStart}
            className="group relative px-10 py-4 rounded-xl font-bold text-xl transition-all duration-300 cursor-pointer overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1"
            style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Custom Journey
            </span>
          </button>

          {hasPlayerId && onViewPast && (
            <button
              onClick={onViewPast}
              className="group flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 cursor-pointer border shadow-sm hover:shadow-md hover:-translate-y-1"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-bg-secondary)',
                fontFamily: 'var(--font-display)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
            >
              <BookOpen size={20} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors" />
              Past Adventures
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
