import { z } from 'zod';

// Response schema
export const NpcUpdateSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9_]{0,29}$/),
  name: z.string().min(1).max(40),
  dispositionDelta: z.number().int().min(-50).max(50),
  note: z.string().max(200),
});

export const ChoiceSchema = z.object({
  id: z.enum(['A', 'B', 'C', 'D']),
  text: z.string().min(1).max(90),
});

export const AiTurnSchema = z.object({
  chapterTitle: z.string().min(1).max(60),
  story: z.string().min(50).max(3000),
  choices: z.array(ChoiceSchema).min(2).max(4),
  stateChanges: z
    .object({
      health: z.number().int().min(-50).max(50).optional(),
      gold: z.number().int().min(-50).max(50).optional(),
      reputation: z.number().int().min(-50).max(50).optional(),
    })
    .optional()
    .default({}),
  inventoryAdd: z.array(z.string().max(40)).max(3).optional().default([]),
  inventoryRemove: z.array(z.string().max(40)).max(3).optional().default([]),
  npcUpdates: z.array(NpcUpdateSchema).max(3).optional().default([]),
  secretsDiscovered: z.array(z.string().max(200)).max(2).optional().default([]),
  events: z.array(z.string().max(200)).max(3).optional().default([]),
  summaryUpdate: z.string().max(900),
  isEnding: z.boolean().optional().default(false),
});

export type AiTurn = z.infer<typeof AiTurnSchema>;
export type Choice = z.infer<typeof ChoiceSchema>;
export type NpcUpdate = z.infer<typeof NpcUpdateSchema>;

// API request schemas
export const StartSessionRequestSchema = z.object({
  playerId: z.string().min(1).max(100),
  genre: z.enum(['fantasy', 'scifi', 'noir']),
  archetype: z.enum(['survivor', 'scholar', 'outsider']),
});

export const ContinueSessionRequestSchema = z.object({
  playerId: z.string().min(1).max(100),
  choiceId: z.enum(['A', 'B', 'C', 'D']),
  expectedVersion: z.number().int().min(0),
});

export type StartSessionRequest = z.infer<typeof StartSessionRequestSchema>;
export type ContinueSessionRequest = z.infer<typeof ContinueSessionRequestSchema>;
