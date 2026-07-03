/**
 * Supabase Server Client
 *
 * Use this in:
 *   - API Route Handlers (src/app/api/…/route.ts)
 *   - Server Components
 *   - Server Actions
 *
 * This client uses the SERVICE_ROLE key which bypasses Row Level Security.
 * NEVER import this file from a Client Component.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Creates a Supabase admin client with the service role key.
 *
 * ⚠️  This client bypasses RLS — use with care.
 * Only call from server-side code (API routes, server components).
 */
export function createServerClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing Supabase server environment variables. " +
        "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Creates a Supabase client scoped to the anon key (server-side).
 *
 * Use this when you want server-side code to still respect RLS rules,
 * e.g. when acting on behalf of an unauthenticated public user.
 */
export function createAnonServerClient(): SupabaseClient {
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. " +
        "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
