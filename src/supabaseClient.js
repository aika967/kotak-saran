// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// GANTI DENGAN KUNCI ANDA DARI LANGKAH 3
const supabaseUrl = 'https://bwkdsdfuygitznrzjazd.supabase.co'; 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3a2RzZGZ1eWdpdHpucnpqYXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNTA2NjEsImV4cCI6MjA4MDkyNjY2MX0.EDBrCkvIHDj_j_n12H1qkzvzEEYG7u--fGtH4AfLokg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);