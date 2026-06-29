import { NextResponse } from "next/server";
import { getCustomer, updateCustomer, createCustomerAddress, updateCustomerAddress, updateCustomerDefaultAddress } from "@/src/utils/shopify-auth";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];

    const customer = await getCustomer(token);

    if (!customer) {
      return NextResponse.json({ message: "Customer not found" }, { status: 404 });
    }

    const defaultAddress = customer.defaultAddress || {};

    const profile = {
      id: customer.id,
      email: customer.email,
      first_name: customer.firstName || "",
      last_name: customer.lastName || "",
      username: customer.email,
      shipping: {
        first_name: defaultAddress.firstName || customer.firstName || "",
        last_name: defaultAddress.lastName || customer.lastName || "",
        address_1: defaultAddress.address1 || "",
        city: defaultAddress.city || "",
        state: defaultAddress.province || "",
        postcode: defaultAddress.zip || "",
        country: defaultAddress.country || "AU",
        phone: defaultAddress.phone || customer.phone || "",
      }
    };

    return NextResponse.json({ profile }, { status: 200 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch customer profile";
    console.error("[API Get Profile] Server Error", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const body = await req.json();

    const customer = await getCustomer(token);
    if (!customer) {
      return NextResponse.json({ message: "Customer not found" }, { status: 404 });
    }

    const updateInput: any = {
      firstName: body.shipping?.first_name || "",
      lastName: body.shipping?.last_name || "",
    };
    if (body.shipping?.phone?.trim()) {
      updateInput.phone = body.shipping.phone.trim();
    }

    await updateCustomer(token, updateInput);

    if (body.shipping) {
      const addressInput: any = {
        firstName: body.shipping.first_name || "",
        lastName: body.shipping.last_name || "",
        address1: body.shipping.address_1 || "",
        city: body.shipping.city || "",
        province: body.shipping.state || "",
        zip: body.shipping.postcode || "",
        country: body.shipping.country || "AU",
      };
      if (body.shipping.phone?.trim()) {
        addressInput.phone = body.shipping.phone.trim();
      }

      if (customer.defaultAddress?.id) {
        // Update existing default address
        await updateCustomerAddress(token, customer.defaultAddress.id, addressInput);
      } else {
        // Create new address and set as default
        const newAddress = await createCustomerAddress(token, addressInput);
        if (newAddress?.id) {
          await updateCustomerDefaultAddress(token, newAddress.id);
        }
      }
    }

    const freshCustomer = await getCustomer(token);
    const defaultAddress = freshCustomer?.defaultAddress || {};

    const profile = {
      id: freshCustomer?.id || customer.id,
      email: freshCustomer?.email || customer.email,
      first_name: freshCustomer?.firstName || customer.firstName || "",
      last_name: freshCustomer?.lastName || customer.lastName || "",
      username: freshCustomer?.email || customer.email,
      shipping: {
        first_name: defaultAddress.firstName || "",
        last_name: defaultAddress.lastName || "",
        address_1: defaultAddress.address1 || "",
        city: defaultAddress.city || "",
        state: defaultAddress.province || "",
        postcode: defaultAddress.zip || "",
        country: defaultAddress.country || "AU",
        phone: defaultAddress.phone || "",
      }
    };

    return NextResponse.json({ profile }, { status: 200 });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to update customer profile";
    console.error("[API Update Profile] Server Error", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}
