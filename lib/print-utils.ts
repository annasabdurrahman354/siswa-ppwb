import { PaymentTransaction } from "@/types/payment"
import type { Siswa } from "@/types/siswa"
import { terbilang, formatRupiah } from "./terbilang"

export function generatePrintDocument(
  data: Siswa | { siswa: Siswa; transaction: PaymentTransaction }, // Union type
  type: "cocard-depan" | "cocard-belakang" | "stiker" | "nota",
): Window | null {
  let title = "";
  let siswaData = data as Siswa; // Cast because other types only take Siswa
  let pembayaranData = data as { siswa: Siswa; transaction: PaymentTransaction }

  if (type === "nota") {
    if (!('transaction' in data)) {
      console.error("Transaction data is required for nota printing.");
      return null;
    }
    //htmlContent = generateNotaHTML(data.siswa, data.transaction);
    title = `Nota Pembayaran - ${data.siswa.nama || "Unknown"}`;
  } else {
    switch (type) {
      case "cocard-depan":
        //htmlContent = generateCocardDepan(siswaData);
        title = `Cocard Depan - ${siswaData.nama || "Unknown"}`;
        break;
      case "cocard-belakang":
        //htmlContent = generateCocardBelakang(siswaData);
        title = `Cocard Belakang - ${siswaData.nama || "Unknown"}`;
        break;
      case "stiker":
        //htmlContent = generateStikerIdentitas(siswaData);
        title = `Stiker Identitas - ${siswaData.nama || "Unknown"}`;
        break;
      default:
        return null;
    }
  }
  

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Gagal membuka jendela print. Pastikan popup blocker tidak aktif.");
    return null;
  }

  if (type == "cocard-depan") {
    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Untitled Document</title>
        <style type="text/css">
            @page {
                size: 5.4cm 8.5cm;
                margin: 0;
            }
        </style>
    </head>
    <body style="margin: 0; padding: 0;">
        <div style="width: 5.4cm; height: 8.5cm; page-break-after: always;">
            <table width="212" height="329" border="0" cellpadding="0" cellspacing="0">
                <tbody>
                    <tr>
                        <td valign="bottom" background="/print_assets/cocard_depan.png" style="background-repeat: no-repeat; height: 50px; width: 50px; background-size: 100% 329px;">
                            <table width="98%" height="200" border="0" cellpadding="0" cellspacing="0">
                                <tbody>
                                    <tr>
                                        <td valign="top">
                                            <div style="margin-left: 50px; margin-right: auto; margin-top: -23px;">
                                                <img src="${siswaData.foto_siswa}" alt="no_pic" width="114" height="152">
                                            </div> 
                                            <!-- Menambahkan kontainer untuk nama -->
                                            <div style="text-align: center; margin-top: 0px;">
                                                <strong><span style="font-family: 'Times New Roman', Times, serif; font-size: 12px;">${siswaData.nama}</span></strong>
                                            </div>
                                            <!-- Menambahkan kontainer untuk NIS -->
                                            <div style="text-align: center; margin-top: 0px;">
                                                <span style="font-family: 'Times New Roman', Times, serif; font-size: 12px;">${siswaData.nispn}</span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </body>
    </html>
    `);

    printWindow.document.close();
    return printWindow;
  }

  else if (type == "cocard-belakang") {
    printWindow.document.write(`
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>${title}</title>
        <style type="text/css">
            @page {
                size: CR80 potrait;
                margin: 0;
            }
        </style>
    </head>

    <body style="margin: 0; padding: 0;">

    <div style="width: 54.5mm; height: 85.6mm; page-break-after: always; background-image: url('/print_assets/cocard_belakang.png'); background-size: cover; background-repeat: no-repeat;">
        <table border="0" style="font-size: 10px; font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, sans-serif; width: 100%;"> 
            <tbody>
                <tr>
                    <td>
                        <div align="center">
                            <table width="100%" height="100%" border="0" cellpadding="0" cellspacing="0">
                                <tbody>
                                    <tr>
                                        <td valign="top">
                                            <br><br><br>
                                            <table width="100%" height="100%" border="0" cellpadding="0" cellspacing="0">
                                                <tbody>
                                                    <tr>
                                                        <td width="56" height="15" valign="top">No Induk</td>
                                                        <td width="3" valign="top">:</td>
                                                        <td width="117" valign="top">${siswaData.nispn}</td>
                                                    </tr>
                                                    <tr>
                                                        <td height="15" valign="top">Nama</td>
                                                        <td valign="top">:</td>
                                                        <td valign="top">${siswaData.nama}</td>
                                                    </tr>
                                                    <tr>
                                                        <td height="15" valign="top">Alamat</td>
                                                        <td valign="top">:</td>
                                                        <td valign="top" align="left" height="82">${siswaData.alamat_lengkap}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    </body>
    </html>     
    `);

    printWindow.document.close();
    return printWindow;
  }

  else if (type == "stiker") {  
    printWindow.document.write(`

    `);
    printWindow.document.close();
    return printWindow;
  }

  else {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <style type="text/css">
              @page {
                  size: A4;
                  margin: 10mm;
              }
          </style>
      </head>
      <body style="margin: 0; padding: 0;">
      </body>
      </html>
    `);

    printWindow.document.close();
    return printWindow;
  } 
}

