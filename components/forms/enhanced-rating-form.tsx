"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Star, Upload, X, Image as ImageIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"

interface EnhancedRatingFormProps {
  storeId: string
  onSuccess: () => void
  onCancel?: () => void
}

export function EnhancedRatingForm({ storeId, onSuccess, onCancel }: EnhancedRatingFormProps) {
  const [overallRating, setOverallRating] = useState(0)
  const [dimensionRatings, setDimensionRatings] = useState({
    service: 0,
    quality: 0,
    value: 0,
    ambiance: 0,
  })
  const [review, setReview] = useState("")
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const imageFiles = files.filter((file) => file.type.startsWith("image/"))
    const newPhotos = [...photos, ...imageFiles].slice(0, 5) // Max 5 photos

    setPhotos(newPhotos)

    // Create previews
    const newPreviews: string[] = []
    newPhotos.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          newPreviews.push(e.target.result as string)
          if (newPreviews.length === newPhotos.length) {
            setPhotoPreviews(newPreviews)
          }
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    const newPreviews = photoPreviews.filter((_, i) => i !== index)
    setPhotos(newPhotos)
    setPhotoPreviews(newPreviews)
  }

  const handleSubmit = async () => {
    if (overallRating === 0) {
      setError("Please select an overall rating")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("storeId", storeId)
      formData.append("rating", overallRating.toString())
      if (review.trim()) {
        formData.append("review", review.trim())
      }

      // Add dimension ratings if any are set
      const hasDimensions = Object.values(dimensionRatings).some((r) => r > 0)
      if (hasDimensions) {
        formData.append("ratings", JSON.stringify(dimensionRatings))
      }

      // Add photos
      photos.forEach((photo) => {
        formData.append("photos", photo)
      })

      const token = localStorage.getItem("auth-token")
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setOverallRating(0)
        setDimensionRatings({ service: 0, quality: 0, value: 0, ambiance: 0 })
        setReview("")
        setPhotos([])
        setPhotoPreviews([])
        onSuccess()
      } else {
        setError(data.error || "Failed to submit rating")
      }
    } catch (error) {
      setError("Network error. Please try again.")
      console.error("Error submitting rating:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (rating: number, onStarClick: (star: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 cursor-pointer hover:scale-110 transition-transform ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
        onClick={() => onStarClick(i + 1)}
      />
    ))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate This Store</CardTitle>
        <CardDescription>Share your detailed experience with other customers</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Overall Rating */}
        <div>
          <Label className="text-base font-semibold mb-2 block">Overall Rating *</Label>
          <div className="flex items-center space-x-2">{renderStars(overallRating, setOverallRating)}</div>
        </div>

        {/* Multi-dimensional Ratings */}
        <div className="space-y-4">
          <Label className="text-base font-semibold mb-2 block">Rate Specific Aspects (Optional)</Label>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <Label className="text-sm">Service</Label>
                {dimensionRatings.service > 0 && (
                  <span className="text-sm text-muted-foreground">{dimensionRatings.service}/5</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {renderStars(dimensionRatings.service, (rating) =>
                  setDimensionRatings({ ...dimensionRatings, service: rating }),
                )}
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <Label className="text-sm">Quality</Label>
                {dimensionRatings.quality > 0 && (
                  <span className="text-sm text-muted-foreground">{dimensionRatings.quality}/5</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {renderStars(dimensionRatings.quality, (rating) =>
                  setDimensionRatings({ ...dimensionRatings, quality: rating }),
                )}
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <Label className="text-sm">Value for Money</Label>
                {dimensionRatings.value > 0 && (
                  <span className="text-sm text-muted-foreground">{dimensionRatings.value}/5</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {renderStars(dimensionRatings.value, (rating) =>
                  setDimensionRatings({ ...dimensionRatings, value: rating }),
                )}
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <Label className="text-sm">Ambiance</Label>
                {dimensionRatings.ambiance > 0 && (
                  <span className="text-sm text-muted-foreground">{dimensionRatings.ambiance}/5</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {renderStars(dimensionRatings.ambiance, (rating) =>
                  setDimensionRatings({ ...dimensionRatings, ambiance: rating }),
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Review Text */}
        <div>
          <Label htmlFor="review" className="mb-2 block">
            Write a Review (Optional)
          </Label>
          <Textarea
            id="review"
            placeholder="Share your experience..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={4}
          />
        </div>

        {/* Photo Upload */}
        <div>
          <Label className="mb-2 block">Add Photos (Optional, Max 5)</Label>
          <div className="space-y-3">
            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {photoPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {photos.length < 5 && (
              <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-muted-foreground/25 rounded-md cursor-pointer hover:border-primary transition-colors">
                <div className="flex flex-col items-center">
                  <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                  <span className="text-sm text-muted-foreground">Upload Photo</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={isSubmitting || overallRating === 0} className="flex-1">
            {isSubmitting ? "Submitting..." : "Submit Rating"}
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

