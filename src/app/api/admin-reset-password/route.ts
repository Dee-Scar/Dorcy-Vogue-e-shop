import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "dorcyben001@gmail.com";
// Secret token to authorise this endpoint — stored in env
const RESET_SECRET = process.env.ADMIN_RESET_SECRET || "dv-reset-2026";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { password, secret } = await req.json();

    // Verify the secret matches
    if (secret !== RESET_SECRET) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (!password || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    // Find the admin user
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    const adminUser = usersData?.users?.find((u) => u.email === ADMIN_EMAIL);

    if (!adminUser) {
      return NextResponse.json({ error: "Admin user not found." }, { status: 404 });
    }

    // Update password directly via service role — no client session needed
    const { error } = await supabaseAdmin.auth.admin.updateUserById(adminUser.id, {
      password,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Admin reset password error:", err?.message);
    return NextResponse.json({ error: err?.message || "Failed to reset password." }, { status: 500 });
  }
}
