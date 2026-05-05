"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface Client { _id: string; companyName?: string; individualName?: string; primaryEmail: string }
interface Matter { _id: string; title: string; matterCode: string }

interface LineItem { description: string; quantity: number; unitPrice: number }

export default function NewInvoicePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultClientId = searchParams.get("clientId") ?? ""
  const defaultMatterId  = searchParams.get("matterId") ?? ""

  const [clients, setClients] = useState<Client[]>([])
  const [matters, setMatters] = useState<Matter[]>([])
  const [selectedClient, setSelectedClient] = useState(defaultClientId)
  const [selectedMatter, setSelectedMatter] = useState(defaultMatterId)
  const [lineItems, setLineItems] = useState<LineItem[]>([{ description: "", quantity: 1, unitPrice: 0 }])
  const [taxRate, setTaxRate] = useState(7.5)
  const [dueDate, setDueDate] = useState("")
  const [notes, setNotes]     = useState("")
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    api.get("/api/clients?limit=200&status=active").then(r => setClients(r.data.clients ?? [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedClient) return
    api.get(`/api/matters?clientId=${selectedClient}&limit=50`).then(r => setMatters(r.data.matters ?? [])).catch(() => {})
  }, [selectedClient])

  const addLine = () => setLineItems(prev => [...prev, { description: "", quantity: 1, unitPrice: 0 }])
  const removeLine = (i: number) => setLineItems(prev => prev.filter((_, idx) => idx !== i))
  const updateLine = (i: number, field: keyof LineItem, val: string | number) => {
    setLineItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: val } : item))
  }

  const subtotal = lineItems.reduce((sum, l) => sum + (Number(l.quantity) * Number(l.unitPrice)), 0)
  const tax      = subtotal * (taxRate / 100)
  const total    = subtotal + tax

  const clientLabel = (c: Client) => c.companyName || c.individualName || c.primaryEmail

  const save = async (sendNow: boolean) => {
    if (!selectedClient) { toast.error("Please select a client"); return }
    if (lineItems.some(l => !l.description)) { toast.error("All line items need a description"); return }
    setSaving(true)
    try {
      const res = await api.post("/api/invoices", {
        clientId: selectedClient,
        matterId: selectedMatter || undefined,
        lineItems: lineItems.map(l => ({
          description: l.description,
          quantity: Number(l.quantity),
          unitPrice: Number(l.unitPrice),
          total: Number(l.quantity) * Number(l.unitPrice),
        })),
        taxRate,
        subtotal,
        vatAmount: tax,
        total,
        dueDate: dueDate || undefined,
        notes: notes || undefined,
      })
      if (sendNow) {
        await api.post(`/api/invoices/${res.data._id}/send`)
        toast.success("Invoice created and sent")
      } else {
        toast.success("Invoice saved as draft")
      }
      router.push(`/admin/billing/${res.data._id}`)
    } catch {
      toast.error("Failed to create invoice")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <Link href="/admin/billing" className="flex items-center gap-1 text-sm text-gray-500 hover:text-doda-navy mb-2">
          <ArrowLeft className="h-4 w-4" /> Back to Billing
        </Link>
        <h1 className="text-2xl font-bold text-doda-navy">New Invoice</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Client & Matter */}
          <Card>
            <CardHeader><CardTitle>Bill To</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Client *</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>
                    {clients.map(c => <SelectItem key={c._id} value={c._id}>{clientLabel(c)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {selectedClient && (
                <div className="grid gap-2">
                  <Label>Related Matter (optional)</Label>
                  <Select value={selectedMatter} onValueChange={setSelectedMatter}>
                    <SelectTrigger><SelectValue placeholder="Select matter" /></SelectTrigger>
                    <SelectContent>
                      {matters.map(m => <SelectItem key={m._id} value={m._id}>{m.matterCode} — {m.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader><CardTitle>Line Items</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 uppercase px-1">
                <div className="col-span-5">Description</div>
                <div className="col-span-2">Qty</div>
                <div className="col-span-3">Rate (₦)</div>
                <div className="col-span-2 text-right">Amount</div>
              </div>
              {lineItems.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <Input className="col-span-5 text-sm" value={item.description}
                    onChange={e => updateLine(i, "description", e.target.value)}
                    placeholder="Legal services..." />
                  <Input className="col-span-2 text-sm" type="number" min="1" value={item.quantity}
                    onChange={e => updateLine(i, "quantity", e.target.value)} />
                  <Input className="col-span-3 text-sm" type="number" min="0" value={item.unitPrice}
                    onChange={e => updateLine(i, "unitPrice", e.target.value)} />
                  <div className="col-span-1 text-right text-sm font-medium text-gray-700">
                    ₦{(Number(item.quantity) * Number(item.unitPrice)).toLocaleString()}
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {lineItems.length > 1 && (
                      <button onClick={() => removeLine(i)} className="text-gray-300 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addLine} className="mt-2">
                <Plus className="h-4 w-4 mr-1" /> Add Line Item
              </Button>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
            <CardContent>
              <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Payment instructions, terms, or other notes..."
                className="flex w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-doda-gold/50 resize-none" />
            </CardContent>
          </Card>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Invoice Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">VAT ({taxRate}%)</span>
                <span className="font-medium">₦{tax.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base">
                <span className="font-bold text-doda-navy">Total</span>
                <span className="font-bold text-doda-navy">₦{total.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="grid gap-1.5">
                <Label className="text-xs">Due Date</Label>
                <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs">VAT Rate (%)</Label>
                <Input type="number" value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} min="0" max="100" />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Button variant="navy" className="w-full" onClick={() => save(false)} disabled={saving}>
              {saving ? "Saving..." : "Save as Draft"}
            </Button>
            <Button variant="outline" className="w-full border-doda-gold text-doda-gold hover:bg-amber-50" onClick={() => save(true)} disabled={saving}>
              Save & Send Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
