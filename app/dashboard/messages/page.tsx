"use client"

import { useEffect, useState, useRef } from "react"
import {
  MessageSquare, Send, Loader2, Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { format } from "date-fns"
import { toast } from "sonner"

interface Message {
  _id: string
  body: string
  matterId?: { _id: string; title: string } | null
  senderId: { _id: string; firstName: string; lastName: string } | null
  createdAt: string
}

interface Matter {
  _id: string
  title: string
}

export default function MessagesPage() {
  const { user }              = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [matters, setMatters]   = useState<Matter[]>([])
  const [loading, setLoading]   = useState(true)
  const [body, setBody]         = useState("")
  const [sending, setSending]   = useState(false)
  const [showNew, setShowNew]   = useState(false)
  const [newMatter, setNewMatter] = useState("")
  const [newBody, setNewBody]   = useState("")
  const [newCreating, setNewCreating] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const loadMessages = async () => {
    try {
      const [msgRes, mRes] = await Promise.allSettled([
        api.get("/api/messages?limit=100"),
        api.get("/api/matters?limit=50"),
      ])
      if (msgRes.status === "fulfilled") setMessages(msgRes.value.data.messages ?? [])
      if (mRes.status === "fulfilled")   setMatters(mRes.value.data.matters ?? [])
    } catch {
      toast.error("Failed to load messages")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadMessages() }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function sendMessage() {
    if (!body.trim()) return
    setSending(true)
    try {
      const r = await api.post("/api/messages", { body })
      setMessages(prev => [...prev, r.data])
      setBody("")
    } catch { toast.error("Failed to send") }
    finally { setSending(false) }
  }

  async function createMessage() {
    if (!newBody.trim()) { toast.error("Please enter a message"); return }
    setNewCreating(true)
    try {
      const payload: Record<string, string> = { body: newBody }
      if (newMatter) payload.matterId = newMatter
      const r = await api.post("/api/messages", payload)
      setMessages(prev => [...prev, r.data])
      setShowNew(false)
      setNewMatter("")
      setNewBody("")
      toast.success("Message sent")
    } catch { toast.error("Failed to send message") }
    finally { setNewCreating(false) }
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-doda-navy">Messages</h1>
          <p className="text-gray-500 text-sm">Communicate with your legal team</p>
        </div>
        <Button onClick={() => setShowNew(true)} className="bg-doda-navy text-white">
          <Plus className="h-4 w-4 mr-1.5" /> New Message
        </Button>
      </div>

      {/* Conversation */}
      <div className="border border-gray-100 rounded-xl bg-white overflow-hidden" style={{ minHeight: "400px", maxHeight: "calc(100vh - 280px)", display: "flex", flexDirection: "column" }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full pt-16">
              <Loader2 className="h-6 w-6 animate-spin text-doda-gold" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full pt-16 text-center">
              <MessageSquare className="h-10 w-10 text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">No messages yet</p>
              <p className="text-xs text-gray-300 mt-1">Click "New Message" to start a conversation with your legal team</p>
            </div>
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
                  {msg.matterId && (
                    <p className={`text-xs mb-1 ${isMe ? "text-white/50" : "text-gray-400"}`}>
                      Re: {msg.matterId.title}
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

        {/* Reply */}
        <div className="border-t border-gray-100 p-3 flex gap-2">
          <Textarea
            placeholder="Write a reply…"
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
      </div>

      {/* New Message Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
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
            <Button onClick={createMessage} disabled={newCreating} className="bg-doda-navy text-white">
              {newCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
