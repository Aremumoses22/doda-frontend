import axios, { AxiosError, InternalAxiosRequestConfig } from "axios"

/**
 * Central Axios instance for all API calls to doda-backend.
 *
 * Features:
 *  - Base URL from NEXT_PUBLIC_API_URL env var
 *  - Sends cookies (refresh token) with every request
 *  - Attaches the JWT access token from localStorage on every request
 *  - Auto-refreshes the access token on 401, retries the original request
 *  - Redirects to /login if refresh fails
 */
export const api = axios.create({
  baseURL:         process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  withCredentials: true,   // sends httpOnly refresh cookie automatically
  headers: {
    "Content-Type": "application/json",
  },
})

// ── Request interceptor — attach access token ────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("doda_access_token")
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// ── Response interceptor — auto-refresh on 401 ───────────────────────────────
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token!)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Only intercept 401s — and only once per request (prevent infinite loops)
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      // Queue this request while a refresh is already in progress
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
        .catch((err) => Promise.reject(err))
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      // Attempt to get a new access token using the httpOnly refresh cookie
      const { data } = await axios.post<{ accessToken: string }>(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/auth/refresh`,
        {},
        { withCredentials: true }
      )

      const newToken = data.accessToken
      localStorage.setItem("doda_access_token", newToken)
      api.defaults.headers.common.Authorization = `Bearer ${newToken}`

      processQueue(null, newToken)

      originalRequest.headers.Authorization = `Bearer ${newToken}`
      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      // Refresh failed — clear everything and redirect to login
      localStorage.removeItem("doda_access_token")
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default api
