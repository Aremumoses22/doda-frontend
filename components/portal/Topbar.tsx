"use client"

import Link from "next/link"
import { Bell, ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth, AuthUser } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"

interface Notification {
  _id: string
  message: string
  isRead: boolean
}

export default function PortalTopbar({ user }: { user: AuthUser }) {
  const { logout } = useAuth()
  const router = useRouter()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    api.get("/api/notifications?limit=20")
      .then(r => setUnread(r.data.unread ?? 0))
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    await logout()
    router.replace("/login")
  }

  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      {/* Page breadcrumb placeholder */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400 font-medium">Client Portal</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notifications bell */}
        <Link href="/dashboard/notifications" className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="h-5 w-5 text-gray-500" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-doda-navy text-white">{initials}</AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-doda-navy leading-none">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-gray-400 mt-0.5">Client</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">My Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/notifications">Notifications</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={handleLogout}>
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
