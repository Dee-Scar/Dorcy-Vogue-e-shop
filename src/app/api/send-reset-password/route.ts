import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const FROM_EMAIL = "Dorcy Vogue <notifications@dorcyvogue.com>";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
    if (!RESEND_API_KEY) {
      return NextResponse.json({ error: "Email service not configured." }, { status: 500 });
    }

    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    // Use Supabase to generate a password reset link
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://dorcyvogue.com"}/login`,
      },
    });

    if (resetError || !data?.properties?.action_link) {
      // Don't reveal whether the email exists — always return success to the client
      console.warn("Reset link generation issue (user may not exist):", resetError?.message);
      return NextResponse.json({ sent: true });
    }

    const resetLink = data.properties.action_link;
    const resend = new Resend(RESEND_API_KEY);

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8" /></head>
      <body style="margin:0;padding:0;background:#FAF7F2;font-family:'Helvetica Neue',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F2;padding:40px 20px;">
          <tr><td align="center">
            <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(28,21,18,0.08);">

              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#1C1512 0%,#3a2a1a 100%);padding:32px 40px;text-align:center;">
                  <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:3px;color:#C9956A;text-transform:uppercase;">Dorcy Vogue</p>
                  <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#fff;letter-spacing:1px;">🔐 Reset Your Password</h1>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:40px 40px 32px;">
                  <p style="margin:0 0 16px;font-size:15px;font-weight:700;color:#1C1512;">Hi there,</p>
                  <p style="margin:0 0 24px;font-size:14px;color:#555;line-height:1.7;">
                    We received a request to reset the password for your Dorcy Vogue account associated with <strong>${email}</strong>.
                    Click the button below to set a new password.
                  </p>

                  <div style="text-align:center;margin:32px 0;">
                    <a href="${resetLink}" style="display:inline-block;padding:16px 40px;background:#B78A62;color:#fff;font-size:14px;font-weight:700;text-decoration:none;border-radius:12px;letter-spacing:0.5px;">
                      Reset My Password →
                    </a>
                  </div>

                  <p style="margin:0 0 8px;font-size:12px;color:#8C8682;line-height:1.6;">
                    This link will expire in <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email — your account will remain secure.
                  </p>

                  <div style="margin-top:24px;padding:14px 16px;background:#FAF7F2;border-radius:10px;border:1px solid #f0ece6;">
                    <p style="margin:0;font-size:11px;color:#8C8682;">If the button above doesn't work, copy and paste this link into your browser:</p>
                    <p style="margin:6px 0 0;font-size:11px;color:#B78A62;word-break:break-all;">${resetLink}</p>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background:#FAF7F2;padding:20px 40px;text-align:center;border-top:1px solid #f0ece6;">
                  <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#1C1512;">Dorcy Vogue</p>
                  <p style="margin:0;font-size:11px;color:#8C8682;">Premium Nigerian Fashion — Where Style Meets Elegance</p>
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
      to: email,
      subject: "Reset your Dorcy Vogue password",
      html,
    });

    return NextResponse.json({ sent: true });
  } catch (err: any) {
    console.error("Password reset email error:", err?.message || err);
    return NextResponse.json({ error: err?.message || "Failed to send reset email." }, { status: 500 });
  }
}
