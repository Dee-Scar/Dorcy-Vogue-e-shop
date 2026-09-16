// Server component — fetches products server-side so Google sees real content
import { createClient } from "@supabase/supabase-js";
import { ShopClient } from "./ShopClient";
import type { Product } from "@/data/products";

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

async function getInitialProducts(): Promise<Product[]> {
  try {
    const { data } = await admin()
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
    const { data } = await admin()
      .from("categories")
      .select("name")
      .eq("status", "Active");
    return (data || []).map((c: any) => c.name);
  } catch {
    return [];
  }
}

/**
 * The ?filter=new and ?filter=featured views match products against these CMS
 * lists. They must be rendered on the server: if the page first paints with
 * empty lists, every product fails the filter and the shop briefly claims
 * nothing matched.
 */
async function getInitialCmsLists(): Promise<{ featured: string[]; newArrivals: string[] }> {
  try {
    const { data } = await admin()
      .from("cms_settings")
      .select("featured_products,new_arrival_products")
      .eq("id", 1)
      .single();
    return {
      featured: data?.featured_products || [],
      newArrivals: data?.new_arrival_products || [],
    };
  } catch {
    return { featured: [], newArrivals: [] };
  }
}

export default async function ShopPage() {
  const [initialProducts, initialCategories, cmsLists] = await Promise.all([
    getInitialProducts(),
    getInitialCategories(),
    getInitialCmsLists(),
  ]);

  return (
    <ShopClient
      initialProducts={initialProducts}
      initialCategories={initialCategories}
      initialFeatured={cmsLists.featured}
      initialNewArrivals={cmsLists.newArrivals}
    />
  );
}
