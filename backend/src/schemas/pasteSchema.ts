import { z } from 'zod'

export const createPasteSchema = z.object({
  title: z.string().optional(),
  visibility: z.enum(["public", "unlisted"]).default('public'),
  language: z.string().optional(),
  text: z.string().min(1, 'Text cannot be empty'),
  expiresIn: z.number().int().positive().optional(),
})
