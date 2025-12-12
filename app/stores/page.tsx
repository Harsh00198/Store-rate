"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navigation/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, MapPin, Search, Filter } from "lucide-react"
import type { Store } from "@/lib/types"
import Link from "next/link"

const storeCategories = [
  "All Categories",
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

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [filteredStores, setFilteredStores] = useState<Store[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [sortBy, setSortBy] = useState("name")
  const [isLoading, setIsLoading] = useState(true)

  // Load stores directly from the API
  useEffect(() => {
    const loadStores = async () => {
      try {
        const response = await fetch('/api/stores');
        const data = await response.json();
        if (data.success) {
          setStores(data.stores)
          setFilteredStores(data.stores)
        }
      } catch (error) {
        console.error("Error loading stores:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStores()
  }, [])

  // Filter and sort logic (yeh aage kaam aayega)
  useEffect(() => {
    let processingStores = [...stores];

    if (searchQuery.trim()) {
        processingStores = processingStores.filter(
        (store) =>
          store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.address.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedCategory !== "All Categories") {
        processingStores = processingStores.filter((store) => store.category === selectedCategory)
    }
    
    processingStores.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          // @ts-ignore
          return b.average_rating - a.average_rating
        case "reviews":
          // @ts-ignore
          return b.total_ratings - a.total_ratings
        case "name":
        default:
          return a.name.localeCompare(b.name)
      }
    })

    setFilteredStores(processingStores)
  }, [searchQuery, selectedCategory, sortBy, stores])


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
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">Loading stores...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">All Stores</h1>
          <p className="text-muted-foreground">Discover and rate amazing stores in your area</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Find Stores</CardTitle>
            <CardDescription>Search and filter stores to find exactly what you're looking for</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search stores by name, description, or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {storeCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredStores.length} of {stores.length} stores
            {selectedCategory !== "All Categories" && ` in ${selectedCategory}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>

        {/* Store Grid */}
        {filteredStores.length > 0 ? (
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
                      <span className="text-sm font-medium">{store.average_rating}</span>
                      {/* @ts-ignore */}
                      <span className="text-xs text-muted-foreground">({store.total_ratings})</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{store.description}</p>
                  <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{store.address}</span>
                  </div>
                    {/* @ts-ignore */}
                  <div className="flex items-center space-x-1 mb-4">{renderStars(store.average_rating)}</div>
                  <Button className="w-full" asChild>
                    <Link href={`/stores/${store.id}`}>View Details & Rate</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No stores found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedCategory !== "All Categories"
                  ? "Try adjusting your search criteria or filters."
                  : "No stores are available at the moment."}
              </p>
              {(searchQuery || selectedCategory !== "All Categories") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("All Categories")
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}