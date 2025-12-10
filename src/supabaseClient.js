// src/supabaseClient.js (PASTIKAN SUDAH ADA DAN BENAR)

import { createClient } from '@supabase/supabase-js'

// GANTI NILAI FALLBACK INI atau pastikan Environment Variables Vercel sudah benar
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://bwkdsdfuygitznrzjazd.supabase.co'; 
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3a2RzZGZ1eWdpdHpucnpqYXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNTA2NjEsImV4cCI6MjA4MDkyNjY2MX0.EDBrCkvIHDj_j_n12H1qkzvzEEYG7u--fGtH4AfLokg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);