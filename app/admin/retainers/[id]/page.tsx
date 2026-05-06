"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api } from "@/lib/api"
import { format } from "date-fns"
import { toast } from "sonner"

interface Retainer {
  _id: string
  planName: string
  clientId: { _id: string; companyName?: string; individualName?: string; primaryEmail: string } | null
  assignedToId: { _id: string; firstName: string; lastName: string; email: string } | null
  monthlyFee: number
  currency: string
  hoursIncluded: number
  hoursUsed: number
  status: string
  startDate: string
  renewalDate?: string
  autoRenew: boolean
  notes?: string
}

interface UsageEntry {
  _id: string
  month: string
  hoursLogged: number
  description?: string
  matterId?: { title: string; matterCode: string } | null
  loggedById?: { firstName: string; lastName: string } | null
}

const STATUS_COLORS: Record<string, "success" | "warning" | "secondary" | "destructive"> = {
  active: "success", paused: "warning", cancelled: "destructive", expired: "secondary",
}

const STATUSES = ["active", "paused", "cancelled", "expired"]

export default function RetainerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [retainer, setRetainer] = useState<Retainer | null>(null)
  const [usage, setUsage]       = useState<UsageEntry[]>([])
  const [loading, setLoading]   = useState(true)
  const [status, setStatus]     = useState("")
  const [logModal, setLogModal] = useState(false)
  const [logForm, setLogForm]   = useState({ month: new Date().toISOString().slice(0, 7), hoursLogged: "", description: "" })
  const [savingLog, setSavingLog] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get(`/api/retainers/${id}`),
      api.get(`/api/retainers/${id}/usage`),
    ]).then(([rRes, uRes]) => {
      setRetainer(rRes.data)
      setStatus(rRes.data.status)
      setUsage(uRes.data ?? [])
    }).catch(() => toast.error("Failed to load retainer"))
    .finally(() => setLoading(false))
  }, [id])

  const updateStatus = async (newStatus: string) => {
    try {
      await api.patch(`/api/retainers/${id}`, { status: newStatus })
      setStatus(newStatus)
      setRetainer(prev => prev ? { ...prev, status: newStatus } : prev)
      toast.success("Status updated")
    } catch { toast.error("Failed to update status") }
  }

  const logUsage = async () => {
    if (!logForm.hoursLogged) return
    setSavingLog(true)
    try {
      const res = await api.post(`/api/retainers/${id}/usage`, {
        month: logForm.month,
        hoursLogged: parseFloat(logForm.hoursLogged),
        description: logForm.description || undefined,
      })
      setUsage(prev => [res.data, ...prev])
      const hours = parseFloat(logForm.hoursLogged)
      setRetainer(prev => prev ? { ...prev, hoursUsed: prev.hoursUsed + hours } : prev)
      setLogModal(false)
      setLogForm({ month: new Date().toISOString().slice(0, 7), hoursLogged: "", description: "" })
      toast.success("Usage logged")
    } catch { toast.error("Failed to log usage") }
    finally { setSavingLog(false) }
  }

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)}</div>
  if (!retainer) return <div className="text-center py-20 text-gray-500">Retainer not found</div>

  const clientName = retainer.clientId?.companyName || retainer.clientId?.individualName || retainer.clientId?.primaryEmail || "Unknown"
  const pct = retainer.hoursIncluded > 0 ? Math.min(100, Math.round((retainer.hoursUsed / retainer.hoursIncluded) * 100)) : 0

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/admin/retainers" className="flex items-center gap-1 text-sm text-gray-500 hover:text-doda-navy mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to Retainers
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-doda-navy">{retainer.planName}</h1>
            <Badge variant={STATUS_COLORS[retainer.status] ?? "secondary"} className="capitalize">{retainer.status}</Badge>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{clientName}</p>
        </div>
        <Button variant="navy" size="sm" onClick={() => setLogModal(true)}>
          <Plus className="h-4 w-4 mr-1" /> Log Usage
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-4">
          {/* Hours usage bar */}
          <Card>
            <CardHeader><CardTitle>Hours Usage</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{retainer.hoursUsed} of {retainer.hoursIncluded} hours used</span>
                <span className={`font-medium ${pct > 90 ? "text-red-500" : pct > 70 ? "text-amber-500" : "text-green-600"}`}>{pct}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-400" : "bg-green-500"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-gray-400">{retainer.hoursIncluded - retainer.hoursUsed} hours remaining</p>
            </CardContent>
          </Card>

          {/* Usage log */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle>Usage Log</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setLogModal(true)}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Log Hours
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Matter</TableHead>
                    <TableHead>Logged By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usage.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-gray-400 py-8">No usage logged yet</TableCell></TableRow>
                  ) : usage.map(u => (
                    <TableRow key={u._id}>
                      <TableCell className="font-mono text-sm">{u.month}</TableCell>
                      <TableCell className="font-medium">{u.hoursLogged}h</TableCell>
                      <TableCell className="text-sm text-gray-600">{u.description || "—"}</TableCell>
                      <TableCell className="text-xs text-gray-500">{u.matterId?.matterCode ?? "—"}</TableCell>
                      <TableCell className="text-xs text-gray-500">
                        {u.loggedById ? `${u.loggedById.firstName} ${u.loggedById.lastName}` : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">Monthly Fee</p>
                <p className="font-semibold text-doda-navy text-lg">₦{retainer.monthlyFee.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">Start Date</p>
                <p>{format(new Date(retainer.startDate), "d MMM yyyy")}</p>
              </div>
              {retainer.renewalDate && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">Renewal Date</p>
                  <p>{format(new Date(retainer.renewalDate), "d MMM yyyy")}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">Auto-Renew</p>
                <Badge variant={retainer.autoRenew ? "success" : "secondary"}>{retainer.autoRenew ? "Yes" : "No"}</Badge>
              </div>
              {retainer.assignedToId && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">Assigned To</p>
                  <p>{retainer.assignedToId.firstName} {retainer.assignedToId.lastName}</p>
                </div>
              )}
              {retainer.notes && (
                <div>
                  <p className="text-xs text-gray-400 uppercase font-medium mb-0.5">Notes</p>
                  <p className="text-gray-600">{retainer.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Status</CardTitle></CardHeader>
            <CardContent>
              <Select value={status} onValueChange={updateStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {retainer.clientId && (
            <Card>
              <CardContent className="p-4">
                <Link href={`/admin/clients/${retainer.clientId._id}`}>
                  <Button variant="outline" size="sm" className="w-full">View Client Profile</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Log Usage Modal */}
      <Dialog open={logModal} onOpenChange={setLogModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Log Hours</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Month</Label>
              <Input
                type="month"
                value={logForm.month}
                onChange={e => setLogForm(f => ({ ...f, month: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Hours Logged *</Label>
              <Input
                type="number"
                step="0.5"
                min="0"
                value={logForm.hoursLogged}
                onChange={e => setLogForm(f => ({ ...f, hoursLogged: e.target.value }))}
                placeholder="e.g. 2.5"
              />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Input
                value={logForm.description}
                onChange={e => setLogForm(f => ({ ...f, description: e.target.value }))}
                placeholder="e.g. Contract review and advice"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogModal(false)}>Cancel</Button>
            <Button variant="navy" onClick={logUsage} disabled={savingLog || !logForm.hoursLogged}>
              {savingLog ? "Saving..." : "Log Hours"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
