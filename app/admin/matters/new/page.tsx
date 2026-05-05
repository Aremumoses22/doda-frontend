"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface Client { _id: string; companyName?: string; individualName?: string; primaryEmail: string }
interface TeamMember { _id: string; firstName: string; lastName: string; email: string; role: string }

interface FormValues {
  clientId: string
  title: string
  description: string
  practiceArea: string
  priority: string
  assignedToId: string
  supervisorId: string
  dueDate: string
}

const PRACTICE_AREAS: { value: string; label: string }[] = [
  { value: "corporate_law",    label: "Corporate Law" },
  { value: "contracts",        label: "Contracts" },
  { value: "compliance",       label: "Compliance" },
  { value: "startup_sme",      label: "Startup & SME" },
  { value: "ip",               label: "Intellectual Property" },
  { value: "property",         label: "Property Law" },
  { value: "general_advisory", label: "General Advisory" },
]
const PRIORITIES: { value: string; label: string }[] = [
  { value: "high",   label: "High" },
  { value: "normal", label: "Normal" },
  { value: "low",    label: "Low" },
]

export default function NewMatterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultClientId = searchParams.get("clientId") ?? ""

  const [clients, setClients] = useState<Client[]>([])
  const [team, setTeam]       = useState<TeamMember[]>([])
  const [saving, setSaving]   = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: { clientId: defaultClientId, priority: "normal", practiceArea: "corporate_law" },
  })

  useEffect(() => {
    Promise.all([
      api.get("/api/clients?limit=200&status=active"),
      api.get("/api/team?limit=50"),
    ]).then(([cRes, tRes]) => {
      setClients(cRes.data.clients ?? [])
      setTeam(tRes.data.team ?? [])
    }).catch(() => {})
  }, [])

  const clientLabel = (c: Client) => c.companyName || c.individualName || c.primaryEmail

  const onSubmit = async (data: FormValues) => {
    setSaving(true)
    try {
      const res = await api.post("/api/matters", {
        clientId: data.clientId,
        title: data.title,
        description: data.description || undefined,
        practiceArea: data.practiceArea,
        priority: data.priority,
        assignedToId: data.assignedToId || undefined,
        supervisorId: data.supervisorId || undefined,
        dueDate: data.dueDate || undefined,
      })
      toast.success("Matter created")
      router.push(`/admin/matters/${res.data._id}`)
    } catch {
      toast.error("Failed to create matter")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link href="/admin/matters" className="flex items-center gap-1 text-sm text-gray-500 hover:text-doda-navy mb-2">
          <ArrowLeft className="h-4 w-4" /> Back to Matters
        </Link>
        <h1 className="text-2xl font-bold text-doda-navy">Open New Matter</h1>
        <p className="text-sm text-gray-500 mt-0.5">Create a new legal matter for a client.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Matter Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Client *</Label>
              <Select defaultValue={defaultClientId} onValueChange={v => setValue("clientId", v)}>
                <SelectTrigger className={errors.clientId ? "border-red-400" : ""}>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(c => (
                    <SelectItem key={c._id} value={c._id}>{clientLabel(c)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Matter Title *</Label>
              <Input id="title" {...register("title", { required: true })}
                placeholder="e.g. Acquisition of ABC Limited"
                className={errors.title ? "border-red-400" : ""} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <textarea id="description" {...register("description")}
                rows={3} placeholder="Brief overview of the matter..."
                className="flex w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-doda-gold/50 resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Practice Area *</Label>
                <Select defaultValue="corporate_law" onValueChange={v => setValue("practiceArea", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRACTICE_AREAS.map(a => (
                      <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Priority</Label>
                <Select defaultValue="normal" onValueChange={v => setValue("priority", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Team Assignment</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Lead Lawyer</Label>
                <Select onValueChange={v => setValue("assignedToId", v)}>
                  <SelectTrigger><SelectValue placeholder="Assign lawyer" /></SelectTrigger>
                  <SelectContent>
                    {team.map(m => (
                      <SelectItem key={m._id} value={m._id}>
                        {m.firstName} {m.lastName} ({m.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Supervisor</Label>
                <Select onValueChange={v => setValue("supervisorId", v)}>
                  <SelectTrigger><SelectValue placeholder="Assign supervisor" /></SelectTrigger>
                  <SelectContent>
                    {team.filter(m => ["principal", "senior_associate"].includes(m.role)).map(m => (
                      <SelectItem key={m._id} value={m._id}>
                        {m.firstName} {m.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" {...register("dueDate")} className="w-48" />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" variant="navy" disabled={saving} className="min-w-36">
            {saving ? "Opening Matter..." : "Open Matter"}
          </Button>
          <Link href="/admin/matters">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
