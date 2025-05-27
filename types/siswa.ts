export interface Siswa {
  nispn: string | null
  nis: string | null
  nama: string | null
  nama_ayah: string | null
  nama_ibu: string | null
  tempat_lahir: string | null
  tanggal_lahir: string | null // Format: 'dd-mm-YYYY'
  umur: number | null
  rt: string | null
  rw: string | null
  desa_kel: string | null
  kecamatan: string | null
  kota_kab: string | null
  provinsi: string | null
  kode_pos: string | null
  alamat_lengkap: string
  foto_siswa: string | null // URL to the image
  pendidikan: string | null
  kelompok_sambung: string | null
  daerah_sambung: string | null
  status_mondok: string | null
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
