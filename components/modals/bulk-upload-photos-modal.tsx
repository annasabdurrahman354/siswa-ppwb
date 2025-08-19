"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import imageCompression from "browser-image-compression"
import { Loader2 } from "lucide-react"

interface BulkUploadPhotosModalProps {
  isOpen: boolean
  onClose: () => void
}

export function BulkUploadPhotosModal({ isOpen, onClose }: BulkUploadPhotosModalProps) {
  const { toast } = useToast()
  const [uploadBasedOn, setUploadBasedOn] = useState<"nispn" | "nama_lengkap">("nispn")
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [successFiles, setSuccessFiles] = useState<string[]>([])
  const [errorFiles, setErrorFiles] = useState<{ name: string; error: string }[]>([])

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleSelectFolder = () => {
    fileInputRef.current?.click()
  }

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fl = e.target.files
    if (!fl) return
    const arr = Array.from(fl).filter(f => f.type.startsWith("image/") || /\.(jpe?g|png|gif|webp|bmp)$/i.test(f.name))
    setFiles(arr)
  }

  const resetState = () => {
    setFiles([])
    setSuccessFiles([])
    setErrorFiles([])
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({ title: "Tidak ada file", description: "Pilih folder yang berisi gambar terlebih dahulu.", variant: "destructive" })
      return
    }

    setUploading(true)
    setSuccessFiles([])
    setErrorFiles([])

    for (const file of files) {
      try {
        const baseName = file.name.replace(/\.[^/.]+$/, "")

        const compressedFile = await imageCompression(file, {
          maxSizeMB: 0.4,
          maxWidthOrHeight: 800,
          useWebWorker: true,
        })

        const formData = new FormData()
        if (uploadBasedOn === "nispn") {
          formData.append("nispn", baseName)
        } else {
          formData.append("nama_lengkap", baseName)
        }
        formData.append("photo", compressedFile, file.name)

        const resp = await fetch("https://tes.ppwb.my.id/api/siswa-ppwb/update-photo", {
          method: "POST",
          body: formData,
        })

        if (!resp.ok) {
          let msg = `${resp.status} ${resp.statusText}`
          try {
            const j = await resp.json()
            if (j && (j.message || j.error)) msg = j.message || j.error
          } catch (_) {}
          setErrorFiles(prev => [...prev, { name: file.name, error: msg }])
        } else {
          setSuccessFiles(prev => [...prev, file.name])
        }

      } catch (err: any) {
        setErrorFiles(prev => [...prev, { name: file.name, error: err?.message || String(err) }])
      }
    }

    setUploading(false)

    if (errorFiles.length === 0) {
      toast({ title: "Sukses", description: "Semua file berhasil diupload." })
      resetState()
      onClose()
    } else {
      setReportOpen(true)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Upload Foto Massal</DialogTitle>
            <DialogDescription>
              Upload banyak foto sekaligus. Nama file akan digunakan sebagai NISPN atau Nama tergantung pilihan.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Label>Upload Berdasarkan</Label>
              <Select value={uploadBasedOn} onValueChange={(val: any) => setUploadBasedOn(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nispn">NISPN</SelectItem>
                  <SelectItem value="nama_lengkap">Nama Lengkap</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Pilih Folder Foto</Label>
              <div className="flex gap-2 items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFilesChange}
                  className="hidden"
                  {...({ webkitdirectory: true, directory: true } as any)}
                />
                <Button onClick={handleSelectFolder} variant="outline">Pilih Folder Foto</Button>
                <div className="text-sm text-primary-600">
                  {files.length} file dipilih
                </div>
              </div>
              <div className="text-xs text-muted-foreground">Pastikan nama file berisi NISPN atau Nama sesuai format yang Anda pilih.</div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { resetState(); onClose() }} disabled={uploading}>Batal</Button>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Unggah
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reportOpen} onOpenChange={() => setReportOpen(false)}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Laporan Upload</DialogTitle>
            <DialogDescription>
              Ringkasan hasil upload. Periksa daftar file sukses dan yang gagal.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <h4 className="font-semibold">Berhasil ({successFiles.length})</h4>
              <ul className="list-disc list-inside max-h-40 overflow-auto">
                {successFiles.map((f) => (
                  <li key={f} className="text-sm">{f}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-destructive">Gagal ({errorFiles.length})</h4>
              <ul className="list-disc list-inside max-h-40 overflow-auto">
                {errorFiles.map((e) => (
                  <li key={e.name} className="text-sm">{e.name} - {e.error}</li>
                ))}
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setReportOpen(false); onClose(); resetState(); }}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
