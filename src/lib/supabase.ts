import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fqtdhlbfsapkpgnxocpi.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxdGRobGJmc2Fwa3BnbnhvY3BpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxNzgyNTQsImV4cCI6MjA5ODc1NDI1NH0.t85O5Uf_asFHsSInUp2GSaBS7ZTaNenU7H_SbeHzWRY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
