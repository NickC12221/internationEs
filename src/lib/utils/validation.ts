// src/lib/utils/validation.ts
import { z } from 'zod'

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  displayName: z.string().min(2, 'Name must be at least 2 characters').max(60),
  country: z.string().min(2),
  countryCode: z.string().length(2, 'Country code must be 2 characters'),
  city: z.string().min(2),
})

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
})

export const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(60).optional(),
  bio: z.string().max(1000).optional(),
  age: z.number().min(18).max(100).optional(),
  country: z.string().min(2).optional(),
  countryCode: z.string().length(2).optional(),
  city: z.string().min(2).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  instagram: z.string().max(60).optional().or(z.literal('')),
  twitter: z.string().max(60).optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  availability: z.enum(['AVAILABLE', 'UNAVAILABLE', 'TRAVELING', 'BUSY']).optional(),
})

export const adminUpdateProfileSchema = z.object({
  isVerified: z.boolean().optional(),
  listingTier: z.enum(['FREE', 'PREMIUM']).optional(),
  isActive: z.boolean().optional(),
  premiumExpiresAt: z.string().optional().nullable(),
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type AdminUpdateProfileInput = z.infer<typeof adminUpdateProfileSchema>
