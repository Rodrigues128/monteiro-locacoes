import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: "pkce",
      },
    })
  : null;

export const STORAGE_BUCKET = "catalog";

/** @param {string | null} path */
export function getImageUrl(path) {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  if (!supabase) return "";
  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data
    .publicUrl;
}
