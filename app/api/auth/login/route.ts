import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
        hypothesisId: "H6",
        location: "app/api/auth/login/route.ts:POST",
        message: "Proxy login response",
        data: { status: response.status, ok: response.ok },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Login proxy error:", error)
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/6f5e7aa0-266f-4e9d-96f2-a539e0be835d", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId: "run2",
        hypothesisId: "H6",
        location: "app/api/auth/login/route.ts:POST",
        message: "Login proxy error",
        data: { error: String(error) },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
