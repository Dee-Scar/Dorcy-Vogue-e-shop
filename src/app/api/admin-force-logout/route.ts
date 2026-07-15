import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const ADMIN_EMAIL = "dorcyben001@gmail.com";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dorcyvogue.com";

export const dynamic = "force-dynamic";

// Called from the email "Force Sign Out" button
export async function GET() {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    // 1. Sign out all Supabase sessions for the admin user
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    const adminUser = usersData?.users?.find((u) => u.email === ADMIN_EMAIL);
    if (adminUser) {
      await supabaseAdmin.auth.admin.signOut(adminUser.id, "global");
    }

    // 2. Write a force-logout flag to the DB so the admin layout detects it
    //    and clears sessionStorage on the unauthorized browser in real time
    await supabaseAdmin
      .from("cms_settings")
      .update({ force_admin_logout: true, force_logout_at: new Date().toISOString() })
      .eq("id", 1);

    return NextResponse.redirect(`${SITE_URL}/admin/logged-out`);
  } catch (err: any) {
    console.error("Force logout error:", err?.message);
    return NextResponse.redirect(`${SITE_URL}/admin/login`);
  }
}
