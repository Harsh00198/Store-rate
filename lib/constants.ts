export const APP_CONFIG = {
  name: "Store Rating System",
  description: "Rate and review your favorite stores",
  version: "1.0.0",
  author: "Store Rating Team",
}

export const API_ENDPOINTS = {
  auth: {
    login: "/api/auth/login",
    signup: "/api/auth/signup",
  },
  stores: {
    list: "/api/stores",
    detail: (id: string) => `/api/stores/${id}`,
    create: "/api/stores",
    delete: (id: string) => `/api/stores/${id}`,
  },
  ratings: {
    create: "/api/ratings",
    list: "/api/ratings",
  },
  admin: {
    users: "/api/admin/users",
    stores: "/api/admin/stores",
  },
}

export const USER_ROLES = {
  USER: "user",
  STORE_OWNER: "store_owner",
  ADMIN: "admin",
} as const

export const STORE_CATEGORIES = [
  "Food & Beverage",
  "Electronics",
  "Restaurant",
  "Garden & Home",
  "Fashion",
  "Health & Beauty",
  "Sports & Recreation",
  "Books & Media",
  "Automotive",
  "Services",
] as const

// Admin credentials for documentation
export const ADMIN_CREDENTIALS = {
  email: "admin@storerating.com",
  password: "Admin@123",
  role: "admin",
}

export const SAMPLE_CREDENTIALS = {
  storeOwner: {
    email: "john@coffeeshop.com",
    password: "Admin@123",
    role: "store_owner",
  },
  user: {
    email: "alice@example.com",
    password: "Admin@123",
    role: "user",
  },
}
