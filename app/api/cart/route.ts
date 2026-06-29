import { NextResponse } from "next/server";
import { fetchShopifyCart } from "@/src/utils/shopify-cart";
import { mapShopifyCart } from "@/src/utils/shopify-cart-mapper";

export const GET = async (req: Request) => {
    try {
        const { searchParams } = new URL(req.url);
        const cartId = searchParams.get("cartId");

        if (!cartId) {
            return NextResponse.json({ items: [] });
        }

        const shopifyCart = await fetchShopifyCart(cartId);

        if (!shopifyCart) {
            return NextResponse.json({ items: [] });
        }

        const mappedCart = mapShopifyCart(shopifyCart);

        return NextResponse.json(mappedCart);
    } catch (error: any) {
        console.error("Cart GET Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}