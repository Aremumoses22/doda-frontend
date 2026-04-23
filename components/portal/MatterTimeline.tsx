"use client"

import { CheckCircle2, Circle, AlertTriangle, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type TimelineStepStatus = "completed" | "in_progress" | "pending" | "action_required"

export type TimelineStep = {
  id: string
  title: string
  status: TimelineStepStatus
  completedAt?: string | Date
  note?: string
  onAction?: () => void
}

function StepIcon({ status }: { status: TimelineStepStatus }) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0" />
    case "in_progress":
      return <Loader2 className="h-6 w-6 text-doda-gold shrink-0 animate-spin" />
    case "action_required":
      return (
        <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center shrink-0">
          <AlertTriangle className="h-3.5 w-3.5 text-white" />
        </div>
      )
    default:
      return <Circle className="h-6 w-6 text-gray-300 shrink-0" />
  }
}

function stepLabel(status: TimelineStepStatus): string {
  switch (status) {
    case "completed":      return "Completed"
    case "in_progress":    return "In Progress"
    case "action_required":return "Action Required"
    default:               return "Not Started"
  }
}

export function MatterTimeline({ steps }: { steps: TimelineStep[] }) {
  if (!steps.length) {
    return (
      <div className="text-center py-10 text-gray-400 text-sm">
        No timeline steps available yet.
      </div>
    )
  }

  return (
    <div className="relative">
      {steps.map((step, index) => (
        <div key={step.id} className="flex gap-4 pb-8 last:pb-0">
          {/* Indicator + connecting line */}
          <div className="flex flex-col items-center">
            <StepIcon status={step.status} />
            {index < steps.length - 1 && (
              <div className={cn(
                "w-px flex-1 mt-2 min-h-[24px]",
                step.status === "completed" ? "bg-green-200" : "bg-gray-200"
              )} />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pt-0.5 pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={cn(
                "font-semibold text-sm",
                step.status === "completed"      ? "text-gray-700" :
                step.status === "in_progress"    ? "text-doda-navy" :
                step.status === "action_required" ? "text-red-700" :
                "text-gray-400"
              )}>
                {step.title}
              </p>
              <span className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                step.status === "completed"       ? "bg-green-100 text-green-700" :
                step.status === "in_progress"     ? "bg-amber-100 text-amber-700" :
                step.status === "action_required" ? "bg-red-100 text-red-700" :
                "bg-gray-100 text-gray-500"
              )}>
                {stepLabel(step.status)}
              </span>
            </div>

            {step.completedAt && (
              <p className="text-xs text-gray-400 mt-0.5">
                {format(new Date(step.completedAt), "MMM d, yyyy")}
              </p>
            )}

            {step.note && (
              <p className="text-sm text-gray-600 mt-1 leading-relaxed">{step.note}</p>
            )}

            {step.status === "action_required" && (
              <Button
                size="sm"
                className="mt-2 bg-red-600 hover:bg-red-700 text-white"
                onClick={step.onAction}>
                ⚠️ Action Required — Take Action
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
