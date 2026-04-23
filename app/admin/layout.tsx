"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin/Sidebar"
import AdminTopbar from "@/components/admin/Topbar"
import { useAuth } from "@/lib/auth"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, fetchMe } = useAuth()
  const router = useRouter()

  useEffect(() => {
    fetchMe()
  }, [fetchMe])

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login")
    if (!isLoading && user?.role === "client") router.replace("/dashboard")
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-2xl font-black text-doda-navy mb-2">DODA.</div>
          <p className="text-sm text-gray-500">Loading…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar userRole={user.role} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminTopbar user={user} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
