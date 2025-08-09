import { PaymentTransaction } from "@/types/payment"
import type { Siswa } from "@/types/siswa"
import { terbilang, formatRupiah } from "./terbilang"

// Helper to generate HTML for the front of the cocard
function generateCocardDepanHTML(siswa: Siswa, siteUrl: string): string {
  // A slightly improved layout for better alignment
  var namaSiswa = siswa.nama.toUpperCase();
  return `
    <div style="width: 5.4cm; height: 8.5cm; page-break-after: always;">
      <table width="212" height="329" border="0" cellpadding="0" cellspacing="0">
          <tbody>
              <tr>
                  <td valign="bottom" background="${siteUrl}/print_assets/cocard_depan.png" style="background-repeat: no-repeat; height: 50px; width: 50px; background-size: 100% 329px;">
                      <table width="98%" height="200" border="0" cellpadding="0" cellspacing="0">
                          <tbody>
                              <tr>
                                  <td valign="top">
                                      <div style="margin-left: 50px; margin-right: auto; margin-top: -23px;">
                                          <img src="${(siswa.foto_siswa ?? '').startsWith('http') ? (siswa.foto_siswa ?? '') : siteUrl + (siswa.foto_siswa ?? '/print_assets/placeholder_person.png')}" alt="no_pic" width="114" height="152">
                                      </div> 
                                      <!-- Menambahkan kontainer untuk nama -->
                                      <div style="text-align: center; margin-top: 0px;">
                                          <strong><span style="font-family: 'Times New Roman', Times, serif; font-size: 12px;">${namaSiswa}</span></strong>
                                      </div>
                                      <!-- Menambahkan kontainer untuk NIS -->
                                      <div style="text-align: center; margin-top: 0px;">
                                          <span style="font-family: 'Times New Roman', Times, serif; font-size: 12px;">${siswa.nispn}</span>
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
  `;
}

// Helper to generate HTML for the back of the cocard
function generateCocardBelakangHTML(siswa: Siswa, siteUrl: string): string {
    return `
    <div style="width: 54.5mm; height: 85.6mm; page-break-after: always; background-image: url('${siteUrl}/print_assets/cocard_belakang.png'); background-size: cover; background-repeat: no-repeat;">
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
                                                      <td width="117" valign="top">${siswa.nispn}</td>
                                                  </tr>
                                                  <tr>
                                                      <td height="15" valign="top">Nama</td>
                                                      <td valign="top">:</td>
                                                      <td valign="top">${siswa.nama}</td>
                                                  </tr>
                                                  <tr>
                                                      <td height="15" valign="top">Alamat</td>
                                                      <td valign="top">:</td>
                                                      <td valign="top" align="left" height="82">${siswa.alamat_lengkap}</td>
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
    `;
}

// New function for bulk printing cocards
export function generateBulkPrintDocument(
  students: Siswa[],
  type: "cocard-depan" | "cocard-belakang",
): void {
    const siteUrl = window.location.origin;
    let title = "";
    let allHtmlContent = "";

    if (type === "cocard-depan") {
        title = `Bulk Cocard Depan - ${students.length} Siswa`;
        allHtmlContent = students.map(s => generateCocardDepanHTML(s, siteUrl)).join('');
    } else if (type === "cocard-belakang") {
        title = `Bulk Cocard Belakang - ${students.length} Siswa`;
        allHtmlContent = students.map(s => generateCocardBelakangHTML(s, siteUrl)).join('');
    } else {
        return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
        alert("Gagal membuka jendela print. Pastikan popup blocker tidak aktif.");
        return;
    }

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>${title}</title>
        <style type="text/css">
            @page {
                size: 5.4cm 8.5cm;
                margin: 0;
            }
            body { margin: 0; padding: 0; }
        </style>
    </head>
    <body>
        ${allHtmlContent}
    </body>
    </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        try {
            printWindow.print();
        } catch (e) {
            console.error("Printing failed:", e);
            printWindow.alert("Gagal memulai proses cetak.");
        }
    }, 500);
}


