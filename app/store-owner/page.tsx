"use client"

import { Navbar } from "@/components/navigation/navbar"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { StoreOwnerDashboard } from "@/components/dashboard/store-owner-dashboard"

export default function StoreOwnerPage() {
  return (
    <ProtectedRoute allowedRoles={["store_owner"]}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <StoreOwnerDashboard />
      </div>
    </ProtectedRoute>
  )
}
