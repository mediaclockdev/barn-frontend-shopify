import { NextResponse } from "next/server";
import { fetchWcApi } from "@/src/utils/api-client";
import { calculateShippingCost } from "@/src/utils/shipping";
import { rateLimit } from "@/src/lib/rate-limit";

const limiter = rateLimit({ interval: 60_000 });

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "anonymous";
  const { success } = limiter.check(10, `create-order-${ip}`);
  if (!success) {
    return NextResponse.json(
      { message: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  try {
    const body = await req.json();
    const {
      email,
      phone,
      shipping,
      billing,
      createAccount,
      password,
      cartItems,
      payment_method,
      deliveryMethod,
      customer_id,
    } = body;

    let finalCustomerId = parseInt(customer_id) || 0;

    // Handle optional billing for Local Pickup: ensure address fields are never empty if WC requires them
    const isPickup = deliveryMethod === "pickup";
    const finalBilling = billing || { ...shipping };

    if (isPickup) {
      if (!shipping.address_1) shipping.address_1 = "Store Pickup";
      if (!shipping.city) shipping.city = "Heathcote";
      if (!shipping.state) shipping.state = "VIC";
      if (!shipping.postcode) shipping.postcode = "3523";
      if (!shipping.country) shipping.country = "AU";
    }

    finalBilling.email = email;
    finalBilling.phone = phone;

    if (createAccount && password) {
      // Attempt to create customer
      try {
        const custRes = await fetchWcApi<any>("wc/v3/customers", {
          method: "POST",
          body: JSON.stringify({
            email,
            first_name: shipping.first_name,
            last_name: shipping.last_name,
            password,
            billing: finalBilling,
            shipping: shipping,
          }),
        });
        finalCustomerId = custRes.data.id;
      } catch (cerr: any) {
        console.error("[API Create Order] Failed to create customer", cerr);
        return NextResponse.json(
          {
            message:
              "Failed to create account. Email might already be registered.",
          },
          { status: 400 },
        );
      }
    }

    // ── Server-side shipping cost calculation ──
    // We NEVER trust the client's shippingCost. We recalculate it here.
    let serverShippingCost = 0;
    let shippingMethodId = "local_pickup";
    let shippingMethodTitle = "Store Pickup";

    if (deliveryMethod === "delivery") {
      // Build full address from the shipping fields
      const fullAddress = [
        shipping.address_1,
        shipping.city,
        shipping.state,
        shipping.postcode,
        shipping.country || "Australia",
      ]
        .filter(Boolean)
        .join(", ");

      if (!fullAddress.trim()) {
        return NextResponse.json(
          { message: "Shipping address is required for home delivery." },
          { status: 400 },
        );
      }

      try {
        const shippingResult = await calculateShippingCost(fullAddress);

        if (!shippingResult.available) {
          return NextResponse.json(
            {
              message:
                "Delivery is not available for this address. Please select Store Pickup or contact the store for a quote.",
            },
            { status: 400 },
          );
        }

        serverShippingCost = shippingResult.cost || 0;
        shippingMethodId = "flat_rate";
        shippingMethodTitle = "Local Delivery";
      } catch (shippingErr: any) {
        console.error(
          "[API Create Order] Shipping calculation failed:",
          shippingErr.message,
        );
        return NextResponse.json(
          {
            message: "Failed to calculate shipping cost. Please try again.",
          },
          { status: 500 },
        );
      }
    } else if (deliveryMethod === "auspost") {
      // ── Australia Post: server-side rate verification (via WooCommerce backend) ──
      if (!shipping.postcode) {
        return NextResponse.json(
          { message: "Shipping postcode is required for Australia Post." },
          { status: 400 },
        );
      }

      try {
        const wcRes = await fetchWcApi<any>(
          "custom/v1/shipping/auspost-calculate",
          {
            method: "POST",
            body: JSON.stringify({
              destination_postcode: shipping.postcode,
              cart_items: cartItems.map((item: any) => ({
                product_id: item.product_id,
                variation_id: item.variation_id || 0,
                quantity: item.quantity,
              })),
            }),
          },
        );

        const wcData = wcRes.data;

        if (wcRes.status !== 200 || !wcData.available) {
          return NextResponse.json(
            {
              message:
                wcData.message ||
                "Australia Post shipping is not available for this address.",
            },
            { status: 400 },
          );
        }

        serverShippingCost =
          typeof wcData.cost === "number"
            ? wcData.cost
            : parseFloat(wcData.cost);
        shippingMethodId = "australia_post";
        shippingMethodTitle = wcData.method_name || "Australia Post";
      } catch (shippingErr: any) {
        console.error(
          "[API Create Order] AusPost rate calculation failed:",
          shippingErr.message,
        );
        return NextResponse.json(
          {
            message:
              "Failed to calculate Australia Post rates. Please try again.",
          },
          { status: 500 },
        );
      }
    }
    // For pickup, serverShippingCost stays 0

    const orderPayload: any = {
      payment_method: payment_method || "paypal",
      payment_method_title: "PayPal",
      set_paid: false,
      status: "pending",
      billing: finalBilling,
      shipping: shipping,
      line_items: cartItems.map((item: any) => {
        const lineItem: any = {
          product_id: item.product_id,
          variation_id: item.variation_id || 0,
          quantity: item.quantity,
        };

        // Only include variation fields for variable products
        if (item.variation_id) {
          lineItem.variation_id = item.variation_id;

          // variation_attributes is already a flat object like { "pa_size": "500mls", "pa_color": "red" }
          if (
            item.variation_attributes &&
            Object.keys(item.variation_attributes).length > 0
          ) {
            lineItem.variation = item.variation_attributes;
          }
        }

        return lineItem;
      }),
      shipping_lines: [
        {
          method_id: shippingMethodId,
          method_title: shippingMethodTitle,
          total: String(serverShippingCost),
        },
      ],
      customer_id: finalCustomerId,
    };

    const { couponCode } = body;
    if (couponCode) {
      orderPayload.coupon_lines = [{ code: couponCode }];
    }

    const orderRes = await fetchWcApi<any>("custom/v1/orders", {
      method: "POST",
      body: JSON.stringify(orderPayload),
    });

    return NextResponse.json(
      {
        order_id: orderRes.data.id,
        total: orderRes.data.total,
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("[API Create Order] Server Error", err);
    return NextResponse.json(
      { message: err.message || "Server Error" },
      { status: 500 },
    );
  }
}
