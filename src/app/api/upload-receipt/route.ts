import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const orderId = formData.get("orderId") as string | null;

    if (!file || !orderId) {
      return NextResponse.json(
        { error: "File and Order ID are required." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fqtdhlbfsapkpgnxocpi.supabase.co";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxdGRobGJmc2Fwa3BnbnhvY3BpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzE3ODI1NCwiZXhwIjoyMDk4NzU0MjU0fQ.s0JEDmQAaSFB3VUowJaauL1bXbJ_A69rcM7aZc0xT8Q";

    // Initialize admin client to bypass RLS policies
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const fileExt = file.name.split(".").pop();
    const fileName = `${orderId}_${Date.now()}.${fileExt}`;
    const filePath = `receipts/${fileName}`;

    // Convert file to array buffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to receipts bucket using service role client
    const { error: uploadError } = await supabaseAdmin.storage
      .from("receipts")
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Error uploading file to storage:", uploadError);
      return NextResponse.json(
        { error: `Storage upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get Public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from("receipts")
      .getPublicUrl(filePath);

    // Update order record
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        receipt_url: publicUrl,
        receipt_uploaded_at: new Date().toISOString(),
        status: "Awaiting Verification",
        payment_status: "Awaiting Verification",
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("Error updating order record:", updateError);
      return NextResponse.json(
        { error: `Database update failed: ${updateError.message}` },
        { status: 500 }
      );
    }

    // Fetch order details to include in admin notification
    const { data: orderData } = await supabaseAdmin
      .from("orders")
      .select("full_name, email, shipping_cost, order_items(price, quantity)")
      .eq("id", orderId)
      .maybeSingle();

    const customerName = orderData?.full_name || "Customer";
    const customerEmail = orderData?.email || "";
    const total =
      (orderData?.order_items || []).reduce(
        (sum: number, item: any) => sum + Number(item.price || 0) * Number(item.quantity || 1),
        0
      ) + Number(orderData?.shipping_cost || 0);

    // Fire admin notification — don't block the response if it fails
    try {
      const headersList = await headers();
      const host = headersList.get("host") || "localhost:3000";
      const protocol = host.includes("localhost") ? "http" : "https";
      await fetch(`${protocol}://${host}/api/notify-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "receipt_uploaded",
          orderId,
          customerName,
          customerEmail,
          receiptUrl: publicUrl,
          amount: total,
        }),
      });
    } catch (notifyErr) {
      console.warn("Admin receipt notification failed (non-fatal):", notifyErr);
    }

    return NextResponse.json({ success: true, publicUrl });
  } catch (err: any) {
    console.error("API Error in upload-receipt:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
