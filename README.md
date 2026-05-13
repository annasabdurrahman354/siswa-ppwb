# Sistem Informasi Siswa PPWB

Platform manajemen administrasi, data akademis, dan keuangan komprehensif untuk pengurus dan pengelola data siswa Pondok Pesantren Warga Belajar (PPWB). Sistem ini dirancang untuk menangani pencarian tersaring (*filtered search*), manajemen riwayat penempatan, pencetakan tanda pengenal massal (*bulk cocard printing*), pelaporan berkas, hingga pencatatan transaksi pembayaran.

---

## 🚀 Fitur Utama

### 👨‍🎓 Manajemen Data Siswa Terintegrasi

#### 🔍 Pencarian & Filter Dinamis

- Pencarian *real-time* berbasis *debounce*
- Pencarian berdasarkan:
  - Nama Lengkap
  - NISPN
- Multi-filter dinamis:
  - Jenis Kelamin
  - Status Mondok
  - Daerah Sambung
  - Kelas
  - Kelompok

#### 📚 Penelusuran Riwayat Siswa

Sistem mendukung pencatatan dan penelusuran:

- Riwayat Pondok Pesantren
- Riwayat Kelas
- Riwayat Kelompok

---

### 💳 Modul Keuangan & Pembayaran

#### 🧾 Manajemen Pembayaran

- Pengelolaan kategori pembayaran
- Pengaturan tarif spesifik
- Multi-item transaksi

#### 🖨️ Nota Otomatis

- Pembuatan deskripsi transaksi otomatis
- Siap cetak nota pembayaran

---

### 🖨️ Utilitas Ekspor & Pencetakan Massal

#### 📊 Ekspor Laporan

Dukungan ekspor dokumen menggunakan:

- `xlsx`
- `docx`

#### 🪪 Cetak Cocard Massal

- Cetak cocard depan & belakang
- Seleksi batch berdasarkan siswa tertentu
- Layout siap cetak

---

### 🖼️ Manajemen Foto & Dokumen

#### 📤 Bulk Upload Foto

- Upload pasfoto massal
- Pencocokan otomatis data siswa

#### 📷 Capture & Crop

Integrasi:

- `react-webcam`
- `react-image-crop`
- `browser-image-compression`

Fitur:

- Ambil foto langsung dari webcam
- Crop presisi
- Kompresi gambar di sisi klien

---

## 🛠️ Teknologi & Arsitektur (*Tech Stack*)

Sistem dibangun menggunakan arsitektur modern berbasis Next.js App Router.

---

### ⚛️ Framework & Core

| Teknologi | Keterangan |
|---|---|
| Next.js 15 | Framework utama berbasis App Router |
| React 19 | Library UI modern |
| TypeScript | Pengetikan statis & keamanan kode |

---

### 🎨 Styling & UI

| Teknologi | Fungsi |
|---|---|
| Tailwind CSS | Utility-first CSS framework |
| shadcn/ui | Komponen UI berbasis Radix UI |

---

### 🧠 State Management & Form

| Teknologi | Fungsi |
|---|---|
| react-hook-form | Manajemen formulir |
| zod | Validasi skema data |

---

### 🗄️ Backend & Data Service

| Teknologi | Fungsi |
|---|---|
| Supabase JS Client | Integrasi database & autentikasi |
| Recharts | Grafik & visualisasi dashboard |

---

### 📁 Utilitas File & Gambar

- `xlsx`
- `docx`
- `browser-image-compression`

---

## 📂 Struktur Proyek

```text
├── app/                  # Next.js App Router
│   ├── login/            # Halaman autentikasi
│   ├── siswa/            # Detail siswa & pembaruan foto
│   └── page.tsx          # Dashboard utama
├── components/           # Komponen reusable
├── contexts/             # React Context
├── hooks/                # Custom hooks
├── lib/                  # Helper & utilitas
├── public/               # Aset statis
├── styles/               # Global CSS & Tailwind
└── types/                # Definisi tipe TypeScript
```

---

## ⚙️ Persyaratan Sistem

Pastikan lingkungan pengembangan telah memasang:

- Node.js versi 20.x atau 22.x
- npm / bun / yarn / pnpm

---

## 🚀 Langkah Instalasi

### 1️⃣ Kloning Repositori

```bash
git clone <url-repositori-anda>
cd siswa-ppwb
```

---

### 2️⃣ Instalasi Dependensi

```bash
npm install
```

---

### 3️⃣ Konfigurasi Environment Variables

Salin file konfigurasi:

```bash
cp .env.example .env.local
```

Kemudian sesuaikan isi `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.domain-backend-anda.com/api
NEXT_PUBLIC_SUPABASE_URL=https://id-proyek-anda.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=kunci-anon-supabase-anda
```

---

### 4️⃣ Menjalankan Development Server

```bash
npm run dev
```

Aplikasi dapat diakses melalui:

```txt
http://localhost:3000
```

---

## 📦 Skrip yang Tersedia

| Perintah | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan development server |
| `npm run build` | Build produksi |
| `npm run start` | Menjalankan hasil build produksi |
| `npm run lint` | Analisis kode menggunakan ESLint |

---

## 📊 Modul Utama Sistem

| Modul | Fungsi |
|---|---|
| Dashboard | Monitoring & statistik siswa |
| Direktori Siswa | Pencarian & filter data siswa |
| Riwayat Penempatan | Histori pondok, kelas, kelompok |
| Pembayaran | Transaksi & laporan keuangan |
| Cocard Printing | Cetak tanda pengenal massal |
| Foto Siswa | Upload, capture, crop gambar |

---

## 🔒 Keamanan & Validasi

Sistem menerapkan:

- Validasi formulir berbasis `zod`
- Pengelolaan autentikasi terpusat
- Sanitasi input pengguna
- Validasi sisi klien dan server
- Pembatasan akses halaman tertentu

---

## 📱 Dukungan Responsif

Antarmuka dirancang responsif untuk:

- Desktop
- Tablet
- Smartphone

Dengan pendekatan desain modern:

- Responsive layout
- Clean dashboard UI
- Smooth interaction
- Utility-first styling

---

## 📄 Lisensi

Proyek ini dikembangkan untuk kebutuhan internal administrasi dan pengelolaan data siswa PPWB.