function generateNotaHTML(siswa: Siswa, transaction: PaymentTransaction): string {
  const transactionDate = new Date(transaction.transaction_date).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  const gunaPembayaran = Array.from(new Set(transaction.items.map(item => item.category_name))).join(', ');

  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <title>Nota Pembayaran - ${siswa.nama}</title>
        <style>
            @page { size: 210mm 148mm; margin: 5mm; } /* A5 Landscape, adjust if nota is half A4 portrait */
            body { font-family: 'Arial', 'Helvetica', sans-serif; font-size: 10pt; line-height: 1.4; color: #000; margin:0; padding:0; }
            .nota-container { display: flex; width: 100%; height: 100%; border: 1px solid #ccc; }
            .main-nota { flex: 0 0 70%; padding: 10mm; box-sizing: border-box; position: relative; border-right: 1px dashed #ccc;}
            .slip-nota { flex: 0 0 30%; padding: 10mm 8mm; box-sizing: border-box; position: relative; }

            .header { text-align: center; margin-bottom: 8mm; }
            .header img { width: 40mm; margin-bottom: 2mm; }
            .header h1 { font-size: 12pt; margin: 0; font-weight: bold; }
            .header p { font-size: 8pt; margin: 1mm 0; }

            .nota-details, .slip-details { margin-bottom: 5mm; }
            .nota-details table, .slip-details table { width: 100%; border-collapse: collapse; font-size: 9pt; }
            .nota-details td, .slip-details td { padding: 1mm 0; vertical-align: top; }
            .label { width: 30%; }
            .value { width: 68%; }
            .colon { width: 2%; text-align: center;}

            .payment-info { margin-top: 8mm; }
            .terbilang { font-style: italic; margin-bottom: 2mm; font-size: 9pt;}
            .total-box { border: 1px solid #000; padding: 2mm 3mm; text-align: center; font-weight: bold; font-size: 11pt; margin-bottom: 5mm; }
            .signature-area { margin-top: 10mm; font-size: 9pt; }
            .signature-area .petugas { float: right; text-align: center; }
            .signature-area .petugas .name { margin-top: 10mm; }

            .slip-header { text-align: center; margin-bottom: 5mm; }
            .slip-header h2 { font-size: 10pt; margin:0; font-weight: bold; }
            .slip-items table { width: 100%; font-size: 8pt; margin-top: 3mm; }
            .slip-items th, .slip-items td { text-align: left; padding: 1mm; border-bottom: 1px solid #eee; }
            .slip-items th { font-weight: bold; }
            .slip-items td.amount { text-align: right; }
            .slip-total { margin-top: 3mm; text-align: right; font-weight: bold; font-size: 9pt;}

            .clearfix::after { content: ""; clear: both; display: table; }
        </style>
    </head>
    <body>
        <div class="nota-container">
            <div class="main-nota">
                <div class="header">
                    <h1>BUKTI PEMBAYARAN</h1>
                    <p>Jl. Raya Kejapanan No. 27 Kejapanan, Gempol, Pasuruan (67155)</p>
                </div>

                <div class="nota-details">
                    <table>
                        <tr>
                            <td class="label">Telah terima dari</td><td class="colon">:</td><td class="value">${siswa.nama || '-'}</td>
                        </tr>
                        <tr>
                            <td class="label">NIS / NISPN</td><td class="colon">:</td><td class="value">${siswa.nis || '-'} / ${siswa.nispn || '-'}</td>
                        </tr>
                        <tr>
                            <td class="label">Alamat</td><td class="colon">:</td><td class="value">${siswa.alamat_lengkap || '-'}</td>
                        </tr>
                        <tr>
                            <td class="label">Guna Pembayaran</td><td class="colon">:</td><td class="value">${gunaPembayaran}</td>
                        </tr>
                    </table>
                </div>

                <div class="payment-info">
                    <div class="terbilang">Terbilang: ${terbilang(transaction.total_amount)}</div>
                    <div class="total-box">Total Bayar: ${formatRupiah(transaction.total_amount)}</div>
                </div>

                <div class="signature-area clearfix">
                    <div class="petugas">
                        Pasuruan, ${transactionDate}<br>
                        Petugas,<br><br><br><br>
                        <span class="name">( ${transaction.processed_by_petugas} )</span>
                    </div>
                </div>
            </div>

            <div class="slip-nota">
                <div class="slip-header">
                    <h2>TANDA TERIMA</h2>
                </div>
                <div class="slip-details">
                    <table>
                        <tr><td>Tanggal</td><td class="colon">:</td><td>${transactionDate}</td></tr>
                        <tr><td>Nama</td><td class="colon">:</td><td>${siswa.nama || '-'}</td></tr>
                        <tr><td>NISPN</td><td class="colon">:</td><td>${siswa.nispn || '-'}</td></tr>
                         <tr><td>Petugas</td><td class="colon">:</td><td>${transaction.processed_by_petugas}</td></tr>
                    </table>
                </div>
                <div class="slip-items">
                    <table>
                        <thead><tr><th>Keterangan</th><th>Jumlah</th></tr></thead>
                        <tbody>
                            ${transaction.items.map(item => `
                                <tr>
                                    <td>${item.description_for_nota}</td>
                                    <td class="amount">${formatRupiah(item.amount)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="slip-total">
                    Total: ${formatRupiah(transaction.total_amount)}
                </div>
                 <div style="font-size: 7pt; text-align:center; margin-top:10mm;">Simpanlah slip ini sebagai bukti pembayaran yang sah.</div>
            </div>
        </div>
    </body>
    </html>
  `;
}

function generateCocardDepan(siswa: Siswa): string {
  const photoUrl = siswa.foto_siswa || "/print_assets/placeholder_person.png"
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
        background-image: url('/print_assets/cocard_depan.png');
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
        background-image: url('/print_assets/cocard_belakang.png');
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
        background-image: url('/print_assets/Stiker Fix.jpg');
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
