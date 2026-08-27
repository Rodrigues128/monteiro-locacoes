import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseProjectRef =
  supabaseUrl?.match(/^https?:\/\/([^.]+)/)?.[1] ?? "monteiro-locacoes";
const authStorageKey = `sb-${supabaseProjectRef}-auth-token`;
const sessionPreferenceKey = "monteiro-locacoes-keep-signed-in";

function getBrowserStorage(persistent) {
  if (typeof window === "undefined") return null;
  return persistent ? window.localStorage : window.sessionStorage;
}

export function getSessionPersistence() {
  return getBrowserStorage(true)?.getItem(sessionPreferenceKey) !== "false";
}

export function setSessionPersistence(shouldPersist) {
  const wasPersistent = getSessionPersistence();
  const source = getBrowserStorage(wasPersistent);
  const destination = getBrowserStorage(shouldPersist);
  const session = source?.getItem(authStorageKey);

  if (session && source !== destination) {
    destination?.setItem(authStorageKey, session);
    source?.removeItem(authStorageKey);
  }

  getBrowserStorage(true)?.setItem(
    sessionPreferenceKey,
    shouldPersist ? "true" : "false",
  );
}

const authStorage = {
  getItem(key) {
    return getBrowserStorage(getSessionPersistence())?.getItem(key) ?? null;
  },
  setItem(key, value) {
    getBrowserStorage(getSessionPersistence())?.setItem(key, value);
  },
  removeItem(key) {
    getBrowserStorage(true)?.removeItem(key);
    getBrowserStorage(false)?.removeItem(key);
  },
};

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: "pkce",
        storage: authStorage,
        storageKey: authStorageKey,
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
