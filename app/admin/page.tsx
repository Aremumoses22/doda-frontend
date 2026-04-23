"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Users, Briefcase, Scale, FileText, TrendingUp, RefreshCw,
  ArrowRight, Plus, Calendar, AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { format } from "date-fns"

interface KPIData {
  newLeads: number
  activeClients: number
  openMatters: number
  outstandingInvoicesAmount: number
  activeRetainers: number
}

interface RecentLead {
  _id: string
  fullName: string
  email: string
  serviceInterest?: string[]
  status: string
  createdAt: string
}

interface RecentMatter {
  _id: string
  title: string
  matterCode: string
  status: string
  clientId?: { companyName?: string; individualName?: string }
  priority: string
  dueDate?: string
}

const statusColor: Record<string, "default" | "success" | "warning" | "destructive" | "info" | "secondary" | "outline" | "gold"> = {
  new:          "info",
  contacted:    "warning",
  qualified:    "gold",
  converted:    "success",
  archived:     "secondary",
  active:       "success",
  draft:        "secondary",
  completed:    "success",
  on_hold:      "warning",
  under_review: "info",
}

export default function AdminDashboardPage() {
  const [kpi, setKpi] = useState<KPIData | null>(null)
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([])
  const [recentMatters, setRecentMatters] = useState<RecentMatter[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [leadsRes, mattersRes, invoicesRes, clientsRes, retainersRes] = await Promise.allSettled([
          api.get("/api/leads?page=1&limit=5"),
          api.get("/api/matters?status=active&page=1&limit=5"),
          api.get("/api/invoices?status=sent"),
          api.get("/api/clients?status=active&page=1&limit=1"),
          api.get("/api/retainers?status=active"),
        ])

        const leads   = leadsRes.status     === "fulfilled" ? leadsRes.value.data   : { leads: [], total: 0 }
        const matters = mattersRes.status   === "fulfilled" ? mattersRes.value.data : { matters: [], total: 0 }
        const invoices= invoicesRes.status  === "fulfilled" ? invoicesRes.value.data : { invoices: [], total: 0 }
        const clients = clientsRes.status   === "fulfilled" ? clientsRes.value.data : { total: 0 }
        const retainers= retainersRes.status=== "fulfilled" ? retainersRes.value.data : []

        const newLeads = (leads.leads as RecentLead[]).filter((l) => l.status === "new").length

        const outstandingTotal = (invoices.invoices as { total: number }[]).reduce(
          (sum, inv) => sum + (inv.total || 0), 0
        )

        setKpi({
          newLeads,
          activeClients:              clients.total ?? 0,
          openMatters:                matters.total ?? 0,
          outstandingInvoicesAmount:  outstandingTotal,
          activeRetainers:            Array.isArray(retainers) ? retainers.length : 0,
        })

        setRecentLeads(leads.leads.slice(0, 5))
        setRecentMatters(matters.matters.slice(0, 5))
      } catch (e) {
        console.error("Dashboard load error:", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-doda-navy">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">{format(new Date(), "EEEE, d MMMM yyyy")}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/clients/new">
            <Button variant="navy" size="sm">
              <Plus className="h-4 w-4 mr-1" /> New Client
            </Button>
          </Link>
          <Link href="/admin/matters/new">
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" /> New Matter
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          label="New Leads"
          value={kpi?.newLeads ?? "—"}
          icon={<Users className="h-5 w-5 text-blue-500" />}
          href="/admin/leads?status=new"
          color="blue"
          loading={loading}
        />
        <KpiCard
          label="Active Clients"
          value={kpi?.activeClients ?? "—"}
          icon={<Briefcase className="h-5 w-5 text-green-500" />}
          href="/admin/clients"
          color="green"
          loading={loading}
        />
        <KpiCard
          label="Open Matters"
          value={kpi?.openMatters ?? "—"}
          icon={<Scale className="h-5 w-5 text-purple-500" />}
          href="/admin/matters"
          color="purple"
          loading={loading}
        />
        <KpiCard
          label="Outstanding (₦)"
          value={kpi ? `₦${kpi.outstandingInvoicesAmount.toLocaleString()}` : "—"}
          icon={<TrendingUp className="h-5 w-5 text-orange-500" />}
          href="/admin/billing"
          color="orange"
          loading={loading}
        />
        <KpiCard
          label="Active Retainers"
          value={kpi?.activeRetainers ?? "—"}
          icon={<RefreshCw className="h-5 w-5 text-teal-500" />}
          href="/admin/retainers"
          color="teal"
          loading={loading}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Add Client",     href: "/admin/clients/new",  icon: <Briefcase className="h-4 w-4" /> },
          { label: "Create Matter",  href: "/admin/matters/new",  icon: <Scale className="h-4 w-4" /> },
          { label: "Upload Doc",     href: "/admin/documents",    icon: <FileText className="h-4 w-4" /> },
          { label: "New Invoice",    href: "/admin/billing/new",  icon: <TrendingUp className="h-4 w-4" /> },
        ].map((a) => (
          <Link key={a.href} href={a.href}>
            <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-doda-gold transition-colors">
              {a.icon} {a.label}
            </button>
          </Link>
        ))}
      </div>

      {/* Recent Leads + Recent Matters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="text-base">Recent Leads</CardTitle>
            <Link href="/admin/leads" className="text-xs text-doda-gold hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
              </div>
            ) : recentLeads.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No leads yet</p>
            ) : (
              <ul className="space-y-3">
                {recentLeads.map((lead) => (
                  <li key={lead._id} className="flex items-center justify-between">
                    <div className="min-w-0">
                      <Link href={`/admin/leads/${lead._id}`} className="text-sm font-medium text-doda-navy hover:underline truncate block">
                        {lead.fullName}
                      </Link>
                      <p className="text-xs text-gray-500 truncate">{lead.email}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <Badge variant={statusColor[lead.status] ?? "secondary"} className="capitalize">
                        {lead.status}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {format(new Date(lead.createdAt), "d MMM")}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent Matters */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="text-base">Active Matters</CardTitle>
            <Link href="/admin/matters" className="text-xs text-doda-gold hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
              </div>
            ) : recentMatters.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No active matters</p>
            ) : (
              <ul className="space-y-3">
                {recentMatters.map((matter) => (
                  <li key={matter._id} className="flex items-center justify-between">
                    <div className="min-w-0">
                      <Link href={`/admin/matters/${matter._id}`} className="text-sm font-medium text-doda-navy hover:underline truncate block">
                        {matter.title}
                      </Link>
                      <p className="text-xs text-gray-500">
                        {matter.clientId?.companyName ?? matter.clientId?.individualName ?? "No client"} · {matter.matterCode}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      {matter.priority === "high" && (
                        <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                      )}
                      <Badge variant={statusColor[matter.status] ?? "secondary"} className="capitalize">
                        {matter.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function KpiCard({
  label, value, icon, href, loading,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  href: string
  color: string
  loading: boolean
}) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            {icon}
            <ArrowRight className="h-3.5 w-3.5 text-gray-300" />
          </div>
          {loading ? (
            <div className="h-7 bg-gray-100 rounded animate-pulse mt-1" />
          ) : (
            <p className="text-2xl font-bold text-doda-navy">{value}</p>
          )}
          <p className="text-xs text-gray-500 mt-0.5">{label}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
