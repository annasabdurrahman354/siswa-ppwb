import type { Siswa } from "@/types/siswa"

export function generatePrintDocument(
  siswa: Siswa,
  type: "cocard-depan" | "cocard-belakang" | "stiker",
): Window | null {
  let htmlContent = ""
  let title = ""

  switch (type) {
    case "cocard-depan":
      htmlContent = generateCocardDepan(siswa)
      title = `Cocard Depan - ${siswa.nama || "Unknown"}`
      break
    case "cocard-belakang":
      htmlContent = generateCocardBelakang(siswa)
      title = `Cocard Belakang - ${siswa.nama || "Unknown"}`
      break
    case "stiker":
      htmlContent = generateStikerIdentitas(siswa)
      title = `Stiker Identitas - ${siswa.nama || "Unknown"}`
      break
    default:
      return null
  }

  const printWindow = window.open("", "_blank")
  if (!printWindow) return null

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `)

  printWindow.document.close()
  return printWindow
}

function generateCocardDepan(siswa: Siswa): string {
  const photoUrl = siswa.foto_siswa || "/images/print_assets/placeholder_person.png"
  const studentName = (siswa.nama || "").toUpperCase()
  const studentId = siswa.nis || siswa.nispn || ""

  return `
    <style>
      @page {
        size: 5.4cm 8.5cm;
        margin: 0;
      }
      
      body {
        margin: 0;
        padding: 0;
        font-family: 'Gotham', 'Calibri', Arial, sans-serif;
        background-image: url('/images/print_assets/cocard.PNG');
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        width: 5.4cm;
        height: 8.5cm;
        position: relative;
      }
      
      .photo-container {
        position: absolute;
        top: 2.2cm;
        left: 50%;
        transform: translateX(-50%);
        width: 2.4cm;
        height: 3.2cm;
        overflow: hidden;
        border-radius: 4px;
      }
      
      .photo {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .name-container {
        position: absolute;
        top: 5.8cm;
        left: 50%;
        transform: translateX(-50%);
        width: 4.8cm;
        text-align: center;
      }
      
      .student-name {
        font-size: 10px;
        font-weight: bold;
        color: #000;
        line-height: 1.2;
        word-wrap: break-word;
      }
      
      .student-id {
        position: absolute;
        top: 6.5cm;
        left: 50%;
        transform: translateX(-50%);
        font-size: 9px;
        font-weight: bold;
        color: #000;
        text-align: center;
      }
    </style>
    
    <div class="photo-container">
      <img src="${photoUrl}" alt="Student Photo" class="photo" crossorigin="anonymous">
    </div>
    
    <div class="name-container">
      <div class="student-name">${studentName}</div>
    </div>
    
    <div class="student-id">${studentId}</div>
  `
}

function generateCocardBelakang(siswa: Siswa): string {
  const studentId = siswa.nis || siswa.nispn || ""
  const studentName = (siswa.nama || "").toUpperCase()
  const studentAddress = siswa.alamat_lengkap || ""

  return `
    <style>
      @page {
        size: 54.5mm 85.6mm;
        margin: 0;
      }
      
      body {
        margin: 0;
        padding: 0;
        font-family: 'Gotham', 'Calibri', Arial, sans-serif;
        background-image: url('/images/print_assets/cocard_belakang.png');
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        width: 54.5mm;
        height: 85.6mm;
        position: relative;
      }
      
      .content-table {
        position: absolute;
        top: 25mm;
        left: 4mm;
        width: 46mm;
        font-size: 7px;
        color: #000;
      }
      
      .content-table table {
        width: 100%;
        border-collapse: collapse;
      }
      
      .content-table td {
        padding: 1mm 0;
        vertical-align: top;
        line-height: 1.2;
      }
      
      .label {
        font-weight: bold;
        width: 15mm;
      }
      
      .colon {
        width: 2mm;
        text-align: center;
      }
      
      .value {
        font-weight: normal;
        word-wrap: break-word;
      }
      
      .address-cell {
        height: 20mm;
        vertical-align: top;
      }
    </style>
    
    <div class="content-table">
      <table>
        <tr>
          <td class="label">No Induk</td>
          <td class="colon">:</td>
          <td class="value">${studentId}</td>
        </tr>
        <tr>
          <td class="label">Nama</td>
          <td class="colon">:</td>
          <td class="value">${studentName}</td>
        </tr>
        <tr>
          <td class="label">Alamat</td>
          <td class="colon">:</td>
          <td class="value address-cell">${studentAddress}</td>
        </tr>
      </table>
    </div>
  `
}

function generateStikerIdentitas(siswa: Siswa): string {
  const studentName = siswa.nama || ""
  const studentAddress = siswa.alamat_lengkap || ""
  const kelompokSambung = siswa.kelompok_sambung || ""
  const daerahSambung = siswa.daerah_sambung || ""

  return `
    <style>
      @page {
        size: A4;
        margin: 10mm;
      }
      
      body {
        margin: 0;
        padding: 0;
        font-family: 'Gotham', 'Calibri', Arial, sans-serif;
        background-image: url('/images/print_assets/Stiker Fix.jpg');
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
      }
      
      .sticker-sheet {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 5mm;
      }
      
      .large-stickers {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 5mm;
        margin-bottom: 10mm;
      }
      
      .large-sticker {
        border: 1px solid #ccc;
        padding: 8mm;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 3mm;
        font-size: 10px;
        line-height: 1.4;
        height: 40mm;
      }
      
      .small-stickers {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 3mm;
      }
      
      .small-sticker {
        border: 1px solid #ccc;
        padding: 4mm;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 2mm;
        font-size: 8px;
        text-align: center;
        line-height: 1.3;
        height: 20mm;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      
      .sticker-field {
        margin-bottom: 2mm;
      }
      
      .field-label {
        font-weight: bold;
        color: #333;
      }
      
      .field-value {
        color: #000;
        word-wrap: break-word;
      }
      
      .center-text {
        text-align: center;
      }
    </style>
    
    <div class="sticker-sheet">
      <!-- Large Stickers (2x2 layout) -->
      <div class="large-stickers">
        ${Array(4)
          .fill(0)
          .map(
            () => `
          <div class="large-sticker">
            <div class="sticker-field">
              <div class="field-label">NAMA:</div>
              <div class="field-value">${studentName}</div>
            </div>
            <div class="sticker-field">
              <div class="field-label">ALAMAT:</div>
              <div class="field-value">${studentAddress}</div>
            </div>
            <div class="sticker-field">
              <div class="field-label">KELOMPOK:</div>
              <div class="field-value">${kelompokSambung}</div>
            </div>
            <div class="sticker-field">
              <div class="field-label">DAERAH:</div>
              <div class="field-value">${daerahSambung}</div>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
      
      <!-- Small Stickers (1x4 layout) -->
      <div class="small-stickers">
        ${Array(8)
          .fill(0)
          .map(
            () => `
          <div class="small-sticker">
            <div class="sticker-field center-text">
              <div class="field-label">NAMA:</div>
              <div class="field-value">${studentName}</div>
            </div>
            <div class="sticker-field center-text">
              <div class="field-label">DAERAH:</div>
              <div class="field-value">${daerahSambung}</div>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  `
}
