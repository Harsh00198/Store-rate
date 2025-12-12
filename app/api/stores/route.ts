import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()

    const response = await fetch(`${process.env.BACKEND_URL || "http://localhost:5000"}/api/stores?${queryString}`)
    const data = await response.json()

    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/6f5e7aa0-266f-4e9d-96f2-a539e0be835d", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId: "run2",
        hypothesisId: "H7",
        location: "app/api/stores/route.ts:GET",
        message: "Proxy stores response",
        data: { status: response.status, ok: response.ok, query: queryString },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Stores fetch proxy error:", error)
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/6f5e7aa0-266f-4e9d-96f2-a539e0be835d", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId: "run2",
        hypothesisId: "H7",
        location: "app/api/stores/route.ts:GET",
        message: "Stores proxy error",
        data: { error: String(error) },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get("authorization")

    const response = await fetch(`${process.env.BACKEND_URL || "http://localhost:5000"}/api/stores`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader && { Authorization: authHeader }),
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/6f5e7aa0-266f-4e9d-96f2-a539e0be835d", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId: "run2",
        hypothesisId: "H7",
        location: "app/api/stores/route.ts:POST",
        message: "Proxy store create response",
        data: { status: response.status, ok: response.ok },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Store creation proxy error:", error)
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/6f5e7aa0-266f-4e9d-96f2-a539e0be835d", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId: "run2",
        hypothesisId: "H7",
        location: "app/api/stores/route.ts:POST",
        message: "Store create proxy error",
        data: { error: String(error) },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
