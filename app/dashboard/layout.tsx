"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import PortalSidebar from "@/components/portal/Sidebar"
import PortalTopbar from "@/components/portal/Topbar"
import { useAuth } from "@/lib/auth"

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, fetchMe } = useAuth()
  const router = useRouter()

  useEffect(() => {
    fetchMe()
  }, [])

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login")
    if (!isLoading && user && user.role !== "client") router.replace("/admin")
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-2xl font-bold text-doda-gold">DODA.</p>
          <p className="text-sm text-gray-400 mt-2">Loading your portal…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <PortalSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <PortalTopbar user={user} />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}
