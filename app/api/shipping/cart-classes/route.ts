import { NextResponse } from "next/server";
import { fetchWcApi } from "@/src/utils/api-client";
import { rateLimit } from "@/src/lib/rate-limit";

const limiter = rateLimit({ interval: 60_000 });

/**
 * POST /api/shipping/cart-classes
 *
 * Fetches the WooCommerce `shipping_class` for each product in the cart.
 * Used to detect "pickup-only" items and force the order to Store Pickup
 * when the cart is mixed (shippable + pickup-only items).
 *
 * Request:  { cartItems: [{ product_id: 123 }, ...] }
 * Response: { items: [...], has_pickup_only: boolean, has_shippable: boolean }
 */
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const { success } = limiter.check(20, `cart-classes-${ip}`);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const { cartItems } = body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { error: "Cart items are required." },
        { status: 400 },
      );
    }

    const productIds = [
      ...new Set(cartItems.map((i: any) => i.product_id)),
    ] as number[];

    // Fetch shipping_class from WooCommerce for each product
    const idsParam = productIds.join(",");
    const res = await fetchWcApi<any>(
      `wc/v3/products?include=${idsParam}&_fields=id,name,shipping_class&per_page=${productIds.length}`,
    );

    const products = Array.isArray(res.data) ? res.data : [];

    const items = products.map((p: any) => ({
      product_id: p.id,
      name: p.name || `Product #${p.id}`,
      shipping_class: p.shipping_class || "",
    }));

    // Detect pickup-only and shippable items
    // NOTE: The exact slug "pickup-only" may need adjustment based on
    // what the client configures in WooCommerce shipping classes.
    const hasPickupOnly = items.some(
      (item: any) =>
        item.shipping_class === "pickup-only" ||
        item.shipping_class === "pickup_only" ||
        item.shipping_class === "local-pickup",
    );

    const hasShippable = items.some(
      (item: any) =>
        item.shipping_class !== "pickup-only" &&
        item.shipping_class !== "pickup_only" &&
        item.shipping_class !== "local-pickup",
    );

    return NextResponse.json({
      items,
      has_pickup_only: hasPickupOnly,
      has_shippable: hasShippable,
    });
  } catch (err: any) {
    console.error("[API Cart Classes] Error:", err.message);
    return NextResponse.json(
      { error: "Failed to fetch shipping classes." },
      { status: 500 },
    );
  }
}
