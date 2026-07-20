// Server component — fetches products server-side so Google sees real content
import { createClient } from "@supabase/supabase-js";
import { ShopClient } from "./ShopClient";
import type { Product } from "@/data/products";

async function getInitialProducts(): Promise<Product[]> {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );

    const { data } = await supabaseAdmin
      .from("products")
      .select("id,name,price,image,images,category,description,sizes,colors,status,stock")
      .neq("status", "Draft")
      .order("created_at", { ascending: false });

    return (data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      formattedPrice: "₦" + Number(p.price).toLocaleString(),
      image: p.image,
      images: p.images || [],
      category: p.category,
      description: p.description || "",
      sizes: p.sizes || [],
      colors: p.colors || [],
      details: [],
      status: p.status || "Active",
      comparePrice: p.compare_price ? Number(p.compare_price) : undefined,
    }));
  } catch {
    return [];
  }
}

async function getInitialCategories(): Promise<string[]> {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
    const { data } = await supabaseAdmin
      .from("categories")
      .select("name")
      .eq("status", "Active");
    return (data || []).map((c: any) => c.name);
  } catch {
    return [];
  }
}

export default async function ShopPage() {
  const [initialProducts, initialCategories] = await Promise.all([
    getInitialProducts(),
    getInitialCategories(),
  ]);

  return (
    <ShopClient
      initialProducts={initialProducts}
      initialCategories={initialCategories}
    />
  );
}
