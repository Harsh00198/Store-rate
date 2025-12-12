import type { User, Store, Rating } from "./types"
import { mockUsers, mockStores, mockRatings } from "./mock-data"

// In-memory storage (replace with real database later)
const safeUsers = Array.isArray(mockUsers) ? mockUsers : []
const safeStores = Array.isArray(mockStores) ? mockStores : []
const safeRatings = Array.isArray(mockRatings) ? mockRatings : []

const users = [...safeUsers]
const stores = [...safeStores]
let ratings = [...safeRatings]

export class DataService {
  // User operations
  static async createUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    users.push(newUser)
    return newUser
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    return users.find((user) => user.email === email) || null
  }

  static async getUserById(id: string): Promise<User | null> {
    return users.find((user) => user.id === id) || null
  }

  static async getAllUsers(): Promise<User[]> {
    return users
  }

  // Store operations
  static async createStore(
    storeData: Omit<Store, "id" | "createdAt" | "updatedAt" | "averageRating" | "totalRatings">,
  ): Promise<Store> {
    const newStore: Store = {
      ...storeData,
      id: Date.now().toString(),
      averageRating: 0,
      totalRatings: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    stores.push(newStore)
    return newStore
  }

  static async getAllStores(): Promise<Store[]> {
    return stores
  }

  static async getStoreById(id: string): Promise<Store | null> {
    return stores.find((store) => store.id === id) || null
  }

  static async getStoresByOwner(ownerId: string): Promise<Store[]> {
    return stores.filter((store) => store.ownerId === ownerId)
  }

  static async deleteStore(id: string): Promise<boolean> {
    const index = stores.findIndex((store) => store.id === id)
    if (index > -1) {
      stores.splice(index, 1)
      // Also remove related ratings
      ratings = ratings.filter((rating) => rating.storeId !== id)
      return true
    }
    return false
  }

  // Rating operations
  static async createRating(ratingData: Omit<Rating, "id" | "createdAt" | "updatedAt">): Promise<Rating> {
    const newRating: Rating = {
      ...ratingData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    ratings.push(newRating)

    // Update store average rating
    await this.updateStoreRating(ratingData.storeId)
    return newRating
  }

  static async getRatingsByStore(storeId: string): Promise<Rating[]> {
    return ratings.filter((rating) => rating.storeId === storeId)
  }

  static async getRatingsByUser(userId: string): Promise<Rating[]> {
    return ratings.filter((rating) => rating.userId === userId)
  }

  private static async updateStoreRating(storeId: string): Promise<void> {
    const storeRatings = ratings.filter((rating) => rating.storeId === storeId)
    const store = stores.find((s) => s.id === storeId)

    if (store && storeRatings.length > 0) {
      const totalRating = storeRatings.reduce((sum, rating) => sum + rating.rating, 0)
      store.averageRating = Math.round((totalRating / storeRatings.length) * 10) / 10
      store.totalRatings = storeRatings.length
      store.updatedAt = new Date()
    }
  }

  // Search and filter operations
  static async searchStores(query: string): Promise<Store[]> {
    const lowercaseQuery = query.toLowerCase()
    return stores.filter(
      (store) =>
        store.name.toLowerCase().includes(lowercaseQuery) ||
        store.description.toLowerCase().includes(lowercaseQuery) ||
        store.category.toLowerCase().includes(lowercaseQuery),
    )
  }

  static async getStoresByCategory(category: string): Promise<Store[]> {
    return stores.filter((store) => store.category === category)
  }
}
