import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "dorcyvogue@gmail.com";
const FROM_EMAIL = "Dorcy Vogue <notifications@dorcyvogue.com>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dorcyvogue.com";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
    if (!RESEND_API_KEY) return NextResponse.json({ skipped: true });

    const body = await req.json();
    const { userAgent, loginTime, ipHint } = body;

    const resend = new Resend(RESEND_API_KEY);

    // Generate a real password reset link for the admin account
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    let resetLink = `${SITE_URL}/admin/change-password`;
    try {
      const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email: "dorcyben001@gmail.com",
        options: { redirectTo: `${SITE_URL}/admin/change-password` },
      });
      if (linkData?.properties?.action_link) {
        resetLink = linkData.properties.action_link;
      }
    } catch (_) {}

    const forceLogoutUrl = `${SITE_URL}/api/admin-force-logout`;
    const resetPasswordUrl = `${SITE_URL}/admin/login`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8" /></head>
      <body style="margin:0;padding:0;background:#FAF7F2;font-family:'Helvetica Neue',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F2;padding:40px 20px;">
          <tr><td align="center">
            <table width="540" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(28,21,18,0.08);">

              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#1C1512 0%,#3a2a1a 100%);padding:32px 40px;text-align:center;">
                  <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:3px;color:#C9956A;text-transform:uppercase;">Dorcy Vogue</p>
                  <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#fff;">🔐 Admin Login Detected</h1>
                </td>
              </tr>

              <!-- Alert Banner -->
              <tr>
                <td style="background:#f59e0b;padding:12px 40px;text-align:center;">
                  <p style="margin:0;font-size:12px;font-weight:700;color:#fff;letter-spacing:0.5px;">
                    Someone just signed into your admin panel
                  </p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:32px 40px;">
                  <p style="margin:0 0 24px;font-size:14px;color:#555;line-height:1.7;">
                    A login was recorded on your <strong>Dorcy Vogue Admin</strong> panel. If this was you, no action is needed. If you did <strong>not</strong> authorise this login, use the buttons below immediately.
                  </p>

                  <!-- Login Details -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F2;border-radius:12px;overflow:hidden;margin-bottom:28px;">
                    <tr>
                      <td style="padding:10px 16px;font-size:11px;font-weight:700;color:#8C8682;text-transform:uppercase;letter-spacing:1px;width:40%;">Time</td>
                      <td style="padding:10px 16px;font-size:13px;font-weight:600;color:#1C1512;">${loginTime}</td>
                    </tr>
                    <tr style="background:#f5f0ea;">
                      <td style="padding:10px 16px;font-size:11px;font-weight:700;color:#8C8682;text-transform:uppercase;letter-spacing:1px;">Device / Browser</td>
                      <td style="padding:10px 16px;font-size:12px;color:#1C1512;">${userAgent || "Unknown"}</td>
                    </tr>
                    ${ipHint ? `<tr>
                      <td style="padding:10px 16px;font-size:11px;font-weight:700;color:#8C8682;text-transform:uppercase;letter-spacing:1px;">Location Hint</td>
                      <td style="padding:10px 16px;font-size:13px;color:#1C1512;">${ipHint}</td>
                    </tr>` : ""}
                  </table>

                  <!-- Action Buttons -->
                  <p style="margin:0 0 16px;font-size:13px;font-weight:700;color:#1C1512;">If this wasn't you:</p>
                  <div style="text-align:center;margin-bottom:12px;">
                    <a href="${forceLogoutUrl}" style="display:inline-block;padding:14px 28px;background:#dc2626;color:#fff;font-size:13px;font-weight:700;text-decoration:none;border-radius:10px;letter-spacing:0.5px;margin-bottom:10px;">
                      🚨 Force Sign Out All Sessions
                    </a>
                  </div>
                  <div style="text-align:center;margin-bottom:24px;">
                    <a href="${resetLink}" style="display:inline-block;padding:14px 28px;background:#1C1512;color:#fff;font-size:13px;font-weight:700;text-decoration:none;border-radius:10px;letter-spacing:0.5px;">
                      🔑 Reset My Password
                    </a>
                  </div>

                  <p style="margin:0;font-size:11px;color:#8C8682;line-height:1.6;text-align:center;">
                    Click <strong>Force Sign Out</strong> first to kick the unauthorized user out immediately, then reset your password.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background:#FAF7F2;padding:20px 40px;text-align:center;border-top:1px solid #f0ece6;">
                  <p style="margin:0;font-size:11px;color:#8C8682;">Automated security alert from <strong>Dorcy Vogue Admin System</strong></p>
                </td>
              </tr>

            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `;

    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🔐 Admin Login Alert — ${loginTime}`,
      html,
    });

    return NextResponse.json({ sent: true });
  } catch (err: any) {
    console.error("Admin login alert error:", err?.message);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
