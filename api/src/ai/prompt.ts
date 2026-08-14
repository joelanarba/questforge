import type { GameSession } from '../domain/state.js';
import { getGenre, getArchetype } from '../domain/content.js';

function dispositionBucket(d: number): string {
  if (d <= -60) return 'hostile';
  if (d <= -20) return 'unfriendly';
  if (d <= 20) return 'neutral';
  if (d <= 60) return 'friendly';
  return 'devoted';
}

export function buildSystemPrompt(session: GameSession): string {
  const genre = getGenre(session.genre);
  const archetype = getArchetype(session.archetype);

  const maxChapters = parseInt(process.env['MAX_CHAPTERS'] || '25', 10);
  const isNearFinale = session.chapter >= maxChapters - 2;

  let prompt = `You are the narrator of an interactive text adventure.

${genre?.toneBlock || ''}

${archetype?.toneBlock || ''}

Rules for your response:
- Write in second person, present tense.
- The story segment should be 120 to 220 words.
- Provide exactly 3 choices (or 4 if a risky option genuinely fits).
- Each choice must be imperative mood, no longer than 90 characters, and must not spoil its outcome.
- Choice IDs must be A, B, C in order (D if 4 choices).
- The chapterTitle must be at most 60 characters.
- stateChanges values are deltas (integers from -50 to 50). Only include keys that actually change.
- events should be 0 to 3 factual, past-tense statements about what just happened.
- summaryUpdate must rewrite the running summary to include this chapter. Max 900 characters.
- Do not use em dashes. Use commas, semicolons, colons, or periods instead.
- Do not use emojis.
- Be specific and concrete. Avoid vague or generic descriptions.
`;

  if (isNearFinale) {
    prompt += `\nIMPORTANT: The story is approaching its conclusion. Begin wrapping up plot threads and building toward a satisfying ending. If this is the final chapter, set isEnding to true and provide no choices.\n`;
  }

  return prompt;
}

export function buildUserPrompt(
  session: GameSession,
  chosenChoiceText: string | null,
): string {
  // Compact world state
  const npcsCompact = Object.entries(session.npcs).map(([id, npc]) => ({
    id,
    name: npc.name,
    attitude: dispositionBucket(npc.disposition),
    note: npc.note,
  }));

  const recentEvents = session.world.events.slice(-6);

  const worldContext = JSON.stringify({
    player: {
      health: session.player.health,
      maxHealth: session.player.maxHealth,
      gold: session.player.gold,
      reputation: session.player.reputation,
      inventory: session.player.inventory,
    },
    npcs: npcsCompact,
    recentEvents,
    secrets: session.world.secrets,
  });

  let prompt = `Chapter ${session.chapter + 1}.\n\n`;

  if (session.summary) {
    prompt += `Story so far: ${session.summary}\n\n`;
  }

  // Recent scenes
  for (const scene of session.recentScenes) {
    prompt += `[Chapter ${scene.chapter}: "${scene.title}"] ${scene.excerpt}\nPlayer chose: ${scene.chosen}\n\n`;
  }

  if (chosenChoiceText) {
    prompt += `The player just chose: "${chosenChoiceText}"\n\n`;
  } else {
    prompt += `This is the opening chapter. Establish the setting and the protagonist\'s situation.\n\n`;
  }

  prompt += `Current world state:\n${worldContext}\n`;

  return prompt;
}
