import { NextResponse } from "next/server";
import { removeCartLines } from "@/src/utils/shopify-cart";
import { mapShopifyCart } from "@/src/utils/shopify-cart-mapper";

export async function POST(req: Request) {
    try {
        const { cartId, line_id } = await req.json();

        if (!cartId || !line_id) {
            return NextResponse.json({ error: "Missing cartId or line_id" }, { status: 400 });
        }

        const shopifyCart = await removeCartLines(cartId, [line_id]);

        const mappedCart = mapShopifyCart(shopifyCart);

        return NextResponse.json(mappedCart);
    } catch (error: any) {
        console.error("Cart Remove Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
