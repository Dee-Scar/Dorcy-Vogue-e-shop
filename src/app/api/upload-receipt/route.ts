import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { orderId, receiptUrl } = await request.json();

    if (!orderId || !receiptUrl) {
      return NextResponse.json(
        { error: "Order ID and Receipt URL are required." },
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

    const { error } = await supabaseAdmin
      .from("orders")
      .update({
        receipt_url: receiptUrl,
        receipt_uploaded_at: new Date().toISOString(),
        status: "Awaiting Verification",
        payment_status: "Awaiting Verification",
      })
      .eq("id", orderId);

    if (error) {
      console.error("Error updating order with receipt:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("API Error in upload-receipt:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
