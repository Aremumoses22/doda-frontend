"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Scale, FileText, MessageSquare, Receipt, RefreshCw,
  CalendarPlus, ArrowRight, AlertTriangle, CheckCircle2, Loader2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { format } from "date-fns"

interface Matter {
  _id: string
  title: string
  practiceArea: string
  status: string
  tasks: { status: string }[]
  updatedAt: string
  assignedToId?: { firstName: string; lastName: string } | null
}

interface Doc {
  _id: string
  name: string
  category: string
  createdAt: string
}

interface Message {
  _id: string
  body: string
  senderId: { firstName: string; lastName: string } | null
  createdAt: string
  readAt?: string | null
}

interface Invoice {
  _id: string
  invoiceNumber: string
  total: number
  status: string
  dueDate?: string
}

interface Retainer {
  planName: string
  renewalDate?: string
  status: string
}

// Map internal status → client-facing label + style
const matterStatusMap: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft:    { label: "Getting Started", color: "bg-gray-100 text-gray-600",    icon: Loader2 },
  open:     { label: "Getting Started", color: "bg-gray-100 text-gray-600",    icon: Loader2 },
  active:   { label: "In Progress",     color: "bg-amber-100 text-amber-700",  icon: Loader2 },
  on_hold:  { label: "On Hold",         color: "bg-orange-100 text-orange-700",icon: Loader2 },
  closed:   { label: "Completed ✅",    color: "bg-green-100 text-green-700",  icon: CheckCircle2 },
}

