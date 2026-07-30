import { z } from 'zod'

export const createPasteSchema = z.object({
  text: z.string().min(1, 'Text cannot be empty'),
  expiresIn: z.number().int().positive().optional(),
})
