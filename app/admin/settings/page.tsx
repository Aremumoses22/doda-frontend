"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { api } from "@/lib/api"
import { toast } from "sonner"

export default function SettingsPage() {
  const [firmForm, setFirmForm] = useState({
    name: "DODA Legal",
    email: "hello@dodalegal.com",
    phone: "+234 800 000 0000",
    address: "Victoria Island, Lagos, Nigeria",
    website: "https://dodalegal.com",
    rcNumber: "",
  })
  const [savingFirm, setSavingFirm] = useState(false)

  const [notifSettings, setNotifSettings] = useState({
    newLeadEmail: true,
    invoicePaidEmail: true,
    newMessageEmail: true,
    matterDueSoonEmail: true,
  })

  const [paystackKey, setPaystackKey] = useState("")
  const [cloudinaryName, setCloudinaryName] = useState("")

  const saveFirm = async () => {
    setSavingFirm(true)
    // In a real implementation, PATCH /api/settings/firm
    await new Promise(r => setTimeout(r, 600))
    setSavingFirm(false)
    toast.success("Firm settings saved")
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-doda-navy">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage firm preferences and system configuration.</p>
      </div>

      <Tabs defaultValue="firm">
        <TabsList>
          <TabsTrigger value="firm">Firm Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Firm Profile */}
        <TabsContent value="firm">
          <Card>
            <CardHeader>
              <CardTitle>Firm Information</CardTitle>
              <CardDescription>Update your law firm's profile details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Firm Name</Label>
                  <Input value={firmForm.name} onChange={e => setFirmForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>RC Number</Label>
                  <Input value={firmForm.rcNumber} onChange={e => setFirmForm(f => ({ ...f, rcNumber: e.target.value }))} placeholder="RC-123456" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input type="email" value={firmForm.email} onChange={e => setFirmForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="grid gap-2">
                  <Label>Phone</Label>
                  <Input value={firmForm.phone} onChange={e => setFirmForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Address</Label>
                <Input value={firmForm.address} onChange={e => setFirmForm(f => ({ ...f, address: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Website</Label>
                <Input value={firmForm.website} onChange={e => setFirmForm(f => ({ ...f, website: e.target.value }))} />
              </div>
              <Button variant="navy" onClick={saveFirm} disabled={savingFirm}>
                {savingFirm ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Choose which system events trigger email alerts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "newLeadEmail", label: "New Lead Submission", desc: "Get notified when a new enquiry is received" },
                { key: "invoicePaidEmail", label: "Invoice Paid", desc: "Receive confirmation when a client pays an invoice" },
                { key: "newMessageEmail", label: "New Client Message", desc: "Receive an email when a client sends a message" },
                { key: "matterDueSoonEmail", label: "Matter Due Soon", desc: "Alert when a matter deadline is approaching" },
              ].map(n => (
                <div key={n.key}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-doda-navy">{n.label}</p>
                      <p className="text-xs text-gray-500">{n.desc}</p>
                    </div>
                    <Switch
                      checked={notifSettings[n.key as keyof typeof notifSettings]}
                      onCheckedChange={(v: boolean) => setNotifSettings(s => ({ ...s, [n.key]: v }))} />
                  </div>
                  <Separator className="mt-3" />
                </div>
              ))}
              <Button variant="navy" onClick={() => toast.success("Notification preferences saved")}>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Paystack</CardTitle>
                <CardDescription>Payment processing for client invoices.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2">
                  <Label>Secret Key</Label>
                  <Input type="password" value={paystackKey} onChange={e => setPaystackKey(e.target.value)}
                    placeholder="sk_live_••••••••••••" />
                </div>
                <p className="text-xs text-gray-400">Set in your environment variables: <code className="bg-gray-100 px-1 rounded">PAYSTACK_SECRET_KEY</code></p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cloudinary</CardTitle>
                <CardDescription>Secure document and file storage.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2">
                  <Label>Cloud Name</Label>
                  <Input value={cloudinaryName} onChange={e => setCloudinaryName(e.target.value)} placeholder="your-cloud-name" />
                </div>
                <p className="text-xs text-gray-400">Configure via: <code className="bg-gray-100 px-1 rounded">CLOUDINARY_CLOUD_NAME</code>, <code className="bg-gray-100 px-1 rounded">CLOUDINARY_API_KEY</code>, <code className="bg-gray-100 px-1 rounded">CLOUDINARY_API_SECRET</code></p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage access control and session security.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-doda-navy">Force Password Reset</p>
                  <p className="text-xs text-gray-500">Require all staff to reset passwords on next login</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast.info("This feature requires backend implementation")}>
                  Trigger Reset
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-doda-navy">Session Timeout</p>
                  <p className="text-xs text-gray-500">Current: 24 hours (configured via JWT_EXPIRES_IN)</p>
                </div>
                <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">24h</span>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-doda-navy mb-1">Audit Log</p>
                <p className="text-xs text-gray-500 mb-2">All admin actions are tracked in the audit log.</p>
                <a href="/admin/audit-log" className="text-sm text-doda-gold hover:underline">View Audit Log →</a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
