"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Scale,
  FileText,
  MessageSquare,
  Receipt,
  RefreshCw,
  CalendarPlus,
  User,
  HelpCircle,
  Bell,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"

const navItems = [
  { label: "Dashboard",      href: "/dashboard",           icon: LayoutDashboard },
  { label: "My Matters",     href: "/dashboard/matters",   icon: Scale },
  { label: "Documents",      href: "/dashboard/documents", icon: FileText },
  { label: "Messages",       href: "/dashboard/messages",  icon: MessageSquare },
  { label: "Billing",        href: "/dashboard/billing",   icon: Receipt },
  { label: "Retainer",       href: "/dashboard/retainer",  icon: RefreshCw },
  { label: "Book a Session", href: "/dashboard/book",      icon: CalendarPlus },
]

const bottomItems = [
  { label: "My Profile",    href: "/dashboard/profile", icon: User },
  { label: "Help & Support",href: "/dashboard/help",    icon: HelpCircle },
]

export default function PortalSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.replace("/login")
  }

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href)

  return (
    <aside className="w-64 shrink-0 bg-doda-navy flex flex-col h-screen">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold text-doda-gold tracking-tight">DODA.</span>
          <span className="text-xs text-white/40 font-medium">Client Portal</span>
        </Link>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map(item => {
          const active = isActive(item.href)
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-doda-gold text-doda-navy"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}>
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom nav */}
      <div className="px-3 py-3 border-t border-white/10 space-y-0.5">
        {bottomItems.map(item => {
          const active = isActive(item.href)
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-doda-gold text-doda-navy"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}>
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}

        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all">
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </button>
      </div>

      {/* Confidentiality notice */}
      <div className="px-4 py-3 border-t border-white/10">
        <p className="text-xs text-white/25 leading-relaxed">
          Content in this portal is confidential and protected by legal professional privilege.
        </p>
      </div>
    </aside>
  )
}
