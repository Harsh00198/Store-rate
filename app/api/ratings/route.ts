import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const contentType = request.headers.get("content-type") || ""

    let response: Response

    // Handle FormData (for photo uploads)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      
      response = await fetch(`${process.env.BACKEND_URL || "http://localhost:5000"}/api/ratings`, {
        method: "POST",
        headers: {
          ...(authHeader && { Authorization: authHeader }),
        },
        body: formData,
      })
    } else {
      // Handle JSON (backward compatibility)
      const body = await request.json()
      
      response = await fetch(`${process.env.BACKEND_URL || "http://localhost:5000"}/api/ratings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authHeader && { Authorization: authHeader }),
        },
        body: JSON.stringify(body),
      })
    }

    const data = await response.json()

    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/6f5e7aa0-266f-4e9d-96f2-a539e0be835d", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId: "run2",
        hypothesisId: "H7",
        location: "app/api/ratings/route.ts:POST",
        message: "Proxy rating response",
        data: { status: response.status, ok: response.ok },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Rating creation proxy error:", error)
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/6f5e7aa0-266f-4e9d-96f2-a539e0be835d", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId: "run2",
        hypothesisId: "H7",
        location: "app/api/ratings/route.ts:POST",
        message: "Rating proxy error",
        data: { error: String(error) },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()

    const response = await fetch(`${process.env.BACKEND_URL || "http://localhost:5000"}/api/ratings?${queryString}`)
    const data = await response.json()

    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/6f5e7aa0-266f-4e9d-96f2-a539e0be835d", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId: "run2",
        hypothesisId: "H7",
        location: "app/api/ratings/route.ts:GET",
        message: "Proxy ratings list response",
        data: { status: response.status, ok: response.ok, query: queryString },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Rating fetch proxy error:", error)
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/6f5e7aa0-266f-4e9d-96f2-a539e0be835d", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId: "run2",
        hypothesisId: "H7",
        location: "app/api/ratings/route.ts:GET",
        message: "Ratings proxy error",
        data: { error: String(error) },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
