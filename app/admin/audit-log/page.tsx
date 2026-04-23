"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search } from "lucide-react"
import { api } from "@/lib/api"
import { format } from "date-fns"
import { toast } from "sonner"

interface AuditEntry {
  _id: string
  action: string
  resource: string
  resourceId: string
  performedBy: { firstName: string; lastName: string; email: string; role: string } | null
  metadata?: Record<string, unknown>
  ipAddress?: string
  createdAt: string
}

const ACTION_COLORS: Record<string, "success" | "info" | "warning" | "destructive" | "secondary" | "outline"> = {
  create: "success", update: "info", delete: "destructive", login: "secondary", logout: "outline", view: "outline",
}

const RESOURCES = ["all", "client", "matter", "invoice", "document", "user", "lead", "retainer"]

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState("")
  const [resource, setResource] = useState("all")
  const [page, setPage]       = useState(1)
  const PER_PAGE = 25

  const fetchLog = () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: String(PER_PAGE) })
    if (search)              params.set("search", search)
    if (resource !== "all")  params.set("resource", resource)
    // Note: GET /api/audit-log endpoint (to be added to backend)
    api.get(`/api/audit-log?${params}`)
      .then(r => { setEntries(r.data.entries ?? []); setTotal(r.data.total ?? 0) })
      .catch(() => {
        // Graceful fallback: audit log endpoint might not be wired yet
        setEntries([])
        setTotal(0)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchLog() }, [page, search, resource])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-doda-navy">Audit Log</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track all admin actions across the system. {total > 0 && `${total} total events.`}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input className="pl-9" placeholder="Search by action or user..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <Select value={resource} onValueChange={v => { setResource(v); setPage(1) }}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {RESOURCES.map(r => (
              <SelectItem key={r} value={r} className="capitalize">{r === "all" ? "All Resources" : r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Performed By</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <TableRow key={i}>{[1,2,3,4,5].map(j => (
                    <TableCell key={j}><div className="h-4 bg-gray-100 rounded animate-pulse" /></TableCell>
                  ))}</TableRow>
                ))
              ) : entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <p className="text-gray-400 text-sm">No audit log entries found.</p>
                    <p className="text-gray-300 text-xs mt-1">The audit log records all create, update, and delete operations.</p>
                  </TableCell>
                </TableRow>
              ) : entries.map(e => (
                <TableRow key={e._id}>
                  <TableCell>
                    <Badge variant={ACTION_COLORS[e.action] ?? "outline"} className="capitalize">{e.action}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm capitalize">{e.resource}</span>
                    <p className="text-xs text-gray-400 font-mono">{e.resourceId}</p>
                  </TableCell>
                  <TableCell>
                    {e.performedBy ? (
                      <div>
                        <p className="text-sm font-medium">{e.performedBy.firstName} {e.performedBy.lastName}</p>
                        <p className="text-xs text-gray-500 capitalize">{e.performedBy.role.replace("_", " ")}</p>
                      </div>
                    ) : <span className="text-gray-400 text-sm">System</span>}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500 font-mono">{e.ipAddress ?? "—"}</TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {format(new Date(e.createdAt), "d MMM yyyy, h:mm a")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
