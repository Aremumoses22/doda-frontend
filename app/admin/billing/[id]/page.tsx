"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Send, Printer } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api"
import { format } from "date-fns"
import { toast } from "sonner"

interface LineItem {
  _id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface Invoice {
  _id: string
  invoiceNumber: string
  clientId: { _id: string; companyName?: string; individualName?: string; primaryEmail: string; clientCode: string } | null
  matterId: { title: string; matterCode: string } | null
  description?: string
  lineItems: LineItem[]
  subtotal: number
  vatRate: number
  vatAmount?: number
  total: number
  currency: string
  status: string
  issuedDate?: string
  dueDate?: string
  paidDate?: string
  paidAmount: number
  notes?: string
}

const STATUS_COLORS: Record<string, "success" | "warning" | "secondary" | "destructive" | "info" | "outline"> = {
  paid: "success", sent: "info", overdue: "destructive", draft: "secondary", cancelled: "secondary", void: "secondary",
}

const STATUSES = ["draft", "sent", "paid", "overdue", "cancelled"]

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState("")
  const [savingStatus, setSavingStatus] = useState(false)

  useEffect(() => {
    api.get(`/api/invoices/${id}`)
      .then(r => { setInvoice(r.data); setStatus(r.data.status) })
      .catch(() => toast.error("Failed to load invoice"))
      .finally(() => setLoading(false))
  }, [id])

  const sendInvoice = async () => {
    try {
      await api.post(`/api/invoices/${id}/send`)
      setInvoice(prev => prev ? { ...prev, status: "sent" } : prev)
      setStatus("sent")
      toast.success("Invoice sent to client")
    } catch { toast.error("Failed to send invoice") }
  }

  const updateStatus = async (newStatus: string) => {
    setSavingStatus(true)
    try {
      await api.patch(`/api/invoices/${id}`, { status: newStatus })
      setStatus(newStatus)
      setInvoice(prev => prev ? { ...prev, status: newStatus } : prev)
      toast.success("Status updated")
    } catch { toast.error("Failed to update status") }
    finally { setSavingStatus(false) }
  }

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)}</div>
  if (!invoice) return <div className="text-center py-20 text-gray-500">Invoice not found</div>

  const clientName = invoice.clientId?.companyName || invoice.clientId?.individualName || invoice.clientId?.primaryEmail || "Unknown"

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/admin/billing" className="flex items-center gap-1 text-sm text-gray-500 hover:text-doda-navy mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to Billing
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-doda-navy font-mono">{invoice.invoiceNumber}</h1>
            <Badge variant={STATUS_COLORS[invoice.status] ?? "secondary"} className="capitalize">{invoice.status}</Badge>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{clientName}</p>
        </div>
        <div className="flex gap-2">
          {invoice.status === "draft" && (
            <Button variant="navy" size="sm" onClick={sendInvoice}>
              <Send className="h-4 w-4 mr-1" /> Send Invoice
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-1" /> Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice body */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header info */}
          <Card>
            <CardContent className="p-6 grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-xs text-gray-400 uppercase font-medium mb-1">Bill To</p>
                <p className="font-semibold text-doda-navy">{clientName}</p>
                <p className="text-gray-500">{invoice.clientId?.primaryEmail}</p>
                {invoice.clientId?.clientCode && <p className="text-gray-400 text-xs">{invoice.clientId.clientCode}</p>}
              </div>
              <div className="space-y-2">
                {invoice.issuedDate && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-medium">Issued</p>
                    <p>{format(new Date(invoice.issuedDate), "d MMM yyyy")}</p>
                  </div>
                )}
                {invoice.dueDate && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-medium">Due</p>
                    <p className={invoice.status === "overdue" ? "text-red-500 font-medium" : ""}>
                      {format(new Date(invoice.dueDate), "d MMM yyyy")}
                    </p>
                  </div>
                )}
                {invoice.matterId && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-medium">Matter</p>
                    <p className="font-mono text-xs">{invoice.matterId.matterCode}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Line items */}
          <Card>
            <CardHeader><CardTitle>Line Items</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left p-4 text-xs text-gray-500 uppercase font-medium">Description</th>
                    <th className="text-right p-4 text-xs text-gray-500 uppercase font-medium">Qty</th>
                    <th className="text-right p-4 text-xs text-gray-500 uppercase font-medium">Unit Price</th>
                    <th className="text-right p-4 text-xs text-gray-500 uppercase font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.length === 0 ? (
                    <tr><td colSpan={4} className="text-center text-gray-400 py-6">No line items</td></tr>
                  ) : invoice.lineItems.map((item) => (
                    <tr key={item._id} className="border-b border-gray-50">
                      <td className="p-4 text-gray-700">{item.description}</td>
                      <td className="p-4 text-right text-gray-500">{item.quantity}</td>
                      <td className="p-4 text-right text-gray-500">₦{item.unitPrice.toLocaleString()}</td>
                      <td className="p-4 text-right font-medium">₦{item.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-100">
                    <td colSpan={3} className="p-4 text-right text-gray-500 text-xs uppercase font-medium">Subtotal</td>
                    <td className="p-4 text-right">₦{invoice.subtotal.toLocaleString()}</td>
                  </tr>
                  {(invoice.vatRate ?? 0) > 0 && (
                    <tr>
                      <td colSpan={3} className="p-4 text-right text-gray-500 text-xs uppercase font-medium">VAT ({invoice.vatRate}%)</td>
                      <td className="p-4 text-right">₦{(invoice.vatAmount ?? 0).toLocaleString()}</td>
                    </tr>
                  )}
                  <tr className="bg-gray-50">
                    <td colSpan={3} className="p-4 text-right font-bold text-doda-navy uppercase text-xs">Total</td>
                    <td className="p-4 text-right font-bold text-doda-navy text-lg">₦{invoice.total.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </CardContent>
          </Card>

          {invoice.notes && (
            <Card>
              <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p></CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Status</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Select value={status} onValueChange={updateStatus} disabled={savingStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Payment</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Amount Due</span>
                <span className="font-medium">₦{invoice.total.toLocaleString()}</span>
              </div>
              {invoice.paidAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Paid</span>
                  <span className="text-green-600 font-medium">₦{invoice.paidAmount.toLocaleString()}</span>
                </div>
              )}
              {invoice.paidDate && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Paid On</span>
                  <span>{format(new Date(invoice.paidDate), "d MMM yyyy")}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {invoice.clientId && (
            <Card>
              <CardContent className="p-4 space-y-2">
                <Link href={`/admin/clients/${invoice.clientId._id}`}>
                  <Button variant="outline" size="sm" className="w-full">View Client</Button>
                </Link>
                {invoice.matterId && (
                  <Link href={`/admin/matters?search=${invoice.matterId.matterCode}`}>
                    <Button variant="outline" size="sm" className="w-full">View Matter</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
