import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Supabase environment variables are not configured on the server." },
        { status: 500 }
      );
    }

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

    return NextResponse.json({ success: true, publicUrl });
  } catch (err: any) {
    console.error("API Error in upload-receipt:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
