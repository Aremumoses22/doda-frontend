"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, CalendarDays, User, Scale, FileText,
  Upload, Download, Send, AlertTriangle, CheckCircle2, Loader2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MatterTimeline, type TimelineStep } from "@/components/portal/MatterTimeline"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { format } from "date-fns"
import { toast } from "sonner"

interface Milestone {
  _id: string
  title: string
  dueDate?: string
  status: "pending" | "completed" | "missed"
}

interface Task {
  _id: string
  title: string
  status: string
  assignedToClient?: boolean
  completedAt?: string
  notes?: string
}

interface MatterDoc {
  _id: string
  name: string
  category: string
  fileUrl?: string
  status?: string
  createdAt: string
  matterCode?: string
}

interface MatterMessage {
  _id: string
  body: string
  senderId: { _id: string; firstName: string; lastName: string } | null
  createdAt: string
  attachments?: { name: string; url: string }[]
}

interface Matter {
  _id: string
  title: string
  practiceArea: string
  status: string
  description?: string
  matterCode?: string
  tasks: Task[]
  milestones?: Milestone[]
  openedDate?: string
  expectedCompletionDate?: string
  assignedToId?: { _id: string; firstName: string; lastName: string; email?: string } | null
  clientId?: { firstName: string; lastName: string } | null
}

const statusConfig: Record<string, { label: string; color: string }> = {
  draft:          { label: "Getting Started",     color: "bg-gray-100 text-gray-600" },
  open:           { label: "Getting Started",     color: "bg-gray-100 text-gray-600" },
  active:         { label: "In Progress",         color: "bg-amber-100 text-amber-700" },
  pending_client: { label: "Awaiting Your Input", color: "bg-red-100 text-red-700" },
  on_hold:        { label: "On Hold",             color: "bg-orange-100 text-orange-700" },
  closed:         { label: "Completed",           color: "bg-green-100 text-green-700" },
}

function milestoneStatusBadge(s: string) {
  if (s === "completed") return <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle2 className="h-3.5 w-3.5" />Completed</span>
  if (s === "missed")    return <span className="text-xs text-red-600">⚠️ Missed</span>
  return <span className="text-xs text-gray-400">Pending</span>
}

