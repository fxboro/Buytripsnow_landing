/**
 * Supabase Browser Client
 *
 * Use this singleton in Client Components (anything marked 'use client').
 * It uses the NEXT_PUBLIC_ prefixed env vars so they are bundled for the browser.
 *
 * For Server Components and API Routes, use `src/lib/supabase-server.ts` instead.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

/**
 * Browser-side Supabase client.
 *
 * Uses the anonymous (public) key — all queries are subject to RLS policies.
 * This client is safe to use in the browser because the anon key only grants
 * the permissions defined by your Row Level Security rules.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
