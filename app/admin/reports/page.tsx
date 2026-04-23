"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "@/lib/api"
import { toast } from "sonner"

const NAVY = "#0D1B2A"
const GOLD = "#C9A84C"
const COLORS = [NAVY, GOLD, "#4A90A4", "#E8A838", "#6B7280", "#10B981", "#EF4444", "#8B5CF6"]

export default function ReportsPage() {
  const [revenue, setRevenue]   = useState<{ month: string; total: number }[]>([])
  const [matters, setMatters]   = useState<{ _id: string; count: number }[]>([])
  const [leads, setLeads]       = useState<{ _id: string; count: number }[]>([])
  const [clients, setClients]   = useState<{ _id: string; count: number }[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.allSettled([
      api.get("/api/reports/revenue"),
      api.get("/api/reports/matters"),
      api.get("/api/reports/leads"),
      api.get("/api/reports/clients"),
    ]).then(([rRes, mRes, lRes, cRes]) => {
      if (rRes.status === "fulfilled") setRevenue(rRes.value.data.revenue ?? [])
      if (mRes.status === "fulfilled") setMatters(mRes.value.data.byStatus ?? [])
      if (lRes.status === "fulfilled") setLeads(lRes.value.data.byStatus ?? [])
      if (cRes.status === "fulfilled") setClients(cRes.value.data.byType ?? [])
    }).catch(() => toast.error("Failed to load reports"))
    .finally(() => setLoading(false))
  }, [])

  const totalRevenue = revenue.reduce((s, r) => s + r.total, 0)
  const totalMatters = matters.reduce((s, m) => s + m.count, 0)
  const totalLeads   = leads.reduce((s, l) => s + l.count, 0)
  const totalClients = clients.reduce((s, c) => s + c.count, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-doda-navy">Reports & Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Practice performance overview</p>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue (YTD)", value: `₦${totalRevenue.toLocaleString()}`, color: "text-doda-gold" },
          { label: "Total Matters", value: totalMatters, color: "text-doda-navy" },
          { label: "Total Leads", value: totalLeads, color: "text-blue-600" },
          { label: "Total Clients", value: totalClients, color: "text-green-600" },
        ].map(k => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <p className="text-xs text-gray-500 font-medium uppercase">{k.label}</p>
              <p className={`text-2xl font-bold mt-1 ${k.color}`}>{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="matters">Matters</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <Card>
            <CardHeader><CardTitle>Monthly Revenue</CardTitle></CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
              ) : revenue.length === 0 ? (
                <p className="text-center text-gray-400 py-16">No revenue data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenue} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={v => `₦${(v/1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => [`₦${Number(v).toLocaleString()}`, "Revenue"]} />
                    <Bar dataKey="total" fill={GOLD} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matters">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Matters by Status</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={matters.map(m => ({ name: m._id, value: m.count }))}
                      cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                      paddingAngle={3} dataKey="value">
                      {matters.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {matters.map((m, i) => (
                    <div key={m._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-sm capitalize">{m._id.replace("_", " ")}</span>
                      </div>
                      <span className="text-sm font-bold text-doda-navy">{m.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leads">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Leads by Status</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={leads.map(l => ({ name: l._id, value: l.count }))}
                      cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                      paddingAngle={3} dataKey="value">
                      {leads.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Conversion Summary</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leads.map((l, i) => (
                    <div key={l._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-sm capitalize">{l._id}</span>
                      </div>
                      <span className="text-sm font-bold text-doda-navy">{l.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Clients by Type</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={clients.map(c => ({ name: c._id, value: c.count }))}
                      cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                      paddingAngle={3} dataKey="value">
                      {clients.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Client Breakdown</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {clients.map((c, i) => (
                    <div key={c._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-sm capitalize">{c._id}</span>
                      </div>
                      <span className="text-sm font-bold text-doda-navy">{c.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
