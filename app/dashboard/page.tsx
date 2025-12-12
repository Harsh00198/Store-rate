"use client"

import { Navbar } from "@/components/navigation/navbar"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { UserDashboard } from "@/components/dashboard/user-dashboard"

export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["user"]}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <UserDashboard />
      </div>
    </ProtectedRoute>
  )
}
