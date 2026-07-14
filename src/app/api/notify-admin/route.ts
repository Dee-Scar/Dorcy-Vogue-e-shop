import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "dorcyvogue@gmail.com";
const FROM_EMAIL = "Dorcy Vogue <notifications@dorcyvogue.com>";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const RESEND_API_KEY =
      process.env.RESEND_API_KEY || "";

    if (!RESEND_API_KEY) {
      // Silently skip if no API key — don't break the checkout flow
      console.warn("RESEND_API_KEY not set — admin notification skipped.");
      return NextResponse.json({ skipped: true });
    }

    const resend = new Resend(RESEND_API_KEY);
    const body = await req.json();
    const { type } = body;

    if (type === "new_order") {
      const { orderId, customerName, customerEmail, customerPhone, address, items, subtotal, shippingCost, total } = body;

      const itemsHtml = (items || [])
        .map(
          (item: any) =>
            `<tr>
              <td style="padding:8px 12px;border-bottom:1px solid #f0ece6;font-size:13px;color:#1C1512;">${item.name}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #f0ece6;font-size:13px;color:#555;text-align:center;">${item.size}${item.color && item.color !== "Default" ? ` / ${item.color}` : ""}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #f0ece6;font-size:13px;color:#555;text-align:center;">×${item.quantity}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #f0ece6;font-size:13px;font-weight:700;color:#B78A62;text-align:right;">₦${(item.price * item.quantity).toLocaleString()}</td>
            </tr>`
        )
        .join("");

      const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8" /></head>
        <body style="margin:0;padding:0;background:#FAF7F2;font-family:'Helvetica Neue',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F2;padding:40px 20px;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(28,21,18,0.08);">
                
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#1C1512 0%,#3a2a1a 100%);padding:32px 40px;text-align:center;">
                    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:3px;color:#C9956A;text-transform:uppercase;">Dorcy Vogue</p>
                    <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#fff;letter-spacing:1px;">🛒 New Order Received</h1>
                  </td>
                </tr>

                <!-- Order Reference Banner -->
                <tr>
                  <td style="background:#B78A62;padding:12px 40px;text-align:center;">
                    <p style="margin:0;font-size:13px;font-weight:700;color:#fff;letter-spacing:1px;">Order Reference: <span style="font-size:15px;">${orderId}</span></p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:32px 40px;">

                    <!-- Customer Details -->
                    <h2 style="margin:0 0 16px;font-size:13px;font-weight:700;color:#B78A62;text-transform:uppercase;letter-spacing:1.5px;">Customer Details</h2>
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F2;border-radius:12px;overflow:hidden;margin-bottom:28px;">
                      <tr>
                        <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#8C8682;text-transform:uppercase;letter-spacing:1px;width:40%;">Name</td>
                        <td style="padding:10px 16px;font-size:13px;font-weight:700;color:#1C1512;">${customerName}</td>
                      </tr>
                      <tr style="background:#f5f0ea;">
                        <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#8C8682;text-transform:uppercase;letter-spacing:1px;">Email</td>
                        <td style="padding:10px 16px;font-size:13px;color:#1C1512;">${customerEmail}</td>
                      </tr>
                      <tr>
                        <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#8C8682;text-transform:uppercase;letter-spacing:1px;">Phone</td>
                        <td style="padding:10px 16px;font-size:13px;color:#1C1512;">${customerPhone}</td>
                      </tr>
                      <tr style="background:#f5f0ea;">
                        <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#8C8682;text-transform:uppercase;letter-spacing:1px;">Address</td>
                        <td style="padding:10px 16px;font-size:13px;color:#1C1512;">${address}</td>
                      </tr>
                    </table>

                    <!-- Order Items -->
                    <h2 style="margin:0 0 16px;font-size:13px;font-weight:700;color:#B78A62;text-transform:uppercase;letter-spacing:1.5px;">Items Ordered</h2>
                    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0ece6;border-radius:12px;overflow:hidden;margin-bottom:28px;">
                      <thead>
                        <tr style="background:#FAF7F2;">
                          <th style="padding:10px 12px;font-size:11px;font-weight:700;color:#8C8682;text-align:left;text-transform:uppercase;letter-spacing:1px;">Product</th>
                          <th style="padding:10px 12px;font-size:11px;font-weight:700;color:#8C8682;text-align:center;text-transform:uppercase;letter-spacing:1px;">Variant</th>
                          <th style="padding:10px 12px;font-size:11px;font-weight:700;color:#8C8682;text-align:center;text-transform:uppercase;letter-spacing:1px;">Qty</th>
                          <th style="padding:10px 12px;font-size:11px;font-weight:700;color:#8C8682;text-align:right;text-transform:uppercase;letter-spacing:1px;">Price</th>
                        </tr>
                      </thead>
                      <tbody>${itemsHtml}</tbody>
                    </table>

                    <!-- Totals -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F2;border-radius:12px;padding:4px 0;margin-bottom:28px;">
                      <tr>
                        <td style="padding:8px 16px;font-size:13px;color:#8C8682;">Subtotal</td>
                        <td style="padding:8px 16px;font-size:13px;font-weight:700;color:#1C1512;text-align:right;">₦${Number(subtotal).toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 16px;font-size:13px;color:#8C8682;">Shipping</td>
                        <td style="padding:8px 16px;font-size:13px;font-weight:700;color:#1C1512;text-align:right;">${Number(shippingCost) === 0 ? "—" : "₦" + Number(shippingCost).toLocaleString()}</td>
                      </tr>
                      <tr style="border-top:2px solid #e8ddd4;">
                        <td style="padding:12px 16px;font-size:15px;font-weight:700;color:#1C1512;">Total</td>
                        <td style="padding:12px 16px;font-size:17px;font-weight:800;color:#B78A62;text-align:right;">₦${Number(total).toLocaleString()}</td>
                      </tr>
                    </table>

                    <!-- CTA -->
                    <div style="text-align:center;">
                      <a href="https://dorcyvogue.com/admin/orders" style="display:inline-block;padding:14px 32px;background:#1C1512;color:#fff;font-size:13px;font-weight:700;text-decoration:none;border-radius:10px;letter-spacing:0.5px;">
                        View Order in Admin →
                      </a>
                    </div>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#FAF7F2;padding:20px 40px;text-align:center;border-top:1px solid #f0ece6;">
                    <p style="margin:0;font-size:11px;color:#8C8682;">This is an automated notification from <strong>Dorcy Vogue</strong>.</p>
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
        subject: `🛒 New Order: ${orderId} — ₦${Number(total).toLocaleString()} from ${customerName}`,
        html,
      });

      return NextResponse.json({ sent: true, type: "new_order" });
    }

    if (type === "new_signup") {
      const { userName, userEmail } = body;

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
                    <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#fff;letter-spacing:1px;">👤 New Customer Sign Up</h1>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:36px 40px;text-align:center;">
                    <div style="width:64px;height:64px;background:#FAF7F2;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px;font-size:28px;">👤</div>
                    <h2 style="margin:0 0 6px;font-size:18px;font-weight:700;color:#1C1512;">${userName}</h2>
                    <p style="margin:0 0 24px;font-size:14px;color:#B78A62;font-weight:600;">${userEmail}</p>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F2;border-radius:12px;overflow:hidden;text-align:left;margin-bottom:28px;">
                      <tr>
                        <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#8C8682;text-transform:uppercase;letter-spacing:1px;width:40%;">Full Name</td>
                        <td style="padding:10px 16px;font-size:13px;font-weight:700;color:#1C1512;">${userName}</td>
                      </tr>
                      <tr style="background:#f5f0ea;">
                        <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#8C8682;text-transform:uppercase;letter-spacing:1px;">Email</td>
                        <td style="padding:10px 16px;font-size:13px;color:#1C1512;">${userEmail}</td>
                      </tr>
                      <tr>
                        <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#8C8682;text-transform:uppercase;letter-spacing:1px;">Signed Up</td>
                        <td style="padding:10px 16px;font-size:13px;color:#1C1512;">${new Date().toLocaleString("en-NG", { timeZone: "Africa/Lagos", dateStyle: "medium", timeStyle: "short" })} (WAT)</td>
                      </tr>
                    </table>

                    <a href="https://dorcyvogue.com/admin/customers" style="display:inline-block;padding:14px 32px;background:#1C1512;color:#fff;font-size:13px;font-weight:700;text-decoration:none;border-radius:10px;letter-spacing:0.5px;">
                      View Customers →
                    </a>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#FAF7F2;padding:20px 40px;text-align:center;border-top:1px solid #f0ece6;">
                    <p style="margin:0;font-size:11px;color:#8C8682;">This is an automated notification from <strong>Dorcy Vogue</strong>.</p>
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
        subject: `👤 New Sign Up: ${userName} (${userEmail})`,
        html,
      });

      return NextResponse.json({ sent: true, type: "new_signup" });
    }

    // ── Receipt Uploaded → notify admin ──────────────────────────────────────
    if (type === "receipt_uploaded") {
      const { orderId, customerName, customerEmail, receiptUrl, amount } = body;

      const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8" /></head>
        <body style="margin:0;padding:0;background:#FAF7F2;font-family:'Helvetica Neue',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F2;padding:40px 20px;">
            <tr><td align="center">
              <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(28,21,18,0.08);">

                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#1C1512 0%,#3a2a1a 100%);padding:32px 40px;text-align:center;">
                    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:3px;color:#C9956A;text-transform:uppercase;">Dorcy Vogue</p>
                    <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#fff;letter-spacing:1px;">🧾 Payment Receipt Uploaded</h1>
                  </td>
                </tr>

                <!-- Banner -->
                <tr>
                  <td style="background:#B78A62;padding:12px 40px;text-align:center;">
                    <p style="margin:0;font-size:13px;font-weight:700;color:#fff;letter-spacing:1px;">Order: <span style="font-size:15px;">${orderId}</span></p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:32px 40px;">
                    <p style="margin:0 0 24px;font-size:14px;color:#555;line-height:1.6;">
                      A customer has uploaded their payment receipt and is awaiting your verification.
                    </p>

                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F2;border-radius:12px;overflow:hidden;margin-bottom:28px;">
                      <tr>
                        <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#8C8682;text-transform:uppercase;letter-spacing:1px;width:40%;">Customer</td>
                        <td style="padding:10px 16px;font-size:13px;font-weight:700;color:#1C1512;">${customerName}</td>
                      </tr>
                      <tr style="background:#f5f0ea;">
                        <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#8C8682;text-transform:uppercase;letter-spacing:1px;">Email</td>
                        <td style="padding:10px 16px;font-size:13px;color:#1C1512;">${customerEmail}</td>
                      </tr>
                      <tr>
                        <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#8C8682;text-transform:uppercase;letter-spacing:1px;">Order ID</td>
                        <td style="padding:10px 16px;font-size:13px;color:#1C1512;">${orderId}</td>
                      </tr>
                      <tr style="background:#f5f0ea;">
                        <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#8C8682;text-transform:uppercase;letter-spacing:1px;">Amount</td>
                        <td style="padding:10px 16px;font-size:14px;font-weight:800;color:#B78A62;">₦${Number(amount).toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#8C8682;text-transform:uppercase;letter-spacing:1px;">Uploaded At</td>
                        <td style="padding:10px 16px;font-size:13px;color:#1C1512;">${new Date().toLocaleString("en-NG", { timeZone: "Africa/Lagos", dateStyle: "medium", timeStyle: "short" })} (WAT)</td>
                      </tr>
                    </table>

                    <div style="text-align:center;margin-bottom:16px;">
                      <a href="${receiptUrl}" target="_blank" style="display:inline-block;padding:12px 28px;background:#B78A62;color:#fff;font-size:13px;font-weight:700;text-decoration:none;border-radius:10px;letter-spacing:0.5px;margin-right:12px;">
                        View Receipt →
                      </a>
                      <a href="https://dorcyvogue.com/admin/orders/${orderId}" style="display:inline-block;padding:12px 28px;background:#1C1512;color:#fff;font-size:13px;font-weight:700;text-decoration:none;border-radius:10px;letter-spacing:0.5px;">
                        Confirm Payment →
                      </a>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#FAF7F2;padding:20px 40px;text-align:center;border-top:1px solid #f0ece6;">
                    <p style="margin:0;font-size:11px;color:#8C8682;">This is an automated notification from <strong>Dorcy Vogue</strong>.</p>
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
        subject: `🧾 Receipt Uploaded: ${orderId} — ₦${Number(amount).toLocaleString()} from ${customerName}`,
        html,
      });

      return NextResponse.json({ sent: true, type: "receipt_uploaded" });
    }

    // ── Payment Confirmed → notify customer ──────────────────────────────────
    if (type === "payment_confirmed") {
      const { orderId, customerName, customerEmail, amount, items } = body;

      const itemsHtml = (items || [])
        .map(
          (item: any) =>
            `<tr>
              <td style="padding:8px 12px;border-bottom:1px solid #f0ece6;font-size:13px;color:#1C1512;">${item.name}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #f0ece6;font-size:13px;color:#555;text-align:center;">${item.size}${item.color && item.color !== "—" && item.color !== "Default" ? ` / ${item.color}` : ""}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #f0ece6;font-size:13px;color:#555;text-align:center;">×${item.qty}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #f0ece6;font-size:13px;font-weight:700;color:#B78A62;text-align:right;">₦${(item.price * item.qty).toLocaleString()}</td>
            </tr>`
        )
        .join("");

      const html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8" /></head>
        <body style="margin:0;padding:0;background:#FAF7F2;font-family:'Helvetica Neue',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F2;padding:40px 20px;">
            <tr><td align="center">
              <table width="580" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(28,21,18,0.08);">

                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#1C1512 0%,#3a2a1a 100%);padding:32px 40px;text-align:center;">
                    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:3px;color:#C9956A;text-transform:uppercase;">Dorcy Vogue</p>
                    <h1 style="margin:8px 0 0;font-size:24px;font-weight:700;color:#fff;letter-spacing:1px;">✅ Payment Confirmed!</h1>
                  </td>
                </tr>

                <!-- Green Banner -->
                <tr>
                  <td style="background:#22c55e;padding:14px 40px;text-align:center;">
                    <p style="margin:0;font-size:13px;font-weight:700;color:#fff;letter-spacing:0.5px;">Your payment has been verified — we're preparing your order!</p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:36px 40px;">
                    <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#1C1512;">Hi ${customerName},</p>
                    <p style="margin:0 0 28px;font-size:14px;color:#555;line-height:1.6;">
                      Great news! We've confirmed your payment for order <strong>${orderId}</strong>. Your items are now being prepared and will be on their way to you soon.
                    </p>

                    <!-- Order Summary -->
                    <h2 style="margin:0 0 14px;font-size:13px;font-weight:700;color:#B78A62;text-transform:uppercase;letter-spacing:1.5px;">Order Summary</h2>
                    ${itemsHtml ? `
                    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0ece6;border-radius:12px;overflow:hidden;margin-bottom:24px;">
                      <thead>
                        <tr style="background:#FAF7F2;">
                          <th style="padding:10px 12px;font-size:11px;font-weight:700;color:#8C8682;text-align:left;text-transform:uppercase;letter-spacing:1px;">Item</th>
                          <th style="padding:10px 12px;font-size:11px;font-weight:700;color:#8C8682;text-align:center;text-transform:uppercase;letter-spacing:1px;">Variant</th>
                          <th style="padding:10px 12px;font-size:11px;font-weight:700;color:#8C8682;text-align:center;text-transform:uppercase;letter-spacing:1px;">Qty</th>
                          <th style="padding:10px 12px;font-size:11px;font-weight:700;color:#8C8682;text-align:right;text-transform:uppercase;letter-spacing:1px;">Total</th>
                        </tr>
                      </thead>
                      <tbody>${itemsHtml}</tbody>
                    </table>` : ""}

                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F2;border-radius:12px;padding:4px 0;margin-bottom:28px;">
                      <tr>
                        <td style="padding:10px 16px;font-size:13px;color:#8C8682;">Order Reference</td>
                        <td style="padding:10px 16px;font-size:13px;font-weight:700;color:#1C1512;text-align:right;">${orderId}</td>
                      </tr>
                      <tr style="border-top:2px solid #e8ddd4;">
                        <td style="padding:12px 16px;font-size:15px;font-weight:700;color:#1C1512;">Amount Paid</td>
                        <td style="padding:12px 16px;font-size:17px;font-weight:800;color:#B78A62;text-align:right;">₦${Number(amount).toLocaleString()}</td>
                      </tr>
                    </table>

                    <p style="margin:0 0 24px;font-size:13px;color:#555;line-height:1.6;">
                      You can track the status of your order anytime using the button below.
                    </p>

                    <div style="text-align:center;">
                      <a href="https://dorcyvogue.com/track?ref=${orderId}" style="display:inline-block;padding:14px 36px;background:#B78A62;color:#fff;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;letter-spacing:0.5px;">
                        Track My Order →
                      </a>
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#FAF7F2;padding:24px 40px;text-align:center;border-top:1px solid #f0ece6;">
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
        to: customerEmail,
        subject: `✅ Payment Confirmed — Your Dorcy Vogue order ${orderId} is being prepared`,
        html,
      });

      return NextResponse.json({ sent: true, type: "payment_confirmed" });
    }

    return NextResponse.json({ error: "Unknown notification type" }, { status: 400 });
  } catch (err: any) {
    // Never crash the calling function — just log and return ok
    console.error("Admin notification error:", err?.message || err);
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}
