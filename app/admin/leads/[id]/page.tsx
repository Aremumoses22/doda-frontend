"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, UserCheck, Briefcase, Phone, Mail, Globe,
  ChevronDown, Save, RefreshCw,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { api } from "@/lib/api"
import { format } from "date-fns"
import { toast } from "sonner"

interface Lead {
  _id: string
  fullName: string
  email: string
  phone: string
  companyName?: string
  businessType?: string
  serviceInterest?: string[]
  engagementType?: string
  description?: string
  preferredTime?: string
  referralSource?: string
  status: string
  internalNotes?: string
  assignedTo?: { _id: string; firstName: string; lastName: string } | null
  convertedAt?: string
  createdAt: string
  updatedAt: string
}

const STATUS_OPTIONS = ["new", "contacted", "qualified", "proposal_sent", "converted", "archived"]
const STATUS_COLORS: Record<string, "info" | "warning" | "gold" | "success" | "secondary"> = {
  new: "info", contacted: "warning", qualified: "gold",
  proposal_sent: "warning", converted: "success", archived: "secondary",
}

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [lead, setLead]       = useState<Lead | null>(null)
  const [notes, setNotes]     = useState("")
  const [status, setStatus]   = useState("")
  const [saving, setSaving]   = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/api/leads/${id}`)
      .then(({ data }) => {
        setLead(data)
        setNotes(data.internalNotes ?? "")
        setStatus(data.status)
      })
      .finally(() => setLoading(false))
  }, [id])

  const save = async () => {
    setSaving(true)
    try {
      await api.patch(`/api/leads/${id}`, { status, internalNotes: notes })
      toast.success("Lead updated")
    } catch {
      toast.error("Failed to update")
    } finally {
      setSaving(false)
    }
  }

  const convertToClient = async () => {
    try {
      await api.post(`/api/leads/${id}/convert`, {})
      toast.success("Lead converted — create a client profile now")
      router.push("/admin/clients/new")
    } catch {
      toast.error("Failed to convert lead")
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)}
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Lead not found</p>
        <Link href="/admin/leads"><Button variant="outline" className="mt-4">Back to Leads</Button></Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/admin/leads" className="flex items-center gap-1 text-sm text-gray-500 hover:text-doda-navy mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to Leads
          </Link>
          <h1 className="text-2xl font-bold text-doda-navy">{lead.fullName}</h1>
          <p className="text-sm text-gray-500">
            Received {format(new Date(lead.createdAt), "d MMMM yyyy, h:mm a")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={save} disabled={saving}>
            <Save className="h-4 w-4 mr-1" /> {saving ? "Saving…" : "Save"}
          </Button>
          {lead.status !== "converted" && (
            <Button variant="navy" size="sm" onClick={convertToClient}>
              <UserCheck className="h-4 w-4 mr-1" /> Convert to Client
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Lead Details */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <Detail icon={<Mail />} label="Email" value={<a href={`mailto:${lead.email}`} className="text-doda-gold hover:underline">{lead.email}</a>} />
              <Detail icon={<Phone />} label="Phone" value={lead.phone} />
              <Detail icon={<Briefcase />} label="Company" value={lead.companyName || "—"} />
              <Detail icon={<Globe />} label="Business Type" value={lead.businessType || "—"} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Enquiry Details</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {lead.serviceInterest && lead.serviceInterest.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase mb-1">Services of Interest</p>
                  <div className="flex flex-wrap gap-1.5">
                    {lead.serviceInterest.map(s => <Badge key={s} variant="info">{s}</Badge>)}
                  </div>
                </div>
              )}
              {lead.engagementType && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase mb-1">Engagement Type</p>
                  <p className="capitalize">{lead.engagementType.replace("_", " ")}</p>
                </div>
              )}
              {lead.description && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase mb-1">Description</p>
                  <p className="text-gray-700 leading-relaxed">{lead.description}</p>
                </div>
              )}
              {lead.preferredTime && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase mb-1">Preferred Call Time</p>
                  <p className="capitalize">{lead.preferredTime.replace("_", " ")}</p>
                </div>
              )}
              {lead.referralSource && (
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase mb-1">Referral Source</p>
                  <p className="capitalize">{lead.referralSource.replace("_", " ")}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Internal Notes */}
          <Card>
            <CardHeader><CardTitle>Internal Notes</CardTitle></CardHeader>
            <CardContent>
              <Textarea
                rows={5}
                placeholder="Add internal notes about this lead — not visible to the enquirer"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right: Status + Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Status</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Badge variant={STATUS_COLORS[lead.status] ?? "secondary"} className="capitalize text-sm px-3 py-1">
                {lead.status.replace("_", " ")}
              </Badge>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase mb-1.5">Update Status</p>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(s => (
                      <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <a href={`mailto:${lead.email}`}>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Mail className="h-4 w-4" /> Send Email
                </Button>
              </a>
              <a href={`tel:${lead.phone}`}>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Phone className="h-4 w-4" /> Call
                </Button>
              </a>
              {lead.status !== "converted" && (
                <Button variant="navy" className="w-full justify-start gap-2" onClick={convertToClient}>
                  <UserCheck className="h-4 w-4" /> Convert to Client
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-xs text-gray-400 space-y-1">
              <p>Received: {format(new Date(lead.createdAt), "d MMM yyyy, HH:mm")}</p>
              <p>Updated: {format(new Date(lead.updatedAt), "d MMM yyyy, HH:mm")}</p>
              {lead.convertedAt && <p>Converted: {format(new Date(lead.convertedAt), "d MMM yyyy")}</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2.5">
      <span className="mt-0.5 shrink-0 text-gray-400 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      <div>
        <p className="text-xs font-medium text-gray-400 uppercase">{label}</p>
        <div className="text-gray-700">{value}</div>
      </div>
    </div>
  )
}
