import { NextResponse } from "next/server";
import { fetchWcApi } from "@/src/utils/api-client";
import { rateLimit } from "@/src/lib/rate-limit";

const limiter = rateLimit({ interval: 60_000 });

// PayPal API base URL — defaults to sandbox for safety.
// Set PAYPAL_API_URL=https://api-m.paypal.com in .env.local for production.
const PAYPAL_API_BASE =
  process.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com";

/**
 * Get a PayPal access token using OAuth2 client credentials.
 */
async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET_KEY;

  if (!clientId || !secret) {
    throw new Error("PayPal credentials are not configured.");
  }

  const credentials = Buffer.from(`${clientId}:${secret}`).toString("base64");

  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok || !data.access_token) {
    throw new Error("Failed to obtain PayPal access token.");
  }

  return data.access_token;
}


/**
 * Capture a PayPal order by its transaction ID (PayPal Order ID).
 * Returns the capture status, amount, and currency.
 */
async function capturePayPalOrder(paypalOrderId: string): Promise<{
  status: string;
  amount: string;
  currency: string;
  transactionId: string;
}> {
  const accessToken = await getPayPalAccessToken();

  const res = await fetch(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${paypalOrderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      `PayPal capture failed: ${errorData.message || res.statusText}`,
    );
  }

  const data = await res.json();

  if (data.status !== "COMPLETED") {
    throw new Error(`Capture not completed. Status: ${data.status}`);
  }

  // Extract the captured payment from the first purchase unit
  const capture = data.purchase_units?.[0]?.payments?.captures?.[0];

  if (!capture) {
    throw new Error("No completed capture found for this PayPal transaction.");
  }

  return {
    status: capture.status,
    amount: capture.amount?.value || "0",
    currency: capture.amount?.currency_code || "",
    transactionId: capture.id,
  };
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "anonymous";
  const { success } = limiter.check(10, `confirm-order-${ip}`);
  if (!success) {
    return NextResponse.json(
      { message: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  try {
    const body = await req.json();
    const { order_id, transaction_id, paypal_order_id } = body;

    const targetId = paypal_order_id || transaction_id;

    if (!order_id || !targetId) {
      return NextResponse.json(
        { message: "Missing order or transaction ID" },
        { status: 400 },
      );
    }

    // ── Step 1: Capture with PayPal that this transaction actually exists ──
    let paypalCapture;
    try {
      paypalCapture = await capturePayPalOrder(targetId);
    } catch (verifyErr: any) {
      console.error(
        "[API Confirm Order] PayPal capture failed:",
        verifyErr.message,
      );
      return NextResponse.json(
        {
          message:
            "Payment verification failed. Transaction could not be verified with PayPal.",
        },
        { status: 400 },
      );
    }

    // ── Step 2: Check that PayPal capture status is COMPLETED ──
    if (paypalCapture.status !== "COMPLETED") {
      console.error(
        `[API Confirm Order] PayPal capture status: "${paypalCapture.status}", expected "COMPLETED"`,
      );
      return NextResponse.json(
        {
          message: `Payment not completed. PayPal status: ${paypalCapture.status}`,
        },
        { status: 400 },
      );
    }

    // ── Step 3: Get WooCommerce order total for comparison ──
    const wcOrder = await fetchWcApi<any>(`wc/v3/orders/${order_id}`, {
      method: "GET",
      cache: "no-store",
    });

    const wcTotal = parseFloat(wcOrder?.data?.total || "0");
    const paypalAmount = parseFloat(paypalCapture.amount);

    // ── Step 4: Verify amount matches (allow $0.01 rounding tolerance) ──
    if (Math.abs(wcTotal - paypalAmount) > 0.01) {
      console.error(
        `[API Confirm Order] Amount mismatch! WooCommerce: $${wcTotal}, PayPal: $${paypalAmount}`,
      );
      return NextResponse.json(
        { message: "Payment amount does not match order total." },
        { status: 400 },
      );
    }

    // ── Step 5: Verify currency is AUD ──
    if (paypalCapture.currency !== "AUD") {
      console.error(
        `[API Confirm Order] Currency mismatch! Expected AUD, got ${paypalCapture.currency}`,
      );
      return NextResponse.json(
        { message: "Payment currency does not match." },
        { status: 400 },
      );
    }

    // ── Step 6: All checks passed — mark WooCommerce order as paid ──
    const res = await fetchWcApi<any>(`custom/v1/orders/${order_id}`, {
      method: "PUT",
      body: JSON.stringify({
        status: "processing",
        set_paid: true,
        transaction_id: paypalCapture.transactionId || targetId,
      }),
    });

    return NextResponse.json({ success: true, order: res.data });
  } catch (err: any) {
    console.error("[API Confirm Order]", err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
