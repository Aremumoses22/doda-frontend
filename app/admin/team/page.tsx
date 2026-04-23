"use client"

import { useEffect, useState } from "react"
import { Plus, Mail, Phone, Shield } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { api } from "@/lib/api"
import { format } from "date-fns"
import { toast } from "sonner"

interface TeamMember {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: string
  phone?: string
  barNumber?: string
  status: string
  createdAt: string
}

const ROLE_COLORS: Record<string, "gold" | "info" | "secondary" | "outline" | "warning"> = {
  principal: "gold", senior_associate: "info", associate: "secondary", paralegal: "outline", intern: "warning",
}
const ROLES = ["principal", "senior_associate", "associate", "paralegal", "intern"]

export default function TeamPage() {
  const [team, setTeam]       = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [form, setForm]       = useState({ firstName: "", lastName: "", email: "", role: "associate", phone: "", barNumber: "", password: "" })
  const [saving, setSaving]   = useState(false)

  const fetchTeam = () => {
    setLoading(true)
    api.get("/api/team?limit=50")
      .then(r => setTeam(r.data.team ?? []))
      .catch(() => toast.error("Failed to load team"))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchTeam() }, [])

  const addMember = async () => {
    if (!form.firstName || !form.email || !form.password) {
      toast.error("First name, email and password are required")
      return
    }
    setSaving(true)
    try {
      await api.post("/api/team", form)
      fetchTeam()
      setModal(false)
      setForm({ firstName: "", lastName: "", email: "", role: "associate", phone: "", barNumber: "", password: "" })
      toast.success("Team member added")
    } catch { toast.error("Failed to add member") }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-doda-navy">Team</h1>
          <p className="text-sm text-gray-500 mt-0.5">{team.length} team member{team.length !== 1 ? "s" : ""}</p>
        </div>
        <Button variant="navy" onClick={() => setModal(true)}><Plus className="h-4 w-4 mr-1" /> Add Member</Button>
      </div>

      {/* Grid cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          [1,2,3,4].map(i => <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />)
        ) : team.map(m => (
          <Card key={m._id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex flex-col items-center text-center">
              <Avatar className="h-14 w-14 mb-3">
                <AvatarFallback className="text-lg">{m.firstName[0]}{m.lastName?.[0] ?? ""}</AvatarFallback>
              </Avatar>
              <p className="font-semibold text-doda-navy">{m.firstName} {m.lastName}</p>
              <Badge variant={ROLE_COLORS[m.role] ?? "outline"} className="mt-1 capitalize text-xs">
                {m.role.replace("_", " ")}
              </Badge>
              <div className="mt-3 space-y-1 w-full text-xs text-gray-500">
                <div className="flex items-center gap-1.5 justify-center">
                  <Mail className="h-3 w-3" /> <span className="truncate">{m.email}</span>
                </div>
                {m.phone && <div className="flex items-center gap-1.5 justify-center"><Phone className="h-3 w-3" /> {m.phone}</div>}
                {m.barNumber && <div className="flex items-center gap-1.5 justify-center"><Shield className="h-3 w-3" /> {m.barNumber}</div>}
              </div>
              <p className="text-xs text-gray-400 mt-3">Joined {format(new Date(m.createdAt), "MMM yyyy")}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Bar Number</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {team.map(m => (
                <TableRow key={m._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">{m.firstName[0]}{m.lastName?.[0] ?? ""}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-doda-navy">{m.firstName} {m.lastName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={ROLE_COLORS[m.role] ?? "outline"} className="capitalize text-xs">
                      {m.role.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{m.email}</TableCell>
                  <TableCell className="text-sm font-mono">{m.barNumber ?? "—"}</TableCell>
                  <TableCell className="text-sm text-gray-500">{format(new Date(m.createdAt), "d MMM yyyy")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Member Modal */}
      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Team Member</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>First Name *</Label>
                <Input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="John" />
              </div>
              <div className="grid gap-1.5">
                <Label>Last Name</Label>
                <Input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Doe" />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@dodalegal.com" />
            </div>
            <div className="grid gap-1.5">
              <Label>Password *</Label>
              <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Role</Label>
                <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map(r => <SelectItem key={r} value={r} className="capitalize">{r.replace("_", " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+234..." />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Bar Number</Label>
              <Input value={form.barNumber} onChange={e => setForm(f => ({ ...f, barNumber: e.target.value }))} placeholder="NBA-12345" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(false)}>Cancel</Button>
            <Button variant="navy" onClick={addMember} disabled={saving}>{saving ? "Adding..." : "Add Member"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
