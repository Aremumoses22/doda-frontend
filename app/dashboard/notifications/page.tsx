"use client"

import { useEffect, useState } from "react"
import { Bell, CheckCheck, Loader2, Scale, FileText, MessageSquare, Receipt, RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { format } from "date-fns"
import { toast } from "sonner"
import Link from "next/link"

interface Notification {
  _id: string
  type: string
  title: string
  body: string
  isRead: boolean
  link?: string
  createdAt: string
}

const notifIcon = (type: string) => {
  if (type.includes("matter")) return <Scale className="h-4 w-4 text-doda-gold" />
  if (type.includes("document")) return <FileText className="h-4 w-4 text-blue-400" />
  if (type.includes("message")) return <MessageSquare className="h-4 w-4 text-purple-400" />
  if (type.includes("invoice") || type.includes("billing")) return <Receipt className="h-4 w-4 text-red-400" />
  if (type.includes("retainer")) return <RefreshCw className="h-4 w-4 text-amber-400" />
  return <Bell className="h-4 w-4 text-gray-400" />
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading]             = useState(true)
  const [markingAll, setMarkingAll]       = useState(false)

  useEffect(() => {
    api.get("/api/notifications?limit=50")
      .then(r => setNotifications(r.data.notifications ?? []))
      .finally(() => setLoading(false))
  }, [])

  async function markAllRead() {
    setMarkingAll(true)
    try {
      await api.patch("/api/notifications/read-all")
      setNotifications(n => n.map(x => ({ ...x, isRead: true })))
      toast.success("All marked as read")
    } catch { toast.error("Failed to mark all as read") }
    finally { setMarkingAll(false) }
  }

  async function markRead(id: string) {
    try {
      await api.patch(`/api/notifications/${id}/read`)
      setNotifications(n => n.map(x => x._id === id ? { ...x, isRead: true } : x))
    } catch {}
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-doda-navy">Notifications</h1>
          <p className="text-gray-500 text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={markingAll}>
            {markingAll ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCheck className="h-4 w-4 mr-2" />}
            Mark All Read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="h-10 w-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {notifications.map(n => {
            const content = (
              <div
                key={n._id}
                onClick={() => !n.isRead && markRead(n._id)}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-colors cursor-pointer
                  ${!n.isRead ? "bg-amber-50/60 border-doda-gold/20 hover:bg-amber-50" : "bg-white border-gray-100 hover:bg-gray-50"}`}
              >
                <div className={`mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${!n.isRead ? "bg-white shadow-sm" : "bg-gray-100"}`}>
                  {notifIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className={`text-sm font-semibold ${!n.isRead ? "text-doda-navy" : "text-gray-600"}`}>{n.title}</p>
                    <span className="text-xs text-gray-400 shrink-0 ml-2">
                      {format(new Date(n.createdAt), "d MMM")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{n.body}</p>
                </div>
                {!n.isRead && <div className="h-2 w-2 rounded-full bg-doda-gold mt-2 shrink-0" />}
              </div>
            )
            return n.link ? <Link href={n.link} key={n._id}>{content}</Link> : <div key={n._id}>{content}</div>
          })}
        </div>
      )}
    </div>
  )
}
