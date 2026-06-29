import { NextResponse } from "next/server";
import { updateCartBuyerIdentity } from "@/src/utils/shopify-cart";

export async function POST(req: Request) {
  try {
    const { cartId, customerAccessToken } = await req.json();

    if (!cartId || !customerAccessToken) {
      return NextResponse.json(
        { message: "cartId and customerAccessToken are required" },
        { status: 400 },
      );
    }

    await updateCartBuyerIdentity(cartId, customerAccessToken);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error("[API Cart Merge] Error:", err);
    return NextResponse.json(
      { message: err.message || "Server Error" },
      { status: 500 },
    );
  }
}
