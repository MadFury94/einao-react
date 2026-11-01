import { z } from 'zod'

// Validation Schemas using Zod

export const UpdateConfigSchema = z.object({
  name: z.string().min(1, 'name is required').max(100, 'name must be 100 characters or less'),
})

export const UserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100),
})

// Type inference from schemas
export type UpdateConfigInput = z.infer<typeof UpdateConfigSchema>
export type UserInput = z.infer<typeof UserSchema>
