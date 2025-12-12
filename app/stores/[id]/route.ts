import { type NextRequest, NextResponse } from "next/server"

// Function to handle DELETE requests for deleting a store
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")

    const response = await fetch(
      `${process.env.BACKEND_URL || "http://localhost:5000"}/api/admin/stores/${params.id}`,
      {
        method: "DELETE",
        headers: {
          ...(authHeader && { Authorization: authHeader }),
        },
      },
    )

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Admin store deletion proxy error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}