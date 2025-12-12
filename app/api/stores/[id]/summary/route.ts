import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const response = await fetch(`${process.env.BACKEND_URL || "http://localhost:5000"}/api/stores/${params.id}/summary`)
    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Summary fetch proxy error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

