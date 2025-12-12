interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("auth-token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(endpoint, {
        headers: this.getAuthHeaders(),
      })
      const data = await response.json()
      return { success: response.ok, data: response.ok ? data : undefined, error: response.ok ? undefined : data.error }
    } catch (error) {
      return { success: false, error: "Network error" }
    }
  }

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(body),
      })
      const data = await response.json()
      return { success: response.ok, data: response.ok ? data : undefined, error: response.ok ? undefined : data.error }
    } catch (error) {
      return { success: false, error: "Network error" }
    }
  }

  async put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(body),
      })
      const data = await response.json()
      return { success: response.ok, data: response.ok ? data : undefined, error: response.ok ? undefined : data.error }
    } catch (error) {
      return { success: false, error: "Network error" }
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      })
      const data = await response.json()
      return { success: response.ok, data: response.ok ? data : undefined, error: response.ok ? undefined : data.error }
    } catch (error) {
      return { success: false, error: "Network error" }
    }
  }
}

export const apiClient = new ApiClient()
