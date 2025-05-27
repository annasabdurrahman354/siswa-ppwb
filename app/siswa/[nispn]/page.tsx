// annasabdurrahman354/siswa-ppwb/siswa-ppwb-1ab3aee5d39e63208c9cf1d36490c24de570cf47/app/siswa/[nispn]/page.tsx
"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ArrowLeft, Camera, User, MapPin, GraduationCap, Home, Calendar, Users,
  BadgeIcon as IdCard, Printer as PrinterIcon, DollarSign, FileText
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { generatePrintDocument } from "@/lib/print-utils"
import { Badge } from "@/components/ui/badge"
import { AddPaymentModal } from "@/components/payments/add-payment-modal"
import { formatRupiah } from "@/lib/terbilang"
import { supabase } from "@/lib/supabase"
import { PaymentTransaction } from "@/types/payment"
import { Siswa } from "@/types/siswa"

export default function SiswaDetailPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const nispn = params.nispn as string;

  const [siswa, setSiswa] = useState<Siswa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentTransaction[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  const fetchSiswaDetail = useCallback(async () => {
    if (!nispn) return;
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`https://tes.ppwb.my.id/api/siswa-ppwb?filter[nispn]=${nispn}`);
      if (!response.ok) throw new Error("Gagal memuat data siswa dari API eksternal");
      const result = await response.json();
      if (result.data && result.data.length > 0) {
        setSiswa(result.data[0]);
      } else {
        setError("Data siswa tidak ditemukan");
        setSiswa(null);
      }
    } catch (err: any) {
      setError(err.message || "Gagal memuat data siswa");
      toast({ title: "Error", description: err.message || "Gagal memuat data siswa", variant: "destructive" });
      setSiswa(null);
    } finally {
      setLoading(false);
    }
  }, [nispn, toast]);

  const fetchPaymentHistory = useCallback(async () => {
    if (!nispn) return;
    setLoadingPayments(true);
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select(`
          *,
          items:payment_transaction_items (
            *,
            category_option:payment_category_options (
              *,
              category:payment_categories (
                id,
                name
              )
            )
          )
        `)
        .eq('siswa_nispn', nispn)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      
      // Map the data to include category and option information
      const historyWithDetails = data.map(transaction => ({
        ...transaction,
        items: transaction.items.map((item: any) => ({
          ...item,
          category_name: item.category_option.category.name,
          option_description: item.category_option.description,
          option_amount: item.category_option.amount
        }))
      }));
      setPaymentHistory(historyWithDetails || []);

    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: "Gagal memuat riwayat pembayaran: " + error.message, 
        variant: "destructive" 
      });
      setPaymentHistory([]);
    } finally {
      setLoadingPayments(false);
    }
  }, [nispn, toast]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && nispn) {
      fetchSiswaDetail();
      fetchPaymentHistory();
    }
  }, [isAuthenticated, nispn, fetchSiswaDetail, fetchPaymentHistory]);

  const handleUpdatePhoto = () => {
    router.push(`/siswa/${nispn}/update-photo?foto_siswa=${encodeURIComponent(siswa?.foto_siswa || "")}`);
  };

 const handlePrint = (type: "cocard-depan" | "cocard-belakang" | "stiker") => {
    if (!siswa) return

    const printWindow = generatePrintDocument(siswa, type)
    if (printWindow) {
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
        printWindow.onafterprint = () => {
          printWindow.close()
        }
      }, 500)
    }
  }


  const handlePrintNota = (transaction: PaymentTransaction) => {
    if (!siswa || !transaction) return;
    const printWindow = generatePrintDocument({ siswa, transaction }, "nota");
     if (printWindow) {
      printWindow.focus();
      // Delay print to allow content to load, especially images if any are on nota
      setTimeout(() => {
        try {
          printWindow.print();
          printWindow.onafterprint = () => {
            // printWindow.close(); // Closing sometimes cancels printing
          };
        } catch (e) {
          console.error("Error printing nota:", e);
          printWindow.alert("Gagal memulai proses print. Silakan coba print manual dari jendela nota (Ctrl/Cmd + P).");
        }
      }, 1000); // Increased delay
    } else {
      toast({title: "Gagal Cetak", description: "Tidak bisa membuka jendela cetak nota.", variant: "destructive"})
    }
  };


  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4"><Skeleton className="h-10 w-24" /><Skeleton className="h-8 w-48" /></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card><CardContent className="p-6 text-center"><Skeleton className="h-64 w-48 rounded-lg mx-auto mb-4" /><Skeleton className="h-10 w-32 mx-auto" /></CardContent></Card>
            <div className="lg:col-span-2 space-y-4">{[...Array(3)].map((_, i) => (<Card key={i}><CardHeader><Skeleton className="h-6 w-32" /></CardHeader><CardContent><div className="space-y-2">{[...Array(4)].map((_, j) => (<Skeleton key={j} className="h-4 w-full" />))}</div></CardContent></Card>))}</div>
          </div>
           <Card className="mt-6"><CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
        </div>
      </MainLayout>
    );
  }

  if (error || !siswa) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Button variant="outline" onClick={() => router.replace('/')}><ArrowLeft className="h-4 w-4 mr-2" /> Kembali</Button>
          <Card><CardContent className="p-6 text-center"><p className="text-destructive mb-4">{error || "Data siswa tidak ditemukan."}</p><Button onClick={fetchSiswaDetail}>Coba Lagi</Button></CardContent></Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.back()} className="border-primary-300 text-primary-700 hover:bg-primary-50">
              <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
            </Button>
            <div>
              <h2 className="text-3xl font-bold text-primary-800">Detail Siswa</h2>
              <p className="text-primary-600">Informasi lengkap data siswa</p>
            </div>
          </div>
           <Button onClick={() => setIsPaymentModalOpen(true)} className="bg-success-600 hover:bg-success-700">
            <DollarSign className="h-4 w-4 mr-2" /> Tambah Pembayaran
          </Button>
        </div>

        {/* Student Info and Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Photo & Actions Card */}
          <Card className="border-primary-200 shadow-lg lg:sticky lg:top-6 self-start">
            <CardContent className="p-6 text-center">
              <div className="relative mb-6">
                <div className="w-48 h-64 mx-auto rounded-xl overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200 shadow-lg">
                  <img src={siswa.foto_siswa || "/placeholder.svg?height=256&width=192"} alt={siswa.nama || "Student"} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                  <Badge variant="secondary" className="bg-primary-600 text-white px-3 py-1 text-xs"><IdCard className="h-3 w-3 mr-1" />{siswa.nis || siswa.nispn || "N/A"}</Badge>
                </div>
              </div>
              <div className="mb-4">
                <h3 className="text-xl font-bold text-primary-800 mb-1">{siswa.nama || "-"}</h3>
                <p className="text-primary-600 text-sm">{siswa.daerah_sambung || "Daerah tidak diketahui"}</p>
              </div>
              <div className="space-y-3">
                <Button onClick={handleUpdatePhoto} className="w-full bg-primary-600 hover:bg-primary-700"><Camera className="h-4 w-4 mr-2" />Update Photo</Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full border-primary-300 text-primary-700 hover:bg-primary-50"><PrinterIcon className="h-4 w-4 mr-2" />Cetak Identitas</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center">
                    <DropdownMenuItem onClick={() => handlePrint("cocard-depan")}>Cetak Cocard Depan</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePrint("cocard-belakang")}>Cetak Cocard Belakang</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePrint("stiker")}>Cetak Stiker Identitas</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Information Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="border-primary-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary-50 to-primary-100 border-b border-primary-200">
                <CardTitle className="flex items-center gap-2 text-primary-800">
                  <User className="h-5 w-5" />
                  Informasi Dasar
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="h-4 w-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary-600">Nama Lengkap</p>
                        <p className="text-lg font-semibold text-primary-800">{siswa.nama || "-"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-info-100 flex items-center justify-center flex-shrink-0 mt-1">
                        <IdCard className="h-4 w-4 text-info-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary-600">NIS</p>
                        <p className="text-lg text-primary-800">{siswa.nis || "-"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-success-100 flex items-center justify-center flex-shrink-0 mt-1">
                        <Calendar className="h-4 w-4 text-success-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary-600">Tempat Lahir</p>
                        <p className="text-lg text-primary-800">{siswa.tempat_lahir || "-"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-warning-100 flex items-center justify-center flex-shrink-0 mt-1">
                        <IdCard className="h-4 w-4 text-warning-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary-600">NISPN</p>
                        <p className="text-lg text-primary-800">{siswa.nispn || "-"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0 mt-1">
                        <Calendar className="h-4 w-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary-600">Umur</p>
                        <p className="text-lg text-primary-800">{siswa.umur ? `${siswa.umur} tahun` : "-"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-info-100 flex items-center justify-center flex-shrink-0 mt-1">
                        <Calendar className="h-4 w-4 text-info-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-primary-600">Tanggal Lahir</p>
                        <p className="text-lg text-primary-800">{siswa.tanggal_lahir || "-"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Family Information */}
            <Card className="border-primary-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-success-50 to-success-100 border-b border-success-200">
                <CardTitle className="flex items-center gap-2 text-success-800">
                  <Users className="h-5 w-5" />
                  Informasi Keluarga
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-success-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="h-4 w-4 text-success-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-success-600">Nama Ayah</p>
                      <p className="text-lg text-success-800">{siswa.nama_ayah || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-success-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="h-4 w-4 text-success-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-success-600">Nama Ibu</p>
                      <p className="text-lg text-success-800">{siswa.nama_ibu || "-"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card className="border-primary-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-info-50 to-info-100 border-b border-info-200">
                <CardTitle className="flex items-center gap-2 text-info-800">
                  <MapPin className="h-5 w-5" />
                  Informasi Alamat
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-info-50 rounded-lg">
                    <p className="text-xs font-medium text-info-600 mb-1">RT</p>
                    <p className="text-lg font-bold text-info-800">{siswa.rt || "-"}</p>
                  </div>
                  <div className="text-center p-3 bg-info-50 rounded-lg">
                    <p className="text-xs font-medium text-info-600 mb-1">RW</p>
                    <p className="text-lg font-bold text-info-800">{siswa.rw || "-"}</p>
                  </div>
                  <div className="text-center p-3 bg-info-50 rounded-lg">
                    <p className="text-xs font-medium text-info-600 mb-1">Desa/Kel</p>
                    <p className="text-sm font-bold text-info-800">{siswa.desa_kel || "-"}</p>
                  </div>
                  <div className="text-center p-3 bg-info-50 rounded-lg">
                    <p className="text-xs font-medium text-info-600 mb-1">Kode Pos</p>
                    <p className="text-lg font-bold text-info-800">{siswa.kode_pos || "-"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-info-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <MapPin className="h-4 w-4 text-info-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-info-600">Kecamatan</p>
                      <p className="text-lg text-info-800">{siswa.kecamatan || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-info-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <MapPin className="h-4 w-4 text-info-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-info-600">Kota/Kab</p>
                      <p className="text-lg text-info-800">{siswa.kota_kab || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-info-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <MapPin className="h-4 w-4 text-info-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-info-600">Provinsi</p>
                      <p className="text-lg text-info-800">{siswa.provinsi || "-"}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-info-50 rounded-lg">
                  <div className="w-8 h-8 rounded-lg bg-info-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <Home className="h-4 w-4 text-info-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-info-600 mb-1">Alamat Lengkap</p>
                    <p className="text-base text-info-800 leading-relaxed">{siswa.alamat_lengkap || "-"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Education Information */}
            <Card className="border-primary-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-warning-50 to-warning-100 border-b border-warning-200">
                <CardTitle className="flex items-center gap-2 text-warning-800">
                  <GraduationCap className="h-5 w-5" />
                  Informasi Pendidikan
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-warning-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <GraduationCap className="h-4 w-4 text-warning-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-warning-600">Pendidikan</p>
                      <p className="text-lg text-warning-800">{siswa.pendidikan || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-warning-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <Home className="h-4 w-4 text-warning-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-warning-600">Status Mondok</p>
                      <Badge variant={siswa.status_mondok ? "default" : "secondary"} className="mt-1">
                        {siswa.status_mondok || "Tidak Diketahui"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-warning-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <Users className="h-4 w-4 text-warning-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-warning-600">Kelompok Sambung</p>
                      <p className="text-lg text-warning-800">{siswa.kelompok_sambung || "-"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-warning-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <MapPin className="h-4 w-4 text-warning-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-warning-600">Daerah Sambung</p>
                      <p className="text-lg text-warning-800">{siswa.daerah_sambung || "-"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payment History Section */}
        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <DollarSign className="h-5 w-5" />
                Riwayat Pembayaran
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loadingPayments ? (
              <div className="p-6 space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : paymentHistory.length === 0 ? (
              <p className="p-6 text-center text-muted-foreground">
                Belum ada riwayat pembayaran.
              </p>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Detail Pembayaran</TableHead>
                        <TableHead>Total Bayar</TableHead>
                        <TableHead>Petugas</TableHead>
                        <TableHead>Catatan</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentHistory.map(tx => (
                        <TableRow key={tx.id}>
                          <TableCell className="font-medium">
                            {new Date(tx.transaction_date).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {tx.items.map((item: any, index: number) => (
                                <div key={item.id} className="text-sm">
                                  <div className="font-medium text-primary-700">
                                    {item.category_name}
                                  </div>
                                  <div className="text-muted-foreground text-xs">
                                    {item.option_description} 
                                    {item.quantity > 1 && ` × ${item.quantity}`}
                                    <span className="ml-2 font-medium">
                                      {formatRupiah(item.amount)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold text-primary-700">
                            {formatRupiah(tx.total_amount)}
                          </TableCell>
                          <TableCell>{tx.processed_by_petugas}</TableCell>
                          <TableCell className="max-w-[200px]">
                            {tx.notes ? (
                              <div className="truncate" title={tx.notes}>
                                {tx.notes}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handlePrintNota(tx)}
                            >
                              <FileText className="h-3.5 w-3.5 mr-1.5" />
                              Print Nota
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden p-4 space-y-3">
                  {paymentHistory.map(tx => (
                    <Card key={tx.id} className="border-blue-100">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="font-semibold text-lg text-primary-700">
                            {formatRupiah(tx.total_amount)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(tx.transaction_date).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </div>
                        </div>

                        {/* Payment Items */}
                        <div className="space-y-2 mb-3">
                          {tx.items.map((item: any) => (
                            <div key={item.id} className="bg-gray-50 rounded-lg p-2">
                              <div className="font-medium text-sm text-primary-700">
                                {item.category_name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {item.option_description}
                                {item.quantity > 1 && ` × ${item.quantity}`}
                              </div>
                              <div className="text-xs font-medium text-right">
                                {formatRupiah(item.amount)}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="text-xs text-muted-foreground mb-2">
                          <span className="font-medium">Petugas:</span> {tx.processed_by_petugas}
                        </div>

                        {tx.notes && (
                          <div className="text-xs text-muted-foreground mb-3">
                            <span className="font-medium">Catatan:</span> {tx.notes}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="p-3 pt-0">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full" 
                          onClick={() => handlePrintNota(tx)}
                        >
                          <FileText className="h-3.5 w-3.5 mr-1.5" />
                          Print Nota
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <AddPaymentModal
        isOpen={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        siswa={siswa}
        onPaymentSuccess={() => {
            fetchPaymentHistory(); // Refresh payment history list
            toast({ title: "Sukses", description: "Pembayaran berhasil ditambahkan."});
        }}
      />
    </MainLayout>
  );
}