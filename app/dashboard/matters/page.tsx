"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AlertTriangle, Loader2, CheckCircle2, Scale, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api"
import { format } from "date-fns"

interface Matter {
  _id: string
  title: string
  practiceArea: string
  status: string
  tasks: { status: string; assignedToClient?: boolean }[]
  updatedAt: string
  assignedToId?: { firstName: string; lastName: string } | null
  matterCode?: string
}

const statusConfig: Record<string, { label: string; color: string }> = {
  draft:          { label: "Getting Started",      color: "bg-gray-100 text-gray-600" },
  open:           { label: "Getting Started",      color: "bg-gray-100 text-gray-600" },
  active:         { label: "In Progress",          color: "bg-amber-100 text-amber-700" },
  pending_client: { label: "Awaiting Your Input",  color: "bg-red-100 text-red-700" },
  on_hold:        { label: "On Hold",              color: "bg-orange-100 text-orange-700" },
  closed:         { label: "Completed",            color: "bg-green-100 text-green-700" },
}

function matterProgress(tasks: { status: string }[]) {
  if (!tasks.length) return 0
  return Math.round((tasks.filter(t => t.status === "done").length / tasks.length) * 100)
}

function hasActionRequired(matter: Matter) {
  return matter.status === "pending_client" ||
    matter.tasks.some(t => (t as any).assignedToClient && t.status !== "done")
}

export default function MattersPage() {
  const [matters, setMatters]   = useState<Matter[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState("")
  const [filter, setFilter]     = useState("all")

  useEffect(() => {
    api.get("/api/matters?limit=50")
      .then(r => setMatters(r.data.matters ?? []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = matters.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.practiceArea?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === "all" || m.status === filter ||
      (filter === "action_required" && hasActionRequired(m))
    return matchSearch && matchFilter
  })

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-doda-navy">My Matters</h1>
        <p className="text-gray-500 text-sm mt-1">All your legal matters and their current status</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search by title or practice area…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="action_required">⚠️ Action Required</SelectItem>
            <SelectItem value="active">In Progress</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
            <SelectItem value="closed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Matter cards grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-36 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Scale className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No matters found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map(m => {
            const cfg       = statusConfig[m.status] ?? { label: m.status, color: "bg-gray-100 text-gray-600" }
            const actionReq = hasActionRequired(m)
            const progress  = matterProgress(m.tasks)
            return (
              <Link href={`/dashboard/matters/${m._id}`} key={m._id}>
                <Card className="cursor-pointer hover:shadow-md hover:border-doda-gold/40 transition-all h-full">
                  <CardContent className="p-4 space-y-3">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-doda-navy leading-snug">{m.title}</p>
                        {m.matterCode && <p className="text-xs text-gray-400 mt-0.5">{m.matterCode}</p>}
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-300 shrink-0 mt-0.5" />
                    </div>

                    {/* Status badges */}
                    <div className="flex flex-wrap gap-2">
                      {actionReq ? (
                        <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                          <AlertTriangle className="h-3 w-3" /> Awaiting Your Input
                        </span>
                      ) : (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 capitalize">
                        {m.practiceArea?.replace(/_/g, " ") || "General"}
                      </span>
                    </div>

                    {/* Progress */}
                    {m.tasks.length > 0 && (
                      <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${progress === 100 ? "bg-green-400" : "bg-doda-gold"}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Assigned lawyer + last update */}
                    <div className="flex justify-between items-center text-xs text-gray-400 pt-1 border-t border-gray-50">
                      <span>
                        {m.assignedToId
                          ? `Lawyer: ${m.assignedToId.firstName} ${m.assignedToId.lastName}`
                          : "Unassigned"}
                      </span>
                      <span>Updated {format(new Date(m.updatedAt), "d MMM")}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
