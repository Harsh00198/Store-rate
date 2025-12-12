"use client"

import { Navbar } from "@/components/navigation/navbar"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <AdminDashboard />
      </div>
    </ProtectedRoute>
  )
}
