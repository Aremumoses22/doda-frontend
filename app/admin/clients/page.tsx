"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Search, Filter, Plus, Eye, UserPlus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api } from "@/lib/api"
import { format } from "date-fns"

interface Client {
  _id: string
  clientCode: string
  companyName?: string
  individualName?: string
  clientType?: string
  primaryEmail: string
  primaryPhone?: string
  engagementType?: string
  status: string
  accountManagerId?: { firstName: string; lastName: string } | null
  onboardedAt: string
}

const STATUS_COLORS: Record<string, "success" | "warning" | "secondary" | "destructive"> = {
  active: "success", on_hold: "warning", completed: "secondary", inactive: "destructive",
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState("")
  const [status, setStatus]   = useState("")

  const fetchClients = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" })
      if (status) params.set("status", status)
      if (search) params.set("search", search)
      const { data } = await api.get(`/api/clients?${params}`)
      setClients(data.clients ?? [])
      setTotal(data.total ?? 0)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page, status, search])

  useEffect(() => { fetchClients() }, [fetchClients])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-doda-navy">Clients</h1>
          <p className="text-sm text-gray-500">{total} total clients</p>
        </div>
        <Link href="/admin/clients/new">
          <Button variant="navy">
            <Plus className="h-4 w-4 mr-1" /> New Client
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input className="pl-9" placeholder="Search by name, code, email…"
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <Select value={status || "all"} onValueChange={(v) => { setStatus(v === "all" ? "" : v); setPage(1) }}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2 text-gray-400" />
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {["active","on_hold","completed","inactive"].map(s => (
                <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead>Account Manager</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Onboarded</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}><div className="h-4 bg-gray-100 rounded animate-pulse" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-400 py-10">
                    No clients found
                  </TableCell>
                </TableRow>
              ) : clients.map((client) => (
                <TableRow key={client._id}>
                  <TableCell className="font-mono text-xs text-gray-500">{client.clientCode}</TableCell>
                  <TableCell>
                    <p className="font-medium text-doda-navy">{client.companyName || client.individualName || "—"}</p>
                    <p className="text-xs text-gray-500">{client.primaryEmail}</p>
                  </TableCell>
                  <TableCell className="capitalize text-sm">{client.clientType?.replace("_", " ") ?? "—"}</TableCell>
                  <TableCell className="capitalize text-sm">{client.engagementType?.replace("_", " ") ?? "—"}</TableCell>
                  <TableCell className="text-sm">
                    {client.accountManagerId
                      ? `${client.accountManagerId.firstName} ${client.accountManagerId.lastName}`
                      : <span className="text-gray-400">Unassigned</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_COLORS[client.status] ?? "secondary"} className="capitalize">
                      {client.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {format(new Date(client.onboardedAt), "d MMM yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Link href={`/admin/clients/${client._id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="View Profile">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/matters/new?clientId=${client._id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-doda-gold" title="Add Matter">
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {total > 20 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm text-gray-500 flex items-center px-2">Page {page}</span>
          <Button variant="outline" size="sm" disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  )
}
