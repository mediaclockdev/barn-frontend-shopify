import { NextResponse } from "next/server";
import { fetchShopifyRecommendations } from "@/src/utils/shopify-products";

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
    const productIds = ids.split(",").map((id) => id.trim()).filter(Boolean);

    // If there are multiple IDs, we'll just grab recommendations based on the first item in the cart.
    // A more advanced approach would fetch recommendations for all and mix them.
    const primaryId = productIds[0];
    
    if (!primaryId) {
      return NextResponse.json({ count: 0, products: [] });
    }

    const recommendations = await fetchShopifyRecommendations(primaryId);

    // Filter out items already in the cart
    const filteredRecommendations = recommendations.filter(
      (p) => !productIds.includes(String(p.id))
    );

    return NextResponse.json({
      count: filteredRecommendations.length,
      products: filteredRecommendations.slice(0, 6),
    });
  } catch (error: any) {
    console.error("Error fetching related products:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
