"use client"

import { useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Send, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { format } from "date-fns"
import { toast } from "sonner"

interface Message {
  _id: string
  subject?: string
  body: string
  senderId: { _id: string; firstName: string; lastName: string } | null
  recipientId: { _id: string; firstName: string; lastName: string } | null
  isRead: boolean
  createdAt: string
}

interface Thread {
  clientId: string
  clientName: string
  messages: Message[]
  unread: number
}

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const defaultClientId = searchParams.get("clientId") ?? ""

  const [threads, setThreads]           = useState<Thread[]>([])
  const [selected, setSelected]         = useState<Thread | null>(null)
  const [messages, setMessages]         = useState<Message[]>([])
  const [search, setSearch]             = useState("")
  const [newMsg, setNewMsg]             = useState("")
  const [loading, setLoading]           = useState(true)
  const [sending, setSending]           = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.get("/api/messages?limit=200")
      .then(r => {
        const msgs: Message[] = r.data.messages ?? []
        // Group by client
        const map = new Map<string, Thread>()
        msgs.forEach(m => {
          // Determine client side: if sender is non-staff, they're the client
          const clientSide = m.senderId
          if (!clientSide) return
          const clientId = clientSide._id
          const clientName = `${clientSide.firstName} ${clientSide.lastName}`
          if (!map.has(clientId)) {
            map.set(clientId, { clientId, clientName, messages: [], unread: 0 })
          }
          const thread = map.get(clientId)!
          thread.messages.push(m)
          if (!m.isRead) thread.unread++
        })
        setThreads(Array.from(map.values()))
        // Auto-select if clientId in query param
        if (defaultClientId) {
          const t = map.get(defaultClientId)
          if (t) openThread(t)
        }
      })
      .catch(() => toast.error("Failed to load messages"))
      .finally(() => setLoading(false))
  }, [])

  const openThread = async (thread: Thread) => {
    setSelected(thread)
    try {
      const res = await api.get(`/api/messages/client/${thread.clientId}`)
      setMessages(res.data.messages ?? [])
      // Mark unread as read
      res.data.messages?.filter((m: Message) => !m.isRead).forEach((m: Message) => {
        api.patch(`/api/messages/${m._id}/read`).catch(() => {})
      })
    } catch { toast.error("Failed to load thread") }
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
  }

  const sendMessage = async () => {
    if (!selected || !newMsg.trim()) return
    setSending(true)
    try {
      const res = await api.post("/api/messages", {
        recipientId: selected.clientId,
        body: newMsg,
      })
      setMessages(prev => [...prev, res.data])
      setNewMsg("")
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
    } catch { toast.error("Failed to send") }
    finally { setSending(false) }
  }

  const filteredThreads = threads.filter(t =>
    t.clientName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-doda-navy">Messages</h1>
        <p className="text-sm text-gray-500 mt-0.5">Client communications centre</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ height: "calc(100vh - 220px)" }}>
        {/* Thread List */}
        <Card className="flex flex-col overflow-hidden">
          <CardContent className="p-0 flex flex-col h-full">
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input className="pl-9 h-8 text-sm" placeholder="Search clients..." value={search}
                  onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
                </div>
              ) : filteredThreads.length === 0 ? (
                <p className="text-sm text-gray-400 text-center p-6">No threads</p>
              ) : filteredThreads.map(t => (
                <button key={t.clientId} onClick={() => openThread(t)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${selected?.clientId === t.clientId ? "bg-amber-50 border-l-2 border-l-doda-gold" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-doda-navy">{t.clientName}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate w-40">
                        {t.messages[t.messages.length - 1]?.body ?? ""}
                      </p>
                    </div>
                    {t.unread > 0 && (
                      <Badge variant="gold" className="text-xs">{t.unread}</Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Message Thread */}
        <Card className="lg:col-span-2 flex flex-col overflow-hidden">
          {!selected ? (
            <CardContent className="flex-1 flex items-center justify-center">
              <p className="text-gray-400 text-sm">Select a conversation</p>
            </CardContent>
          ) : (
            <>
              <CardHeader className="border-b border-gray-100 py-3 px-4">
                <CardTitle className="text-base">{selected.clientName}</CardTitle>
              </CardHeader>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(m => {
                  const isMe = m.senderId?._id !== selected.clientId
                  return (
                    <div key={m._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-2.5 text-sm ${isMe ? "bg-doda-navy text-white" : "bg-gray-100 text-gray-800"}`}>
                        <p>{m.body}</p>
                        <p className={`text-xs mt-1 ${isMe ? "text-white/60" : "text-gray-400"}`}>
                          {format(new Date(m.createdAt), "h:mm a · d MMM")}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>
              <div className="border-t border-gray-100 p-3 flex gap-2">
                <Input
                  value={newMsg}
                  onChange={e => setNewMsg(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                  className="flex-1" />
                <Button variant="navy" size="icon" onClick={sendMessage} disabled={sending}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
