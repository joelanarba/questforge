import type { PlayerState } from '../api/client';
import { Heart, Coins, Star, Backpack, BookOpen } from 'lucide-react';

export function StatusBar({
  player,
  chapter,
}: {
  player: PlayerState;
  chapter: number;
}) {
  const healthPercent = (player.health / player.maxHealth) * 100;

  return (
    <div
      className="flex flex-wrap items-center gap-4 px-4 py-3 rounded-lg border text-sm"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="flex items-center gap-2">
        <BookOpen className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
        <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {chapter}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Heart className="w-4 h-4" style={{ color: 'var(--color-health)' }} />
        <div
          className="w-20 h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--color-bg-hover)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${healthPercent}%`,
              backgroundColor: healthPercent > 50 ? 'var(--color-health)' : healthPercent > 25 ? '#f59e0b' : '#dc2626',
            }}
          />
        </div>
        <span className="font-mono text-xs" style={{ color: 'var(--color-text-secondary)' }}>
          {player.health}/{player.maxHealth}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Coins className="w-4 h-4" style={{ color: 'var(--color-gold)' }} />
        <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          {player.gold}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Star className="w-4 h-4" style={{ color: 'var(--color-reputation)' }} />
        <span
          className="font-semibold"
          style={{
            color: player.reputation > 0 ? 'var(--color-success)' : player.reputation < 0 ? 'var(--color-danger)' : 'var(--color-text-primary)',
          }}
        >
          {player.reputation > 0 ? '+' : ''}{player.reputation}
        </span>
      </div>

      {player.inventory.length > 0 && (
        <div className="flex items-center gap-1">
          <Backpack className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {player.inventory.length}
          </span>
        </div>
      )}
    </div>
  );
}
