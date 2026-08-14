export interface GenreDefinition {
  id: string;
  name: string;
  description: string;
  toneBlock: string;
}

export interface ArchetypeDefinition {
  id: string;
  name: string;
  description: string;
  toneBlock: string;
}

export const GENRES: GenreDefinition[] = [
  {
    id: 'fantasy',
    name: 'Dark Fantasy',
    description: 'A crumbling kingdom where old magic stirs beneath forgotten ruins.',
    toneBlock: 'Setting: dark fantasy. Tone: grim but not hopeless. The world is dangerous and morally grey. Magic exists but carries a cost. Ruins, ancient pacts, and dying dynasties. Prose should feel grounded, not flowery.',
  },
  {
    id: 'scifi',
    name: 'Deep Space',
    description: 'A derelict station on the edge of known space. Something went wrong.',
    toneBlock: 'Setting: hard science fiction. Tone: tense, isolated. A space station or ship with failing systems, strange signals, and crew mysteries. Technology is plausible and gritty. Prose should be tight and atmospheric.',
  },
  {
    id: 'noir',
    name: 'Neo-Noir',
    description: 'Rain-slicked streets, corrupt officials, and a case that smells wrong.',
    toneBlock: 'Setting: neo-noir detective fiction. Tone: cynical, atmospheric. A rain-drenched city with corruption at every level. The protagonist is clever but compromised. Dialogue is sharp, descriptions moody. Prose should be terse and punchy.',
  },
];

export const ARCHETYPES: ArchetypeDefinition[] = [
  {
    id: 'survivor',
    name: 'The Survivor',
    description: 'Tough, resourceful, and driven by self-preservation above all.',
    toneBlock: 'The protagonist is a survivor: pragmatic, resourceful, wary of trust. They make decisions based on self-preservation first. Their voice is practical and unsentimental.',
  },
  {
    id: 'scholar',
    name: 'The Scholar',
    description: 'Curious, observant, and willing to take risks for knowledge.',
    toneBlock: 'The protagonist is a scholar: curious, analytical, sometimes reckless in pursuit of understanding. They notice details others miss. Their voice is precise and questioning.',
  },
  {
    id: 'outsider',
    name: 'The Outsider',
    description: 'Distrusted by locals, carrying secrets, with nothing left to lose.',
    toneBlock: 'The protagonist is an outsider: distrusted, carrying hidden knowledge or a hidden past. They have nothing to lose and everything to prove. Their voice is guarded and defiant.',
  },
];

export function getGenre(id: string): GenreDefinition | undefined {
  return GENRES.find((g) => g.id === id);
}

export function getArchetype(id: string): ArchetypeDefinition | undefined {
  return ARCHETYPES.find((a) => a.id === id);
}

export function isValidGenre(id: string): boolean {
  return GENRES.some((g) => g.id === id);
}

export function isValidArchetype(id: string): boolean {
  return ARCHETYPES.some((a) => a.id === id);
}
