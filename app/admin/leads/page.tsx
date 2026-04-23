"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Search, Filter, Plus, Eye, UserCheck, Archive } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api } from "@/lib/api"
import { format } from "date-fns"

interface Lead {
  _id: string
  fullName: string
  email: string
  phone: string
  companyName?: string
  businessType?: string
  serviceInterest?: string[]
  engagementType?: string
  status: string
  assignedTo?: { firstName: string; lastName: string } | null
  createdAt: string
}

const STATUS_COLORS: Record<string, "info" | "warning" | "gold" | "success" | "secondary"> = {
  new:           "info",
  contacted:     "warning",
  qualified:     "gold",
  proposal_sent: "warning",
  converted:     "success",
  archived:      "secondary",
}

const STATUS_OPTIONS = ["", "new", "contacted", "qualified", "proposal_sent", "converted", "archived"]

export default function AdminLeadsPage() {
  const [leads, setLeads]       = useState<Lead[]>([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState("")
  const [status, setStatus]     = useState("")

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" })
      if (status) params.set("status", status)
      if (search) params.set("search", search)
      const { data } = await api.get(`/api/leads?${params}`)
      setLeads(data.leads ?? [])
      setTotal(data.total ?? 0)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page, status, search])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  const patchStatus = async (id: string, newStatus: string) => {
    await api.patch(`/api/leads/${id}`, { status: newStatus })
    fetchLeads()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-doda-navy">Leads & Enquiries</h1>
          <p className="text-sm text-gray-500">{total} total submissions</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Search by name, email…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <Select value={status || "all"} onValueChange={(v) => { setStatus(v === "all" ? "" : v); setPage(1) }}>
            <SelectTrigger className="w-[160px]">
              <Filter className="h-4 w-4 mr-2 text-gray-400" />
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUS_OPTIONS.filter(Boolean).map((s) => (
                <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name / Company</TableHead>
                <TableHead>Service Interest</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Received</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                    No leads found
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow key={lead._id}>
                    <TableCell>
                      <p className="font-medium text-doda-navy">{lead.fullName}</p>
                      <p className="text-xs text-gray-500">{lead.email}</p>
                      {lead.companyName && <p className="text-xs text-gray-400">{lead.companyName}</p>}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(lead.serviceInterest ?? []).slice(0, 2).map((s) => (
                          <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                        ))}
                        {(lead.serviceInterest ?? []).length > 2 && (
                          <Badge variant="secondary" className="text-xs">+{(lead.serviceInterest!).length - 2}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize text-sm">{lead.engagementType?.replace("_", " ") ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_COLORS[lead.status] ?? "secondary"} className="capitalize">
                        {lead.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {format(new Date(lead.createdAt), "d MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Link href={`/admin/leads/${lead._id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="View">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        {lead.status !== "converted" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600"
                            title="Convert to Client"
                            onClick={() => patchStatus(lead._id, "converted")}
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        )}
                        {lead.status !== "archived" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400"
                            title="Archive"
                            onClick={() => patchStatus(lead._id, "archived")}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
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
