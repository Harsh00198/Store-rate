"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { DataService } from "@/lib/data-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Star, TrendingUp, MessageSquare, Plus, Edit, Eye, Store } from "lucide-react"
import { AddStoreForm } from "@/components/forms/add-store-form"
import Link from "next/link"

export function StoreOwnerDashboard() {
  const { user } = useAuth()
  const [stores, setStores] = useState<any[]>([])
  const [allRatings, setAllRatings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddStore, setShowAddStore] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      if (!user) return

      try {
        const userStores = await DataService.getStoresByOwner(user.id)
        setStores(userStores)

        // Get all ratings for user's stores
        const ratingsPromises = userStores.map((store) => DataService.getRatingsByStore(store.id))
        const ratingsArrays = await Promise.all(ratingsPromises)
        const flatRatings = ratingsArrays.flat()
        setAllRatings(flatRatings)
      } catch (error) {
        console.error("Error loading store owner data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user])

  const handleStoreAdded = (newStore: any) => {
    setStores((prev) => [...prev, newStore])
    setShowAddStore(false)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ))
  }

  const totalRatings = allRatings.length
  const averageRating = totalRatings > 0 ? allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings : 0
  const recentRatings = allRatings
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Store Owner Dashboard</h1>
          <p className="text-muted-foreground">Manage your stores and track customer feedback</p>
        </div>
        <Dialog open={showAddStore} onOpenChange={setShowAddStore}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Store
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Store</DialogTitle>
              <DialogDescription>Create a new store listing for customers to discover and rate.</DialogDescription>
            </DialogHeader>
            <AddStoreForm onSuccess={handleStoreAdded} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stores.length}</div>
            <p className="text-xs text-muted-foreground">Active store listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRatings}</div>
            <p className="text-xs text-muted-foreground">Customer reviews received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Across all stores</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageRating >= 4.5
                ? "Excellent"
                : averageRating >= 4
                  ? "Good"
                  : averageRating >= 3
                    ? "Fair"
                    : "Needs Improvement"}
            </div>
            <p className="text-xs text-muted-foreground">Overall performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="stores" className="space-y-6">
        <TabsList>
          <TabsTrigger value="stores">My Stores</TabsTrigger>
          <TabsTrigger value="reviews">Recent Reviews</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="stores" className="space-y-6">
          {stores.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.map((store) => (
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
                        <span className="text-sm font-medium">{store.averageRating}</span>
                        <span className="text-xs text-muted-foreground">({store.totalRatings})</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{store.description}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/stores/${store.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No stores yet</h3>
                <p className="text-muted-foreground mb-4">Create your first store listing to get started.</p>
                <Button onClick={() => setShowAddStore(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Store
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Customer Reviews</CardTitle>
              <CardDescription>Latest feedback from your customers</CardDescription>
            </CardHeader>
            <CardContent>
              {recentRatings.length > 0 ? (
                <div className="space-y-4">
                  {recentRatings.map((rating) => {
                    const store = stores.find((s) => s.id === rating.storeId)
                    return (
                      <div key={rating.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium">{store?.name}</h4>
                            <div className="flex items-center space-x-1 mt-1">{renderStars(rating.rating)}</div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(rating.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        {rating.review && <p className="text-sm text-muted-foreground">"{rating.review}"</p>}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No reviews yet. Customers will see their reviews here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Store Performance</CardTitle>
                <CardDescription>Individual store ratings breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stores.map((store) => (
                    <div key={store.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{store.name}</p>
                        <div className="flex items-center space-x-1">{renderStars(store.averageRating)}</div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{store.averageRating}</p>
                        <p className="text-xs text-muted-foreground">{store.totalRatings} reviews</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
                <CardDescription>How customers rate your stores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = allRatings.filter((r) => r.rating === stars).length
                    const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0
                    return (
                      <div key={stars} className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 w-16">
                          <span className="text-sm">{stars}</span>
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        </div>
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary rounded-full h-2 transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
