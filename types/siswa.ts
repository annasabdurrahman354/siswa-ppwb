export interface RiwayatPonpes {
  nama: string
  tanggal_masuk: string | null
  status: number
}

export interface RiwayatKelas {
  nama: string
  tanggal_masuk: string | null
  status: number
}

export interface RiwayatKelompok {
  nama: string
  tanggal_masuk: string | null
  status: number
}

export interface Siswa {
  nispn: string
  nis: string | null
  nama: string
  jenis_kelamin: string
  nama_ayah: string
  nama_ibu: string
  tempat_lahir: string
  tanggal_lahir: string
  umur: number
  rt: string | null
  rw: string | null
  desa_kel: string | null
  kecamatan: string | null
  kota_kab: string | null
  provinsi: string | null
  kode_pos: string
  alamat_lengkap: string
  foto_siswa: string
  pendidikan: string
  jurusan: string
  kelompok_sambung: string
  desa_sambung: string
  daerah_sambung: string
  status_mondok: string
  daerah_kiriman: string
  kelas: string
  kelompok: string

  // NEW FIELDS
  riwayat_ponpes: RiwayatPonpes[]
  riwayat_kelas: RiwayatKelas[]
  riwayat_kelompok: RiwayatKelompok[]
}

export interface SiswaPaginatedResponse {
  current_page: number
  data: Siswa[]
  first_page_url: string
  from: number | null
  last_page: number
  last_page_url: string
  links: Array<{ url: string | null; label: string; active: boolean }>
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number | null
  total: number
}