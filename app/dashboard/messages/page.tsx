"use client"

import { useEffect, useState, useRef } from "react"
import {
  MessageSquare, Send, Paperclip, Loader2, Plus, X
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { format } from "date-fns"
import { toast } from "sonner"

interface Thread {
  _id: string
  subject?: string
  matterId?: { _id: string; title: string } | null
  lastMessage?: { body: string; createdAt: string }
  unread: number
  participants: { _id: string; firstName: string; lastName: string }[]
  updatedAt: string
}

interface Message {
  _id: string
  body: string
  senderId: { _id: string; firstName: string; lastName: string } | null
  createdAt: string
  attachments?: { name: string; url: string }[]
}

interface Matter {
  _id: string
  title: string
}

export default function MessagesPage() {
  const { user }              = useAuth()
  const [threads, setThreads] = useState<Thread[]>([])
  const [selected, setSelected] = useState<Thread | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [msgLoading, setMsgLoading] = useState(false)
  const [body, setBody]       = useState("")
  const [sending, setSending] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [matters, setMatters] = useState<Matter[]>([])
  const [newSubject, setNewSubject] = useState("")
  const [newMatter, setNewMatter]   = useState("")
  const [newBody, setNewBody]       = useState("")
  const [newCreating, setNewCreating] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const attachRef  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    Promise.allSettled([
      api.get("/api/messages/threads"),
      api.get("/api/matters?limit=50"),
    ]).then(([tRes, mRes]) => {
      if (tRes.status === "fulfilled") setThreads(tRes.value.data.threads ?? [])
      if (mRes.status === "fulfilled") setMatters(mRes.value.data.matters ?? [])
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function loadThread(thread: Thread) {
    setSelected(thread)
    setMsgLoading(true)
    try {
      const r = await api.get(`/api/messages?threadId=${thread._id}`)
      setMessages(r.data.messages ?? [])
    } finally {
      setMsgLoading(false)
    }
  }

  async function sendMessage() {
    if (!body.trim() || !selected) return
    setSending(true)
    try {
      const r = await api.post("/api/messages", { body, threadId: selected._id })
      setMessages(prev => [...prev, r.data])
      setBody("")
    } catch { toast.error("Failed to send") }
    finally { setSending(false) }
  }

  async function createNewThread() {
    if (!newBody.trim()) { toast.error("Please enter a message"); return }
    setNewCreating(true)
    try {
      const r = await api.post("/api/messages", {
        body: newBody,
        subject: newSubject || undefined,
        matterId: newMatter || undefined,
      })
      const t = r.data.thread ?? r.data
      setThreads(prev => [t, ...prev])
      setShowNew(false)
      setNewSubject(""); setNewMatter(""); setNewBody("")
      toast.success("Message sent")
    } catch { toast.error("Failed to send message") }
    finally { setNewCreating(false) }
  }

  return (
    <div className="space-y-4 max-w-5xl h-[calc(100vh-140px)] flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-doda-navy">Messages</h1>
          <p className="text-gray-500 text-sm">Communicate with your legal team</p>
        </div>
        <Button onClick={() => setShowNew(true)} className="bg-doda-navy text-white">
          <Plus className="h-4 w-4 mr-1.5" /> New Message
        </Button>
      </div>

      {/* Split panel */}
      <div className="flex gap-4 flex-1 overflow-hidden">
        {/* Thread list */}
        <div className="w-72 flex-shrink-0 overflow-y-auto border border-gray-100 rounded-xl bg-white">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : threads.length === 0 ? (
            <div className="p-6 text-center">
              <MessageSquare className="h-8 w-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No messages yet</p>
            </div>
          ) : threads.map(t => (
            <button
              key={t._id}
              onClick={() => loadThread(t)}
              className={`w-full p-4 text-left border-b border-gray-50 hover:bg-amber-50/40 transition-colors ${selected?._id === t._id ? "bg-amber-50 border-l-2 border-l-doda-gold" : ""}`}
            >
              <div className="flex justify-between items-start mb-1">
                <p className="text-sm font-semibold text-doda-navy truncate flex-1">
                  {t.subject || (t.matterId?.title) || "Message"}
                </p>
                {t.unread > 0 && (
                  <span className="ml-2 h-5 w-5 rounded-full bg-doda-gold text-white text-xs flex items-center justify-center shrink-0">
                    {t.unread}
                  </span>
                )}
              </div>
              {t.lastMessage && (
                <p className="text-xs text-gray-400 truncate">{t.lastMessage.body}</p>
              )}
              <p className="text-xs text-gray-300 mt-0.5">
                {t.updatedAt ? format(new Date(t.updatedAt), "d MMM") : ""}
              </p>
            </button>
          ))}
        </div>

        {/* Chat view */}
        <div className="flex-1 flex flex-col border border-gray-100 rounded-xl bg-white overflow-hidden">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 flex-col gap-2">
              <MessageSquare className="h-10 w-10 text-gray-200" />
              <p className="text-sm">Select a conversation</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <p className="font-semibold text-doda-navy text-sm">
                  {selected.subject || selected.matterId?.title || "Conversation"}
                </p>
                {selected.matterId && (
                  <p className="text-xs text-gray-400">{selected.matterId.title}</p>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {msgLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-doda-gold" />
                  </div>
                ) : messages.map(msg => {
                  const isMe = msg.senderId?._id === user?.id
                  return (
                    <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                        isMe ? "bg-doda-navy text-white rounded-br-sm" : "bg-gray-100 text-doda-navy rounded-bl-sm"
                      }`}>
                        {!isMe && (
                          <p className="text-xs font-semibold mb-1 text-doda-gold">
                            {msg.senderId ? `${msg.senderId.firstName} ${msg.senderId.lastName}` : "Doda Legal"}
                          </p>
                        )}
                        <p>{msg.body}</p>
                        {msg.attachments?.map(a => (
                          <a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer"
                            className={`text-xs flex items-center gap-1 mt-1 underline ${isMe ? "text-white/70" : "text-doda-gold"}`}>
                            <Paperclip className="h-3 w-3" /> {a.name}
                          </a>
                        ))}
                        <p className={`text-xs mt-1 ${isMe ? "text-white/50" : "text-gray-400"}`}>
                          {format(new Date(msg.createdAt), "h:mm a")}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Reply */}
              <div className="p-3 border-t border-gray-100 flex gap-2">
                <Textarea
                  placeholder="Write a message…"
                  rows={2}
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  className="flex-1 resize-none text-sm"
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                />
                <Button onClick={sendMessage} disabled={sending || !body.trim()} className="bg-doda-navy text-white self-end">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* New Message Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Subject (optional)</Label>
              <Input value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="e.g. Question about my contract…" className="mt-1" />
            </div>
            <div>
              <Label>Related Matter (optional)</Label>
              <Select value={newMatter} onValueChange={setNewMatter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a matter…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {matters.map(m => <SelectItem key={m._id} value={m._id}>{m.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Message *</Label>
              <Textarea
                value={newBody}
                onChange={e => setNewBody(e.target.value)}
                rows={4}
                placeholder="Type your message…"
                className="mt-1 resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button onClick={createNewThread} disabled={newCreating} className="bg-doda-navy text-white">
              {newCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
