import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase environment variables. Check your .env file.');
}

const supabaseOptions = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    fetch: fetch,
  },
  realtime: {
    transport: ws,
  },
};

// Service role client - bypasses RLS
export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  supabaseOptions
);

// Anon client
export const supabaseAnon = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    ...supabaseOptions,
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Creates a Supabase client scoped to a specific user's access token.
 */
export const getUserScopedClient = (accessToken) => {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      fetch: fetch,
    },
    realtime: {
      transport: ws,
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};