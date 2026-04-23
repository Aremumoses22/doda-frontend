"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Eye, Send, Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api } from "@/lib/api"
import { format } from "date-fns"
import { toast } from "sonner"

interface Invoice {
  _id: string
  invoiceNumber: string
  clientId: { companyName?: string; individualName?: string; primaryEmail: string } | null
  matterId: { title: string; matterCode: string } | null
  subtotal: number
  tax: number
  total: number
  status: string
  issuedDate?: string
  dueDate?: string
  paidAt?: string
}

const STATUS_COLORS: Record<string, "success" | "warning" | "secondary" | "destructive" | "info" | "outline"> = {
  paid: "success", sent: "info", overdue: "destructive", draft: "secondary",
}
const STATUSES = ["all", "draft", "sent", "paid", "overdue"]

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [total, setTotal]       = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState("")
  const [status, setStatus]     = useState("all")
  const [page, setPage]         = useState(1)
  const PER_PAGE = 20

  const fetchInvoices = () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: String(PER_PAGE) })
    if (search)           params.set("search", search)
    if (status !== "all") params.set("status", status)
    api.get(`/api/invoices?${params}`)
      .then(r => {
        setInvoices(r.data.invoices ?? [])
        setTotal(r.data.total ?? 0)
        // Sum paid invoices shown
        const rev = (r.data.invoices ?? []).filter((i: Invoice) => i.status === "paid").reduce((a: number, i: Invoice) => a + i.total, 0)
        setTotalRevenue(rev)
      })
      .catch(() => toast.error("Failed to load invoices"))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchInvoices() }, [page, search, status])

  const sendInvoice = async (id: string) => {
    try {
      await api.post(`/api/invoices/${id}/send`)
      setInvoices(prev => prev.map(i => i._id === id ? { ...i, status: "sent" } : i))
      toast.success("Invoice sent")
    } catch { toast.error("Failed to send invoice") }
  }

  const clientName = (inv: Invoice) =>
    inv.clientId?.companyName || inv.clientId?.individualName || inv.clientId?.primaryEmail || "—"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-doda-navy">Billing</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} invoice{total !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/admin/billing/new">
          <Button variant="navy"><Plus className="h-4 w-4 mr-1" /> New Invoice</Button>
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Invoices", value: total },
          { label: "Draft", value: invoices.filter(i => i.status === "draft").length },
          { label: "Sent / Pending", value: invoices.filter(i => i.status === "sent").length },
          { label: "Overdue", value: invoices.filter(i => i.status === "overdue").length },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-xs text-gray-500 font-medium uppercase">{s.label}</p>
              <p className="text-2xl font-bold text-doda-navy mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input className="pl-9" placeholder="Search invoices..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <Select value={status} onValueChange={v => { setStatus(v); setPage(1) }}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s === "all" ? "All Statuses" : s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Matter</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <TableRow key={i}>{[1,2,3,4,5,6,7,8].map(j => (
                    <TableCell key={j}><div className="h-4 bg-gray-100 rounded animate-pulse" /></TableCell>
                  ))}</TableRow>
                ))
              ) : invoices.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-gray-400 py-10">No invoices found</TableCell></TableRow>
              ) : invoices.map(inv => (
                <TableRow key={inv._id}>
                  <TableCell className="font-mono text-sm font-medium">{inv.invoiceNumber}</TableCell>
                  <TableCell className="text-sm">{clientName(inv)}</TableCell>
                  <TableCell className="text-xs text-gray-500">{inv.matterId?.matterCode ?? "—"}</TableCell>
                  <TableCell className="font-medium">₦{inv.total.toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {inv.issuedDate ? format(new Date(inv.issuedDate), "d MMM yyyy") : "—"}
                  </TableCell>
                  <TableCell className={`text-sm ${inv.status === "overdue" ? "text-red-500 font-medium" : "text-gray-500"}`}>
                    {inv.dueDate ? format(new Date(inv.dueDate), "d MMM yyyy") : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_COLORS[inv.status] ?? "secondary"} className="capitalize">{inv.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {inv.status === "draft" && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Send invoice" onClick={() => sendInvoice(inv._id)}>
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Link href={`/admin/billing/${inv._id}`}>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                      </Link>
                    </div>
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
