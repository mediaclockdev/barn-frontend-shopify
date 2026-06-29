import { NextResponse } from "next/server";
import { fetchShopifyCart, removeCartLines } from "@/src/utils/shopify-cart";

export async function POST(req: Request) {
    try {
        const { cartId } = await req.json();

        if (cartId) {
            // Fetch the existing cart to get all line IDs
            const cart = await fetchShopifyCart(cartId);
            if (cart && cart.lines.edges.length > 0) {
                const lineIds = cart.lines.edges.map(({ node }) => node.id);
                await removeCartLines(cartId, lineIds);
            }
        }

        // Frontend will also null out the cartId and create a fresh one next time
        return NextResponse.json({ items: [], cartId: null, checkoutUrl: null });
    } catch (error: any) {
        console.error("Cart Clear Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
