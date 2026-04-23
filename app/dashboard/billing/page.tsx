"use client"

import { useEffect, useState, useRef } from "react"
import {
  Receipt, CheckCircle2, AlertTriangle, Upload, Loader2, ExternalLink
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { api } from "@/lib/api"
import { format } from "date-fns"
import { toast } from "sonner"

interface Invoice {
  _id: string
  invoiceNumber: string
  description?: string
  subtotal: number
  tax?: number
  total: number
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
  issuedDate?: string
  dueDate?: string
  matterId?: { title: string } | null
  paymentHistory?: { amount: number; method: string; date: string; reference?: string }[]
}

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    draft: "bg-gray-100 text-gray-600",
    sent: "bg-blue-100 text-blue-700",
    paid: "bg-green-100 text-green-700",
    overdue: "bg-red-100 text-red-700",
    cancelled: "bg-gray-100 text-gray-400",
  }
  return <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${map[s] ?? "bg-gray-100 text-gray-600"}`}>{s}</span>
}

export default function BillingPage() {
  const [invoices, setInvoices]   = useState<Invoice[]>([])
  const [loading, setLoading]     = useState(true)
  const [paying, setPaying]       = useState<string | null>(null)
  const [proofOpen, setProofOpen] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    api.get("/api/invoices?limit=50")
      .then(r => setInvoices(r.data.invoices ?? []))
      .finally(() => setLoading(false))
  }, [])

  async function payNow(invoiceId: string) {
    setPaying(invoiceId)
    try {
      const r = await api.post(`/api/invoices/${invoiceId}/pay`)
      const { authorizationUrl } = r.data
      if (authorizationUrl) {
        window.location.href = authorizationUrl
      } else {
        toast.success("Payment initiated. Follow the instructions provided.")
      }
    } catch { toast.error("Payment initiation failed") }
    finally { setPaying(null) }
  }

  async function uploadProof() {
    if (!selectedFile || !proofOpen) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("proof", selectedFile)
      fd.append("invoiceId", proofOpen)
      await api.post(`/api/invoices/${proofOpen}/upload-proof`, fd, { headers: { "Content-Type": "multipart/form-data" } })
      toast.success("Proof of payment uploaded. Our team will confirm shortly.")
      setProofOpen(null)
      setSelectedFile(null)
    } catch { toast.error("Upload failed") }
    finally { setUploading(false) }
  }

  const outstanding = invoices.filter(i => i.status === "sent" || i.status === "overdue")
  const paid        = invoices.filter(i => i.status === "paid")
  const totalOwed   = outstanding.reduce((s, i) => s + i.total, 0)

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-doda-navy">Billing &amp; Payments</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your invoices and payment history</p>
      </div>

      {/* Outstanding summary */}
      {outstanding.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-sm font-semibold text-red-700">
                {outstanding.length} outstanding invoice{outstanding.length > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-red-500">Total owed: ₦{totalOwed.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {outstanding.length === 0 && !loading && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <p className="text-sm font-semibold text-green-700">All invoices are settled. You&apos;re up to date!</p>
        </div>
      )}

      {/* Outstanding invoices */}
      {outstanding.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Outstanding Invoices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {outstanding.map(inv => (
              <div key={inv._id} className="border border-gray-100 rounded-xl p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-doda-navy">{inv.invoiceNumber}</p>
                      {statusBadge(inv.status)}
                    </div>
                    {inv.description && <p className="text-sm text-gray-500 mt-0.5">{inv.description}</p>}
                    {inv.matterId && <p className="text-xs text-gray-400 mt-0.5">{inv.matterId.title}</p>}
                    <div className="flex gap-4 mt-2 text-xs text-gray-400">
                      {inv.issuedDate && <span>Issued: {format(new Date(inv.issuedDate), "d MMM yyyy")}</span>}
                      {inv.dueDate && <span className={new Date(inv.dueDate) < new Date() ? "text-red-500 font-semibold" : ""}>
                        Due: {format(new Date(inv.dueDate), "d MMM yyyy")}
                      </span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-doda-navy">₦{inv.total.toLocaleString()}</p>
                    {inv.tax ? <p className="text-xs text-gray-400">Incl. ₦{inv.tax.toLocaleString()} tax</p> : null}
                    <div className="flex gap-2 mt-2 justify-end">
                      <Button
                        size="sm"
                        onClick={() => payNow(inv._id)}
                        disabled={paying === inv._id}
                        className="bg-doda-gold text-doda-navy font-semibold"
                      >
                        {paying === inv._id ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <ExternalLink className="h-4 w-4 mr-1" />}
                        Pay Now
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setProofOpen(inv._id)}
                      >
                        <Upload className="h-4 w-4 mr-1" /> Upload Proof
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Payment history */}
      {paid.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Payment History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              [1,2].map(i => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)
            ) : paid.map(inv => (
              <div key={inv._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-doda-navy">{inv.invoiceNumber}</p>
                  {inv.description && <p className="text-xs text-gray-400">{inv.description}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">₦{inv.total.toLocaleString()}</p>
                  {statusBadge("paid")}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Upload proof dialog */}
      <Dialog open={!!proofOpen} onOpenChange={v => { if (!v) { setProofOpen(null); setSelectedFile(null) } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Proof of Payment</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-sm text-gray-500">
              If you have made a bank transfer, upload your payment receipt or screenshot here.
              Our team will verify and confirm within 24 hours.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={e => setSelectedFile(e.target.files?.[0] ?? null)}
            />
            <Button variant="outline" onClick={() => fileRef.current?.click()} className="border-dashed w-full">
              <Upload className="h-4 w-4 mr-2" />
              {selectedFile ? selectedFile.name : "Choose file (PDF or image)"}
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setProofOpen(null); setSelectedFile(null) }}>Cancel</Button>
            <Button onClick={uploadProof} disabled={uploading || !selectedFile} className="bg-doda-navy text-white">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
