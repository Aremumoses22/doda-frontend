"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, CheckCircle2, Circle, Clock, Trash2, Edit2, ChevronDown, ChevronUp } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { api } from "@/lib/api"
import { format } from "date-fns"
import { toast } from "sonner"

interface Task {
  _id: string
  title: string
  description?: string
  assignedToId?: { _id: string; firstName: string; lastName: string } | null
  dueDate?: string
  priority: string
  status: string
}

interface Matter {
  _id: string
  matterCode: string
  title: string
  description?: string
  practiceArea: string
  status: string
  priority: string
  clientId: { _id: string; companyName?: string; individualName?: string } | null
  assignedToId: { _id: string; firstName: string; lastName: string; email: string } | null
  supervisorId: { _id: string; firstName: string; lastName: string } | null
  dueDate?: string
  startDate?: string
  createdAt: string
  tasks: Task[]
}

interface TeamMember { _id: string; firstName: string; lastName: string }

const STATUS_COLORS: Record<string, "success" | "warning" | "secondary" | "destructive" | "info" | "outline" | "gold"> = {
  active: "success", on_hold: "warning", closed: "secondary", open: "info", draft: "secondary",
  done: "success", in_progress: "info", pending: "warning", cancelled: "destructive",
}

const STATUSES = ["draft", "open", "active", "on_hold", "closed"]
const PRIORITIES = ["low", "medium", "high", "urgent"]

