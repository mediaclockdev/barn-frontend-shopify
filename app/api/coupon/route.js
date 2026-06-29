import { fetchWcApi } from "@/src/utils/api-client";
import { NextResponse } from "next/server";
import { rateLimit } from "@/src/lib/rate-limit";

// Rate limiter: Max 5 attempts per IP per minute to prevent brute-forcing coupon codes
const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 500 });

export const POST = async (req) => {
    try {
        // 1. Rate Limiting
        const ip = req.headers.get("x-forwarded-for") || "anonymous";
        const { success } = limiter.check(5, ip);
        if (!success) {
            return NextResponse.json(
                { error: "Too many coupon attempts. Please try again later." },
                { status: 429 }
            );
        }

        const body = await req.json();

        // 2. Input Validation
        const { coupon_code, cart_total } = body;

        if (!coupon_code || typeof coupon_code !== "string" || coupon_code.trim() === "") {
            return NextResponse.json({ error: "Valid coupon code is required" }, { status: 400 });
        }

        if (typeof cart_total !== "number" || isNaN(cart_total) || cart_total < 0) {
            return NextResponse.json({ error: "Valid cart total is required" }, { status: 400 });
        }

        // 3. Sanitization (Allow alphanumeric and dash/underscore)
        const sanitizedCode = coupon_code.trim().replace(/[^a-zA-Z0-9\-_]/g, "");
        if (sanitizedCode !== coupon_code.trim()) {
            return NextResponse.json({ error: "Invalid characters in coupon code" }, { status: 400 });
        }

        // Pass the sanitized body to the custom/v1/apply-coupon endpoint
        const response = await fetchWcApi("custom/v1/apply-coupon", {
            method: "POST",
            body: JSON.stringify({
                coupon_code: sanitizedCode,
                cart_total: cart_total
            }),
        });

        return NextResponse.json(response.data, { status: response.status });
    } catch (error) {
        console.error("Coupon POST Error:", error);

        let errorMessage = error.message || "Internal Server Error";

        // Rephrase technical WooCommerce API errors for the frontend
        if (errorMessage.toLowerCase().includes("invalid coupon") || errorMessage.includes("404 Not Found")) {
            errorMessage = "Invalid Coupon Code";
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: 400 }
        );
    }
}
