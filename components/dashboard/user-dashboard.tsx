"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Star, MapPin, Calendar, TrendingUp } from "lucide-react"
import type { Store, Rating } from "@/lib/types"
import Link from "next/link"

// Component yahan se shuru hota hai
export function UserDashboard() {
  const { user, token } = useAuth()
  const [stores, setStores] = useState<Store[]>([])
  const [userRatings, setUserRatings] = useState<Rating[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredStores, setFilteredStores] = useState<Store[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (!user || !token) {
        setIsLoading(false)
        return
      }
      try {
        const [storesResponse, ratingsResponse] = await Promise.all([
          fetch("/api/stores"),
          fetch(`/api/ratings?userId=${user.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ])

        const storesData = await storesResponse.json()
        const ratingsData = await ratingsResponse.json()

        if (storesData.success) {
          setStores(storesData.stores)
          setFilteredStores(storesData.stores)
        }
        
        if (ratingsData.success) {
          setUserRatings(ratingsData.ratings)
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user, token])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = stores.filter(
        (store) =>
          store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (store.description && store.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (store.category && store.category.toLowerCase().includes(searchQuery.toLowerCase())),
      )
      setFilteredStores(filtered)
    } else {
      setFilteredStores(stores)
    }
  }, [searchQuery, stores])

  const handleSearch = async () => {
    // Is function ko abhi ke liye aise hi rakhein, aage use kar sakte hain
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">Loading your dashboard...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-muted-foreground">Discover new stores and share your experiences with the community.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Reviews</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userRatings.length}</div>
            <p className="text-xs text-muted-foreground">Total reviews written</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Stores</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stores.length}</div>
            <p className="text-xs text-muted-foreground">Stores to explore</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userRatings.length > 0
                ? (userRatings.reduce((sum, r) => sum + r.rating, 0) / userRatings.length).toFixed(1)
                : "0.0"}
            </div>
            <p className="text-xs text-muted-foreground">Your average rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="stores" className="space-y-6">
        <TabsList>
          <TabsTrigger value="stores">Browse Stores</TabsTrigger>
          <TabsTrigger value="reviews">My Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="stores" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Find Stores</CardTitle>
              <CardDescription>Search for stores by name, category, or description</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search stores..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch}>Search</Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStores.map((store) => (
              <Card key={store.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{store.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {store.category}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {/* @ts-ignore */}
                      <span className="text-sm font-medium">{store.average_rating || store.averageRating}</span>
                      {/* @ts-ignore */}
                      <span className="text-xs text-muted-foreground">({store.total_ratings || store.totalRatings})</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{store.description}</p>
                  <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    {store.address}
                  </div>
                  <Button className="w-full" asChild>
                    <Link href={`/stores/${store.id}`}>View Details & Rate</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Reviews</CardTitle>
              <CardDescription>All the reviews you've written for stores</CardDescription>
            </CardHeader>
            <CardContent>
              {userRatings.length > 0 ? (
                <div className="space-y-4">
                  {userRatings.map((rating) => {
                    const store = stores.find((s) => s.id === rating.storeId)
                    return (
                      <div key={rating.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{store?.name || "Unknown Store"}</h4>
                          <div className="flex items-center space-x-1">{renderStars(rating.rating)}</div>
                        </div>
                        {rating.review && <p className="text-sm text-muted-foreground mb-2">"{rating.review}"</p>}
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(rating.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">You haven't written any reviews yet.</p>
                  <Button asChild>
                    <Link href="/stores">Browse Stores to Review</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} // Component yahan par khatam hota hai