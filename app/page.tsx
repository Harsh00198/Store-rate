import { Navbar } from "@/components/navigation/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, Store, Users, Shield } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Rate Your Favorite <span className="text-primary">Stores</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                Discover amazing stores, share your experiences, and help others make informed decisions with our
                community-driven rating platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" asChild>
                  <Link href="/stores">Browse Stores</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/auth?tab=signup">Join Community</Link>
                </Button>
              </div>
            </div>
            <div className="relative h-96 lg:h-[500px] rounded-lg overflow-hidden">
              <Image
                src="/images/store-rating-hero.png"
                alt="Store Rating Platform"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose StoreRate?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <Star className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Rate & Review</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Share your honest experiences and help others discover great stores.</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Store className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Discover Stores</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Find new stores in your area with detailed ratings and reviews.</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Community Driven</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Join a community of shoppers sharing authentic experiences.</CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Store Owners</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Manage your store profile and engage with customer feedback.</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Sample Stores Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Stores</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="overflow-hidden">
              <div className="relative h-48">
                <Image src="/cozy-coffee-shop.png" alt="Cozy Coffee Corner" fill className="object-cover" />
              </div>
              <CardHeader>
                <CardTitle>Cozy Coffee Corner</CardTitle>
                <CardDescription>Artisanal coffee and fresh pastries</CardDescription>
              </CardHeader>
            </Card>

            <Card className="overflow-hidden">
              <div className="relative h-48">
                <Image
                  src="/electronics-store-interior.png"
                  alt="TechWorld Electronics"
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle>TechWorld Electronics</CardTitle>
                <CardDescription>Latest gadgets and tech accessories</CardDescription>
              </CardHeader>
            </Card>

            <Card className="overflow-hidden">
              <div className="relative h-48">
                <Image
                  src="/images/restaurant-interior.png"
                  alt="Mama's Italian Kitchen"
                  fill
                  className="object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle>Mama's Italian Kitchen</CardTitle>
                <CardDescription>Authentic Italian cuisine</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of users who trust StoreRate for honest store reviews and ratings.
          </p>
          <Button size="lg" asChild>
            <Link href="/auth?tab=signup">Create Your Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 StoreRate. All rights reserved.</p>
          <p className="mt-2 text-sm">
            Admin Login: admin@storerating.com | Demo User: alice@example.com | Password: Admin@123
          </p>
        </div>
      </footer>
    </div>
  )
}
