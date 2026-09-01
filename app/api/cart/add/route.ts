import { NextResponse } from "next/server";
import { createShopifyCart, addLinesToCart } from "@/src/utils/shopify-cart";
import { mapShopifyCart } from "@/src/utils/shopify-cart-mapper";

export async function POST(req: Request) {
    try {
        const { cartId, variation_id, quantity } = await req.json();

        if (!variation_id) {
            return NextResponse.json({ error: "Missing variation_id/product_id" }, { status: 400 });
        }

        // Shopify expects string gid
        const variantId = String(variation_id);

        let shopifyCart;
        if (cartId) {
            try {
                shopifyCart = await addLinesToCart(cartId, variantId, Number(quantity));
            } catch (err: any) {
                // If the cart expired or was deleted on Shopify's end, recover by creating a new one
                if (err.message && err.message.includes("cart does not exist")) {

                    shopifyCart = await createShopifyCart(variantId, Number(quantity));
                } else {
                    throw err;
                }
            }
        } else {
            shopifyCart = await createShopifyCart(variantId, Number(quantity));
        }

        const mappedCart = mapShopifyCart(shopifyCart);

        return NextResponse.json(mappedCart);
    } catch (error: any) {
        console.error("Cart Add Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}