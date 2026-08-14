import type { SceneState } from '../api/client';

export function SceneView({ scene }: { scene: SceneState }) {
  return (
    <div className="animate-fade-in">
      <h2
        className="text-2xl md:text-3xl font-bold mb-6"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent-light)' }}
      >
        {scene.title}
      </h2>
      <div
        className="text-base md:text-lg leading-relaxed whitespace-pre-wrap"
        style={{ color: 'var(--color-text-primary)', lineHeight: '1.8' }}
      >
        {scene.story}
      </div>
    </div>
  );
}
