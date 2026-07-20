// ============================================================
// Supabase istemcisi — turnuva başvuru sistemi
// Anahtarlar .env.local dosyasından okunur (bkz. KURULUM-SUPABASE.md).
// Anahtarlar tanımlı değilse istemci null olur; sayfalar bu durumda
// başvuru bölümünü gizleyip Discord yönlendirmesi gösterir.
// ============================================================
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
