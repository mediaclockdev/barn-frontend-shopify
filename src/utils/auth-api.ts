"use server";

import {
  createCustomer,
  loginCustomer,
  recoverCustomer,
  resetCustomer,
  getCustomer,
} from "./shopify-auth";

export async function loginUser(credentials: {
  email: string;
  password: string;
}) {
  try {
    const token = await loginCustomer({
      email: credentials.email,
      password: credentials.password,
    });

    if (!token?.accessToken) {
      return { error: "Invalid credentials", success: false };
    }

    // Fetch customer details to return
    const customer = await getCustomer(token.accessToken);

    return {
      success: true,
      token: token.accessToken,
      id: customer.id,
      email: customer.email,
      first_name: customer.firstName || "",
      last_name: customer.lastName || "",
      display_name: customer.displayName || "",
    };
  } catch (error: any) {
    return { error: error.message || "Login failed", success: false };
  }
}

export async function signupUser(userData: {
  email: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  username?: string; // Kept for backwards compatibility with UI
}) {
  try {
    if (!userData.password) {
      return { error: "Password is required", success: false };
    }

    const customer = await createCustomer({
      email: userData.email,
      password: userData.password,
      firstName: userData.first_name || "",
      lastName: userData.last_name || "",
    });

    return { success: true, customer };
  } catch (error: any) {
    return { error: error.message || "Signup failed", success: false };
  }
}

export async function forgotPassword(email: string) {
  try {
    await recoverCustomer(email);
    return { success: true, message: "If an account exists, a reset link will be sent." };
  } catch (error: any) {
    // We typically want to return success anyway to prevent email enumeration,
    // but we can return the error if needed.
    return { error: error.message || "Request failed", success: false };
  }
}

export async function resetPassword(payload: any, token?: string | null) {
  // In Shopify, reset password requires `id` and `resetToken` in the URL/payload
  // Our legacy UI payload had different structure. Assuming payload contains `password`, `id`, `resetToken`
  try {
    if (!payload.id || !payload.resetToken || !payload.password) {
      return { error: "Missing reset token or password", success: false };
    }

    // Ensure id is a global GraphQL ID
    const formattedId = payload.id.includes("gid://")
      ? payload.id
      : `gid://shopify/Customer/${payload.id}`;

    const newAccessToken = await resetCustomer(formattedId, {
      resetToken: payload.resetToken,
      password: payload.password,
    });

    return { success: true, token: newAccessToken?.accessToken };
  } catch (error: any) {
    return { error: error.message || "Reset failed", success: false };
  }
}
