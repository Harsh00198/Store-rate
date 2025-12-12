"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Users, Store, Star, TrendingUp, Plus, Trash2, Search, ArrowUpDown, Filter } from "lucide-react"
import { AddStoreForm } from "@/components/forms/add-store-form"
import type { User, Store as StoreType, Rating } from "@/lib/types"

export function AdminDashboard() {
  const { token } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [stores, setStores] = useState<StoreType[]>([])
  const [ratings, setRatings] = useState<Rating[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddStore, setShowAddStore] = useState(false)

  const [userSearch, setUserSearch] = useState("")
  const [storeSearch, setStoreSearch] = useState("")
  const [userSortField, setUserSortField] = useState<keyof User>("name")
  const [storeSortField, setStoreSortField] = useState<keyof StoreType>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  useEffect(() => {
    const loadData = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const [usersResponse, storesResponse, ratingsResponse] = await Promise.all([
          fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/stores'),
          fetch('/api/ratings')
        ]);

        const usersData = await usersResponse.json();
        const storesData = await storesResponse.json();
        const ratingsData = await ratingsResponse.json();

        if (usersData.success) {
          const formattedUsers = usersData.users.map((user: any) => ({
            ...user,
            createdAt: new Date(user.created_at),
            updatedAt: new Date(user.updated_at)
          }));
          setUsers(formattedUsers);
        }
        if (storesData.success) {
          const formattedStores = storesData.stores.map((store: any) => ({
            ...store,
            averageRating: store.average_rating,
            totalRatings: store.total_ratings,
            createdAt: new Date(store.created_at),
            updatedAt: new Date(store.updated_at)
          }));
          setStores(formattedStores);
        }
        if (ratingsData.success) setRatings(ratingsData.ratings);

      } catch (error) {
        console.error("Error loading admin data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [token])

  const handleDeleteStore = async (storeId: string) => {
    if (!token) return;
    try {
      const response = await fetch(`/api/admin/stores/${storeId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setStores((prev) => prev.filter((store) => store.id !== storeId))
        setRatings((prev) => prev.filter((rating) => rating.storeId !== storeId))
      }
    } catch (error) {
      console.error("Error deleting store:", error)
    }
  }

  const handleStoreAdded = (newStore: StoreType) => {
    setStores((prev) => [newStore, ...prev]);
    setShowAddStore(false)
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.role.toLowerCase().includes(userSearch.toLowerCase()),
  )

  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(storeSearch.toLowerCase()) ||
      store.category.toLowerCase().includes(storeSearch.toLowerCase()) ||
      store.address.toLowerCase().includes(storeSearch.toLowerCase()),
  )

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aValue = a[userSortField]
    const bValue = b[userSortField]
    if (sortDirection === "asc") {
        // @ts-ignore
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
        // @ts-ignore
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const sortedStores = [...filteredStores].sort((a, b) => {
    const aValue = a[storeSortField]
    const bValue = b[storeSortField]
    if (sortDirection === "asc") {
        // @ts-ignore
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
        // @ts-ignore
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const handleSort = (field: keyof User | keyof StoreType, type: "user" | "store") => {
    const currentSortField = type === 'user' ? userSortField : storeSortField;
    if (currentSortField === field) {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
        if (type === 'user') setUserSortField(field as keyof User);
        else setStoreSortField(field as keyof StoreType);
        setSortDirection('asc');
    }
  }

  const totalUsers = users.length
  const totalStores = stores.length
  const totalRatings = ratings.length
  const averageRating = totalRatings > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings : 0

  const usersByRole = users.reduce(
    (acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">Loading admin dashboard...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, stores, and system analytics</p>
        </div>
        <Dialog open={showAddStore} onOpenChange={setShowAddStore}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Store
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Store</DialogTitle>
              <DialogDescription>Create a new store listing in the system.</DialogDescription>
            </DialogHeader>
            <AddStoreForm onSuccess={handleStoreAdded} />
          </DialogContent>
        </Dialog>
      </div>

      {/* System Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {usersByRole.user || 0} customers, {usersByRole.store_owner || 0} owners
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStores}</div>
            <p className="text-xs text-muted-foreground">Active store listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRatings}</div>
            <p className="text-xs text-muted-foreground">Customer reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">System-wide average</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="stores" className="space-y-6">
        <TabsList>
          <TabsTrigger value="stores">Store Management</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="analytics">System Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="stores" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Management</CardTitle>
              <CardDescription>View, add, and remove stores from the system</CardDescription>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search stores..."
                    value={storeSearch}
                    onChange={(e) => setStoreSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort("name", "store")} className="h-auto p-0 font-medium">
                        Name <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort("category", "store")} className="h-auto p-0 font-medium">
                        Category <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort("averageRating", "store")} className="h-auto p-0 font-medium">
                        Rating <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort("totalRatings", "store")} className="h-auto p-0 font-medium">
                        Reviews <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedStores.map((store) => (
                    <TableRow key={store.id}>
                      <TableCell className="font-medium">{store.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{store.category}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{store.address}</TableCell>
                      <TableCell>{store.averageRating}</TableCell>
                      <TableCell>{store.totalRatings}</TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Store</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{store.name}"? This action cannot be undone and will
                                remove all associated reviews.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteStore(String(store.id))}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage all system users</CardDescription>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort("name", "user")} className="h-auto p-0 font-medium">
                        Name <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort("email", "user")} className="h-auto p-0 font-medium">
                        Email <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort("role", "user")} className="h-auto p-0 font-medium">
                        Role <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort("createdAt", "user")} className="h-auto p-0 font-medium">
                        Joined <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "admin" ? "default" : user.role === "store_owner" ? "secondary" : "outline"
                          }
                        >
                          {user.role.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="max-w-xs truncate">{user.address || "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}