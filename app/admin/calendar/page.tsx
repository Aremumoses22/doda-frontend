"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isToday, isSameDay } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"

interface CalendarEvent {
  _id: string
  title: string
  date: string
  type: "matter_deadline" | "hearing" | "meeting" | "reminder"
  clientName?: string
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents]           = useState<CalendarEvent[]>([])
  const [selected, setSelected]       = useState<Date | null>(null)

  useEffect(() => {
    // Fetch matters with due dates as calendar events
    const start = format(startOfMonth(currentDate), "yyyy-MM-dd")
    const end   = format(endOfMonth(currentDate), "yyyy-MM-dd")
    api.get(`/api/matters?limit=200&dueDateFrom=${start}&dueDateTo=${end}`)
      .then(r => {
        const matters = r.data.matters ?? []
        setEvents(matters
          .filter((m: { dueDate?: string }) => m.dueDate)
          .map((m: { _id: string; title: string; dueDate: string; clientId?: { companyName?: string; individualName?: string } | null }) => ({
            _id: m._id,
            title: m.title,
            date: m.dueDate,
            type: "matter_deadline" as const,
            clientName: m.clientId?.companyName || m.clientId?.individualName,
          }))
        )
      })
      .catch(() => {})
  }, [currentDate])

  const monthStart  = startOfMonth(currentDate)
  const monthEnd    = endOfMonth(currentDate)
  const calStart    = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd      = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days: Date[] = []
  let d = calStart
  while (d <= calEnd) { days.push(d); d = addDays(d, 1) }

  const eventsOnDay = (day: Date) => events.filter(e => isSameDay(new Date(e.date), day))
  const selectedEvents = selected ? eventsOnDay(selected) : []

  const TYPE_COLORS: Record<string, string> = {
    matter_deadline: "bg-red-100 text-red-700",
    hearing: "bg-blue-100 text-blue-700",
    meeting: "bg-green-100 text-green-700",
    reminder: "bg-amber-100 text-amber-700",
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-doda-navy">Calendar</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{format(currentDate, "MMMM yyyy")}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8"
                    onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>Today</Button>
                  <Button variant="outline" size="icon" className="h-8 w-8"
                    onClick={() => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                  <div key={day} className="bg-gray-50 text-center text-xs font-semibold text-gray-500 py-2">{day}</div>
                ))}
                {days.map((day, i) => {
                  const dayEvents = eventsOnDay(day)
                  const isSelected = selected && isSameDay(day, selected)
                  return (
                    <div key={i}
                      onClick={() => setSelected(isSameDay(day, selected ?? new Date(0)) ? null : day)}
                      className={`bg-white min-h-[72px] p-1.5 cursor-pointer hover:bg-gray-50 transition-colors ${
                        !isSameMonth(day, currentDate) ? "opacity-30" : ""} ${
                        isToday(day) ? "ring-2 ring-inset ring-doda-gold" : ""} ${
                        isSelected ? "bg-amber-50" : ""}`}>
                      <p className={`text-sm font-medium mb-1 ${isToday(day) ? "text-doda-gold" : "text-gray-700"}`}>
                        {format(day, "d")}
                      </p>
                      {dayEvents.slice(0, 2).map(e => (
                        <div key={e._id} className={`text-xs rounded px-1 py-0.5 mb-0.5 truncate ${TYPE_COLORS[e.type]}`}>
                          {e.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <p className="text-xs text-gray-400">+{dayEvents.length - 2} more</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {selected ? format(selected, "EEEE, d MMMM") : "Select a day"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selected ? (
                <p className="text-sm text-gray-400">Click a day to see events</p>
              ) : selectedEvents.length === 0 ? (
                <p className="text-sm text-gray-400">No events on this day</p>
              ) : (
                <div className="space-y-2">
                  {selectedEvents.map(e => (
                    <div key={e._id} className={`rounded-lg p-3 ${TYPE_COLORS[e.type]}`}>
                      <p className="text-sm font-medium">{e.title}</p>
                      {e.clientName && <p className="text-xs mt-0.5">{e.clientName}</p>}
                      <Badge variant="outline" className="mt-1 text-xs capitalize">
                        {e.type.replace("_", " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Upcoming Deadlines</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {events
                  .filter(e => new Date(e.date) >= new Date())
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .slice(0, 5)
                  .map(e => (
                    <div key={e._id} className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-doda-navy truncate w-36">{e.title}</p>
                        <p className="text-xs text-gray-500">{format(new Date(e.date), "d MMM yyyy")}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{format(new Date(e.date), "d MMM")}</Badge>
                    </div>
                  ))}
                {events.filter(e => new Date(e.date) >= new Date()).length === 0 && (
                  <p className="text-sm text-gray-400">No upcoming deadlines</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
