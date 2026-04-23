"use client"

import { useEffect, useState } from "react"
import { CalendarPlus, Loader2, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { format, addDays, isBefore, startOfToday } from "date-fns"

interface Matter {
  _id: string
  title: string
}

const SESSION_TYPES = [
  "Initial Consultation",
  "Follow-up Session",
  "Retainer Check-in",
  "Strategy Session",
  "Document Review Meeting",
  "Court Preparation",
]

const TIME_SLOTS = [
  "9:00 AM", "9:30 AM",
  "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM",
  "12:00 PM",
  "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM",
  "4:00 PM", "4:30 PM",
]

export default function BookPage() {
  const [matters, setMatters]       = useState<Matter[]>([])
  const [sessionType, setSessionType] = useState("")
  const [matterId, setMatterId]     = useState("")
  const [description, setDescription] = useState("")
  const [preferredDate, setPreferredDate] = useState("")
  const [preferredTime, setPreferredTime] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone]             = useState(false)

  useEffect(() => {
    api.get("/api/matters?limit=50").then(r => setMatters(r.data.matters ?? []))
  }, [])

  const today = format(new Date(), "yyyy-MM-dd")
  const maxDate = format(addDays(new Date(), 60), "yyyy-MM-dd")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!sessionType) { toast.error("Please select a session type"); return }
    if (!preferredDate) { toast.error("Please select a preferred date"); return }
    if (!preferredTime) { toast.error("Please select a preferred time"); return }

    setSubmitting(true)
    try {
      const body = [
        `📅 Session Booking Request`,
        ``,
        `Session Type: ${sessionType}`,
        `Preferred Date: ${format(new Date(preferredDate), "EEEE, d MMMM yyyy")}`,
        `Preferred Time: ${preferredTime}`,
        matterId ? `Related Matter: ${matters.find(m => m._id === matterId)?.title ?? matterId}` : "",
        description ? `\nAdditional Notes:\n${description}` : "",
      ].filter(Boolean).join("\n")

      await api.post("/api/messages", {
        body,
        matterId: matterId || undefined,
        subject: `Session Booking: ${sessionType} — ${format(new Date(preferredDate), "d MMM yyyy")}`,
      })
      setDone(true)
    } catch { toast.error("Booking request failed. Please try again.") }
    finally { setSubmitting(false) }
  }

  if (done) return (
    <div className="max-w-md mx-auto text-center py-20">
      <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="h-8 w-8 text-green-500" />
      </div>
      <h2 className="text-xl font-bold text-doda-navy">Booking Request Sent!</h2>
      <p className="text-gray-500 text-sm mt-2">
        Your session booking request has been sent to the Doda Legal team. We&apos;ll confirm your appointment shortly.
      </p>
      <Button className="mt-6 bg-doda-navy text-white" onClick={() => {
        setDone(false); setSessionType(""); setMatterId(""); setDescription(""); setPreferredDate(""); setPreferredTime("")
      }}>
        Book Another Session
      </Button>
    </div>
  )

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-doda-navy">Book a Session</h1>
        <p className="text-gray-500 text-sm mt-1">Request a consultation or meeting with your legal team</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Session type */}
            <div>
              <Label>Session Type *</Label>
              <Select value={sessionType} onValueChange={setSessionType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select session type…" />
                </SelectTrigger>
                <SelectContent>
                  {SESSION_TYPES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Related matter */}
            <div>
              <Label>Related Matter <span className="text-gray-400">(optional)</span></Label>
              <Select value={matterId} onValueChange={setMatterId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a matter…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None / General enquiry</SelectItem>
                  {matters.map(m => <SelectItem key={m._id} value={m._id}>{m.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div>
              <Label>Brief Description <span className="text-gray-400">(optional)</span></Label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="What would you like to discuss? Any specific questions or documents to review?"
                className="mt-1 resize-none text-sm"
              />
            </div>

            {/* Date & time row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Preferred Date *</Label>
                <Input
                  type="date"
                  min={today}
                  max={maxDate}
                  value={preferredDate}
                  onChange={e => setPreferredDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Preferred Time *</Label>
                <Select value={preferredTime} onValueChange={setPreferredTime}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select time…" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="text-xs text-gray-400">
              * All sessions are subject to availability. The Doda Legal team will confirm or propose an alternative time.
            </p>

            <Button type="submit" disabled={submitting} className="w-full bg-doda-navy text-white">
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Submitting…</>
              ) : (
                <><CalendarPlus className="h-4 w-4 mr-2" />Send Booking Request</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
