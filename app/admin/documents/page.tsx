"use client"

import { useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Upload, Download, Trash2, Search, FileText, Eye } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { format } from "date-fns"
import { toast } from "sonner"

interface Doc {
  _id: string
  title: string
  documentType: string
  fileSize?: number
  mimeType?: string
  status: string
  visibleToClient: boolean
  clientId?: { companyName?: string; individualName?: string } | null
  matterId?: { title: string; matterCode: string } | null
  uploadedBy?: { firstName: string; lastName: string } | null
  createdAt: string
}

const DOC_TYPES = ["all", "contract", "court_filing", "correspondence", "invoice", "retainer_agreement", "evidence", "memo", "other"]

export default function DocumentsPage() {
  const searchParams = useSearchParams()
  const [docs, setDocs]       = useState<Doc[]>([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState("")
  const [docType, setDocType] = useState("all")
  const [page, setPage]       = useState(1)
  const [uploadModal, setUploadModal] = useState(false)
  const [uploadForm, setUploadForm]   = useState({ title: "", documentType: "contract", clientId: "", matterId: "", visibleToClient: false })
  const [uploadFile, setUploadFile]   = useState<File | null>(null)
  const [uploading, setUploading]     = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const PER_PAGE = 20

  const clientId = searchParams.get("clientId") ?? ""
  const matterId = searchParams.get("matterId") ?? ""

  const fetchDocs = () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: String(PER_PAGE) })
    if (search) params.set("search", search)
    if (docType !== "all") params.set("documentType", docType)
    if (clientId) params.set("clientId", clientId)
    if (matterId) params.set("matterId", matterId)
    api.get(`/api/documents?${params}`)
      .then(r => { setDocs(r.data.documents ?? []); setTotal(r.data.total ?? 0) })
      .catch(() => toast.error("Failed to load documents"))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchDocs() }, [page, search, docType])

  const download = async (doc: Doc) => {
    try {
      const res = await api.get(`/api/documents/${doc._id}/download`)
      window.open(res.data.url, "_blank")
    } catch { toast.error("Failed to get download link") }
  }

  const deleteDoc = async (id: string) => {
    if (!confirm("Delete this document? This cannot be undone.")) return
    try {
      await api.delete(`/api/documents/${id}`)
      setDocs(prev => prev.filter(d => d._id !== id))
      setTotal(prev => prev - 1)
      toast.success("Document deleted")
    } catch { toast.error("Delete failed") }
  }

  const uploadDocument = async () => {
    if (!uploadFile || !uploadForm.title) {
      toast.error("Please provide a title and select a file")
      return
    }
    setUploading(true)
    try {
      const form = new FormData()
      form.append("file", uploadFile)
      form.append("title", uploadForm.title)
      form.append("documentType", uploadForm.documentType)
      form.append("visibleToClient", String(uploadForm.visibleToClient))
      if (uploadForm.clientId) form.append("clientId", uploadForm.clientId)
      if (uploadForm.matterId) form.append("matterId", uploadForm.matterId)
      const res = await api.post("/api/documents", form, { headers: { "Content-Type": "multipart/form-data" } })
      setDocs(prev => [res.data, ...prev])
      setTotal(prev => prev + 1)
      setUploadModal(false)
      setUploadFile(null)
      setUploadForm({ title: "", documentType: "contract", clientId: "", matterId: "", visibleToClient: false })
      toast.success("Document uploaded")
    } catch { toast.error("Upload failed") }
    finally { setUploading(false) }
  }

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "—"
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-doda-navy">Documents</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} document{total !== 1 ? "s" : ""}</p>
        </div>
        <Button variant="navy" onClick={() => setUploadModal(true)}>
          <Upload className="h-4 w-4 mr-1" /> Upload Document
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input className="pl-9" placeholder="Search documents..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <Select value={docType} onValueChange={v => { setDocType(v); setPage(1) }}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            {DOC_TYPES.map(t => (
              <SelectItem key={t} value={t} className="capitalize">{t === "all" ? "All Types" : t.replace("_", " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Matter</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Visible to Client</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>By</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [1,2,3,4].map(i => (
                  <TableRow key={i}>{[1,2,3,4,5,6,7,8,9].map(j => (
                    <TableCell key={j}><div className="h-4 bg-gray-100 rounded animate-pulse" /></TableCell>
                  ))}</TableRow>
                ))
              ) : docs.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center text-gray-400 py-10">No documents found</TableCell></TableRow>
              ) : docs.map(d => (
                <TableRow key={d._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400 shrink-0" />
                      <span className="font-medium text-sm text-doda-navy">{d.title}</span>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="capitalize text-xs">{d.documentType.replace("_", " ")}</Badge></TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {d.clientId?.companyName || d.clientId?.individualName || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {d.matterId ? <span>{d.matterId.matterCode}</span> : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">{formatBytes(d.fileSize)}</TableCell>
                  <TableCell>
                    <Badge variant={d.visibleToClient ? "success" : "secondary"} className="text-xs">
                      {d.visibleToClient ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {format(new Date(d.createdAt), "d MMM yyyy")}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {d.uploadedBy ? `${d.uploadedBy.firstName} ${d.uploadedBy.lastName}` : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => download(d)}>
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => deleteDoc(d._id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {total > PER_PAGE && (
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>Page {page} of {Math.ceil(total / PER_PAGE)}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / PER_PAGE)}>Next</Button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <Dialog open={uploadModal} onOpenChange={setUploadModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Document Title *</Label>
              <Input value={uploadForm.title} onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Board Resolution 2024" />
            </div>
            <div className="grid gap-2">
              <Label>Document Type</Label>
              <Select value={uploadForm.documentType} onValueChange={v => setUploadForm(f => ({ ...f, documentType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.filter(t => t !== "all").map(t => (
                    <SelectItem key={t} value={t} className="capitalize">{t.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>File *</Label>
              <div
                className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-doda-gold transition-colors"
                onClick={() => fileRef.current?.click()}>
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  {uploadFile ? uploadFile.name : "Click to select a file"}
                </p>
                {uploadFile && <p className="text-xs text-gray-400 mt-1">{formatBytes(uploadFile.size)}</p>}
              </div>
              <input ref={fileRef} type="file" className="hidden"
                onChange={e => setUploadFile(e.target.files?.[0] ?? null)} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="visibleToClient" checked={uploadForm.visibleToClient}
                onChange={e => setUploadForm(f => ({ ...f, visibleToClient: e.target.checked }))} />
              <Label htmlFor="visibleToClient" className="font-normal text-sm cursor-pointer">Visible to client portal</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadModal(false)}>Cancel</Button>
            <Button variant="navy" onClick={uploadDocument} disabled={uploading}>
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
