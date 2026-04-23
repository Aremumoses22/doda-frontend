"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Mail, Phone, Building, ExternalLink } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api } from "@/lib/api"
import { format } from "date-fns"
import { toast } from "sonner"

interface Client {
  _id: string
  clientCode: string
  companyName?: string
  individualName?: string
  clientType?: string
  industry?: string
  registrationNo?: string
  primaryEmail: string
  primaryPhone?: string
  address?: string
  engagementType?: string
  status: string
  accountManagerId?: { firstName: string; lastName: string; email: string } | null
  onboardedAt: string
}

interface Matter {
  _id: string
  matterCode: string
  title: string
  practiceArea: string
  status: string
  priority: string
  assignedToId?: { firstName: string; lastName: string } | null
  dueDate?: string
}

interface Invoice {
  _id: string
  invoiceNumber: string
  total: number
  status: string
  issuedDate?: string
  dueDate?: string
}

const STATUS_COLORS: Record<string, "success" | "warning" | "secondary" | "destructive" | "info" | "gold" | "outline"> = {
  active: "success", on_hold: "warning", completed: "secondary", inactive: "destructive",
  paid: "success", sent: "info", overdue: "destructive", draft: "secondary",
  new: "info", converted: "success",
}

export default function ClientProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [client, setClient]   = useState<Client | null>(null)
  const [matters, setMatters] = useState<Matter[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(`/api/clients/${id}`),
      api.get(`/api/matters?clientId=${id}&limit=50`),
      api.get(`/api/invoices?clientId=${id}&limit=50`),
    ]).then(([clientRes, mattersRes, invoicesRes]) => {
      setClient(clientRes.data)
      setMatters(mattersRes.data.matters ?? [])
      setInvoices(invoicesRes.data.invoices ?? [])
    }).catch(() => toast.error("Failed to load client"))
    .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)}</div>
  }
  if (!client) {
    return <div className="text-center py-20 text-gray-500">Client not found</div>
  }

  const clientName = client.companyName || client.individualName || "Client"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/admin/clients" className="flex items-center gap-1 text-sm text-gray-500 hover:text-doda-navy mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to Clients
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-doda-navy">{clientName}</h1>
            <Badge variant={STATUS_COLORS[client.status] ?? "secondary"} className="capitalize">
              {client.status.replace("_", " ")}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-0.5 font-mono">{client.clientCode}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/matters/new?clientId=${id}`}>
            <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" /> Add Matter</Button>
          </Link>
          <Link href={`/admin/billing/new?clientId=${id}`}>
            <Button variant="navy" size="sm"><Plus className="h-4 w-4 mr-1" /> Invoice</Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="matters">Matters ({matters.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="billing">Billing ({invoices.length})</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Client Information</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 text-sm">
                <InfoRow label="Type" value={client.clientType?.replace("_", " ")} />
                <InfoRow label="Industry" value={client.industry} />
                {client.registrationNo && <InfoRow label="Reg. Number" value={client.registrationNo} />}
                <InfoRow label="Engagement" value={client.engagementType?.replace("_", " ")} />
                <InfoRow label="Onboarded" value={format(new Date(client.onboardedAt), "d MMMM yyyy")} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Contact Details</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a href={`mailto:${client.primaryEmail}`} className="text-doda-gold hover:underline">{client.primaryEmail}</a>
                </div>
                {client.primaryPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{client.primaryPhone}</span>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-start gap-2">
                    <Building className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span>{client.address}</span>
                  </div>
                )}
                {client.accountManagerId && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-400 font-medium uppercase mb-1">Account Manager</p>
                    <p className="font-medium">
                      {client.accountManagerId.firstName} {client.accountManagerId.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{client.accountManagerId.email}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Matters */}
        <TabsContent value="matters">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Matter</TableHead>
                    <TableHead>Practice Area</TableHead>
                    <TableHead>Assigned Lawyer</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matters.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center text-gray-400 py-8">No matters yet</TableCell></TableRow>
                  ) : matters.map(m => (
                    <TableRow key={m._id}>
                      <TableCell>
                        <p className="font-medium text-doda-navy">{m.title}</p>
                        <p className="text-xs text-gray-500 font-mono">{m.matterCode}</p>
                      </TableCell>
                      <TableCell className="capitalize text-sm">{m.practiceArea.replace("_", " ")}</TableCell>
                      <TableCell className="text-sm">
                        {m.assignedToId ? `${m.assignedToId.firstName} ${m.assignedToId.lastName}` : <span className="text-gray-400">—</span>}
                      </TableCell>
                      <TableCell>
                        <Badge variant={m.priority === "high" ? "destructive" : m.priority === "low" ? "secondary" : "outline"} className="capitalize">
                          {m.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_COLORS[m.status] ?? "secondary"} className="capitalize">
                          {m.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {m.dueDate ? format(new Date(m.dueDate), "d MMM yyyy") : "—"}
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/matters/${m._id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><ExternalLink className="h-4 w-4" /></Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents */}
        <TabsContent value="documents">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-doda-navy">Client Documents</h3>
                <Link href={`/admin/documents?clientId=${id}`}>
                  <Button variant="outline" size="sm">View All Documents</Button>
                </Link>
              </div>
              <p className="text-sm text-gray-500">Documents are managed in the Documents Library. Filter by this client to see all files.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Issued</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-gray-400 py-8">No invoices yet</TableCell></TableRow>
                  ) : invoices.map(inv => (
                    <TableRow key={inv._id}>
                      <TableCell className="font-mono text-sm">{inv.invoiceNumber}</TableCell>
                      <TableCell className="font-medium">₦{inv.total.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {inv.issuedDate ? format(new Date(inv.issuedDate), "d MMM yyyy") : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {inv.dueDate ? format(new Date(inv.dueDate), "d MMM yyyy") : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_COLORS[inv.status] ?? "secondary"} className="capitalize">
                          {inv.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/billing/${inv._id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><ExternalLink className="h-4 w-4" /></Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messages */}
        <TabsContent value="messages">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-doda-navy">Communications</h3>
                <Link href={`/admin/messages?clientId=${id}`}>
                  <Button variant="navy" size="sm"><Mail className="h-4 w-4 mr-1" /> Open Thread</Button>
                </Link>
              </div>
              <p className="text-sm text-gray-500">All messages with this client are in the Communications Centre.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity */}
        <TabsContent value="activity">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-500 text-center py-4">Activity log coming soon — all actions on this client profile will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex justify-between">
      <span className="text-gray-500 font-medium capitalize">{label}</span>
      <span className="text-gray-700 capitalize">{value}</span>
    </div>
  )
}
