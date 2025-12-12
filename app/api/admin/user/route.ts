import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    const response = await fetch(`${process.env.BACKEND_URL || "http://localhost:5000"}/api/admin/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader }),
      },
    })

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Admin users fetch proxy error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}