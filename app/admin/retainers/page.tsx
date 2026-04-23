"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Search, Eye } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api } from "@/lib/api"
import { format } from "date-fns"
import { toast } from "sonner"

interface Retainer {
  _id: string
  planName: string
  clientId: { companyName?: string; individualName?: string; primaryEmail: string } | null
  monthlyFee: number
  currency: string
  hoursIncluded: number
  hoursUsed: number
  status: string
  startDate: string
  renewalDate?: string
}

const STATUS_COLORS: Record<string, "success" | "warning" | "secondary" | "destructive" | "info" | "outline"> = {
  active: "success", paused: "warning", cancelled: "destructive", expired: "secondary",
}

export default function RetainersPage() {
  const [retainers, setRetainers] = useState<Retainer[]>([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState("")
  const [status, setStatus]       = useState("all")
  const [page, setPage]           = useState(1)
  const PER_PAGE = 20

  const fetchRetainers = () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: String(PER_PAGE) })
    if (search)           params.set("search", search)
    if (status !== "all") params.set("status", status)
    api.get(`/api/retainers?${params}`)
      .then(r => { setRetainers(r.data.retainers ?? []); setTotal(r.data.total ?? 0) })
      .catch(() => toast.error("Failed to load retainers"))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchRetainers() }, [page, search, status])

  const clientName = (r: Retainer) => r.clientId?.companyName || r.clientId?.individualName || r.clientId?.primaryEmail || "—"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-doda-navy">Retainers</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} retainer plan{total !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Plans", value: retainers.filter(r => r.status === "active").length, color: "text-green-600" },
          { label: "Monthly Revenue", value: `₦${retainers.filter(r => r.status === "active").reduce((s, r) => s + r.monthlyFee, 0).toLocaleString()}`, color: "text-doda-gold" },
          { label: "Paused", value: retainers.filter(r => r.status === "paused").length, color: "text-amber-500" },
          { label: "Expired", value: retainers.filter(r => r.status === "expired").length, color: "text-gray-500" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-xs text-gray-500 font-medium uppercase">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input className="pl-9" placeholder="Search retainers..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <Select value={status} onValueChange={v => { setStatus(v); setPage(1) }}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["all", "active", "paused", "cancelled", "expired"].map(s => (
              <SelectItem key={s} value={s} className="capitalize">{s === "all" ? "All Statuses" : s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Monthly Fee</TableHead>
                <TableHead>Hours Usage</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Renewal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [1,2,3].map(i => (
                  <TableRow key={i}>{[1,2,3,4,5,6,7,8].map(j => (
                    <TableCell key={j}><div className="h-4 bg-gray-100 rounded animate-pulse" /></TableCell>
                  ))}</TableRow>
                ))
              ) : retainers.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-gray-400 py-10">No retainers found</TableCell></TableRow>
              ) : retainers.map(r => {
                const pct = r.hoursIncluded > 0 ? Math.min(100, Math.round((r.hoursUsed / r.hoursIncluded) * 100)) : 0
                return (
                  <TableRow key={r._id}>
                    <TableCell className="font-medium text-doda-navy">{r.planName}</TableCell>
                    <TableCell className="text-sm">{clientName(r)}</TableCell>
                    <TableCell className="font-medium">₦{r.monthlyFee.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-400" : "bg-green-500"}`}
                            style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{r.hoursUsed}/{r.hoursIncluded}h</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {format(new Date(r.startDate), "d MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {r.renewalDate ? format(new Date(r.renewalDate), "d MMM yyyy") : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_COLORS[r.status] ?? "secondary"} className="capitalize">{r.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/retainers/${r._id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })}
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
