"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface TeamMember { _id: string; firstName: string; lastName: string; email: string }

interface FormValues {
  clientType: string
  companyName: string
  individualFirstName: string
  individualLastName: string
  primaryEmail: string
  primaryPhone: string
  address: string
  industry: string
  registrationNo: string
  engagementType: string
  retainerPlanId: string
  accountManagerId: string
}

export default function NewClientPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const leadId = searchParams.get("leadId")

  const [team, setTeam] = useState<TeamMember[]>([])
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: { clientType: "individual", engagementType: "retainer" },
  })
  const clientType = watch("clientType")

  useEffect(() => {
    api.get("/api/team?limit=50").then(r => setTeam(r.data.team ?? [])).catch(() => {})
  }, [])

  const onSubmit = async (data: FormValues) => {
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        clientType: data.clientType,
        primaryEmail: data.primaryEmail,
        primaryPhone: data.primaryPhone || undefined,
        address: data.address || undefined,
        industry: data.industry || undefined,
        registrationNo: data.registrationNo || undefined,
        engagementType: data.engagementType,
        accountManagerId: data.accountManagerId || undefined,
        leadId: leadId || undefined,
      }
      if (data.clientType === "company") {
        payload.clientType = "corporate"
        payload.companyName = data.companyName
      } else {
        payload.individualName = `${data.individualFirstName} ${data.individualLastName}`.trim()
      }
      const res = await api.post("/api/clients", payload)
      toast.success("Client created")
      router.push(`/admin/clients/${res.data._id}`)
    } catch {
      toast.error("Failed to create client")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link href="/admin/clients" className="flex items-center gap-1 text-sm text-gray-500 hover:text-doda-navy mb-2">
          <ArrowLeft className="h-4 w-4" /> Back to Clients
        </Link>
        <h1 className="text-2xl font-bold text-doda-navy">New Client</h1>
        <p className="text-sm text-gray-500 mt-0.5">Add a new client to the practice management system.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Client Type</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {["individual", "company"].map(type => (
                <button key={type} type="button"
                  onClick={() => setValue("clientType", type)}
                  className={`border-2 rounded-xl p-4 text-left transition-all ${clientType === type ? "border-doda-gold bg-amber-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <p className="font-semibold capitalize text-doda-navy">{type}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {type === "individual" ? "Single person client" : "Corporate or registered entity"}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Client Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {clientType === "company" ? (
              <div className="grid gap-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input id="companyName" {...register("companyName", { required: clientType === "company" })}
                  placeholder="Acme Limited" className={errors.companyName ? "border-red-400" : ""} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="individualFirstName">First Name *</Label>
                  <Input id="individualFirstName"
                    {...register("individualFirstName", { required: clientType === "individual" })}
                    placeholder="John" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="individualLastName">Last Name *</Label>
                  <Input id="individualLastName"
                    {...register("individualLastName", { required: clientType === "individual" })}
                    placeholder="Doe" />
                </div>
              </div>
            )}

            {clientType === "company" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="registrationNo">Registration Number</Label>
                  <Input id="registrationNo" {...register("registrationNo")} placeholder="RC-123456" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input id="industry" {...register("industry")} placeholder="Technology" />
                </div>
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="primaryEmail">Email Address *</Label>
                <Input id="primaryEmail" type="email"
                  {...register("primaryEmail", { required: true })}
                  placeholder="client@example.com"
                  className={errors.primaryEmail ? "border-red-400" : ""} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="primaryPhone">Phone Number</Label>
                <Input id="primaryPhone" {...register("primaryPhone")} placeholder="+234 800 000 0000" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...register("address")} placeholder="1 Law Street, Victoria Island, Lagos" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Engagement Setup</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Engagement Type *</Label>
                <Select defaultValue="retainer" onValueChange={v => setValue("engagementType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["retainer", "advisory", "transactional", "embedded"].map(e => (
                      <SelectItem key={e} value={e} className="capitalize">{e}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Account Manager</Label>
                <Select onValueChange={v => setValue("accountManagerId", v)}>
                  <SelectTrigger><SelectValue placeholder="Assign lawyer" /></SelectTrigger>
                  <SelectContent>
                    {team.map(m => (
                      <SelectItem key={m._id} value={m._id}>
                        {m.firstName} {m.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" variant="navy" disabled={saving} className="min-w-32">
            {saving ? "Creating..." : "Create Client"}
          </Button>
          <Link href="/admin/clients">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
