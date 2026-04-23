"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Eye, Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api } from "@/lib/api"
import { format } from "date-fns"
import { toast } from "sonner"

interface Matter {
  _id: string
  matterCode: string
  title: string
  practiceArea: string
  status: string
  priority: string
  clientId: { _id: string; companyName?: string; individualName?: string; primaryEmail: string } | null
  assignedToId: { firstName: string; lastName: string } | null
  dueDate?: string
  createdAt: string
}

const STATUS_COLORS: Record<string, "success" | "warning" | "secondary" | "destructive" | "info" | "outline" | "gold"> = {
  active: "success", on_hold: "warning", closed: "secondary", open: "info", draft: "secondary",
}
const PRIORITY_COLORS: Record<string, "destructive" | "warning" | "secondary" | "outline"> = {
  high: "destructive", medium: "warning", low: "secondary",
}
const STATUSES = ["all", "draft", "open", "active", "on_hold", "closed"]
const PRACTICE_AREAS = ["all", "corporate", "litigation", "real_estate", "employment", "intellectual_property", "tax", "family", "criminal", "immigration"]

export default function MattersPage() {
  const [matters, setMatters] = useState<Matter[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState("")
  const [status, setStatus]   = useState("all")
  const [area, setArea]       = useState("all")
  const [page, setPage]       = useState(1)
  const PER_PAGE = 20

  const fetchMatters = () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: String(PER_PAGE) })
    if (search)           params.set("search", search)
    if (status !== "all") params.set("status", status)
    if (area !== "all")   params.set("practiceArea", area)
    api.get(`/api/matters?${params}`)
      .then(r => { setMatters(r.data.matters ?? []); setTotal(r.data.total ?? 0) })
      .catch(() => toast.error("Failed to load matters"))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchMatters() }, [page, search, status, area])

  const clientName = (m: Matter) =>
    m.clientId?.companyName || m.clientId?.individualName || m.clientId?.primaryEmail || "—"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-doda-navy">Matters</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} matter{total !== 1 ? "s" : ""} total</p>
        </div>
        <Link href="/admin/matters/new">
          <Button variant="navy"><Plus className="h-4 w-4 mr-1" /> New Matter</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input className="pl-9" placeholder="Search matters..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <Select value={status} onValueChange={v => { setStatus(v); setPage(1) }}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s === "all" ? "All Statuses" : s.replace("_", " ")}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={area} onValueChange={v => { setArea(v); setPage(1) }}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            {PRACTICE_AREAS.map(a => <SelectItem key={a} value={a} className="capitalize">{a === "all" ? "All Practice Areas" : a.replace("_", " ")}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matter</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Practice Area</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <TableRow key={i}>
                    {[1,2,3,4,5,6,7,8].map(j => (
                      <TableCell key={j}><div className="h-4 bg-gray-100 rounded animate-pulse" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : matters.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-gray-400 py-10">No matters found</TableCell></TableRow>
              ) : matters.map(m => (
                <TableRow key={m._id}>
                  <TableCell>
                    <p className="font-medium text-doda-navy">{m.title}</p>
                    <p className="text-xs text-gray-500 font-mono">{m.matterCode}</p>
                  </TableCell>
                  <TableCell className="text-sm">{clientName(m)}</TableCell>
                  <TableCell className="text-sm capitalize">{m.practiceArea.replace("_", " ")}</TableCell>
                  <TableCell className="text-sm">
                    {m.assignedToId ? `${m.assignedToId.firstName} ${m.assignedToId.lastName}` : <span className="text-gray-400">Unassigned</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={PRIORITY_COLORS[m.priority] ?? "outline"} className="capitalize">{m.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_COLORS[m.status] ?? "secondary"} className="capitalize">
                      {m.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {m.dueDate ? format(new Date(m.dueDate), "d MMM yyyy") : "—"}
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/matters/${m._id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {total > PER_PAGE && (
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>Page {page} of {Math.ceil(total / PER_PAGE)}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / PER_PAGE)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  )
}
