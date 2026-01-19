import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY;

if (!url || !serviceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

// Service-role client for database operations and admin tasks
const supabase = createClient(url, serviceRoleKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
  },
});

// Public client for validating user JWTs; falls back to service client if anon key not provided
const supabaseAuth =
  anonKey && anonKey !== serviceRoleKey
    ? createClient(url, anonKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : supabase;

export { supabase, supabaseAuth };
