import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const response = await fetch(`${process.env.BACKEND_URL || "http://localhost:5000"}/api/stores/${params.id}`)
    const data = await response.json()

    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/6f5e7aa0-266f-4e9d-96f2-a539e0be835d", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId: "run2",
        hypothesisId: "H7",
        location: "app/api/stores/[id]/route.ts:GET",
        message: "Proxy store detail response",
        data: { status: response.status, ok: response.ok, id: params.id },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Store fetch proxy error:", error)
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/6f5e7aa0-266f-4e9d-96f2-a539e0be835d", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId: "run2",
        hypothesisId: "H7",
        location: "app/api/stores/[id]/route.ts:GET",
        message: "Store detail proxy error",
        data: { error: String(error), id: params.id },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/6f5e7aa0-266f-4e9d-96f2-a539e0be835d", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId: "run2",
        hypothesisId: "H7",
        location: "app/api/stores/[id]/route.ts:DELETE",
        message: "Proxy store delete response",
        data: { status: response.status, ok: response.ok, id: params.id },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Store deletion proxy error:", error)
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/6f5e7aa0-266f-4e9d-96f2-a539e0be835d", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId: "run2",
        hypothesisId: "H7",
        location: "app/api/stores/[id]/route.ts:DELETE",
        message: "Store delete proxy error",
        data: { error: String(error), id: params.id },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
