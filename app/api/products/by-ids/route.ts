import { NextResponse } from "next/server";
import { fetchShopifyProductsByIds } from "@/src/utils/shopify-products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get("ids");

  if (!ids) {
    return NextResponse.json(
      { error: "Missing ids parameter" },
      { status: 400 },
    );
  }

  try {
    const idsArray = ids.split(",").map((id) => id.trim()).filter(Boolean);
    const products = await fetchShopifyProductsByIds(idsArray);
    return NextResponse.json({ count: products.length, products: products });
  } catch (error: any) {
    console.error("Error fetching products by ids:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