export default function MatterDetailPage() {
  const { id }      = useParams<{ id: string }>()
  const router      = useRouter()
  const { user }    = useAuth()

  const [matter, setMatter]       = useState<Matter | null>(null)
  const [docs, setDocs]           = useState<MatterDoc[]>([])
  const [messages, setMessages]   = useState<MatterMessage[]>([])
  const [loading, setLoading]     = useState(true)
  const [replyBody, setReplyBody] = useState("")
  const [sending, setSending]     = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef              = useRef<HTMLInputElement>(null)
  const chatEndRef                = useRef<HTMLDivElement>(null)

  useEffect(() => {
    Promise.allSettled([
      api.get(`/api/matters/${id}`),
      api.get(`/api/documents?matterId=${id}`),
      api.get(`/api/messages?matterId=${id}`),
    ]).then(([mRes, dRes, msgRes]) => {
      if (mRes.status === "fulfilled")   setMatter(mRes.value.data)
      if (dRes.status === "fulfilled")   setDocs(dRes.value.data.documents ?? [])
      if (msgRes.status === "fulfilled") setMessages(msgRes.value.data.messages ?? [])
    }).finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Build timeline steps from tasks
  const timelineSteps: TimelineStep[] = (matter?.tasks ?? []).map(t => {
    let status: TimelineStep["status"] = "pending"
    if (t.status === "done")       status = "completed"
    else if (t.assignedToClient)   status = "action_required"
    else if (t.status === "in_progress") status = "in_progress"
    return {
      id: t._id,
      title: t.title,
      status,
      completedAt: t.completedAt ? format(new Date(t.completedAt), "d MMM yyyy") : undefined,
      note: t.notes,
    }
  })

  async function sendReply() {
    if (!replyBody.trim()) return
    setSending(true)
    try {
      const r = await api.post("/api/messages", { body: replyBody, matterId: id })
      setMessages(prev => [...prev, r.data])
      setReplyBody("")
    } catch {
      toast.error("Failed to send message")
    } finally {
      setSending(false)
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("name", file.name)
      fd.append("matterId", id)
      fd.append("visibleToClient", "false")
      await api.post("/api/documents", fd, { headers: { "Content-Type": "multipart/form-data" } })
      toast.success("File uploaded successfully")
      const r = await api.get(`/api/documents?matterId=${id}`)
      setDocs(r.data.documents ?? [])
    } catch {
      toast.error("Upload failed")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function downloadDoc(docId: string, title: string) {
    try {
      const r = await api.get(`/api/documents/${docId}/download`)
      const url = r.data.url
      const a = document.createElement("a"); a.href = url; a.target = "_blank"; a.download = title; a.click()
    } catch { toast.error("Download failed") }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-doda-gold" />
    </div>
  )

  if (!matter) return (
    <div className="text-center py-20">
      <p className="text-gray-400">Matter not found.</p>
      <Link href="/dashboard/matters"><Button className="mt-4">Back to Matters</Button></Link>
    </div>
  )

  const cfg = statusConfig[matter.status] ?? { label: matter.status, color: "bg-gray-100 text-gray-600" }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back + header */}
      <div>
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-doda-navy mb-3 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to My Matters
        </button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-doda-navy">{matter.title}</h1>
            {matter.matterCode && <p className="text-gray-400 text-sm">{matter.matterCode}</p>}
          </div>
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
        </div>
      </div>

      {/* Section 1: Overview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Scale className="h-4 w-4 text-doda-gold" /> Matter Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Practice Area</p>
              <p className="font-medium text-doda-navy capitalize">{matter.practiceArea?.replace(/_/g, " ") || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Assigned Lawyer</p>
              {matter.assignedToId ? (
                <a
                  href={`mailto:${matter.assignedToId.email}`}
                  className="font-medium text-doda-gold hover:underline"
                >
                  {matter.assignedToId.firstName} {matter.assignedToId.lastName}
                </a>
              ) : <p className="font-medium text-doda-navy">—</p>}
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Date Opened</p>
              <p className="font-medium text-doda-navy">
                {matter.openedDate ? format(new Date(matter.openedDate), "d MMM yyyy") : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Expected Completion</p>
              <p className="font-medium text-doda-navy">
                {matter.expectedCompletionDate ? format(new Date(matter.expectedCompletionDate), "d MMM yyyy") : "—"}
              </p>
            </div>
          </div>
          {matter.description && (
            <p className="text-sm text-gray-500 mt-4 border-t border-gray-50 pt-4">{matter.description}</p>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Progress Timeline */}
      {timelineSteps.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-doda-gold" /> Progress Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MatterTimeline steps={timelineSteps} />
          </CardContent>
        </Card>
      )}

      {/* Section 3: Milestones */}
      {(matter.milestones?.length ?? 0) > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Milestones &amp; Key Dates</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="text-left pb-2 font-medium">Milestone</th>
                  <th className="text-left pb-2 font-medium">Due Date</th>
                  <th className="text-left pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {matter.milestones!.map(ms => (
                  <tr key={ms._id} className="py-2">
                    <td className="py-2.5 font-medium text-doda-navy">{ms.title}</td>
                    <td className="py-2.5 text-gray-500">
                      {ms.dueDate ? format(new Date(ms.dueDate), "d MMM yyyy") : "—"}
                    </td>
                    <td className="py-2.5">{milestoneStatusBadge(ms.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Section 4: Documents */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-doda-gold" /> Documents for this Matter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {docs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No documents shared yet</p>
          ) : docs.map(d => (
            <div key={d._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-4 w-4 text-doda-gold shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-doda-navy truncate">{d.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{d.category.replace(/_/g, " ")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {d.status && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 capitalize">
                    {d.status}
                  </span>
                )}
                <Button size="sm" variant="ghost" onClick={() => downloadDoc(d._id, d.name)}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Section 5: Messages */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Matter Notes &amp; Messages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {messages.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No messages for this matter yet</p>
            ) : messages.map(msg => {
              const isMe = msg.senderId?._id === user?.id
              return (
                <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                    isMe
                      ? "bg-doda-navy text-white rounded-br-sm"
                      : "bg-gray-100 text-doda-navy rounded-bl-sm"
                  }`}>
                    {!isMe && (
                      <p className="text-xs font-semibold mb-1 text-doda-gold">
                        {msg.senderId ? `${msg.senderId.firstName} ${msg.senderId.lastName}` : "Doda Legal"}
                      </p>
                    )}
                    <p>{msg.body}</p>
                    <p className={`text-xs mt-1 ${isMe ? "text-white/50" : "text-gray-400"}`}>
                      {format(new Date(msg.createdAt), "d MMM, h:mm a")}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Reply input */}
          <div className="border-t border-gray-100 pt-3 flex gap-2">
            <Textarea
              placeholder="Write a message…"
              value={replyBody}
              onChange={e => setReplyBody(e.target.value)}
              rows={2}
              className="resize-none flex-1 text-sm"
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply() } }}
            />
            <Button onClick={sendReply} disabled={sending || !replyBody.trim()} className="bg-doda-navy text-white self-end">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Section 6: File Upload */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Upload a File</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400 mb-3">
            Your lawyer may request specific documents. Upload them here.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            variant="outline"
            className="border-dashed border-gray-300"
          >
            {uploading ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Uploading…</>
            ) : (
              <><Upload className="h-4 w-4 mr-2" />Choose File to Upload</>
            )}
          </Button>
          <p className="text-xs text-gray-400 mt-2">Accepted: PDF, Word, JPEG, PNG</p>
        </CardContent>
      </Card>
    </div>
  )
}
