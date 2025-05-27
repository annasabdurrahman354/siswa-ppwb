// annasabdurrahman354/siswa-ppwb/siswa-ppwb-1ab3aee5d39e63208c9cf1d36490c24de570cf47/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://pfwzumovbdtocimrotsu.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmd3p1bW92YmR0b2NpbXJvdHN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMzc0ODIsImV4cCI6MjA2MzkxMzQ4Mn0.wEiHUVU6bInwFphqpMUR00zOw0Kdl2geh7DZh3vfcOQ"

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be defined!')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)