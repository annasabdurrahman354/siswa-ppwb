"use client"

import type React from "react"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Camera, Upload, Save, X } from "lucide-react"
import Webcam from "react-webcam"
import ReactCrop, { type PixelCrop } from "react-image-crop"
import imageCompression from "browser-image-compression"
import "react-image-crop/dist/ReactCrop.css"

export default function UpdatePhotoPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const nispn = params.nispn as string
  const existingPhotoUrl = searchParams.get("foto_siswa")

  const [mode, setMode] = useState<"upload" | "webcam">("upload")
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>("")
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [crop, setCrop] = useState({
    unit: "%",
    width: 45,
    height: 60,
    x: 27.5,
    y: 20,
  })
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [showCropper, setShowCropper] = useState(false)
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const webcamRef = useRef<Webcam>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    getVideoDevices()
  }, [])

  const getVideoDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter((device) => device.kind === "videoinput")
      setDevices(videoDevices)
      if (videoDevices.length > 0) {
        setSelectedDevice(videoDevices[0].deviceId)
      }
    } catch (error) {
      console.error("Error getting video devices:", error)
    }
  }

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot()
    if (imageSrc) {
      setCapturedImage(imageSrc)
      setShowCropper(true)
    }
  }, [webcamRef])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        setCapturedImage(reader.result as string)
        setShowCropper(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const getCroppedImg = useCallback((image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) {
      throw new Error("No 2d context")
    }

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    canvas.width = crop.width
    canvas.height = crop.height

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height,
    )

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          }
        },
        "image/jpeg",
        0.9,
      )
    })
  }, [])

  const handleCrop = async () => {
    if (completedCrop && imgRef.current) {
      try {
        const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop)
        const croppedImageUrl = URL.createObjectURL(croppedImageBlob)
        setCroppedImageUrl(croppedImageUrl)
        setShowCropper(false)
      } catch (error) {
        console.error("Error cropping image:", error)
        toast({
          title: "Error",
          description: "Gagal memotong gambar",
          variant: "destructive",
        })
      }
    }
  }

  const handleSave = async () => {
    if (!croppedImageUrl) return

    try {
      setUploading(true)

      // Convert cropped image URL to blob
      const response = await fetch(croppedImageUrl)
      const blob = await response.blob()

      // Compress the image
      const compressedFile = await imageCompression(blob as File, {
        maxSizeMB: 0.4, // 400KB
        maxWidthOrHeight: 800,
        useWebWorker: true,
      })

      // Create form data
      const formData = new FormData()
      formData.append("nispn", nispn)
      formData.append("photo", compressedFile, "photo.jpg")

      // Upload to API
      const uploadResponse = await fetch("https://tes.ppwb.my.id/api/siswa-ppwb/update-photo", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Upload failed")
      }

      toast({
        title: "Berhasil",
        description: "Foto berhasil diperbarui",
      })

      router.push(`/siswa/${nispn}`)
    } catch (error) {
      console.error("Error uploading photo:", error)
      toast({
        title: "Error",
        description: "Gagal mengupload foto",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const resetState = () => {
    setCapturedImage(null)
    setSelectedFile(null)
    setShowCropper(false)
    setCroppedImageUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <h2 className="text-3xl font-bold text-primary-800">Update Foto Siswa</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Photo */}
          {existingPhotoUrl && (
            <Card className="border-primary-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary-50 to-primary-100">
                <CardTitle className="text-primary-800">Foto Saat Ini</CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-center">
                <div className="inline-block rounded-lg overflow-hidden shadow-md">
                  <img
                    src={decodeURIComponent(existingPhotoUrl) || "/placeholder.svg"}
                    alt="Current photo"
                    className="max-w-full h-auto"
                    style={{ maxHeight: "300px", aspectRatio: "3/4", objectFit: "cover" }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Photo Update Interface */}
          <Card className="border-primary-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-info-50 to-info-100">
              <CardTitle className="text-info-800">Update Foto</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {!showCropper && !croppedImageUrl && (
                <>
                  {/* Mode Selection */}
                  <div className="flex gap-2">
                    <Button
                      variant={mode === "upload" ? "default" : "outline"}
                      onClick={() => setMode("upload")}
                      className="flex-1"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                    <Button
                      variant={mode === "webcam" ? "default" : "outline"}
                      onClick={() => setMode("webcam")}
                      className="flex-1"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Webcam
                    </Button>
                  </div>

                  {/* File Upload Mode */}
                  {mode === "upload" && (
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-primary-300 rounded-lg p-8 text-center bg-primary-50">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                          <Upload className="h-4 w-4 mr-2" />
                          Pilih File Gambar
                        </Button>
                        <p className="text-sm text-primary-600 mt-2">Atau drag and drop file gambar di sini</p>
                        <p className="text-xs text-primary-500 mt-1">Format yang didukung: JPG, PNG (Rasio 3:4)</p>
                      </div>
                    </div>
                  )}

                  {/* Webcam Mode */}
                  {mode === "webcam" && (
                    <div className="space-y-4">
                      {devices.length > 1 && (
                        <div className="space-y-2">
                          <Label className="text-primary-700 font-medium">Pilih Kamera</Label>
                          <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                            <SelectTrigger className="border-primary-200 focus:border-primary-500">
                              <SelectValue placeholder="Pilih kamera" />
                            </SelectTrigger>
                            <SelectContent>
                              {devices.map((device, index) => (
                                <SelectItem key={device.deviceId} value={device.deviceId}>
                                  {device.label || `Camera ${index + 1}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="relative rounded-lg overflow-hidden border-2 border-primary-200">
                        <Webcam
                          ref={webcamRef}
                          audio={false}
                          screenshotFormat="image/jpeg"
                          videoConstraints={{
                            deviceId: selectedDevice,
                          }}
                          className="w-full"
                        />
                      </div>

                      <Button onClick={capture} className="w-full bg-primary-600 hover:bg-primary-700">
                        <Camera className="h-4 w-4 mr-2" />
                        Ambil Foto
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* Cropping Interface */}
              {showCropper && capturedImage && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2 text-primary-800">Potong Gambar</h3>
                    <p className="text-sm text-primary-600 mb-4">
                      Sesuaikan area yang akan dipotong dengan rasio 3:4 (lebar:tinggi)
                    </p>
                  </div>

                  <div className="border-2 border-primary-200 rounded-lg overflow-hidden">
                    <ReactCrop
                      crop={crop}
                      onChange={(_, percentCrop) => setCrop(percentCrop)}
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={3 / 4}
                      className="max-w-full"
                    >
                      <img
                        ref={imgRef}
                        alt="Crop me"
                        src={capturedImage || "/placeholder.svg"}
                        className="max-w-full h-auto"
                      />
                    </ReactCrop>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleCrop} className="flex-1 bg-success-600 hover:bg-success-700">
                      <Camera className="h-4 w-4 mr-2" />
                      Potong Gambar
                    </Button>
                    <Button onClick={resetState} variant="outline" className="flex-1">
                      <X className="h-4 w-4 mr-2" />
                      Batal
                    </Button>
                  </div>
                </div>
              )}

              {/* Preview and Save */}
              {croppedImageUrl && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2 text-primary-800">Preview Foto</h3>
                    <p className="text-sm text-primary-600 mb-4">Foto dengan rasio 3:4 siap untuk disimpan</p>
                    <div className="inline-block rounded-lg overflow-hidden shadow-md border-2 border-primary-200">
                      <img
                        src={croppedImageUrl || "/placeholder.svg"}
                        alt="Cropped preview"
                        className="max-w-full h-auto"
                        style={{ maxHeight: "300px", aspectRatio: "3/4", objectFit: "cover" }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleSave}
                      disabled={uploading}
                      className="flex-1 bg-success-600 hover:bg-success-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {uploading ? "Mengupload..." : "Simpan Foto"}
                    </Button>
                    <Button onClick={resetState} variant="outline" className="flex-1">
                      <X className="h-4 w-4 mr-2" />
                      Ulangi
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
