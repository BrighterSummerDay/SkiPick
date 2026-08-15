import { createClient, SupabaseClient } from "@supabase/supabase-js";

function getCleanUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  let cleaned = raw.trim().replace(/^["']|["']$/g, "").replace(/\/+$/, "");
  // 如果误粘贴了带 /rest/v1 后缀的 API URL，自动剥离回根 Project URL
  cleaned = cleaned.replace(/\/rest\/v1\/?$/i, "");
  return cleaned;
}

function getCleanKey(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return raw.trim().replace(/^["']|["']$/g, "");
}

export function isSupabaseConfigured(): boolean {
  const url = getCleanUrl();
  const key = getCleanKey();
  return Boolean(url && key);
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseInstance) {
    const url = getCleanUrl();
    const key = getCleanKey();
    supabaseInstance = createClient(url, key);
  }
  return supabaseInstance;
}

export type FeedbackRecord = {
  id: string;
  nickname: string;
  content: string;
  resort_slug?: string | null;
  ip_hash: string;
  admin_reply?: string | null;
  replied_at?: string | null;
  created_at: string;
};
