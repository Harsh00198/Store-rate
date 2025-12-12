"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Navbar } from "@/components/navigation/navbar"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Star, MapPin, Calendar, ThumbsUp, Flag, CheckCircle2 } from "lucide-react"
import { EnhancedRatingForm } from "@/components/forms/enhanced-rating-form"
import { AISummary } from "@/components/store/ai-summary"
import { BenchmarkDisplay } from "@/components/store/benchmark-display"
import { ReviewPhotos } from "@/components/reviews/review-photos"
import type { Store, Rating, ReviewSummary, BenchmarkData } from "@/lib/types"

export default function StoreDetailPage() {
  const params = useParams()
  const { user, token } = useAuth()
  const [store, setStore] = useState<Store | null>(null)
  const [ratings, setRatings] = useState<Rating[]>([])
  const [summary, setSummary] = useState<ReviewSummary | null>(null)
  const [benchmark, setBenchmark] = useState<BenchmarkData | null>(null)
  const [showRatingForm, setShowRatingForm] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const loadStoreData = async () => {
    if (params.id) {
      try {
        setIsLoading(true)
        const [storeResponse, ratingsResponse, summaryResponse, benchmarkResponse] = await Promise.all([
          fetch(`/api/stores/${params.id}`),
          fetch(`/api/ratings?storeId=${params.id}`),
          fetch(`/api/stores/${params.id}/summary`),
          fetch(`/api/stores/${params.id}/benchmark`),
        ])

        if (storeResponse.ok) {
          const storeData = await storeResponse.json()
          setStore(storeData.store)
          // Use ratings from store response if available (includes photos, tags, etc.)
          if (storeData.store.ratings) {
            setRatings(storeData.store.ratings)
          }
        }

        if (ratingsResponse.ok) {
          const ratingsData = await ratingsResponse.json()
          // Only update if store response didn't include ratings
          if (!store?.ratings) {
            setRatings(ratingsData.ratings)
          }
        }

        if (summaryResponse.ok) {
          const summaryData = await summaryResponse.json()
          setSummary(summaryData.summary)
        }

        if (benchmarkResponse.ok) {
          const benchmarkData = await benchmarkResponse.json()
          setBenchmark(benchmarkData.benchmark)
        }
      } catch (error) {
        console.error("Error loading store data:", error)
        setError("Failed to load store data.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    loadStoreData()
  }, [params.id])

  const handleRatingSuccess = () => {
    setSuccess("Rating submitted successfully!")
    setShowRatingForm(false)
    setTimeout(() => {
      loadStoreData()
      setSuccess("")
    }, 2000)
  }

  const handleHelpful = async (ratingId: string) => {
    if (!token) return
    try {
      const response = await fetch(`/api/ratings/${ratingId}/helpful`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        loadStoreData()
      }
    } catch (error) {
      console.error("Error marking helpful:", error)
    }
  }

  const handleFlag = async (ratingId: string) => {
    if (!token) return
    if (!confirm("Are you sure you want to flag this review?")) return
    try {
      const response = await fetch(`/api/ratings/${ratingId}/flag`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: "Inappropriate content" }),
      })
      if (response.ok) {
        alert("Review flagged. Thank you for your feedback.")
      }
    } catch (error) {
      console.error("Error flagging review:", error)
    }
  }

  const renderStars = (rating: number, interactive = false, onStarClick?: (star: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""} ${
          // @ts-ignore
          i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
        onClick={() => interactive && onStarClick?.(i + 1)}
      />
    ))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">Loading store details...</div>
        </div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">Store not found</div>
        </div>
      </div>
    )
  }

  // Check if user already rated this store
  const userExistingRating = user ? ratings.find((r) => r.userId === user.id) : null

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        {/* Store Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl mb-2">{store.name}</CardTitle>
                <Badge variant="secondary" className="mb-2">
                  {store.category}
                </Badge>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  {store.address}
                </div>
              </div>
              <div className="text-right">
              {/* @ts-ignore */}
                <div className="flex items-center space-x-1 mb-1">{renderStars(store.average_rating)}</div>
                <div className="text-sm text-muted-foreground">
                  {/* @ts-ignore */}
                  {parseFloat(store.average_rating).toFixed(1)} ({store.total_ratings} reviews)
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{store.description}</p>
          </CardContent>
        </Card>

        {/* Success Message */}
        {success && (
          <Alert className="mb-4">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* AI Summary and Benchmark */}
        {(summary || benchmark) && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {summary && <AISummary summary={summary} />}
            {benchmark && <BenchmarkDisplay benchmark={benchmark} />}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Rating Form */}
          {user && user.role === "user" && !userExistingRating && (
            <div className="lg:col-span-1">
              {showRatingForm ? (
                <EnhancedRatingForm storeId={store.id} onSuccess={handleRatingSuccess} onCancel={() => setShowRatingForm(false)} />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Rate This Store</CardTitle>
                    <CardDescription>Share your detailed experience</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => setShowRatingForm(true)} className="w-full">
                      Write a Review
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Show existing rating if user already rated */}
          {user && user.role === "user" && userExistingRating && (
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Your Rating</CardTitle>
                  <CardDescription>You have already rated this store</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex space-x-1">{renderStars(userExistingRating.rating)}</div>
                      {userExistingRating.verified && (
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>

                  {userExistingRating.ratings && (
                    <div className="space-y-1 text-sm">
                      {userExistingRating.ratings.service && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Service:</span>
                          <span>{userExistingRating.ratings.service}/5</span>
                        </div>
                      )}
                      {userExistingRating.ratings.quality && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Quality:</span>
                          <span>{userExistingRating.ratings.quality}/5</span>
                        </div>
                      )}
                      {userExistingRating.ratings.value && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Value:</span>
                          <span>{userExistingRating.ratings.value}/5</span>
                        </div>
                      )}
                      {userExistingRating.ratings.ambiance && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ambiance:</span>
                          <span>{userExistingRating.ratings.ambiance}/5</span>
                        </div>
                      )}
                    </div>
                  )}

                  {userExistingRating.review && (
                    <div>
                      <p className="text-sm text-muted-foreground">"{userExistingRating.review}"</p>
                    </div>
                  )}

                  {userExistingRating.photos && userExistingRating.photos.length > 0 && (
                    <ReviewPhotos photos={userExistingRating.photos} storeName={store.name} />
                  )}

                  {userExistingRating.tags && userExistingRating.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {userExistingRating.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    Submitted on {new Date(userExistingRating.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Reviews List */}
          <div className={user && user.role === "user" ? "lg:col-span-2" : "lg:col-span-3"}>
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
                <CardDescription>
                  {ratings.length} review{ratings.length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ratings.length > 0 ? (
                  <div className="space-y-6">
                    {ratings.map((rating) => (
                      <div key={rating.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center space-x-1">{renderStars(rating.rating)}</div>
                            {rating.verified && (
                              <Badge variant="outline" className="text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                            {rating.tags && rating.tags.length > 0 && (
                              <div className="flex gap-1">
                                {rating.tags.slice(0, 2).map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground gap-2">
                            <Calendar className="h-3 w-3" />
                            {new Date(rating.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        {rating.user_name && (
                          <p className="text-sm font-medium mb-1">{rating.user_name}</p>
                        )}

                        {rating.review && (
                          <p className="text-sm text-muted-foreground mb-2">"{rating.review}"</p>
                        )}

                        {rating.ratings && (
                          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-2">
                            {rating.ratings.service && (
                              <div>Service: {rating.ratings.service}/5</div>
                            )}
                            {rating.ratings.quality && (
                              <div>Quality: {rating.ratings.quality}/5</div>
                            )}
                            {rating.ratings.value && (
                              <div>Value: {rating.ratings.value}/5</div>
                            )}
                            {rating.ratings.ambiance && (
                              <div>Ambiance: {rating.ratings.ambiance}/5</div>
                            )}
                          </div>
                        )}

                        {rating.photos && rating.photos.length > 0 && (
                          <ReviewPhotos photos={rating.photos} storeName={store.name} />
                        )}

                        <div className="flex items-center gap-4 mt-3">
                          <button
                            onClick={() => handleHelpful(rating.id)}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                          >
                            <ThumbsUp className="h-3 w-3" />
                            Helpful ({rating.helpfulCount || 0})
                          </button>
                          {user && (
                            <button
                              onClick={() => handleFlag(rating.id)}
                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Flag className="h-3 w-3" />
                              Flag
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No reviews yet. Be the first to review this store!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}