export function generatePrintDocument(
  data: Siswa | { siswa: Siswa; transaction: PaymentTransaction }, // Union type
  type: "cocard-depan" | "cocard-belakang" | "stiker" | "nota",
): Window | null {
  let title = "";
  let siswaData = data as Siswa; // Cast because other types only take Siswa
  let pembayaranData = data as { siswa: Siswa; transaction: PaymentTransaction }

  // Get the current site URL
  const siteUrl = window.location.origin;

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
    var namaSiswa = siswaData.nama.toUpperCase();
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
                        <td valign="bottom" background="${siteUrl}/print_assets/cocard_depan.png" style="background-repeat: no-repeat; height: 50px; width: 50px; background-size: 100% 329px;">
                            <table width="98%" height="200" border="0" cellpadding="0" cellspacing="0">
                                <tbody>
                                    <tr>
                                        <td valign="top">
                                            <div style="margin-left: 50px; margin-right: auto; margin-top: -23px;">
                                                <img src="${(siswaData.foto_siswa ?? '').startsWith('http') ? (siswaData.foto_siswa ?? '') : siteUrl + (siswaData.foto_siswa ?? '/print_assets/placeholder_person.png')}" alt="no_pic" width="114" height="152">
                                            </div> 
                                            <!-- Menambahkan kontainer untuk nama -->
                                            <div style="text-align: center; margin-top: 0px;">
                                                <strong><span style="font-family: 'Times New Roman', Times, serif; font-size: 12px;">${namaSiswa}</span></strong>
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
      <div style="width: 54.5mm; height: 85.6mm; page-break-after: always; background-image: url('${siteUrl}/print_assets/cocard_belakang.png'); background-size: cover; background-repeat: no-repeat;">
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
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <!-- saved from url=(0080)http://192.168.110.2/walibarokah/app/report/cetak_kartu_ujian.php?nis=0020580525 -->
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
          <title>Untitled Document</title>
          <style type="text/css">
            <!--
                .style1 { font:calibri; font-size:15px}
                .td{ font:calibri;}
                .bgsize {
                background-repeat:no-repeat;
                height:50px;
                width:50px;
                background-position:center;
                background-size: 87%;}
                .bgsize2 {
                background-repeat:no-repeat;
                height:50px;
                width:50px;
                background-size: 87%;}
                -->
          </style>
          <link type="text/css" rel="stylesheet" href="chrome-extension://fheoggkfdfchfphceeifdbepaooicaho/css/mcafee_fonts.css">
      </head>
      <body>
          <table width="747" height="70%" border="0">
            <tbody>
                <tr>
                  <td width="368" height="200">
                      <div align="center">
                        <table width="345" height="200" border="1" cellpadding="0" cellspacing="0">
                            <tbody>
                              <tr>
                                  <td valign="top" background="${siteUrl}/print_assets/sticker.jpg" class="bgsize">
                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" class="style1">
                                        <tbody>
                                          <tr>
                                              <td height="64" colspan="5"></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" width="17%"><strong><font face="calibri">&nbsp;NAMA </font></strong></td>
                                              <td valign="top" width="2%"><strong>:</strong></td>
                                              <td valign="top"> <strong><font face="calibri">${siswaData.nama}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" height="1"> <strong><font face="calibri">&nbsp;ALAMAT</font></strong></td>
                                              <td valign="top"><strong>:</strong></td>
                                              <td width="81%"> <strong><font face="calibri">${siswaData.alamat_lengkap}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" height="1"><strong><font face="calibri">&nbsp;KELOMPOK</font></strong></td>
                                              <td valign="top"><strong>:</strong></td>
                                              <td valign="top"> <strong><font face="calibri">${siswaData.kelompok_sambung}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" height="1"><strong><font face="calibri">&nbsp;DAERAH</font></strong></td>
                                              <td><strong>:</strong></td>
                                              <td rowspan="1" valign="top"> <strong><font face="calibri">${siswaData.daerah_sambung}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td colspan="2" style="font-size:12pt;font-family:Calibri"> </td>
                                          </tr>
                                        </tbody>
                                    </table>
                                  </td>
                              </tr>
                            </tbody>
                        </table>
                      </div>
                  </td>
                  <td>
                      <div align="center">
                        <table width="345" height="200" border="1" cellpadding="0" cellspacing="0">
                            <tbody>
                              <tr>
                                  <td valign="top" background="${siteUrl}/print_assets/sticker.jpg" class="bgsize" width="110%">
                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" class="style1">
                                        <tbody>
                                          <tr>
                                              <td height="64" colspan="5"></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" width="17%"><strong><font face="calibri">&nbsp;NAMA </font></strong></td>
                                              <td valign="top" width="2%"><strong>:</strong></td>
                                              <td valign="top"> <strong><font face="calibri">${siswaData.nama}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" height="1"> <strong><font face="calibri">&nbsp;ALAMAT</font></strong></td>
                                              <td valign="top"><strong>:</strong></td>
                                              <td width="81%"> <strong><font face="calibri">${siswaData.alamat_lengkap}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" height="1"><strong><font face="calibri">&nbsp;KELOMPOK</font></strong></td>
                                              <td valign="top"><strong>:</strong></td>
                                              <td valign="top"> <strong><font face="calibri">${siswaData.kelompok_sambung}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" height="1"><strong><font face="calibri">&nbsp;DAERAH</font></strong></td>
                                              <td><strong>:</strong></td>
                                              <td rowspan="1" valign="top"> <strong><font face="calibri">${siswaData.daerah_sambung}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td colspan="2" style="font-size:12pt;font-family:Calibri"> </td>
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
          <table width="747" height="70%" border="0">
            <tbody>
                <tr>
                  <td width="368" height="200">
                      <div align="center">
                        <table width="345" height="200" border="1" cellpadding="0" cellspacing="0">
                            <tbody>
                              <tr>
                                  <td valign="top" background="${siteUrl}/print_assets/sticker.jpg" class="bgsize">
                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" class="style1">
                                        <tbody>
                                          <tr>
                                              <td height="64" colspan="5"></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" width="17%"><strong><font face="calibri">&nbsp;NAMA </font></strong></td>
                                              <td valign="top" width="2%"><strong>:</strong></td>
                                              <td valign="top"> <strong><font face="calibri">${siswaData.nama}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" height="1"> <strong><font face="calibri">&nbsp;ALAMAT</font></strong></td>
                                              <td valign="top"><strong>:</strong></td>
                                              <td width="81%"> <strong><font face="calibri">${siswaData.alamat_lengkap}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" height="1"><strong><font face="calibri">&nbsp;KELOMPOK</font></strong></td>
                                              <td valign="top"><strong>:</strong></td>
                                              <td valign="top"> <strong><font face="calibri">${siswaData.kelompok_sambung}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" height="1"><strong><font face="calibri">&nbsp;DAERAH</font></strong></td>
                                              <td><strong>:</strong></td>
                                              <td rowspan="1" valign="top"> <strong><font face="calibri">${siswaData.daerah_sambung}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td colspan="2" style="font-size:12pt;font-family:Calibri"> </td>
                                          </tr>
                                        </tbody>
                                    </table>
                                  </td>
                              </tr>
                            </tbody>
                        </table>
                      </div>
                  </td>
                  <td>
                      <div align="center">
                        <table width="345" height="200" border="1" cellpadding="0" cellspacing="0">
                            <tbody>
                              <tr>
                                  <td valign="top" background="${siteUrl}/print_assets/sticker.jpg" class="bgsize" width="110%">
                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" class="style1">
                                        <tbody>
                                          <tr>
                                              <td height="64" colspan="5"></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" width="17%"><strong><font face="calibri">&nbsp;NAMA </font></strong></td>
                                              <td valign="top" width="2%"><strong>:</strong></td>
                                              <td valign="top"> <strong><font face="calibri">${siswaData.nama}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" height="1"> <strong><font face="calibri">&nbsp;ALAMAT</font></strong></td>
                                              <td valign="top"><strong>:</strong></td>
                                              <td width="81%"> <strong><font face="calibri">${siswaData.alamat_lengkap}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" height="1"><strong><font face="calibri">&nbsp;KELOMPOK</font></strong></td>
                                              <td valign="top"><strong>:</strong></td>
                                              <td valign="top"> <strong><font face="calibri">${siswaData.kelompok_sambung}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" height="1"><strong><font face="calibri">&nbsp;DAERAH</font></strong></td>
                                              <td><strong>:</strong></td>
                                              <td rowspan="1" valign="top"> <strong><font face="calibri">${siswaData.daerah_sambung}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td colspan="2" style="font-size:12pt;font-family:Calibri"> </td>
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
          <table width="747" height="70%" border="0">
            <tbody>
                <tr>
                  <td width="368" height="200">
                      <div align="center">
                        <table width="345" height="200" border="1" cellpadding="0" cellspacing="0">
                            <tbody>
                              <tr>
                                  <td valign="top" background="${siteUrl}/print_assets/sticker.jpg" class="bgsize">
                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" class="style1">
                                        <tbody>
                                          <tr>
                                              <td height="64" colspan="5"></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" width="17%"><strong><font face="calibri">&nbsp;NAMA </font></strong></td>
                                              <td valign="top" width="2%"><strong>:</strong></td>
                                              <td valign="top"> <strong><font face="calibri">${siswaData.nama}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" height="1"> <strong><font face="calibri">&nbsp;ALAMAT</font></strong></td>
                                              <td valign="top"><strong>:</strong></td>
                                              <td width="81%"> <strong><font face="calibri">${siswaData.alamat_lengkap}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" height="1"><strong><font face="calibri">&nbsp;KELOMPOK</font></strong></td>
                                              <td valign="top"><strong>:</strong></td>
                                              <td valign="top"> <strong><font face="calibri">${siswaData.kelompok_sambung}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" height="1"><strong><font face="calibri">&nbsp;DAERAH</font></strong></td>
                                              <td><strong>:</strong></td>
                                              <td rowspan="1" valign="top"> <strong><font face="calibri">${siswaData.daerah_sambung}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td colspan="2" style="font-size:12pt;font-family:Calibri"> </td>
                                          </tr>
                                        </tbody>
                                    </table>
                                  </td>
                              </tr>
                            </tbody>
                        </table>
                      </div>
                  </td>
                  <td>
                      <div align="center">
                        <table width="345" height="200" border="1" cellpadding="0" cellspacing="0">
                            <tbody>
                              <tr>
                                  <td valign="top" background="${siteUrl}/print_assets/sticker.jpg" class="bgsize" width="110%">
                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" class="style1">
                                        <tbody>
                                          <tr>
                                              <td height="64" colspan="5"></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" width="17%"><strong><font face="calibri">&nbsp;NAMA </font></strong></td>
                                              <td valign="top" width="2%"><strong>:</strong></td>
                                              <td valign="top"> <strong><font face="calibri">${siswaData.nama}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" height="1"> <strong><font face="calibri">&nbsp;ALAMAT</font></strong></td>
                                              <td valign="top"><strong>:</strong></td>
                                              <td width="81%"> <strong><font face="calibri">${siswaData.alamat_lengkap}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" height="1"><strong><font face="calibri">&nbsp;KELOMPOK</font></strong></td>
                                              <td valign="top"><strong>:</strong></td>
                                              <td valign="top"> <strong><font face="calibri">${siswaData.kelompok_sambung}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" height="1"><strong><font face="calibri">&nbsp;DAERAH</font></strong></td>
                                              <td><strong>:</strong></td>
                                              <td rowspan="1" valign="top"> <strong><font face="calibri">${siswaData.daerah_sambung}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td colspan="2" style="font-size:12pt;font-family:Calibri"> </td>
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
          <table width="747" height="70%" border="0">
            <tbody>
                <tr>
                  <td width="368" height="200">
                      <div align="center">
                        <table width="345" height="200" border="1" cellpadding="0" cellspacing="0">
                            <tbody>
                              <tr>
                                  <td valign="top" background="${siteUrl}/print_assets/sticker.jpg" class="bgsize">
                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" class="style1">
                                        <tbody>
                                          <tr>
                                              <td height="64" colspan="5"></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" width="17%"><strong><font face="calibri">&nbsp;NAMA </font></strong></td>
                                              <td valign="top" width="2%"><strong>:</strong></td>
                                              <td valign="top"> <strong><font face="calibri">${siswaData.nama}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" height="1"> <strong><font face="calibri">&nbsp;ALAMAT</font></strong></td>
                                              <td valign="top"><strong>:</strong></td>
                                              <td width="81%"> <strong><font face="calibri">${siswaData.alamat_lengkap}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" height="1"><strong><font face="calibri">&nbsp;KELOMPOK</font></strong></td>
                                              <td valign="top"><strong>:</strong></td>
                                              <td valign="top"> <strong><font face="calibri">${siswaData.kelompok_sambung}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" height="1"><strong><font face="calibri">&nbsp;DAERAH</font></strong></td>
                                              <td><strong>:</strong></td>
                                              <td rowspan="1" valign="top"> <strong><font face="calibri">${siswaData.daerah_sambung}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td colspan="2" style="font-size:12pt;font-family:Calibri"> </td>
                                          </tr>
                                        </tbody>
                                    </table>
                                  </td>
                              </tr>
                            </tbody>
                        </table>
                      </div>
                  </td>
                  <td>
                      <div align="center">
                        <table width="345" height="200" border="1" cellpadding="0" cellspacing="0">
                            <tbody>
                              <tr>
                                  <td valign="top" background="${siteUrl}/print_assets/sticker.jpg" class="bgsize" width="110%">
                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" class="style1">
                                        <tbody>
                                          <tr>
                                              <td height="64" colspan="5"></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" width="17%"><strong><font face="calibri">&nbsp;NAMA </font></strong></td>
                                              <td valign="top" width="2%"><strong>:</strong></td>
                                              <td valign="top"> <strong><font face="calibri">${siswaData.nama}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" height="1"> <strong><font face="calibri">&nbsp;ALAMAT</font></strong></td>
                                              <td valign="top"><strong>:</strong></td>
                                              <td width="81%"> <strong><font face="calibri">${siswaData.alamat_lengkap}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" height="1"><strong><font face="calibri">&nbsp;KELOMPOK</font></strong></td>
                                              <td valign="top"><strong>:</strong></td>
                                              <td valign="top"> <strong><font face="calibri">${siswaData.kelompok_sambung}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" height="1"><strong><font face="calibri">&nbsp;DAERAH</font></strong></td>
                                              <td><strong>:</strong></td>
                                              <td rowspan="1" valign="top"> <strong><font face="calibri">${siswaData.daerah_sambung}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td colspan="2" style="font-size:12pt;font-family:Calibri"> </td>
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
          <table width="747" height="70%" border="0">
            <tbody>
                <tr>
                  <td width="368" height="200">
                      <div align="center">
                        <table width="345" height="200" border="1" cellpadding="0" cellspacing="0">
                            <tbody>
                              <tr>
                                  <td valign="top" background="${siteUrl}/print_assets/sticker.jpg" class="bgsize">
                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" class="style1">
                                        <tbody>
                                          <tr>
                                              <td height="64" colspan="5"></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" width="17%"><strong><font face="calibri">&nbsp;NAMA </font></strong></td>
                                              <td valign="top" width="2%"><strong>:</strong></td>
                                              <td valign="top"> <strong><font face="calibri">${siswaData.nama}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" height="1"> <strong><font face="calibri">&nbsp;ALAMAT</font></strong></td>
                                              <td valign="top"><strong>:</strong></td>
                                              <td width="81%"> <strong><font face="calibri">${siswaData.alamat_lengkap}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" height="1"><strong><font face="calibri">&nbsp;KELOMPOK</font></strong></td>
                                              <td valign="top"><strong>:</strong></td>
                                              <td valign="top"> <strong><font face="calibri">${siswaData.kelompok_sambung}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" height="1"><strong><font face="calibri">&nbsp;DAERAH</font></strong></td>
                                              <td><strong>:</strong></td>
                                              <td rowspan="1" valign="top"> <strong><font face="calibri">${siswaData.daerah_sambung}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td colspan="2" style="font-size:12pt;font-family:Calibri"> </td>
                                          </tr>
                                        </tbody>
                                    </table>
                                  </td>
                              </tr>
                            </tbody>
                        </table>
                      </div>
                  </td>
                  <td>
                      <div align="center">
                        <table width="345" height="200" border="1" cellpadding="0" cellspacing="0">
                            <tbody>
                              <tr>
                                  <td valign="top" background="${siteUrl}/print_assets/sticker.jpg" class="bgsize" width="110%">
                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" class="style1">
                                        <tbody>
                                          <tr>
                                              <td height="64" colspan="5"></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" width="17%"><strong><font face="calibri">&nbsp;NAMA </font></strong></td>
                                              <td valign="top" width="2%"><strong>:</strong></td>
                                              <td valign="top"> <strong><font face="calibri">${siswaData.nama}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" height="1"> <strong><font face="calibri">&nbsp;ALAMAT</font></strong></td>
                                              <td valign="top"><strong>:</strong></td>
                                              <td width="81%"> <strong><font face="calibri">${siswaData.alamat_lengkap}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" height="1"><strong><font face="calibri">&nbsp;KELOMPOK</font></strong></td>
                                              <td valign="top"><strong>:</strong></td>
                                              <td valign="top"> <strong><font face="calibri">${siswaData.kelompok_sambung}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" height="1"><strong><font face="calibri">&nbsp;DAERAH</font></strong></td>
                                              <td><strong>:</strong></td>
                                              <td rowspan="1" valign="top"> <strong><font face="calibri">${siswaData.daerah_sambung}</font></strong></td>
                                          </tr>
                                          <tr>
                                              <td colspan="2" style="font-size:12pt;font-family:Calibri"> </td>
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
          <table width="747" height="70%" border="0">
            <tbody>
                <tr>
                  <td width="184" height="50">
                      <div align="center">
                        <table width="165" border="1" cellpadding="0" cellspacing="0">
                            <tbody>
                              <tr>
                                  <td valign="top" background="${siteUrl}/print_assets/sticker.jpg" class="bgsize2" width="90%">
                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" class="style1">
                                        <tbody>
                                          <tr>
                                              <td height="25" colspan="3"></td>
                                          </tr>
                                          <tr>
                                          </tr>
                                          <tr>
                                              <td valign="top" colspan="3">
                                                <strong><font face="calibri" size="2"></font></strong>
                                                <center>
                                                    <strong><font face="calibri" size="2">${siswaData.nama}</font></strong>
                                                    <center><strong><font face="calibri" size="2"></font></strong></center>
                                                </center>
                                              </td>
                                          </tr>
                                          <tr>
                                              <td valign="top" colspan="3">
                                                <strong><font face="calibri" size="2"></font></strong>
                                                <center>
                                                    <strong><font face="calibri" size="2">${siswaData.daerah_sambung}</font></strong>
                                                    <center><strong><font face="calibri" size="2"></font></strong></center>
                                                </center>
                                              </td>
                                          </tr>
                                        </tbody>
                                    </table>
                                  </td>
                              </tr>
                            </tbody>
                        </table>
                      </div>
                  </td>
                  <td>
                      <div align="center">
                        <table width="165" border="1" cellpadding="0" cellspacing="0">
                            <tbody>
                              <tr>
                                  <td valign="top" background="${siteUrl}/print_assets/sticker.jpg" class="bgsize2" width="90%">
                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" class="style1">
                                        <tbody>
                                          <tr>
                                              <td height="25" colspan="3"></td>
                                          </tr>
                                          <tr>
                                          </tr>
                                          <tr>
                                              <td valign="top" colspan="3">
                                                <strong><font face="calibri" size="2"></font></strong>
                                                <center>
                                                    <strong><font face="calibri" size="2">${siswaData.nama}</font></strong>
                                                    <center><strong><font face="calibri" size="2"></font></strong></center>
                                                </center>
                                              </td>
                                          </tr>
                                          <tr>
                                              <td valign="top" colspan="3">
                                                <strong><font face="calibri" size="2"></font></strong>
                                                <center>
                                                    <strong><font face="calibri" size="2">${siswaData.daerah_sambung}</font></strong>
                                                    <center><strong><font face="calibri" size="2"></font></strong></center>
                                                </center>
                                              </td>
                                          </tr>
                                        </tbody>
                                    </table>
                                  </td>
                              </tr>
                            </tbody>
                        </table>
                      </div>
                  </td>
                  <td>
                      <div align="center">
                        <table width="165" border="1" cellpadding="0" cellspacing="0">
                            <tbody>
                              <tr>
                                  <td valign="top" background="${siteUrl}/print_assets/sticker.jpg" class="bgsize2" width="90%">
                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" class="style1">
                                        <tbody>
                                          <tr>
                                              <td height="25" colspan="3"></td>
                                          </tr>
                                          <tr>
                                          </tr>
                                          <tr>
                                              <td valign="top" colspan="3">
                                                <strong><font face="calibri" size="2"></font></strong>
                                                <center>
                                                    <strong><font face="calibri" size="2">${siswaData.nama}</font></strong>
                                                    <center><strong><font face="calibri" size="2"></font></strong></center>
                                                </center>
                                              </td>
                                          </tr>
                                          <tr>
                                              <td valign="top" colspan="3">
                                                <strong><font face="calibri" size="2"></font></strong>
                                                <center>
                                                    <strong><font face="calibri" size="2">${siswaData.daerah_sambung}</font></strong>
                                                    <center><strong><font face="calibri" size="2"></font></strong></center>
                                                </center>
                                              </td>
                                          </tr>
                                        </tbody>
                                    </table>
                                  </td>
                              </tr>
                            </tbody>
                        </table>
                      </div>
                  </td>
                  <td>
                      <div align="center">
                        <table width="165" border="1" cellpadding="0" cellspacing="0">
                            <tbody>
                              <tr>
                                  <td valign="top" background="${siteUrl}/print_assets/sticker.jpg" class="bgsize2" width="90%">
                                    <table width="100%" border="0" cellpadding="0" cellspacing="0" class="style1">
                                        <tbody>
                                          <tr>
                                              <td height="25" colspan="3"></td>
                                          </tr>
                                          <tr>
                                              <td valign="top" colspan="3">
                                                <strong><font face="calibri" size="2"></font></strong>
                                                <center>
                                                    <strong><font face="calibri" size="2">${siswaData.nama}</font></strong>
                                                    <center><strong><font face="calibri" size="2"></font></strong></center>
                                                </center>
                                              </td>
                                          </tr>
                                          <tr>
                                              <td valign="top" colspan="3">
                                                <strong><font face="calibri" size="2"></font></strong>
                                                <center>
                                                    <strong><font face="calibri" size="2">${siswaData.daerah_sambung}</font></strong>
                                                    <center><strong><font face="calibri" size="2"></font></strong></center>
                                                </center>
                                              </td>
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
      </body>
    </html>
    `);

    printWindow.document.close();
    return printWindow;
  }

  else if (type === 'nota') {
    printWindow.document.write(generateNotaHTML(pembayaranData.siswa, pembayaranData.transaction));

    printWindow.document.close();
    return printWindow;
  } 
  
  else {
    throw new Error('Unsupported print type');
  }
}

function generateNotaHTML(siswa: Siswa, transaction: PaymentTransaction): string {
  const siteUrl = window.location.origin;
  const transactionDate = new Date(transaction.transaction_date).toLocaleDateString('id-ID');
  const gunaPembayaran = Array.from(new Set(transaction.items.map(item => item.category_name))).join(', ');
  const terbilangText = terbilang(transaction.total_amount);
  const totalFormatted = formatRupiah(transaction.total_amount);

  const itemRows = transaction.items.map(item => 
    `<tr>
      <td>&nbsp;</td>
      <td class="style6">${item.category_name}</td>
      <td>:</td>
      <td class="style6">Rp.</td>
      <td><div align="right"><span class="style6">&nbsp;${formatRupiah(item.amount, false)}</span></div></td>
      <td>&nbsp;</td>
    </tr>`
  ).join('');

  return `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="UTF-8" />
    <title>Nota Pembayaran</title>
    <style type="text/css">
      .style6 { font-size: 16px }
      .style7 { font-size: 14px }
      .header-container table { width: 100%; }
      .header-inner { width: 100%; text-align: center; }
    </style>
  </head>
  <body>
    <table width="1007" height="466" border="1" cellpadding="0" cellspacing="0" bordercolor="#000000">
      <tr>
        <!-- Left Column -->
        <td width="757" valign="top">
          <table width="100%" border="0">
            <!-- Header Section -->
            <tr>
              <td colspan="7" rowspan="2" class="header-container">
                <table class="header-inner" border="0">
                  <tr>
                    <td width="121" align="center" rowspan="4">
                      <img src="${siteUrl}/print_assets/logo_ponpes.png" width="121" height="107" />
                    </td>
                    <td align="center">
                      <img src="${siteUrl}/print_assets/header_arabic.png" width="400" height="70" />
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="font-size:15px"><strong>PONDOK PESANTREN WALI BAROKAH KOTA KEDIRI</strong></td>
                  </tr>
                  <tr>
                    <td align="center" style="font-size:13px">Jl. Hos Cokroaminoto No.195, Kota Kediri, Jawa Timur</td>
                  </tr>
                  <tr>
                    <td align="center" style="font-size:12px">Telp. (0354) 687367 | www.walibarokah.org</td>
                  </tr>
                  <tr><td colspan="2"><hr/><hr/></td></tr>
                </table>
              </td>
            </tr>
            <tr></tr>
            <!-- Student Info -->
            <tr>
              <td width="23">&nbsp;</td>
              <td width="102"><span class="style6">NIS</span></td>
              <td width="17">:</td>
              <td width="217">${siswa.nispn}</td>
              <td width="93">Pendidikan</td>
              <td width="13">:</td>
              <td width="139">${siswa.pendidikan || '-'}</td>
            </tr>
            <tr>
              <td>&nbsp;</td>
              <td>Nama</td>
              <td>:</td>
              <td>${siswa.nama}</td>
              <td>Nama Ayah</td>
              <td>:</td>
              <td>${siswa.nama_ayah || '-'}</td>
            </tr>
            <tr>
              <td>&nbsp;</td>
              <td>Tempat Lahir</td>
              <td>:</td>
              <td>${siswa.tempat_lahir || '-'}</td>
              <td>Tgl Lahir</td>
              <td>:</td>
              <td>${siswa.tanggal_lahir || '-'}</td>
            </tr>
            <tr>
              <td>&nbsp;</td>
              <td>Kelompok</td>
              <td>:</td>
              <td>${siswa.kelompok_sambung || '-'}</td>
              <td>Status</td>
              <td>:</td>
              <td>${siswa.status_mondok || '-'}</td>
            </tr>
            <tr>
              <td>&nbsp;</td>
              <td>Daerah</td>
              <td>:</td>
              <td colspan="2">${siswa.daerah_sambung || '-'}</td>
            </tr>
            <tr>
              <td>&nbsp;</td>
              <td valign="top">Total Bayar</td>
              <td valign="top">:</td>
              <td colspan="5" valign="top">
                ${totalFormatted} ( ${terbilangText} )<br />
                ( Guna Pembayaran - ${gunaPembayaran} )
              </td>
            </tr>
            <tr>
              <td>&nbsp;</td>
              <td colspan="4" align="left">
                <strong><u>Alamat :</u></strong><br />
                ${siswa.alamat_lengkap}<br /><br />
                <font color="#FF0105"><i>NB : Kartu sementara ini dipegang santri sampai masa berlaku habis...</i></font>
              </td>
              <td colspan="3">
                <p align="center" class="style6">
                  <strong>Kediri, ${transactionDate}</strong><br />Petugas,<br /><br /><br /><br />
                  (${transaction.processed_by_petugas})
                </p>
              </td>
            </tr>
          </table>
        </td>
        <!-- Right Column -->
        <td valign="top">
          <table>
            <tr>
              <td colspan="6">
                <center>
                  ${transactionDate}<br />
                  <hr />
                </center>
              </td>
            </tr>
            <tr><td>&nbsp;</td><td>Petugas</td><td>:</td><td colspan="3">${transaction.processed_by_petugas}</td></tr>
            <tr><td>&nbsp;</td><td>NIS</td><td>:</td><td colspan="3">${siswa.nispn}</td></tr>
            <tr><td>&nbsp;</td><td>Nama</td><td>:</td><td colspan="3">${siswa.nama}</td></tr>
            ${itemRows}
            <tr><td colspan="6"><hr /></td></tr>
            <tr>
              <td>&nbsp;</td>
              <td><strong>Jumlah</strong></td><td>:</td><td><strong>Rp.</strong></td>
              <td><div align="right"><strong>${formatRupiah(transaction.total_amount, false)}</strong></div></td>
              <td>&nbsp;</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
