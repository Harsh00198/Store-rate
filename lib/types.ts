export interface User {
  id: string
  name: string
  email: string
  password: string
  address?: string
  role: "user" | "store_owner" | "admin"
  createdAt: Date
  updatedAt: Date
}

export interface Store {
  id: string
  name: string
  description: string
  address: string
  category: string
  ownerId: string
  imageUrl?: string
  averageRating: number
  totalRatings: number
  // Location for map search
  latitude?: number
  longitude?: number
  city?: string
  zipCode?: string
  // AI summary
  summary?: {
    themes?: string[]
    sentiment?: "positive" | "neutral" | "negative"
  }
  createdAt: Date
  updatedAt: Date
  // Populated fields
  owner_id?: string
  owner_name?: string
}

export interface Rating {
  id: string
  userId: string
  storeId: string
  rating: number // 1-5 stars
  review?: string
  // Multi-dimensional ratings
  ratings?: {
    service?: number
    quality?: number
    value?: number
    ambiance?: number
  }
  // Photo support
  photos?: string[]
  // Moderation and verification
  verified?: boolean
  flagged?: boolean
  flaggedReason?: string
  helpfulCount?: number
  // AI-generated tags and sentiment
  tags?: string[]
  sentiment?: "positive" | "neutral" | "negative"
  createdAt: Date
  updatedAt: Date
  // Populated fields
  user_id?: string
  user_name?: string
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: "user" | "store_owner" | "admin"
}

// Form validation types
export interface SignupFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  address?: string
  role: "user" | "store_owner"
}

export interface LoginFormData {
  email: string
  password: string
}

// New types for enhanced features
export interface ReviewSummary {
  totalReviews: number
  themes: string[]
  whatCustomersLike: string[]
  whatCustomersDislike: string[]
  averageDimensions?: {
    service: number
    quality: number
    value: number
    ambiance: number
  }
}

export interface BenchmarkData {
  storeRating: number
  categoryAverage: number
  cityAverage: number | null
  vsCategory: number
  vsCity: number | null
  percentile: number
}
