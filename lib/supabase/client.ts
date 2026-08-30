import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your-supabase-url');
};

export const createBrowserSupabaseClient = () => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
};
