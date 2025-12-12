"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Store } from "@/lib/types"

interface AddStoreFormProps {
  onSuccess: (store: Store) => void
}

const storeCategories = [
  "Restaurant",
  "Electronics",
  "Clothing",
  "Grocery",
  "Health & Beauty",
  "Home & Garden",
  "Sports & Recreation",
  "Books & Media",
  "Automotive",
  "Other",
]

export function AddStoreForm({ onSuccess }: AddStoreFormProps) {
  const { user, token } = useAuth() // Token yahan se mil jayega
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    category: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !token) { // Token check
      setError("You must be logged in to add a store.");
      return;
    }


    setError("")
    setIsLoading(true)

    // Basic validation
    if (!formData.name.trim() || !formData.description.trim() || !formData.address.trim() || !formData.category) {
      setError("All fields are required")
      setIsLoading(false)
      return
    }

    if (formData.description.length > 400) {
      setError("Description must not exceed 400 characters")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/stores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Yahan token ko Authorization header mein add kiya gaya hai
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          address: formData.address.trim(),
          category: formData.category,
          ownerId: user.id,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        onSuccess(data.store)
        setFormData({ name: "", description: "", address: "", category: "" })
      } else {
        setError(data.error || "Failed to create store")
      }
    } catch (error) {
      setError("Network error. Please try again.")
      console.error("Error creating store:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      category: value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Store Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Enter store name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={formData.category} onValueChange={handleCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {storeCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
          placeholder="Enter store address"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          placeholder="Describe your store..."
          rows={3}
          maxLength={400}
        />
        <p className="text-xs text-muted-foreground">{formData.description.length}/400 characters</p>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating Store..." : "Create Store"}
      </Button>
    </form>
  )
}