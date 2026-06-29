import { NextResponse } from "next/server";
import { getCustomer } from "@/src/utils/shopify-auth";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = parseInt(searchParams.get("per_page") || "5", 10);

    const customer = await getCustomer(token);
    if (!customer) {
      return NextResponse.json({ message: "Customer not found" }, { status: 404 });
    }

    const allOrders = customer.orders?.edges?.map(({ node }: any) => {
      // Shopify fulfillmentStatus can be null (unfulfilled), FULFILLED, PARTIALLY_FULFILLED, RESTOCKED
      // Shopify financialStatus can be PAID, PENDING, REFUNDED, etc.
      let status = "pending";
      if (node.fulfillmentStatus === "FULFILLED") {
        status = "shipped";
      } else if (node.fulfillmentStatus === "PARTIALLY_FULFILLED") {
        status = "processing";
      } else if (node.financialStatus === "PAID") {
        status = "processing";
      } else if (node.financialStatus === "REFUNDED") {
        status = "cancelled";
      }

      // Extract tracking info
      let tracking_number = null;
      let tracking_url = null;
      let tracking_company = null;
      if (node.successfulFulfillments && node.successfulFulfillments.length > 0) {
        const fulfillment = node.successfulFulfillments[0];
        tracking_company = fulfillment.trackingCompany;
        if (fulfillment.trackingInfo && fulfillment.trackingInfo.length > 0) {
          tracking_number = fulfillment.trackingInfo[0].number;
          tracking_url = fulfillment.trackingInfo[0].url;
        }
      }

      return {
        id: node.id,
        number: node.orderNumber,
        status: status,
        date: node.processedAt,
        total: node.totalPrice?.amount || "0.00",
        currency: node.totalPrice?.currencyCode || "AUD",
        items: node.lineItems?.edges?.map(({ node: item }: any) => ({
          name: item.title,
          quantity: item.quantity,
          image: item.variant?.image?.url || "",
          total: item.originalTotalPrice?.amount || "0.00",
        })) || [],
        tracking_number: tracking_number,
        tracking_url: tracking_url,
        tracking_company: tracking_company,
        shipping_method: tracking_company || "Standard Shipping",
        order_source: "website",
      };
    }) || [];

    // Paginate manually since Shopify doesn't easily offset-paginate
    const startIndex = (page - 1) * perPage;
    const paginatedOrders = allOrders.slice(startIndex, startIndex + perPage);
    const totalPages = Math.ceil(allOrders.length / perPage) || 1;

    return NextResponse.json(
      {
        orders: paginatedOrders,
        currentPage: page,
        totalPages: totalPages,
        total: allOrders.length,
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("[API Get User Orders] Server Error", err);
    return NextResponse.json(
      { message: err.message || "Server Error" },
      { status: 500 },
    );
  }
}
