"use client"

import { useEffect, useState } from "react"
import { Loader2, Save, Lock, Bell } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { toast } from "sonner"

interface NotificationPrefs {
  matterUpdates:  { email: boolean; inApp: boolean }
  documents:      { email: boolean; inApp: boolean }
  messages:       { email: boolean; inApp: boolean }
  invoices:       { email: boolean; inApp: boolean }
  reminders:      { email: boolean; inApp: boolean }
}

const defaultPrefs: NotificationPrefs = {
  matterUpdates: { email: true,  inApp: true  },
  documents:     { email: true,  inApp: true  },
  messages:      { email: true,  inApp: true  },
  invoices:      { email: true,  inApp: true  },
  reminders:     { email: false, inApp: true  },
}

const prefLabels: Record<keyof NotificationPrefs, string> = {
  matterUpdates: "Matter Updates",
  documents:     "Document Shared",
  messages:      "New Messages",
  invoices:      "Invoice & Billing",
  reminders:     "Reminders",
}

interface ClientProfile {
  firstName: string
  lastName: string
  email: string
  phone: string
  companyName: string
  industry: string
  clientType: string
  clientCode: string
  engagementType: string
  assignedToId?: { firstName: string; lastName: string } | null
  notificationPreferences?: NotificationPrefs
}

export default function ProfilePage() {
  const { user, fetchMe } = useAuth()
  const [profile, setProfile]   = useState<Partial<ClientProfile>>({})
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)

  // Password change state
  const [currentPwd, setCurrentPwd] = useState("")
  const [newPwd, setNewPwd]         = useState("")
  const [confirmPwd, setConfirmPwd] = useState("")
  const [changingPwd, setChangingPwd] = useState(false)

  // Notification prefs
  const [prefs, setPrefs] = useState<NotificationPrefs>(defaultPrefs)

  useEffect(() => {
    api.get("/api/auth/me")
      .then(r => {
        setProfile(r.data)
        if (r.data.notificationPreferences) setPrefs({ ...defaultPrefs, ...r.data.notificationPreferences })
      })
      .finally(() => setLoading(false))
  }, [])

  async function saveProfile() {
    setSaving(true)
    try {
      await api.put("/api/auth/me", {
        firstName: profile.firstName,
        lastName:  profile.lastName,
        phone:     profile.phone,
        companyName: profile.companyName,
        industry:  profile.industry,
      })
      await fetchMe()
      toast.success("Profile updated")
    } catch { toast.error("Failed to update profile") }
    finally { setSaving(false) }
  }

  async function changePassword() {
    if (!currentPwd || !newPwd || !confirmPwd) { toast.error("All password fields are required"); return }
    if (newPwd !== confirmPwd) { toast.error("New passwords do not match"); return }
    if (newPwd.length < 8) { toast.error("New password must be at least 8 characters"); return }
    setChangingPwd(true)
    try {
      await api.post("/api/auth/change-password", { currentPassword: currentPwd, newPassword: newPwd })
      toast.success("Password changed successfully")
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("")
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to change password")
    } finally { setChangingPwd(false) }
  }

  async function savePrefs() {
    try {
      await api.put("/api/auth/me", { notificationPreferences: prefs })
      toast.success("Notification preferences saved")
    } catch { toast.error("Failed to save preferences") }
  }

  function togglePref(key: keyof NotificationPrefs, channel: "email" | "inApp") {
    setPrefs(p => ({
      ...p,
      [key]: { ...p[key], [channel]: !p[key][channel] }
    }))
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-doda-gold" />
    </div>
  )

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-doda-navy">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account details and preferences</p>
      </div>

      {/* Profile details */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input className="mt-1" value={profile.firstName ?? ""} onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))} />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input className="mt-1" value={profile.lastName ?? ""} onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))} />
            </div>
            <div>
              <Label>Email Address</Label>
              <Input className="mt-1" value={profile.email ?? ""} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input className="mt-1" value={profile.phone ?? ""} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div>
              <Label>Company / Organisation</Label>
              <Input className="mt-1" value={profile.companyName ?? ""} onChange={e => setProfile(p => ({ ...p, companyName: e.target.value }))} />
            </div>
            <div>
              <Label>Industry</Label>
              <Input className="mt-1" value={profile.industry ?? ""} onChange={e => setProfile(p => ({ ...p, industry: e.target.value }))} />
            </div>
          </div>

          <Separator className="my-2" />

          {/* Read-only fields */}
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Account Information</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Client Type", value: profile.clientType },
              { label: "Client Code", value: profile.clientCode },
              { label: "Engagement Type", value: profile.engagementType },
              { label: "Assigned Lawyer", value: profile.assignedToId ? `${profile.assignedToId.firstName} ${profile.assignedToId.lastName}` : "—" },
            ].map(f => (
              <div key={f.label}>
                <p className="text-xs text-gray-400 mb-0.5">{f.label}</p>
                <p className="text-sm font-medium text-doda-navy capitalize">{f.value ?? "—"}</p>
              </div>
            ))}
          </div>

          <Button onClick={saveProfile} disabled={saving} className="bg-doda-navy text-white">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Password change */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4 text-doda-gold" /> Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Current Password</Label>
            <Input type="password" className="mt-1" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>New Password</Label>
              <Input type="password" className="mt-1" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
            </div>
            <div>
              <Label>Confirm New Password</Label>
              <Input type="password" className="mt-1" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} />
            </div>
          </div>
          <p className="text-xs text-gray-400">Password must be at least 8 characters long.</p>
          <Button onClick={changePassword} disabled={changingPwd} variant="outline">
            {changingPwd ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Notification preferences */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-doda-gold" /> Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="grid grid-cols-3 text-xs text-gray-400 pb-2 border-b border-gray-100 mb-2">
              <span></span>
              <span className="text-center">Email</span>
              <span className="text-center">In-App</span>
            </div>
            {(Object.keys(prefLabels) as (keyof NotificationPrefs)[]).map(key => (
              <div key={key} className="grid grid-cols-3 items-center py-2.5 border-b border-gray-50 last:border-0">
                <p className="text-sm font-medium text-doda-navy">{prefLabels[key]}</p>
                <div className="flex justify-center">
                  <Switch
                    checked={prefs[key].email}
                    onCheckedChange={() => togglePref(key, "email")}
                  />
                </div>
                <div className="flex justify-center">
                  <Switch
                    checked={prefs[key].inApp}
                    onCheckedChange={() => togglePref(key, "inApp")}
                  />
                </div>
              </div>
            ))}
          </div>
          <Button onClick={savePrefs} className="mt-4 bg-doda-navy text-white">
            <Save className="h-4 w-4 mr-2" /> Save Preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
