"use client"

import { useEffect, useState, useCallback } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useDebounce } from "@/hooks/use-debounce"
import { Eye, ChevronLeft, ChevronRight, Users, Download, ChevronDown } from "lucide-react"
import type { Siswa, SiswaPaginatedResponse } from "@/types/siswa"
import { Combobox } from "@/components/ui/combobox"
import { ExportModal } from "@/components/modals/export-modal"
import { BulkUploadPhotosModal } from "@/components/modals/bulk-upload-photos-modal"
import { generateBulkPrintDocument } from "@/lib/print-utils"

// --- Tipe Data ---
interface Kelas {
  id: number;
  nama: string;
}

interface Kelompok {
  id: number;
  nama: string;
}

export default function HomePage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // State untuk Daftar Siswa
  const [data, setData] = useState<SiswaPaginatedResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [selectedNispns, setSelectedNispns] = useState<string[]>([]);


  // State untuk Filter Dropdowns
  const [kelasOptions, setKelasOptions] = useState<Kelas[]>([]);
  const [kelompokOptions, setKelompokOptions] = useState<Kelompok[]>([]);
  const [daerahOptions, setDaerahOptions] = useState<Kelompok[]>([]);
  const [loadingFilters, setLoadingFilters] = useState(true);

  // --- State untuk Nilai Filter ---
  const [searchNama, setSearchNama] = useState("")
  const [searchNispn, setSearchNispn] = useState("")
  const [jenisKelamin, setJenisKelamin] = useState("all")
  const [statusMondok, setStatusMondok] = useState("all")
  const [selectedKelasId, setSelectedKelasId] = useState<string>("all");
  const [selectedKelompokId, setSelectedKelompokId] = useState<string>("all");
  const [selectedDaerahSambungId, setSelectedDaerahSambungId] = useState<string>("all");
  const [perPage, setPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  // Debounced search values
  const debouncedNama = useDebounce(searchNama, 500)
  const debouncedNispn = useDebounce(searchNispn, 500)

  // --- Fungsi Fetch Data ---

  // Fetch data siswa utama
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      params.append("page", currentPage.toString())
      params.append("per_page", perPage.toString())
      if (debouncedNama) params.append("filter[nama_lengkap]", debouncedNama)
      if (debouncedNispn) params.append("filter[nispn]", debouncedNispn)
      if (jenisKelamin !== "all") params.append("filter[jenis_kelamin]", jenisKelamin)
      if (statusMondok !== "all") params.append("filter[status_mondok]", statusMondok)
      if (selectedDaerahSambungId !== "all") params.append("filter[id_daerah_sambung]", selectedDaerahSambungId)
      if (selectedKelasId !== "all") params.append("id_kelas", selectedKelasId)
      if (selectedKelompokId !== "all") params.append("id_kelompok", selectedKelompokId)

      const response = await fetch(`https://tes.ppwb.my.id/api/siswa-ppwb?${params.toString()}`)
      if (!response.ok) throw new Error("Gagal memuat data siswa")
      const result = await response.json()
      setData(result)
    } catch (err: any) {
      setError("Gagal memuat data siswa: " + err.message)
    } finally {
      setLoading(false)
    }
  }, [currentPage, perPage, debouncedNama, debouncedNispn, jenisKelamin, statusMondok, selectedDaerahSambungId, selectedKelasId, selectedKelompokId]);

  // Fetch data untuk filter
  const fetchFilterOptions = useCallback(async () => {
    setLoadingFilters(true);
    try {
      const [daerahRes, kelasRes, kelompokRes] = await Promise.all([
        fetch('https://tes.ppwb.my.id/api/siswa-ppwb/daerah'),
        fetch('https://tes.ppwb.my.id/api/siswa-ppwb/kelas'),
        fetch('https://tes.ppwb.my.id/api/siswa-ppwb/kelompok'),
      ]);
      if (!daerahRes.ok || !kelasRes.ok || !kelompokRes.ok) throw new Error('Gagal memuat data filter');
      
      const daerahData = await daerahRes.json();
      const kelasData = await kelasRes.json();
      const kelompokData = await kelompokRes.json();

      setDaerahOptions(daerahData || []);
      setKelasOptions(kelasData || []);
      setKelompokOptions(kelompokData || []);
    } catch (err) {
       toast({ title: "Error Filter", description: "Gagal memuat opsi filter.", variant: "destructive" });
    } finally {
      setLoadingFilters(false);
    }
  }, [toast]);

  useEffect(() => {
    setCurrentPage(1)
  }, [perPage])

  // --- useEffect Hooks ---
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  // Initial data fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchFilterOptions();
    }
  }, [isAuthenticated, fetchFilterOptions]);

  // Fetch data siswa ketika filter berubah
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  useEffect(() => {
    setSelectedNispns([]);
  }, [currentPage, perPage, debouncedNama, debouncedNispn, jenisKelamin, statusMondok, selectedDaerahSambungId, selectedKelasId, selectedKelompokId]);
  
  const handleViewStudent = (nispn: string) => {
    router.push(`/siswa/${nispn}`)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleSelectRow = (nispn: string, isSelected: boolean) => {
    setSelectedNispns(prev => 
      isSelected ? [...prev, nispn] : prev.filter(id => id !== nispn)
    );
  };
  
  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      const allNispnsOnPage = data?.data.map(s => s.nispn).filter(Boolean) as string[];
      setSelectedNispns(allNispnsOnPage);
    } else {
      setSelectedNispns([]);
    }
  };

  const isAllOnPageSelected = data?.data.length ? selectedNispns.length === data.data.length : false;

  const handleBulkPrint = async (type: "cocard-depan" | "cocard-belakang") => {
    if (selectedNispns.length === 0) return;

    toast({ title: "Mempersiapkan data...", description: `Memuat data untuk ${selectedNispns.length} siswa.` });

    try {
        const studentPromises = selectedNispns.map(nispn =>
            fetch(`https://tes.ppwb.my.id/api/siswa-ppwb?filter[nispn]=${nispn}`)
                .then(res => res.json())
                .then(result => result.data && result.data.length > 0 ? result.data[0] : null)
        );

        const studentsData = (await Promise.all(studentPromises)).filter(Boolean) as Siswa[];

        if (studentsData.length > 0) {
            generateBulkPrintDocument(studentsData, type);
        } else {
            throw new Error("Gagal mendapatkan data siswa terpilih.");
        }

    } catch (err: any) {
        toast({ title: "Error", description: err.message || "Gagal memuat data untuk dicetak.", variant: "destructive" });
    }
  };
  
  if (!isAuthenticated) return null

  return (
    <MainLayout>
      <div className="space-y-6">
        <ExportModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            filterOptions={{ daerahOptions, kelasOptions, kelompokOptions }}
            currentFilters={{
                searchNama,
                searchNispn,
                jenisKelamin,
                statusMondok,
                selectedKelasId,
                selectedKelompokId,
                selectedDaerahSambungId,
            }}
        />
  <BulkUploadPhotosModal isOpen={isBulkUploadOpen} onClose={() => setIsBulkUploadOpen(false)} />

        <div className="flex flex-col space-y-4">
          <h2 className="text-3xl font-bold text-primary-800">Data Siswa PPWB</h2>

          {/* --- Komponen Filter & Pencarian --- */}
          <Card className="border-primary-200 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-primary-50 to-primary-100">
              <CardTitle className="text-primary-800 flex items-center gap-2"><Users className="h-5 w-5"/>Filter & Pencarian Siswa</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="searchNama">Cari Nama</Label>
                  <Input id="searchNama" placeholder="Masukkan nama..." value={searchNama} onChange={(e) => setSearchNama(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="searchNispn">Cari NISPN</Label>
                  <Input id="searchNispn" placeholder="Masukkan NISPN..." value={searchNispn} onChange={(e) => setSearchNispn(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Jenis Kelamin</Label>
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
                <div className="space-y-2">
                  <Label>Status Mondok</Label>
                  <Select value={statusMondok} onValueChange={setStatusMondok}>
                    <SelectTrigger className="border-primary-200 focus:border-primary-500">
                      <SelectValue placeholder="Pilih status mondok" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua</SelectItem>
                      <SelectItem value="reguler">Reguler</SelectItem>
                      <SelectItem value="pelajar">Pelajar/Mahasiswa</SelectItem>
                      <SelectItem value="kiriman">Kiriman</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Daerah</Label>
                  <Combobox
                    value={selectedDaerahSambungId}
                    onChange={setSelectedDaerahSambungId}
                    options={[
                      { label: "Semua Daerah", value: "all" },
                      ...daerahOptions.map((k) => ({ label: k.nama, value: k.id.toString() })),
                    ]}
                    disabled={loadingFilters}
                    placeholder="Pilih daerah..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kelas</Label>
                  <Combobox
                    value={selectedKelasId}
                    onChange={setSelectedKelasId}
                    options={[
                      { label: "Semua Kelas", value: "all" },
                      ...kelasOptions.map((k) => ({ label: k.nama, value: k.id.toString() })),
                    ]}
                    disabled={loadingFilters}
                    placeholder="Pilih kelas..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Kelompok</Label>
                  <Combobox
                    value={selectedKelompokId}
                    onChange={setSelectedKelompokId}
                    options={[
                      { label: "Semua Kelompok", value: "all" },
                      ...kelompokOptions.map((k) => ({ label: k.nama, value: k.id.toString() })),
                    ]}
                    disabled={loadingFilters}
                    placeholder="Pilih kelompok..."
                  />
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => setIsExportModalOpen(true)}>
                        <Download className="mr-2 h-4 w-4"/>
                        Ekspor
                    </Button>
                    <Button onClick={() => setIsBulkUploadOpen(true)} variant="outline">
                      Upload Foto Massal
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" disabled={selectedNispns.length === 0}>
                          Aksi ({selectedNispns.length})
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => handleBulkPrint('cocard-depan')}>
                            Cetak Cocard Depan
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleBulkPrint('cocard-belakang')}>
                            Cetak Cocard Belakang
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>

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

          {!loading && !error && data && (
            <>
              {data.data.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center space-y-4">
                    <h3 className="text-xl font-semibold text-gray-700">Tidak ada data ditemukan</h3>
                    <p className="text-gray-500">Coba ubah filter pencarian atau periksa kembali input Anda.</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block">
                    <Card>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[50px]">
                                <Checkbox
                                  checked={isAllOnPageSelected}
                                  onCheckedChange={handleSelectAll}
                                  aria-label="Select all rows on this page"
                                />
                              </TableHead>
                              <TableHead>Foto</TableHead>
                              <TableHead>NISPN</TableHead>
                              <TableHead>Nama Lengkap</TableHead>
                              <TableHead>L/P</TableHead>
                              <TableHead>Kelas</TableHead>
                              <TableHead>Kelompok</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Daerah Sambung</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.data.map((siswa) => (
                              <TableRow key={siswa.nispn}>
                                <TableCell>
                                  <Checkbox
                                    checked={selectedNispns.includes(siswa.nispn)}
                                    onCheckedChange={(value) => handleSelectRow(siswa.nispn, !!value)}
                                    aria-label={`Select row for ${siswa.nama}`}
                                  />
                                </TableCell>
                                <TableCell>
                                  <div className="w-12 h-16 rounded-lg overflow-hidden bg-gray-100">
                                    <img
                                      src={siswa.foto_siswa || "/placeholder.svg?height=64&width=48"}
                                      alt={siswa.nama || "Student"}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                </TableCell>
                                <TableCell>{siswa.nispn || "-"}</TableCell>
                                <TableCell className="font-medium">{siswa.nama || "-"}</TableCell>
                                <TableCell>
                                  <Badge variant={siswa.jenis_kelamin === "L" ? "default" : "secondary"}>
                                    {siswa.jenis_kelamin === "L" ? "L" : "P"}
                                  </Badge>
                                </TableCell>
                                <TableCell>{siswa.kelas || "-"}</TableCell>
                                <TableCell>{siswa.kelompok || "-"}</TableCell>
                                <TableCell>{siswa.status_mondok || "-"}</TableCell>
                                <TableCell>{siswa.daerah_sambung || "-"}</TableCell>
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
                      >
                         <CardContent className="p-4">
                            <div className="flex items-start space-x-4">
                               <Checkbox
                                    checked={selectedNispns.includes(siswa.nispn)}
                                    onCheckedChange={(value) => handleSelectRow(siswa.nispn, !!value)}
                                    aria-label={`Select row for ${siswa.nama}`}
                                    className="mt-1"
                                />
                               <div className="w-16 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0" onClick={() => handleViewStudent(siswa.nispn)}>
                                 <img
                                   src={siswa.foto_siswa || "/placeholder.svg?height=80&width=60"}
                                   alt={siswa.nama || "Student"}
                                   className="w-full h-full object-cover"
                                 />
                               </div>
                               <div className="flex-1 space-y-2" onClick={() => handleViewStudent(siswa.nispn)}>
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
                                    <span className="font-medium">NISPN:</span> {siswa.nispn || "-"}
                                  </p>
                                  <p>
                                    <span className="font-medium">Daerah:</span> {siswa.daerah_sambung || "-"}
                                  </p>
                                  <p>
                                    <span className="font-medium">Kelas:</span> {siswa.kelas || "-"}
                                  </p>
                                   <p>
                                    <span className="font-medium">Kelompok:</span> {siswa.kelompok || "-"}
                                  </p>
                                   <p>
                                    <span className="font-medium">Status:</span> {siswa.status_mondok || "-"}
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
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="text-sm text-gray-600">
                            Menampilkan {data.from || 0} - {data.to || 0} dari {data.total} data ({selectedNispns.length} terpilih)
                          </div>

                          <div className="flex items-center space-x-4 justify-between">
                            <div className="flex items-center space-x-2">
                              <Label htmlFor="perPageSelect" className="text-sm text-gray-600">Tampilkan</Label>
                              <Select value={perPage.toString()} onValueChange={(val) => {
                                setPerPage(Number(val));
                              }}>
                                <SelectTrigger id="perPageSelect" className="w-[80px] h-8 border-gray-300">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="10">10</SelectItem>
                                  <SelectItem value="25">25</SelectItem>
                                  <SelectItem value="50">50</SelectItem>
                                  <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                              >
                                <ChevronLeft className="h-4 w-4" />
                              
                              </Button>
                              <span className="text-sm">
                                {currentPage} dari {data.last_page}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === data.last_page}
                              >
                                
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                </>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  )
}