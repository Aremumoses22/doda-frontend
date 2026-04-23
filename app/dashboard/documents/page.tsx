"use client"

import { useEffect, useState } from "react"
import {
  FileText, Download, Eye, Search, Filter, Loader2
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api"
import { format } from "date-fns"
import { toast } from "sonner"

interface Doc {
  _id: string
  title: string
  documentType: string
  status?: string
  matterId?: { _id: string; title: string; matterCode?: string } | null
  createdAt: string
  fileUrl?: string
}

const docTypeLabels: Record<string, string> = {
  contract: "Contract",
  agreement: "Agreement",
  affidavit: "Affidavit",
  brief: "Brief",
  correspondence: "Correspondence",
  court_document: "Court Document",
  invoice: "Invoice",
  receipt: "Receipt",
  other: "Other",
}

const statusColors: Record<string, string> = {
  for_review: "bg-amber-50 text-amber-700",
  awaiting_signature: "bg-blue-50 text-blue-700",
  final: "bg-green-50 text-green-700",
  draft: "bg-gray-100 text-gray-600",
}

export default function DocumentsPage() {
  const [docs, setDocs]         = useState<Doc[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState("")
  const [typeFilter, setType]   = useState("all")
  const [statusFilter, setStatus] = useState("all")

  useEffect(() => {
    api.get("/api/documents?visibleToClient=true&limit=100")
      .then(r => setDocs(r.data.documents ?? []))
      .finally(() => setLoading(false))
  }, [])

  async function handleDownload(docId: string, title: string) {
    try {
      const r = await api.get(`/api/documents/${docId}/download`)
      const a = document.createElement("a")
      a.href = r.data.url; a.target = "_blank"; a.download = title; a.click()
    } catch { toast.error("Download failed") }
  }

  async function handleView(docId: string) {
    try {
      const r = await api.get(`/api/documents/${docId}/download`)
      window.open(r.data.url, "_blank")
    } catch { toast.error("Could not open document") }
  }

  const filtered = docs.filter(d => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase())
    const matchType   = typeFilter === "all" || d.documentType === typeFilter
    const matchStatus = statusFilter === "all" || d.status === statusFilter
    return matchSearch && matchType && matchStatus
  })

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-doda-navy">My Documents</h1>
        <p className="text-gray-500 text-sm mt-1">All documents shared with you by Doda Legal</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search documents…"
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setType}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Document type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(docTypeLabels).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatus}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="for_review">For Review</SelectItem>
            <SelectItem value="awaiting_signature">Awaiting Signature</SelectItem>
            <SelectItem value="final">Final</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Doc list */}
      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No documents found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(d => (
            <Card key={d._id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-doda-gold" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-doda-navy truncate">{d.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400 capitalize">
                        {docTypeLabels[d.documentType] ?? d.documentType}
                      </span>
                      {d.matterId && (
                        <>
                          <span className="text-gray-200">•</span>
                          <span className="text-xs text-gray-400">
                            {d.matterId.title}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {d.status && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full hidden sm:inline-block capitalize ${statusColors[d.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {d.status.replace(/_/g, " ")}
                    </span>
                  )}
                  <span className="text-xs text-gray-400 hidden sm:block">
                    {format(new Date(d.createdAt), "d MMM yyyy")}
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => handleView(d._id)} title="View">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDownload(d._id, d.title)} title="Download">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
