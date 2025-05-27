"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { MainLayout } from "@/components/layout/main-layout"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useDebounce } from "@/hooks/use-debounce"
import { Eye, ChevronLeft, ChevronRight } from "lucide-react"
import type { SiswaPaginatedResponse } from "@/types/siswa"

export default function HomePage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [data, setData] = useState<SiswaPaginatedResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter states
  const [searchNama, setSearchNama] = useState("")
  const [searchNis, setSearchNis] = useState("")
  const [searchNispn, setSearchNispn] = useState("")
  const [jenisKelamin, setJenisKelamin] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  // Debounced search values
  const debouncedNama = useDebounce(searchNama, 500)
  const debouncedNis = useDebounce(searchNis, 500)
  const debouncedNispn = useDebounce(searchNispn, 500)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated, debouncedNama, debouncedNis, debouncedNispn, jenisKelamin, currentPage])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      params.append("page", currentPage.toString())

      if (debouncedNama) params.append("filter[nama_lengkap]", debouncedNama)
      if (debouncedNis) params.append("filter[nis]", debouncedNis)
      if (debouncedNispn) params.append("filter[nispn]", debouncedNispn)
      if (jenisKelamin !== "all") params.append("filter[jenis_kelamin]", jenisKelamin)

      const response = await fetch(`https://tes.ppwb.my.id/api/siswa-ppwb?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch data")
      }

      const result: SiswaPaginatedResponse = await response.json()
      setData(result)
    } catch (err) {
      setError("Gagal memuat data siswa")
      toast({
        title: "Error",
        description: "Gagal memuat data siswa",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewStudent = (nispn: string) => {
    router.push(`/siswa/${nispn}`)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-4">
          <h2 className="text-3xl font-bold text-primary-800">Data Siswa PPWB</h2>

          {/* Filters */}
          <Card className="border-primary-200 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-primary-50 to-primary-100">
              <CardTitle className="text-primary-800">Filter & Pencarian</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="searchNama" className="text-primary-700 font-medium">
                    Cari Nama
                  </Label>
                  <Input
                    id="searchNama"
                    placeholder="Masukkan nama siswa"
                    value={searchNama}
                    onChange={(e) => setSearchNama(e.target.value)}
                    className="border-primary-200 focus:border-primary-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="searchNis" className="text-primary-700 font-medium">
                    Cari NIS
                  </Label>
                  <Input
                    id="searchNis"
                    placeholder="Masukkan NIS"
                    value={searchNis}
                    onChange={(e) => setSearchNis(e.target.value)}
                    className="border-primary-200 focus:border-primary-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="searchNispn" className="text-primary-700 font-medium">
                    Cari NISPN
                  </Label>
                  <Input
                    id="searchNispn"
                    placeholder="Masukkan NISPN"
                    value={searchNispn}
                    onChange={(e) => setSearchNispn(e.target.value)}
                    className="border-primary-200 focus:border-primary-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-primary-700 font-medium">Jenis Kelamin</Label>
                  <Select value={jenisKelamin} onValueChange={setJenisKelamin}>
                    <SelectTrigger className="border-primary-200 focus:border-primary-500">
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="L">Laki-laki</SelectItem>
                      <SelectItem value="P">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {loading && (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-red-600">{error}</p>
                <Button onClick={fetchData} className="mt-4">
                  Coba Lagi
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Data Display */}
          {!loading && !error && data && (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Foto</TableHead>
                          <TableHead>NIS</TableHead>
                          <TableHead>NISPN</TableHead>
                          <TableHead>Nama Lengkap</TableHead>
                          <TableHead>Jenis Kelamin</TableHead>
                          <TableHead>Daerah Sambung</TableHead>
                          <TableHead>Kelompok Sambung</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.data.map((siswa) => (
                          <TableRow key={siswa.nispn}>
                            <TableCell>
                              <div className="w-12 h-16 rounded-lg overflow-hidden bg-gray-100">
                                <img
                                  src={siswa.foto_siswa || "/placeholder.svg?height=64&width=48"}
                                  alt={siswa.nama || "Student"}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </TableCell>
                            <TableCell>{siswa.nis || "-"}</TableCell>
                            <TableCell>{siswa.nispn || "-"}</TableCell>
                            <TableCell className="font-medium">{siswa.nama || "-"}</TableCell>
                            <TableCell>
                              <Badge variant={siswa.jenis_kelamin === "L" ? "default" : "secondary"}>
                                {siswa.jenis_kelamin === "L" ? "L" : "P"}
                              </Badge>
                            </TableCell>
                            <TableCell>{siswa.daerah_sambung || "-"}</TableCell>
                            <TableCell>{siswa.kelompok_sambung || "-"}</TableCell>
                            <TableCell>
                              <Button size="sm" onClick={() => handleViewStudent(siswa.nispn || "")}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {data.data.map((siswa) => (
                  <Card
                    key={siswa.nispn}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleViewStudent(siswa.nispn || "")}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={siswa.foto_siswa || "/placeholder.svg?height=80&width=60"}
                            alt={siswa.nama || "Student"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{siswa.nama || "-"}</h3>
                            <Badge
                              variant="outline"
                              className="rounded-full h-6 w-6 p-0 flex items-center justify-center"
                            >
                              {siswa.jenis_kelamin === "L" ? "L" : "P"}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>
                              <span className="font-medium">NIS:</span> {siswa.nis || "-"}
                            </p>
                            <p>
                              <span className="font-medium">NISPN:</span> {siswa.nispn || "-"}
                            </p>
                            <p>
                              <span className="font-medium">Daerah:</span> {siswa.daerah_sambung || "-"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {data.last_page > 1 && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Menampilkan {data.from || 0} - {data.to || 0} dari {data.total} data
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <span className="text-sm">
                          Halaman {currentPage} dari {data.last_page}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === data.last_page}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
