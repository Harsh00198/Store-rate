"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { AuthUser } from "./types"

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (userData: {
    name: string
    email: string
    password: string
    address?: string
    role: "user" | "store_owner"
  }) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem("auth-user")
    const savedToken = localStorage.getItem("auth-token")

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser))
        setToken(savedToken)
      } catch (error) {
        localStorage.removeItem("auth-user")
        localStorage.removeItem("auth-token")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        const authUser: AuthUser = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        }
        setUser(authUser)
        setToken(data.token)
        localStorage.setItem("auth-user", JSON.stringify(authUser))
        localStorage.setItem("auth-token", data.token)
        return { success: true }
      } else {
        return { success: false, error: data.error || "Login failed" }
      }
    } catch (error) {
      return { success: false, error: "Network error. Please try again." }
    }
  }

  const signup = async (userData: {
    name: string
    email: string
    password: string
    address?: string
    role: "user" | "store_owner"
  }) => {
    try {
      console.log("[v0] Starting signup process", { email: userData.email, role: userData.role })

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...userData,
          confirmPassword: userData.password,
        }),
      })

      const data = await response.json()
      console.log("[v0] Signup API response", { success: response.ok, status: response.status })

      if (response.ok && data.success) {
        const authUser: AuthUser = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        }
        setUser(authUser)
        setToken(data.token)
        localStorage.setItem("auth-user", JSON.stringify(authUser))
        localStorage.setItem("auth-token", data.token)
        console.log("[v0] Signup successful, user set", authUser)
        return { success: true }
      } else {
        console.log("[v0] Signup failed", data.error)
        return { success: false, error: data.error || "Signup failed" }
      }
    } catch (error) {
      console.log("[v0] Signup network error", error)
      return { success: false, error: "Network error. Please try again." }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("auth-user")
    localStorage.removeItem("auth-token")
  }

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, isLoading }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