export default function MatterDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [matter, setMatter]   = useState<Matter | null>(null)
  const [team, setTeam]       = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  // Inline status edit
  const [editingStatus, setEditingStatus]   = useState(false)
  const [newStatus, setNewStatus]           = useState("")

  // Task modal
  const [taskModal, setTaskModal] = useState(false)
  const [taskForm, setTaskForm]   = useState({ title: "", description: "", assignedToId: "", dueDate: "", priority: "medium" })
  const [savingTask, setSavingTask] = useState(false)

  // Collapsed task sections
  const [showDone, setShowDone] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get(`/api/matters/${id}`),
      api.get("/api/team?limit=50"),
    ]).then(([mRes, tRes]) => {
      setMatter(mRes.data)
      setNewStatus(mRes.data.status)
      setTeam(tRes.data.team ?? [])
    }).catch(() => toast.error("Failed to load matter"))
    .finally(() => setLoading(false))
  }, [id])

  const updateStatus = async () => {
    if (!matter) return
    try {
      await api.patch(`/api/matters/${id}`, { status: newStatus })
      setMatter(prev => prev ? { ...prev, status: newStatus } : prev)
      setEditingStatus(false)
      toast.success("Status updated")
    } catch { toast.error("Update failed") }
  }

  const addTask = async () => {
    if (!taskForm.title.trim()) return
    setSavingTask(true)
    try {
      const res = await api.post(`/api/matters/${id}/tasks`, {
        title: taskForm.title,
        description: taskForm.description || undefined,
        assignedToId: taskForm.assignedToId || undefined,
        dueDate: taskForm.dueDate || undefined,
        priority: taskForm.priority,
      })
      setMatter(prev => prev ? { ...prev, tasks: [...prev.tasks, res.data] } : prev)
      setTaskModal(false)
      setTaskForm({ title: "", description: "", assignedToId: "", dueDate: "", priority: "medium" })
      toast.success("Task added")
    } catch { toast.error("Failed to add task") }
    finally { setSavingTask(false) }
  }

  const toggleTask = async (task: Task) => {
    const next = task.status === "done" ? "pending" : "done"
    try {
      await api.patch(`/api/matters/${id}/tasks/${task._id}`, { status: next })
      setMatter(prev => prev ? {
        ...prev,
        tasks: prev.tasks.map(t => t._id === task._id ? { ...t, status: next } : t),
      } : prev)
    } catch { toast.error("Failed to update task") }
  }

  const deleteTask = async (taskId: string) => {
    if (!confirm("Delete this task?")) return
    try {
      await api.delete(`/api/matters/${id}/tasks/${taskId}`)
      setMatter(prev => prev ? { ...prev, tasks: prev.tasks.filter(t => t._id !== taskId) } : prev)
      toast.success("Task deleted")
    } catch { toast.error("Delete failed") }
  }

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)}</div>
  if (!matter) return <div className="text-center py-20 text-gray-500">Matter not found</div>

  const clientName = matter.clientId?.companyName || matter.clientId?.individualName || "Unknown"
  const activeTasks = matter.tasks.filter(t => t.status !== "done")
  const doneTasks   = matter.tasks.filter(t => t.status === "done")
  const progress    = matter.tasks.length > 0 ? Math.round((doneTasks.length / matter.tasks.length) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/admin/matters" className="flex items-center gap-1 text-sm text-gray-500 hover:text-doda-navy mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to Matters
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-doda-navy">{matter.title}</h1>
            <Badge variant={STATUS_COLORS[matter.status] ?? "secondary"} className="capitalize">
              {matter.status.replace("_", " ")}
            </Badge>
            <Badge variant={matter.priority === "high" || matter.priority === "urgent" ? "destructive" : "outline"} className="capitalize">
              {matter.priority}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-0.5 font-mono">{matter.matterCode}</p>
        </div>
        <Button variant="navy" size="sm" onClick={() => setTaskModal(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Task
        </Button>
      </div>

      {/* Progress bar */}
      {matter.tasks.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-doda-navy">Task Progress</span>
            <span className="text-gray-500">{doneTasks.length}/{matter.tasks.length} done ({progress}%)</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-doda-gold rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({matter.tasks.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {matter.description && (
                <Card>
                  <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                  <CardContent><p className="text-sm text-gray-700 leading-relaxed">{matter.description}</p></CardContent>
                </Card>
              )}
              <Card>
                <CardHeader><CardTitle>Matter Details</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <InfoRow label="Client" value={clientName} />
                  <InfoRow label="Practice Area" value={matter.practiceArea.replace("_", " ")} />
                  <InfoRow label="Opened" value={format(new Date(matter.startDate ?? matter.createdAt), "d MMM yyyy")} />
                  {matter.dueDate && <InfoRow label="Due Date" value={format(new Date(matter.dueDate), "d MMM yyyy")} />}
                  {matter.assignedToId && <InfoRow label="Assigned Lawyer" value={`${matter.assignedToId.firstName} ${matter.assignedToId.lastName}`} />}
                  {matter.supervisorId && <InfoRow label="Supervisor" value={`${matter.supervisorId.firstName} ${matter.supervisorId.lastName}`} />}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Status</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {editingStatus ? (
                    <div className="space-y-2">
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUSES.map(s => (
                            <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2">
                        <Button size="sm" variant="navy" onClick={updateStatus} className="flex-1">Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingStatus(false)} className="flex-1">Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <Badge variant={STATUS_COLORS[matter.status] ?? "secondary"} className="capitalize">
                        {matter.status.replace("_", " ")}
                      </Badge>
                      <Button size="sm" variant="ghost" onClick={() => setEditingStatus(true)}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 space-y-2">
                  <Link href={`/admin/clients/${matter.clientId?._id}`}>
                    <Button variant="outline" size="sm" className="w-full">View Client Profile</Button>
                  </Link>
                  <Link href={`/admin/documents?matterId=${id}`}>
                    <Button variant="outline" size="sm" className="w-full">View Documents</Button>
                  </Link>
                  <Link href={`/admin/billing/new?matterId=${id}&clientId=${matter.clientId?._id}`}>
                    <Button variant="outline" size="sm" className="w-full">Create Invoice</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tasks */}
        <TabsContent value="tasks">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-doda-navy">Active Tasks ({activeTasks.length})</h3>
              <Button variant="navy" size="sm" onClick={() => setTaskModal(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add Task
              </Button>
            </div>

            {activeTasks.length === 0 ? (
              <Card><CardContent className="text-center py-8 text-gray-400">No active tasks</CardContent></Card>
            ) : activeTasks.map(task => (
              <TaskCard key={task._id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
            ))}

            {doneTasks.length > 0 && (
              <div>
                <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-doda-navy mb-2"
                  onClick={() => setShowDone(!showDone)}>
                  {showDone ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  Completed Tasks ({doneTasks.length})
                </button>
                {showDone && doneTasks.map(task => (
                  <TaskCard key={task._id} task={task} onToggle={toggleTask} onDelete={deleteTask} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Documents */}
        <TabsContent value="documents">
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              <p className="text-sm mb-3">View all documents linked to this matter.</p>
              <Link href={`/admin/documents?matterId=${id}`}>
                <Button variant="outline">Open Document Library</Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing */}
        <TabsContent value="billing">
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              <p className="text-sm mb-3">Create and manage invoices for this matter.</p>
              <Link href={`/admin/billing?matterId=${id}`}>
                <Button variant="outline">View Invoices</Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Task Modal */}
      <Dialog open={taskModal} onOpenChange={setTaskModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Task</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Task Title *</Label>
              <Input value={taskForm.title} onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Draft shareholder agreement" />
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Input value={taskForm.description} onChange={e => setTaskForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Optional notes" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Assign To</Label>
                <Select onValueChange={v => setTaskForm(f => ({ ...f, assignedToId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select lawyer" /></SelectTrigger>
                  <SelectContent>
                    {team.map(m => (
                      <SelectItem key={m._id} value={m._id}>{m.firstName} {m.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Priority</Label>
                <Select value={taskForm.priority} onValueChange={v => setTaskForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map(p => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Due Date</Label>
              <Input type="date" value={taskForm.dueDate} onChange={e => setTaskForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTaskModal(false)}>Cancel</Button>
            <Button variant="navy" onClick={addTask} disabled={savingTask}>
              {savingTask ? "Adding..." : "Add Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TaskCard({ task, onToggle, onDelete }: { task: Task; onToggle: (t: Task) => void; onDelete: (id: string) => void }) {
  const done = task.status === "done"
  const PRIORITY_COLORS: Record<string, "destructive" | "warning" | "secondary" | "outline"> = {
    high: "destructive", urgent: "destructive", medium: "warning", low: "secondary",
  }
  return (
    <Card className={`mb-2 ${done ? "opacity-60" : ""}`}>
      <CardContent className="p-4 flex items-start gap-3">
        <button onClick={() => onToggle(task)} className="mt-0.5 shrink-0 text-gray-400 hover:text-doda-gold">
          {done ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Circle className="h-5 w-5" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm ${done ? "line-through text-gray-400" : "text-doda-navy"}`}>{task.title}</p>
          {task.description && <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>}
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant={PRIORITY_COLORS[task.priority] ?? "outline"} className="capitalize text-xs">{task.priority}</Badge>
            {task.assignedToId && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="h-3 w-3" /> {task.assignedToId.firstName} {task.assignedToId.lastName}
              </span>
            )}
            {task.dueDate && (
              <span className="text-xs text-gray-500">Due {format(new Date(task.dueDate), "d MMM")}</span>
            )}
          </div>
        </div>
        <button onClick={() => onDelete(task._id)} className="text-gray-300 hover:text-red-500 transition-colors">
          <Trash2 className="h-4 w-4" />
        </button>
      </CardContent>
    </Card>
  )
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs text-gray-400 font-medium uppercase">{label}</p>
      <p className="font-medium text-gray-700 capitalize">{value}</p>
    </div>
  )
}
