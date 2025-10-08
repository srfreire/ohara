import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase_instance: SupabaseClient | null = null;

export function get_supabase_client(): SupabaseClient {
  if (supabase_instance) {
    return supabase_instance;
  }

  const supabase_url = process.env.SUPABASE_URL;
  const supabase_key = process.env.SUPABASE_SECRET_KEY;

  if (!supabase_url || !supabase_key) {
    throw new Error(
      'Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_SECRET_KEY in your .env file.',
    );
  }

  supabase_instance = createClient(supabase_url, supabase_key);

  return supabase_instance;
}
