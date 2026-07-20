import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Use service role key to bypass RLS and read all non-Draft products
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    const { data, error } = await supabaseAdmin
      .from("products")
      .select("id,name,price,compare_price,image,images,category,description,sizes,colors,status,stock")
      .neq("status", "Draft")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const response = NextResponse.json({ products: data || [] });
    // Prevent any caching so customers always get fresh data
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  } catch (err: any) {
    console.error("Error fetching products:", err);
    return NextResponse.json({ products: [], error: err.message }, { status: 500 });
  }
}
