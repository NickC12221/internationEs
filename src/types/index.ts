export type Role = 'MODEL' | 'AGENCY' | 'ADMIN'
export type VerificationStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED'
export type AvailabilityStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'TRAVELING' | 'BUSY'
export type ListingTier = 'FREE' | 'PREMIUM'

export interface JWTPayload {
  sub: string
  email: string
  role: Role
  iat: number
  exp: number
}

export interface SessionUser {
  id: string
  email: string
  role: Role
}

export interface ProfileImage {
  id: string
  url: string
  key: string
  order: number
  isMain: boolean
}

export interface Profile {
  id: string
  userId: string
  displayName: string
  slug: string
  bio: string | null
  age: number | null
  country: string
  countryCode: string
  city: string
  citySlug: string
  email: string | null
  phone: string | null
  instagram: string | null
  twitter: string | null
  website: string | null
  availability: AvailabilityStatus
  listingTier: ListingTier
  isActive: boolean
  isVerified: boolean
  profileImageUrl: string | null
  images: ProfileImage[]
  premiumExpiresAt: string | null
  createdAt: string
  updatedAt: string
}

export interface PublicProfile extends Profile {
  isFavorited?: boolean
}

export interface LocationGroup {
  country: string
  countryCode: string
  cities: {
    city: string
    citySlug: string
    count: number
  }[]
  totalCount: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ProfileFilters {
  country?: string
  countryCode?: string
  citySlug?: string
  availability?: AvailabilityStatus
  search?: string
  page?: number
  pageSize?: number
}

export interface AdminStats {
  totalUsers: number
  totalProfiles: number
  premiumProfiles: number
  verifiedProfiles: number
  pendingVerifications: number
  newThisMonth: number
}
