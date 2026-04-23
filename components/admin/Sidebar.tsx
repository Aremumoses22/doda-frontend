"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  Receipt,
  RefreshCw,
  MessageSquare,
  Calendar,
  UserCog,
  BarChart3,
  Settings,
  ClipboardList,
  Scale,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

type NavItem = {
  label: string
  href: string
  icon: React.ElementType
  roles?: string[]
}

const navItems: NavItem[] = [
  { label: "Dashboard",    href: "/admin",           icon: LayoutDashboard },
  { label: "Leads",        href: "/admin/leads",     icon: Users },
  { label: "Clients",      href: "/admin/clients",   icon: Briefcase },
  { label: "Matters",      href: "/admin/matters",   icon: Scale },
  { label: "Documents",    href: "/admin/documents", icon: FileText },
  { label: "Billing",      href: "/admin/billing",   icon: Receipt },
  { label: "Retainers",    href: "/admin/retainers", icon: RefreshCw },
  { label: "Messages",     href: "/admin/messages",  icon: MessageSquare },
  { label: "Calendar",     href: "/admin/calendar",  icon: Calendar },
  { label: "Team",         href: "/admin/team",      icon: UserCog,      roles: ["principal"] },
  { label: "Reports",      href: "/admin/reports",   icon: BarChart3,    roles: ["principal", "billing_admin"] },
  { label: "Audit Log",    href: "/admin/audit-log", icon: ClipboardList, roles: ["principal"] },
  { label: "Settings",     href: "/admin/settings",  icon: Settings,     roles: ["principal"] },
]

interface SidebarProps {
  userRole: string
}

export default function AdminSidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()

  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  )

  return (
    <aside className="w-64 bg-doda-navy text-white flex flex-col h-full overflow-y-auto shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tight text-white">DODA.</span>
          <span className="text-xs text-doda-gold font-medium mt-1">Admin</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-doda-gold text-doda-navy"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/10">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 text-xs text-white/50 hover:text-white/80 transition-colors"
        >
          <Scale className="h-3 w-3" />
          View Public Website
        </Link>
      </div>
    </aside>
  )
}
