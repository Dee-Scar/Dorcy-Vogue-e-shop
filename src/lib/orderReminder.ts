import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const FROM_EMAIL = "Dorcy Vogue <notifications@dorcyvogue.com>";
const WHATSAPP_NUMBER = "2349071262856";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dorcyvogue.com";
const REMINDER_DELAY_MINUTES = 2; // TEMPORARY: set back to 20 once testing confirms it works

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

function reminderHtml(orderId: string, customerName: string, amount: number) {
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hi DORCY VOGUE, I need help with my order ${orderId}`
  )}`;
  const finishLink = `${SITE_URL}/checkout/upload?ref=${encodeURIComponent(orderId)}&amount=${amount}`;

  return `
    <!DOCTYPE html>
    <html>
      <body style="margin:0;padding:0;background:#FAF7F2;font-family:'Helvetica Neue',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F2;padding:40px 20px;">
          <tr>
            <td align="center">
              <table width="580" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(28,21,18,0.08);">

                <tr>
                  <td style="background:linear-gradient(135deg,#1C1512 0%,#3a2a1a 100%);padding:32px 40px;text-align:center;">
                    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:3px;color:#C9956A;text-transform:uppercase;">Dorcy Vogue</p>
                    <h1 style="margin:8px 0 0;font-size:24px;font-weight:700;color:#fff;letter-spacing:1px;">Your order is waiting</h1>
                  </td>
                </tr>

                <tr>
                  <td style="padding:36px 40px;">
                    <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#1C1512;">Hi ${customerName || "there"},</p>
                    <p style="margin:0 0 24px;font-size:14px;color:#555;line-height:1.6;">
                      We noticed your order has not been completed yet. It is still reserved for you &mdash;
                      you can finish it whenever you are ready.
                    </p>

                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F2;border-radius:12px;margin-bottom:28px;">
                      <tr>
                        <td style="padding:12px 16px;font-size:13px;color:#8C8682;">Order Reference</td>
                        <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#1C1512;text-align:right;">${orderId}</td>
                      </tr>
                      <tr>
                        <td style="padding:12px 16px;font-size:15px;font-weight:700;color:#1C1512;">Amount Due</td>
                        <td style="padding:12px 16px;font-size:17px;font-weight:800;color:#B78A62;text-align:right;">&#8358;${Number(amount).toLocaleString()}</td>
                      </tr>
                    </table>

                    <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                      <tr>
                        <td style="border-radius:10px;background:#1C1512;">
                          <a href="${finishLink}" style="display:inline-block;padding:14px 26px;font-size:14px;font-weight:700;color:#fff;text-decoration:none;">Complete my order</a>
                        </td>
                        <td style="width:12px;"></td>
                        <td style="border-radius:10px;background:#25D366;">
                          <a href="${whatsappLink}" style="display:inline-block;padding:14px 26px;font-size:14px;font-weight:700;color:#fff;text-decoration:none;">Chat on WhatsApp</a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0 0 20px;font-size:14px;color:#555;line-height:1.6;">
                      Had any trouble placing your order? Message Dorcy Vogue directly on WhatsApp at
                      <a href="${whatsappLink}" style="color:#B78A62;font-weight:700;text-decoration:none;">0907 126 2856</a>
                      and we will sort it out with you.
                    </p>

                    <p style="margin:0;font-size:12px;color:#8C8682;line-height:1.6;">
                      Already paid and uploaded your receipt? Please ignore this email &mdash; we are verifying it now.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="background:#FAF7F2;padding:20px 40px;text-align:center;">
                    <p style="margin:0;font-size:11px;color:#8C8682;">Dorcy Vogue &bull; Premium Nigerian Fashion</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

/**
 * Schedules the "your order is waiting" email for 20 minutes after checkout.
 * Resend holds it and we cancel it if the customer uploads a receipt in time,
 * so nothing has to poll the database on a schedule.
 */
export async function scheduleOrderReminder(params: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !params.customerEmail) return;

  const resend = new Resend(apiKey);
  let scheduledId: string | undefined;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: params.customerEmail,
      subject: `Need a hand completing your order ${params.orderId}?`,
      html: reminderHtml(params.orderId, params.customerName, params.amount),
      scheduledAt: new Date(Date.now() + REMINDER_DELAY_MINUTES * 60_000).toISOString(),
    });

    if (error || !data?.id) {
      console.warn("Could not schedule order reminder:", error?.message);
      return;
    }
    scheduledId = data.id;

    const { error: saveError } = await admin()
      .from("orders")
      .update({ reminder_email_id: scheduledId })
      .eq("id", params.orderId);

    // Without the stored id the reminder could never be called off, so rather
    // than risk emailing a customer who has already paid, cancel it now.
    if (saveError) throw new Error(saveError.message);
  } catch (err: any) {
    console.warn("Order reminder not scheduled:", err?.message);
    if (scheduledId) {
      await resend.emails.cancel(scheduledId).catch(() => {});
    }
  }
}

/** Calls off a pending reminder once the customer has paid. */
export async function cancelOrderReminder(orderId: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !orderId) return;

  try {
    const { data } = await admin()
      .from("orders")
      .select("reminder_email_id")
      .eq("id", orderId)
      .single();

    const scheduledId = data?.reminder_email_id;
    if (!scheduledId) return;

    await new Resend(apiKey).emails.cancel(scheduledId);
    await admin().from("orders").update({ reminder_email_id: null }).eq("id", orderId);
  } catch (err: any) {
    console.warn("Could not cancel order reminder:", err?.message);
  }
}
