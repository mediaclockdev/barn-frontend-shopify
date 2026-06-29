import { NextResponse } from "next/server";
import { calculateShippingCost } from "@/src/utils/shipping";
import { fetchWcApi } from "@/src/utils/api-client";
// OLD: Direct AusPost PAC API — now handled by WooCommerce backend
// import { getAusPostRates } from "@/src/utils/auspost";
import { rateLimit } from "@/src/lib/rate-limit";

const limiter = rateLimit({ interval: 60_000 });

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const { success } = limiter.check(15, `shipping-${ip}`);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const { method } = body;

    // ── Australia Post Rate Calculation (NEW: via WooCommerce backend) ──
    if (method === "auspost") {
      const { destinationPostcode, cartItems } = body;

      if (!destinationPostcode) {
        return NextResponse.json(
          { error: "Destination postcode is required." },
          { status: 400 },
        );
      }

      if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        return NextResponse.json(
          { error: "Cart items are required to calculate shipping." },
          { status: 400 },
        );
      }

      try {
        const wcRes = await fetchWcApi<any>(
          "custom/v1/shipping/auspost-calculate",
          {
            method: "POST",
            body: JSON.stringify({
              destination_postcode: destinationPostcode,
              cart_items: cartItems.map((item: any) => ({
                product_id: item.product_id,
                variation_id: item.variation_id || 0,
                quantity: item.quantity,
              })),
            }),
          },
        );

        const wcData = wcRes.data;

        if (wcRes.status !== 200) {
          return NextResponse.json({
            available: false,
            cost: null,
            message:
              wcData.error ||
              wcData.message ||
              "Australia Post shipping is currently unavailable.",
          });
        }

        if (!wcData.available) {
          return NextResponse.json({
            available: false,
            cost: null,
            message:
              wcData.message ||
              "Australia Post shipping is not available for this postcode.",
          });
        }

        return NextResponse.json({
          available: true,
          cost: wcData.cost,
          method_name: wcData.method_name || "Australia Post",
        });
      } catch (err: any) {
        console.error("[Shipping API] AusPost WC backend error:", err.message);
        return NextResponse.json({
          available: false,
          cost: null,
          message:
            "Australia Post shipping is currently unavailable. Please select a different shipping method.",
        });
      }
    }

    // ── Local Delivery (Distance-Based) — existing logic ──
    const { destinationAddress } = body;

    if (!process.env.GOOGLE_MAPS_API_KEY) {
      console.warn(
        "GOOGLE_MAPS_API_KEY is not defined. Please add it to your .env file.",
      );

      return NextResponse.json(
        {
          error:
            "Shipping calculation is currently unavailable. Please contact support or select Store Pickup.",
        },
        { status: 500 },
      );
    }

    const result = await calculateShippingCost(destinationAddress);

    if (!result.available) {
      return NextResponse.json({
        available: false,
        cost: null,
        zone: result.zone,
        distanceKm: result.distanceKm,
        message: result.message,
      });
    }

    return NextResponse.json({
      available: true,
      cost: result.cost,
      zone: result.zone,
      distanceKm: result.distanceKm,
    });
  } catch (error: any) {
    console.error("Shipping API Error:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to calculate shipping" },
      { status: 500 },
    );
  }
}
