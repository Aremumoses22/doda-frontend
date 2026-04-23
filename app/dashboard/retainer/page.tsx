"use client"

import { useEffect, useState } from "react"
import { RefreshCw, MessageSquare, Loader2, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"
import { format } from "date-fns"
import { toast } from "sonner"

interface RetainerPlan {
  _id: string
  planName: string
  monthlyFee: number
  status: "active" | "inactive" | "cancelled"
  startDate?: string
  renewalDate?: string
  includedServices?: {
    serviceType: string
    monthlyLimit: number
    usedThisMonth: number
  }[]
  usageHistory?: {
    _id: string
    serviceType: string
    description?: string
    date: string
    units: number
  }[]
}

function usageColor(used: number, limit: number) {
  const pct = limit > 0 ? used / limit : 0
  if (pct >= 1)   return "bg-red-400"
  if (pct >= 0.7) return "bg-amber-400"
  return "bg-doda-gold"
}

export default function RetainerPage() {
  const [retainer, setRetainer] = useState<RetainerPlan | null>(null)
  const [loading, setLoading]   = useState(true)
  const [showRequest, setShowRequest] = useState(false)
  const [requestMsg, setRequestMsg] = useState("")
  const [sending, setSending]   = useState(false)

  useEffect(() => {
    api.get("/api/retainers?status=active&limit=1")
      .then(r => setRetainer(r.data.retainers?.[0] ?? null))
      .finally(() => setLoading(false))
  }, [])

  async function sendChangeRequest() {
    if (!requestMsg.trim()) return
    setSending(true)
    try {
      await api.post("/api/messages", {
        body: `Retainer Plan Change Request:\n\n${requestMsg}`,
        subject: "Retainer Plan Change Request",
      })
      toast.success("Request sent to Doda Legal")
      setShowRequest(false)
      setRequestMsg("")
    } catch { toast.error("Failed to send request") }
    finally { setSending(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-doda-gold" />
    </div>
  )

  if (!retainer) return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-doda-navy">My Retainer</h1>
      <div className="text-center py-20 border border-dashed border-gray-200 rounded-2xl">
        <RefreshCw className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">You don&apos;t have an active retainer plan</p>
        <Button className="mt-4 bg-doda-navy text-white" onClick={() => setShowRequest(true)}>
          <MessageSquare className="h-4 w-4 mr-2" /> Enquire About a Plan
        </Button>
      </div>
      <Dialog open={showRequest} onOpenChange={setShowRequest}>
        <DialogContent>
          <DialogHeader><DialogTitle>Enquire About a Retainer Plan</DialogTitle></DialogHeader>
          <Textarea
            value={requestMsg}
            onChange={e => setRequestMsg(e.target.value)}
            rows={4}
            placeholder="Tell us about your needs…"
            className="mt-2"
          />
          <DialogFooter className="mt-3">
            <Button variant="outline" onClick={() => setShowRequest(false)}>Cancel</Button>
            <Button onClick={sendChangeRequest} disabled={sending} className="bg-doda-navy text-white">
              {sending && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-doda-navy">My Retainer</h1>
          <p className="text-gray-500 text-sm mt-1">Track your retainer plan and monthly usage</p>
        </div>
        <Button variant="outline" onClick={() => setShowRequest(true)} className="border-doda-gold text-doda-gold">
          <MessageSquare className="h-4 w-4 mr-2" /> Request Plan Change
        </Button>
      </div>

      {/* Plan overview card */}
      <Card className="bg-doda-navy text-white overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <p className="text-white/50 text-xs uppercase tracking-wide mb-1">Active Plan</p>
              <h2 className="text-2xl font-bold">{retainer.planName}</h2>
              <p className="text-white/60 text-sm mt-1">
                ₦{retainer.monthlyFee?.toLocaleString()} / month
              </p>
            </div>
            <div className="text-right">
              <span className="bg-green-400 text-green-900 text-xs font-bold px-3 py-1 rounded-full uppercase">
                {retainer.status}
              </span>
              {retainer.renewalDate && (
                <p className="text-white/50 text-xs mt-2">
                  Renews {format(new Date(retainer.renewalDate), "d MMMM yyyy")}
                </p>
              )}
              {retainer.startDate && (
                <p className="text-white/40 text-xs mt-0.5">
                  Since {format(new Date(retainer.startDate), "d MMM yyyy")}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage progress bars */}
      {(retainer.includedServices?.length ?? 0) > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">This Month&apos;s Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {retainer.includedServices!.map((svc, i) => {
              const pct = svc.monthlyLimit > 0 ? Math.min((svc.usedThisMonth / svc.monthlyLimit) * 100, 100) : 0
              return (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="text-sm font-medium text-doda-navy capitalize">
                      {svc.serviceType.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-gray-400">
                      {svc.usedThisMonth} / {svc.monthlyLimit} units
                    </p>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${usageColor(svc.usedThisMonth, svc.monthlyLimit)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {svc.usedThisMonth >= svc.monthlyLimit && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      ⚠️ Monthly limit reached for this service
                    </p>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Usage history */}
      {(retainer.usageHistory?.length ?? 0) > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Usage History</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="text-left pb-2 font-medium">Date</th>
                  <th className="text-left pb-2 font-medium">Service</th>
                  <th className="text-left pb-2 font-medium">Description</th>
                  <th className="text-right pb-2 font-medium">Units</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {retainer.usageHistory!.map(h => (
                  <tr key={h._id}>
                    <td className="py-2.5 text-gray-500">{format(new Date(h.date), "d MMM yyyy")}</td>
                    <td className="py-2.5 text-gray-700 capitalize">{h.serviceType.replace(/_/g, " ")}</td>
                    <td className="py-2.5 text-gray-500">{h.description ?? "—"}</td>
                    <td className="py-2.5 text-right font-semibold text-doda-navy">{h.units}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Request plan change dialog */}
      <Dialog open={showRequest} onOpenChange={setShowRequest}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Plan Change</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-gray-500 mb-3">
              Describe the changes you&apos;d like to your retainer plan. Our team will review and get back to you.
            </p>
            <Textarea
              value={requestMsg}
              onChange={e => setRequestMsg(e.target.value)}
              rows={4}
              placeholder="e.g. I'd like to increase my advisory hours to 10 per month…"
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequest(false)}>Cancel</Button>
            <Button onClick={sendChangeRequest} disabled={sending} className="bg-doda-navy text-white">
              {sending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
