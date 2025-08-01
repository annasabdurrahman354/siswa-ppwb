import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import * as XLSX from 'xlsx';
import type { Siswa } from '@/types/siswa';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// A more specific type for the export API response
type GroupedSiswaData = Record<string, Siswa[]>;

export const exportToExcel = (apiData: GroupedSiswaData, fileName: string) => {
  // 1. Create a new workbook
  const workbook = XLSX.utils.book_new();

  // 2. Iterate over each group in the data (e.g., "Kelas A", "Kelas B")
  Object.keys(apiData).forEach(groupName => {
    const studentData = apiData[groupName];
    
    // Sanitize sheet name (Excel has a 31 char limit and doesn't like certain chars)
    const sanitizedSheetName = groupName.substring(0, 31).replace(/[:\\/?*[\]]/g, "");

    // Internal keys matching the Siswa interface
    const headers = [
      'tanggal_mendaftar', 'nispn', 'nis', 'nama', 'jenis_kelamin', 'kelas', 'kelompok', 'tanggal_masuk_kelas', 'tanggal_masuk_kelompok', 'nik', 'kk', 'rfid', 'status_mondok', 
      'daerah_kiriman', 'daerah_sambung', 'desa_sambung', 'kelompok_sambung',
      'tempat_lahir', 'tanggal_lahir', 'umur', 'alamat_lengkap',
      'rt', 'rw', 'desa_kel', 'kecamatan', 'kota_kab', 'provinsi', 'kode_pos',
      'nama_ayah', 'nama_ibu', 'foto_siswa', 'pendidikan', 'jurusan'
    ];

    // User-friendly header row for Excel export
    const headerRow = [
      'Tanggal Mendaftar', 'NISPN', 'NIS', 'Nama Lengkap', 'L/P', 'Kelas', 'Kelompok', 'Tanggal Masuk Kelas', 'Tanggal Masuk Kelompok', 'NIK', 'KK', 'RFID', 'Status Mondok',
      'Daerah Kiriman', 'Daerah Sambung', 'Desa Sambung', 'Kelompok Sambung',
      'Tempat Lahir', 'Tanggal Lahir', 'Umur', 'Alamat Lengkap',
      'RT', 'RW', 'Desa/Kel', 'Kecamatan', 'Kota/Kab', 'Provinsi', 'Kode Pos',
      'Nama Ayah', 'Nama Ibu', 'Foto Siswa', 'Pendidikan', 'Jurusan'
    ];

    // 4. Map the student data to an array of arrays, matching the header order.
    const dataForSheet = studentData.map(siswa => 
        headers.map(header => siswa[header as keyof Siswa] ?? '-')
    );

    // 5. Create a worksheet, starting with the header row.
    const worksheet = XLSX.utils.aoa_to_sheet([headerRow, ...dataForSheet]);
    
    // Optional: Auto-fit column widths
    const columnWidths = headerRow.map((_, i) => {
        const maxLength = Math.max(
            headerRow[i].length,
            ...dataForSheet.map(row => String(row[i]).length)
        );
        return { wch: maxLength + 2 }; // +2 for a little padding
    });
    worksheet['!cols'] = columnWidths;

    // 6. Append the worksheet to the workbook with the sanitized group name
    XLSX.utils.book_append_sheet(workbook, worksheet, sanitizedSheetName);
  });

  // 7. Trigger the download
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
