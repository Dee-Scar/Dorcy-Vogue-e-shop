import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const ADMIN_EMAIL = "dorcyben001@gmail.com";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dorcyvogue.com";

export const dynamic = "force-dynamic";

// Called from the email "Force Sign Out" button — signs out all admin sessions
export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    // Get the admin user ID
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    const adminUser = usersData?.users?.find((u) => u.email === ADMIN_EMAIL);

    if (adminUser) {
      // Sign out all sessions for this user
      await supabaseAdmin.auth.admin.signOut(adminUser.id, "global");
    }

    // Redirect to a confirmation page
    return NextResponse.redirect(`${SITE_URL}/admin/logged-out`);
  } catch (err: any) {
    console.error("Force logout error:", err?.message);
    return NextResponse.redirect(`${SITE_URL}/admin/login`);
  }
}
