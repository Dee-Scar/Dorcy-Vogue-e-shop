import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Called by admin actions to silently revalidate customer-facing pages
export async function POST() {
  try {
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/faq");
    revalidatePath("/product/[id]", "page");
    return NextResponse.json({ revalidated: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
