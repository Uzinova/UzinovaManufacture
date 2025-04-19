import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing required environment variables:');
  if (!supabaseUrl) console.error('- VITE_SUPABASE_URL is not set');
  if (!supabaseAnonKey) console.error('- VITE_SUPABASE_ANON_KEY is not set');
  throw new Error('Missing required Supabase environment variables. Check .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});
