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

// Document export function for printable pages
export const exportToDocument = (apiData: GroupedSiswaData, fileName: string, selectedFields: string[], groupBy: string, includeCustomColumn: boolean = false, customColumnName: string = "") => {
 // Create a new window for printing
 const printWindow = window.open('', '_blank');
 if (!printWindow) return;

 // Get field labels for display
 const fieldLabels: Record<string, string> = {
   'tanggal_mendaftar': 'Tanggal Mendaftar',
   'nispn': 'NISPN',
   'nis': 'NIS',
   'nama': 'Nama Lengkap',
   'jenis_kelamin': 'L/P',
   'kelas': 'Kelas',
   'kelompok': 'Kelompok',
   'tanggal_masuk_kelas': 'Tanggal Masuk Kelas',
   'tanggal_masuk_kelompok': 'Tanggal Masuk Kelompok',
   'nik': 'NIK',
   'kk': 'KK',
   'rfid': 'RFID',
   'status_mondok': 'Status Mondok',
   'daerah_kiriman': 'Daerah Kiriman',
   'daerah_sambung': 'Daerah Sambung',
   'desa_sambung': 'Desa Sambung',
   'kelompok_sambung': 'Kelompok Sambung',
   'tempat_lahir': 'Tempat Lahir',
   'tanggal_lahir': 'Tanggal Lahir',
   'umur': 'Umur',
   'alamat_lengkap': 'Alamat Lengkap',
   'rt': 'RT',
   'rw': 'RW',
   'desa_kel': 'Desa/Kel',
   'kecamatan': 'Kecamatan',
   'kota_kab': 'Kota/Kab',
   'provinsi': 'Provinsi',
   'kode_pos': 'Kode Pos',
   'nama_ayah': 'Nama Ayah',
   'nama_ibu': 'Nama Ibu',
   'foto_siswa': 'Foto Siswa',
   'pendidikan': 'Pendidikan',
   'jurusan': 'Jurusan'
 };

 const selectedFieldLabels = selectedFields.map(field => fieldLabels[field] || field);

 // Add custom column to headers if enabled
 const tableHeaders = [...selectedFieldLabels];
 if (includeCustomColumn && customColumnName.trim()) {
   tableHeaders.push(customColumnName.trim());
 }

 // Generate HTML content
 const htmlContent = `
   <!DOCTYPE html>
   <html>
   <head>
     <title>Data Siswa PPWB</title>
     <style>
       @media print {
        @page {
          size: A4;
          margin: 20mm;
        }
        .page-break {
          page-break-before: always;
        }
        .no-print {
          display: none;
        }
        thead {
          display: table-header-group;
        }
        tbody {
          display: table-row-group;
        }
       }
       body {
         font-family: Arial, sans-serif;
         font-size: 12px;
         line-height: 1.4;
         padding: 20px;
       }
      
       .group-title {
         font-size: 16px;
         font-weight: bold;
         margin-bottom: 10px;
         text-align: center;
         background-color: #f5f5f5;
         padding: 10px;
         border: 1px solid #ddd;
       }
       table {
         width: 100%;
         border-collapse: collapse;
         margin-bottom: 20px;
       }
       th, td {
         border: 1px solid #333;
         padding: 6px;
         text-align: left;
         vertical-align: top;
       }
       th {
         background-color: #f0f0f0;
         font-weight: bold;
         text-align: center;
       }
       .no-column {
         width: 40px;
         text-align: center;
       }
       .center {
         text-align: center;
       }
     </style>
   </head>
   <body>
      <button class="no-print" onclick="window.print()">Cetak Dokumen</button>

     ${Object.keys(apiData).map((groupName, groupIndex) => {
       const studentData = apiData[groupName];
       return `
         <div ${groupIndex > 0 ? 'class="page-break"' : ''}>
           <div class="group-title">${groupName}</div>
           <table>
             <thead>
               <tr>
                 <th class="no-column">No</th>
                 ${tableHeaders.map(field => `<th>${field}</th>`).join('')}
               </tr>
             </thead>
             <tbody>
               ${studentData.map((siswa, index) => `
                 <tr>
                   <td class="no-column center">${index + 1}</td>
                   ${selectedFields.map(field => {
                     const value = siswa[field as keyof Siswa] || '-';
                     if (field === 'jenis_kelamin') {
                       return `<td class="center">${value === 'L' ? 'L' : value === 'P' ? 'P' : value}</td>`;
                     }
                     return `<td>${value}</td>`;
                   }).join('')}
                   ${includeCustomColumn && customColumnName.trim() ? '<td></td>' : ''}
                 </tr>
               `).join('')}
             </tbody>
           </table>
         </div>
       `;
     }).join('')}
   </body>
   </html>
 `;

 printWindow.document.write(htmlContent);
 printWindow.document.close();
};
