"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Combobox } from "@/components/ui/combobox"
import { useToast } from "@/hooks/use-toast"
import { exportToExcel } from "@/lib/utils" // Adjust path if needed
import { Loader2 } from "lucide-react"

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
  
  // State for the modal form
  const [groupBy, setGroupBy] = useState("kelas");
  const [filters, setFilters] = useState<CurrentFilters>(currentFilters);
  const [isExporting, setIsExporting] = useState(false);

  const handleFilterChange = (key: keyof CurrentFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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
      
      exportToExcel(data, `export_by_${groupBy}`);
      
      toast({ title: "Ekspor Berhasil", description: "File Excel sedang diunduh." });
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
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Ekspor Data Siswa ke Excel</DialogTitle>
          <DialogDescription>
            Pilih cara pengelompokan dan sesuaikan filter sebelum mengekspor data.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Group By Selector */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger className="col-span-4">
                <SelectValue placeholder="Pilih pengelompokan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Tidak Ada</SelectItem>
                <SelectItem value="kelas">Berdasarkan Kelas</SelectItem>
                <SelectItem value="kelompok">Berdasarkan Kelompok</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
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