function MatterStatusBadge({ status, hasAction }: { status: string; hasAction: boolean }) {
  if (hasAction) {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
        <AlertTriangle className="h-3 w-3" /> Awaiting Your Input
      </span>
    )
  }
  const mapped = matterStatusMap[status] ?? { label: status, color: "bg-gray-100 text-gray-600" }
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${mapped.color}`}>{mapped.label}</span>
}

function matterProgress(tasks: { status: string }[]) {
  if (!tasks.length) return 0
  return Math.round((tasks.filter(t => t.status === "done").length / tasks.length) * 100)
}

export default function PortalHome() {
  const { user } = useAuth()
  const [matters, setMatters]   = useState<Matter[]>([])
  const [docs, setDocs]         = useState<Doc[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [retainer, setRetainer] = useState<Retainer | null>(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.allSettled([
      api.get("/api/matters?limit=6"),
      api.get("/api/documents?limit=4&visibleToClient=true"),
      api.get("/api/messages?limit=5"),
      api.get("/api/invoices?limit=10"),
      api.get("/api/retainers?limit=1&status=active"),
    ]).then(([mRes, dRes, msgRes, invRes, retRes]) => {
      if (mRes.status === "fulfilled")   setMatters(mRes.value.data.matters ?? [])
      if (dRes.status === "fulfilled")   setDocs(dRes.value.data.documents ?? [])
      if (msgRes.status === "fulfilled") setMessages(msgRes.value.data.messages ?? [])
      if (invRes.status === "fulfilled") setInvoices(invRes.value.data.invoices ?? [])
      if (retRes.status === "fulfilled") setRetainer(retRes.value.data.retainers?.[0] ?? null)
    }).finally(() => setLoading(false))
  }, [])

  const activeMatters      = matters.filter(m => m.status !== "closed")
  const actionNeededCount  = matters.filter(m =>
    m.tasks.some(t => t.status === "pending")
  ).length
  const unreadMessages     = messages.filter(m => !m.readAt).length
  const outstandingInvoices= invoices.filter(i => i.status === "sent" || i.status === "overdue")
  const outstandingTotal   = outstandingInvoices.reduce((s, i) => s + i.total, 0)

  const summaryCards = [
    { label: "Active Matters",       value: activeMatters.length,       icon: Scale,          href: "/dashboard/matters",  color: "text-doda-navy" },
    { label: "Docs Awaiting Review", value: actionNeededCount,          icon: FileText,        href: "/dashboard/documents",color: "text-amber-600" },
    { label: "Unread Messages",      value: unreadMessages,             icon: MessageSquare,   href: "/dashboard/messages", color: "text-blue-600" },
    { label: "Outstanding Amount",   value: `₦${outstandingTotal.toLocaleString()}`, icon: Receipt, href: "/dashboard/billing", color: outstandingTotal > 0 ? "text-red-600" : "text-green-600" },
  ]

  const quickActions = [
    { label: "View My Matters",  href: "/dashboard/matters",  icon: Scale,        variant: "navy" as const },
    { label: "Send a Message",   href: "/dashboard/messages", icon: MessageSquare,variant: "outline" as const },
    { label: "Pay Invoice",      href: "/dashboard/billing",  icon: Receipt,      variant: "outline" as const },
    { label: "Book a Session",   href: "/dashboard/book",     icon: CalendarPlus, variant: "outline" as const },
  ]

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Welcome banner */}
      <div className="bg-doda-navy rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.firstName} 👋
        </h1>
        <p className="text-white/60 mt-1 text-sm">
          {activeMatters.length > 0
            ? `You have ${activeMatters.length} active matter${activeMatters.length > 1 ? "s" : ""}${actionNeededCount > 0 ? ` — ${actionNeededCount} need${actionNeededCount > 1 ? "" : "s"} your attention` : ""}.`
            : "Your portal is ready. Explore your matters, documents and messages below."}
        </p>
        <div className="flex gap-3 mt-4">
          {quickActions.map(a => (
            <Link key={a.href} href={a.href}>
              <Button size="sm"
                className={a.variant === "navy"
                  ? "bg-doda-gold text-doda-navy hover:bg-amber-400 font-semibold"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                }
                variant={a.variant === "navy" ? "default" : "outline"}>
                <a.icon className="h-4 w-4 mr-1.5" />
                {a.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(c => (
          <Link href={c.href} key={c.label}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500 font-medium uppercase">{c.label}</p>
                  <c.icon className={`h-4 w-4 ${c.color}`} />
                </div>
                <p className={`text-2xl font-bold ${c.color}`}>{loading ? "—" : c.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Retainer banner (conditional) */}
      {retainer && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 text-doda-gold" />
            <div>
              <p className="text-sm font-semibold text-doda-navy">{retainer.planName}</p>
              <p className="text-xs text-gray-500">
                {retainer.renewalDate
                  ? `Renews ${format(new Date(retainer.renewalDate), "d MMMM yyyy")}`
                  : "Active retainer plan"}
              </p>
            </div>
          </div>
          <Link href="/dashboard/retainer">
            <Button size="sm" variant="outline" className="border-doda-gold text-doda-gold">View Retainer</Button>
          </Link>
        </div>
      )}

      {/* Matters + Documents row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Matters */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">My Matters</CardTitle>
              <Link href="/dashboard/matters" className="text-sm text-doda-gold hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)
            ) : activeMatters.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No active matters</p>
            ) : activeMatters.slice(0, 3).map(m => {
              const hasAction = m.tasks.some(t => t.status === "pending")
              const progress  = matterProgress(m.tasks)
              return (
                <Link href={`/dashboard/matters/${m._id}`} key={m._id}>
                  <div className="p-3 border border-gray-100 rounded-xl hover:border-doda-gold/40 hover:bg-amber-50/30 transition-all cursor-pointer">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-semibold text-doda-navy leading-tight">{m.title}</p>
                      <MatterStatusBadge status={m.status} hasAction={hasAction} />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-doda-gold rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-xs text-gray-400">{progress}%</span>
                    </div>
                    {m.assignedToId && (
                      <p className="text-xs text-gray-400 mt-1.5">
                        Lawyer: {m.assignedToId.firstName} {m.assignedToId.lastName}
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Documents</CardTitle>
              <Link href="/dashboard/documents" className="text-sm text-doda-gold hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              [1,2,3,4].map(i => <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />)
            ) : docs.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No documents shared yet</p>
            ) : docs.map(d => (
              <div key={d._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-doda-gold shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-doda-navy">{d.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{d.category.replace("_", " ")}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{format(new Date(d.createdAt), "d MMM")}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Messages + Invoices row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Messages */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Messages</CardTitle>
              <Link href="/dashboard/messages" className="text-sm text-doda-gold hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              [1,2].map(i => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)
            ) : messages.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No messages yet</p>
            ) : messages.slice(0, 4).map(msg => (
              <div key={msg._id} className={`p-3 rounded-xl border ${!msg.readAt ? "bg-blue-50 border-blue-100" : "border-gray-100"}`}>
                <div className="flex justify-between">
                  <p className="text-xs font-semibold text-gray-600">
                    {msg.senderId ? `${msg.senderId.firstName} ${msg.senderId.lastName}` : "Doda Legal"}
                  </p>
                  <span className="text-xs text-gray-400">{format(new Date(msg.createdAt), "d MMM")}</span>
                </div>
                <p className="text-sm text-gray-700 mt-0.5 truncate">{msg.body}</p>
              </div>
            ))}
            <Link href="/dashboard/messages">
              <Button variant="outline" size="sm" className="w-full mt-1">
                <MessageSquare className="h-4 w-4 mr-1.5" /> Reply or Send Message
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Outstanding Invoices */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Outstanding Invoices</CardTitle>
              <Link href="/dashboard/billing" className="text-sm text-doda-gold hover:underline flex items-center gap-1">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              [1,2].map(i => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)
            ) : outstandingInvoices.length === 0 ? (
              <div className="text-center py-4">
                <CheckCircle2 className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No outstanding invoices</p>
              </div>
            ) : outstandingInvoices.map(inv => (
              <div key={inv._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-doda-navy">{inv.invoiceNumber}</p>
                  <p className="text-xs text-gray-400">
                    Due: {inv.dueDate ? format(new Date(inv.dueDate), "d MMM yyyy") : "N/A"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-doda-navy">₦{inv.total.toLocaleString()}</p>
                  <Badge variant={inv.status === "overdue" ? "destructive" : "info"} className="text-xs mt-0.5 capitalize">
                    {inv.status}
                  </Badge>
                </div>
              </div>
            ))}
            {outstandingInvoices.length > 0 && (
              <Link href="/dashboard/billing">
                <Button variant="navy" size="sm" className="w-full mt-1">Pay Now</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
