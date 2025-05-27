// annasabdurrahman354/siswa-ppwb/siswa-ppwb-1ab3aee5d39e63208c9cf1d36490c24de570cf47/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be defined!')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)