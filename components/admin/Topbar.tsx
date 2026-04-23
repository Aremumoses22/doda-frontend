"use client"

import { Bell, LogOut, User } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

type TopbarUser = {
  firstName: string
  lastName: string
  email: string
  role: string
}

interface TopbarProps {
  user: TopbarUser
}

const roleLabel: Record<string, string> = {
  principal:    "Principal",
  lawyer:       "Lawyer",
  admin_staff:  "Admin Staff",
  billing_admin:"Billing Admin",
  client:       "Client",
}

export default function AdminTopbar({ user }: TopbarProps) {
  const { logout } = useAuth()
  const router = useRouter()

  const initials = `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase()

  const handleLogout = async () => {
    await logout()
    router.replace("/login")
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      {/* Breadcrumb placeholder — pages override via context if needed */}
      <div className="text-sm text-gray-500 font-medium">Doda Legal — Admin Portal</div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Link href="/admin/messages">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-gray-500" />
            {/* Unread badge — future: wired to notification count */}
          </Button>
        </Link>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-100 transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-doda-navy">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500">{roleLabel[user.role] ?? user.role}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/settings" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile & Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
