"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Combobox } from "@/components/ui/combobox"
import { useToast } from "@/hooks/use-toast"
import { exportToExcel, exportToDocument, exportToDocx } from "@/lib/utils" // Adjust path if needed
import { Loader2, FileText } from "lucide-react"

interface FilterOptions {
  daerahOptions: { id: number; nama: string }[];
  kelasOptions: { id: number; nama: string }[];
  kelompokOptions: { id: number; nama: string }[];
}

interface CurrentFilters {
  searchNama: string;
  searchNispn: string;
  jenisKelamin: string;
  statusMondok: string;
  selectedKelasId: string;
  selectedKelompokId: string;
  selectedDaerahSambungId: string;
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  filterOptions: FilterOptions;
  currentFilters: CurrentFilters;
}

export function ExportModal({ isOpen, onClose, filterOptions, currentFilters }: ExportModalProps) {
   const { toast } = useToast()

  // Available fields for document export
   const availableFields = [
     { key: 'tanggal_mendaftar', label: 'Tanggal Mendaftar' },
     { key: 'nispn', label: 'NISPN' },
     { key: 'nis', label: 'NIS' },
     { key: 'nama', label: 'Nama Lengkap' },
     { key: 'jenis_kelamin', label: 'L/P' },
     { key: 'kelas', label: 'Kelas' },
     { key: 'kelompok', label: 'Kelompok' },
     { key: 'tanggal_masuk_kelas', label: 'Tanggal Masuk Kelas' },
     { key: 'tanggal_masuk_kelompok', label: 'Tanggal Masuk Kelompok' },
     { key: 'nik', label: 'NIK' },
     { key: 'kk', label: 'KK' },
     { key: 'rfid', label: 'RFID' },
     { key: 'status_mondok', label: 'Status Mondok' },
     { key: 'daerah_kiriman', label: 'Daerah Kiriman' },
     { key: 'daerah_sambung', label: 'Daerah Sambung' },
     { key: 'desa_sambung', label: 'Desa Sambung' },
     { key: 'kelompok_sambung', label: 'Kelompok Sambung' },
     { key: 'tempat_lahir', label: 'Tempat Lahir' },
     { key: 'tanggal_lahir', label: 'Tanggal Lahir' },
     { key: 'umur', label: 'Umur' },
     { key: 'alamat_lengkap', label: 'Alamat Lengkap' },
     { key: 'rt', label: 'RT' },
     { key: 'rw', label: 'RW' },
     { key: 'desa_kel', label: 'Desa/Kel' },
     { key: 'kecamatan', label: 'Kecamatan' },
     { key: 'kota_kab', label: 'Kota/Kab' },
     { key: 'provinsi', label: 'Provinsi' },
     { key: 'kode_pos', label: 'Kode Pos' },
     { key: 'nama_ayah', label: 'Nama Ayah' },
     { key: 'nama_ibu', label: 'Nama Ibu' },
     { key: 'foto_siswa', label: 'Foto Siswa' },
     { key: 'pendidikan', label: 'Pendidikan' },
     { key: 'jurusan', label: 'Jurusan' }
   ];

  // State for the modal form
   const [groupBy, setGroupBy] = useState("none");
   const [exportType, setExportType] = useState("excel");
   const [documentFormat, setDocumentFormat] = useState("print");
   const [selectedFields, setSelectedFields] = useState<string[]>([
     'nispn', 'nama', 'jenis_kelamin', 'kelas', 'kelompok', 'status_mondok', 'daerah_sambung'
   ]);
   const [includeCustomColumn, setIncludeCustomColumn] = useState(false);
   const [customColumnName, setCustomColumnName] = useState("");
   const [filters, setFilters] = useState<CurrentFilters>(currentFilters);
   const [isExporting, setIsExporting] = useState(false);

   // Auto-set groupBy when export type changes
   const handleExportTypeChange = (newExportType: string) => {
     setExportType(newExportType);
     if (newExportType === "document") {
       if (groupBy === "none") {
         setGroupBy("kelas");
       }
       if (!documentFormat) {
         setDocumentFormat("print");
       }
     }
   };

  const handleFilterChange = (key: keyof CurrentFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleFieldToggle = (fieldKey: string) => {
    setSelectedFields(prev =>
      prev.includes(fieldKey)
        ? prev.filter(f => f !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const params = new URLSearchParams();
      params.append('group_by', groupBy);

      if (filters.jenisKelamin !== "all") params.append("jenis_kelamin", filters.jenisKelamin);
      if (filters.statusMondok !== "all") params.append("status_mondok", filters.statusMondok);
      if (filters.selectedDaerahSambungId !== "all") params.append("id_daerah_sambung", filters.selectedDaerahSambungId);
      if (filters.selectedKelasId !== "all") params.append("id_kelas", filters.selectedKelasId);
      if (filters.selectedKelompokId !== "all") params.append("id_kelompok", filters.selectedKelompokId);

      // Add selected fields for document export
      if (exportType === "document" && selectedFields.length > 0) {
        params.append('fields', selectedFields.join(','));
      }

      const response = await fetch(`https://tes.ppwb.my.id/api/siswa-ppwb/export?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal mengekspor data.");
      }

      const data = await response.json();

      if (Object.keys(data).length === 0) {
        toast({ title: "Tidak Ada Data", description: "Tidak ada data siswa yang ditemukan dengan filter yang dipilih.", variant: "default" });
        return;
      }

      if (exportType === "excel") {
        exportToExcel(data, `export_by_${groupBy}`);
        toast({ title: "Ekspor Berhasil", description: "File Excel sedang diunduh." });
      } else if (exportType === "document") {
        if (documentFormat === "print") {
          exportToDocument(data, `export_by_${groupBy}`, selectedFields, groupBy, includeCustomColumn, customColumnName);
          toast({ title: "Ekspor Berhasil", description: "Dokumen siap dicetak." });
        } else if (documentFormat === "docx") {
          await exportToDocx(data, `export_by_${groupBy}`, selectedFields, groupBy, includeCustomColumn, customColumnName);
          toast({ title: "Ekspor Berhasil", description: "File Word sedang diunduh." });
        }
      }

      onClose();

    } catch (err: any) {
      console.error("Export failed:", err);
      toast({ title: "Ekspor Gagal", description: err.message, variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
           <DialogTitle>Ekspor Data Siswa</DialogTitle>
           <DialogDescription>
             Pilih tipe ekspor, cara pengelompokan, field yang akan ditampilkan, dan sesuaikan filter sebelum mengekspor data.
           </DialogDescription>
         </DialogHeader>
        <div className="grid gap-6 py-4 overflow-y-auto flex-1">
          {/* Export Type Selector */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Tipe Ekspor</Label>
            <Select value={exportType} onValueChange={handleExportTypeChange}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih tipe ekspor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="document">Dokumen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Document Format Selector (only show when document type is selected) */}
          {exportType === "document" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Format Dokumen</Label>
              <Select value={documentFormat} onValueChange={setDocumentFormat}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Pilih format dokumen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="print">Print PDF</SelectItem>
                  <SelectItem value="docx">DOCX (Word)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Group By Selector */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Pengelompokan</Label>
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih pengelompokan" />
              </SelectTrigger>
              <SelectContent>
                {exportType === "document" ? (
                  <>
                    <SelectItem value="kelas">Berdasarkan Kelas</SelectItem>
                    <SelectItem value="kelompok">Berdasarkan Kelompok</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="none">Tidak Ada</SelectItem>
                    <SelectItem value="kelas">Berdasarkan Kelas</SelectItem>
                    <SelectItem value="kelompok">Berdasarkan Kelompok</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Field Selection for Document Export */}
          {exportType === "document" && (
            <>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Field yang Ditampilkan</Label>
                <div className="col-span-3 space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                  <div className="grid grid-cols-2 gap-2">
                    {availableFields.map(field => (
                      <div key={field.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={field.key}
                          checked={selectedFields.includes(field.key)}
                          onCheckedChange={() => handleFieldToggle(field.key)}
                        />
                        <Label htmlFor={field.key} className="text-sm font-normal">
                          {field.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Custom Column Option */}
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Kolom Custom</Label>
                <div className="col-span-3 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeCustomColumn"
                      checked={includeCustomColumn}
                      onCheckedChange={(checked) => setIncludeCustomColumn(!!checked)}
                    />
                    <Label htmlFor="includeCustomColumn" className="text-sm font-normal">
                      Tambahkan kolom kosong custom
                    </Label>
                  </div>
                  {includeCustomColumn && (
                    <div className="ml-6">
                      <Label htmlFor="customColumnName" className="text-sm text-gray-600">Nama Kolom</Label>
                      <input
                        id="customColumnName"
                        type="text"
                        value={customColumnName}
                        onChange={(e) => setCustomColumnName(e.target.value)}
                        placeholder="Masukkan nama kolom..."
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        maxLength={50}
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          
          <hr/>
          <h4 className="text-md font-semibold">Filter Data</h4>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Daerah</Label>
                <Combobox
                  value={filters.selectedDaerahSambungId}
                  onChange={(val) => handleFilterChange('selectedDaerahSambungId', val)}
                  options={[
                    { label: "Semua Daerah", value: "all" },
                    ...filterOptions.daerahOptions.map((k) => ({ label: k.nama, value: k.id.toString() })),
                  ]}
                  placeholder="Pilih daerah..."
                />
              </div>
              <div className="space-y-2">
                <Label>Kelas</Label>
                <Combobox
                  value={filters.selectedKelasId}
                  onChange={(val) => handleFilterChange('selectedKelasId', val)}
                  options={[
                    { label: "Semua Kelas", value: "all" },
                    ...filterOptions.kelasOptions.map((k) => ({ label: k.nama, value: k.id.toString() })),
                  ]}
                  placeholder="Pilih kelas..."
                />
              </div>
              <div className="space-y-2">
                <Label>Kelompok</Label>
                <Combobox
                  value={filters.selectedKelompokId}
                  onChange={(val) => handleFilterChange('selectedKelompokId', val)}
                  options={[
                    { label: "Semua Kelompok", value: "all" },
                    ...filterOptions.kelompokOptions.map((k) => ({ label: k.nama, value: k.id.toString() })),
                  ]}
                  placeholder="Pilih kelompok..."
                />
              </div>
               <div className="space-y-2">
                <Label>Status Mondok</Label>
                <Select value={filters.statusMondok} onValueChange={(val) => handleFilterChange('statusMondok', val)}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua</SelectItem>
                        <SelectItem value="reguler">Reguler</SelectItem>
                        <SelectItem value="pelajar">Pelajar/Mahasiswa</SelectItem>
                        <SelectItem value="kiriman">Kiriman</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Jenis Kelamin</Label>
                <Select value={filters.jenisKelamin} onValueChange={(val) => handleFilterChange('jenisKelamin', val)}>
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isExporting}>Batal</Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Ekspor Sekarang
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}