"use client"

import { create } from "zustand"
import { api } from "./api"

export type AuthUser = {
  id: string
  email: string
  role: "principal" | "lawyer" | "admin_staff" | "billing_admin" | "client"
  firstName: string
  lastName: string
  phone?: string
  isActive: boolean
}

type AuthStore = {
  user: AuthUser | null
  isLoading: boolean
  fetchMe: () => Promise<void>
  login: (email: string, password: string) => Promise<{ role: string }>
  logout: () => Promise<void>
}

export const useAuth = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,

  fetchMe: async () => {
    try {
      const { data } = await api.get<AuthUser>("/api/auth/me")
      set({ user: data, isLoading: false })
    } catch {
      set({ user: null, isLoading: false })
    }
  },

  login: async (email: string, password: string) => {
    const { data } = await api.post<{ accessToken: string; user: AuthUser }>(
      "/api/auth/login",
      { email, password }
    )
    // Store access token for Axios interceptor
    if (typeof window !== "undefined") {
      localStorage.setItem("doda_access_token", data.accessToken)
      // Store in cookie for Next.js middleware JWT check (15 min = 900s)
      document.cookie = `doda_token=${data.accessToken}; path=/; max-age=900; SameSite=Strict`
    }
    set({ user: data.user })
    return { role: data.user.role }
  },

  logout: async () => {
    try {
      await api.post("/api/auth/logout")
    } catch {
      // ignore
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("doda_access_token")
      document.cookie = "doda_token=; path=/; max-age=0"
    }
    set({ user: null })
  },
}))
