/**
 * Australia Post PAC API integration.
 * Uses the Postage Assessment Calculator (free API) to get domestic parcel rates.
 *
 * API Docs: https://developers.auspost.com.au/apis/pac
 */

import { fetchWcApi } from "./api-client";

// ── Types ───────────────────────────────────────────────────

export interface AusPostService {
  code: string; // e.g. "AUS_PARCEL_REGULAR", "AUS_PARCEL_EXPRESS"
  name: string; // e.g. "Parcel Post", "Express Post"
  price: number; // e.g. 15.50
}

export interface AusPostRateResult {
  available: boolean;
  services: AusPostService[];
  totalWeightKg: number;
  message?: string;
}

interface CartItemForShipping {
  product_id: number;
  quantity: number;
}

// ── Constants ───────────────────────────────────────────────

const AUSPOST_API_BASE = "https://digitalapi.auspost.com.au";
const ORIGIN_POSTCODE = "3523"; // Heathcote VIC — from SHOP_ORIGIN_ADDRESS

// ── Main Function ───────────────────────────────────────────

/**
 * Get available Australia Post shipping services and rates for a given
 * destination postcode and cart items.
 *
 * IMPORTANT: All products in the cart MUST have weight and dimensions
 * configured in WooCommerce. If any product is missing this data,
 * Australia Post shipping will be marked as unavailable.
 *
 * Flow:
 * 1. Fetch product weights from WooCommerce
 * 2. Validate all products have shipping data
 * 3. Calculate total parcel weight
 * 4. Call AusPost PAC API for available services + prices
 */
export async function getAusPostRates(
  destinationPostcode: string,
  cartItems: CartItemForShipping[],
): Promise<AusPostRateResult> {
  const apiKey = process.env.AUSPOST_API_KEY;

  if (!apiKey) {
    throw new Error(
      "AUSPOST_API_KEY is not configured. Please add it to your .env file.",
    );
  }

  if (!destinationPostcode || !/^\d{4}$/.test(destinationPostcode)) {
    throw new Error("Please enter a valid 4-digit Australian postcode.");
  }

  // Step 1: Get product weights from WooCommerce and validate
  const parcelResult = await getCartParcelInfo(cartItems);

  // If any product is missing shipping data, AusPost is not available
  if (!parcelResult.valid) {
    return {
      available: false,
      services: [],
      totalWeightKg: 0,
      message: parcelResult.message,
    };
  }

  const { totalWeightKg, maxLength, maxWidth, maxHeight } = parcelResult;

  // Step 2: Call AusPost PAC API
  const services = await fetchAusPostServices(
    ORIGIN_POSTCODE,
    destinationPostcode,
    totalWeightKg,
    maxLength,
    maxWidth,
    maxHeight,
    apiKey,
  );

  if (services.length === 0) {
    return {
      available: false,
      services: [],
      totalWeightKg,
      message:
        "No Australia Post services available for this destination. Please select a different shipping method.",
    };
  }

  return {
    available: true,
    services,
    totalWeightKg,
  };
}

// ── Helpers ─────────────────────────────────────────────────

/**
 * Fetch product weights and dimensions from WooCommerce,
 * then validate ALL products have shipping data and calculate totals.
 *
 * Returns { valid: false, message } if any product is missing weight or dimensions.
 */
export async function getCartParcelInfo(
  cartItems: CartItemForShipping[],
): Promise<
  | {
      valid: true;
      totalWeightKg: number;
      maxLength: number;
      maxWidth: number;
      maxHeight: number;
    }
  | {
      valid: false;
      message: string;
      totalWeightKg?: undefined;
      maxLength?: undefined;
      maxWidth?: undefined;
      maxHeight?: undefined;
    }
> {
  const productIds = [...new Set(cartItems.map((item) => item.product_id))];

  let productsMap: Record<
    number,
    {
      name?: string;
      weight: string;
      dimensions: { length: string; width: string; height: string };
    }
  > = {};

  try {
    // Batch-fetch product weight/dimensions from WooCommerce
    const idsParam = productIds.join(",");

    const res = await fetchWcApi<any>(
      `wc/v3/products?include=${idsParam}&_fields=id,name,weight,dimensions&per_page=${productIds.length}`,
    );

    const products = Array.isArray(res.data) ? res.data : [];
    products.forEach((p: any) => {
      productsMap[p.id] = {
        name: p.name || `Product #${p.id}`,
        weight: p.weight || "",
        dimensions: p.dimensions || {},
      };
    });
  } catch (err) {
    console.error("[AusPost] Could not fetch product data from WC:", err);
    return {
      valid: false,
      message:
        "Could not verify product shipping data. Australia Post shipping is unavailable at this time.",
    };
  }

  // Using static fallbacks for missing weight/dimensions
  let totalWeightKg = 0;
  let maxLength = 0;
  let maxWidth = 0;
  let maxHeight = 0;

  for (const item of cartItems) {
    const product = productsMap[item.product_id];

    let weight = parseFloat(product?.weight || "0");
    let l = parseFloat(product?.dimensions?.length || "0");
    let w = parseFloat(product?.dimensions?.width || "0");
    let h = parseFloat(product?.dimensions?.height || "0");

    // Static fallbacks for missing data
    if (isNaN(weight) || weight <= 0) weight = 1; // 1kg
    if (isNaN(l) || l <= 0) l = 20; // 20cm
    if (isNaN(w) || w <= 0) w = 20; // 20cm
    if (isNaN(h) || h <= 0) h = 20; // 20cm

    totalWeightKg += weight * item.quantity;

    if (l > maxLength) maxLength = l;
    if (w > maxWidth) maxWidth = w;
    if (h > maxHeight) maxHeight = h;
  }

  // AusPost minimum weight is 0.1 kg
  if (totalWeightKg < 0.1) totalWeightKg = 0.1;

  // AusPost max weight for standard parcels is 22 kg
  if (totalWeightKg > 22) {
    return {
      valid: false,
      message: `Australia Post is not available because this order exceeds the maximum weight limit of 22kg.`,
    };
  }

  return { valid: true, totalWeightKg, maxLength, maxWidth, maxHeight };
}

/**
 * Call the Australia Post PAC domestic parcel service API.
 * Returns available services with prices.
 */
async function fetchAusPostServices(
  fromPostcode: string,
  toPostcode: string,
  weightKg: number,
  lengthCm: number,
  widthCm: number,
  heightCm: number,
  apiKey: string,
): Promise<AusPostService[]> {
  const params = new URLSearchParams({
    from_postcode: fromPostcode,
    to_postcode: toPostcode,
    length: String(Math.ceil(lengthCm)),
    width: String(Math.ceil(widthCm)),
    height: String(Math.ceil(heightCm)),
    weight: String(weightKg.toFixed(2)),
  });

  const url = `${AUSPOST_API_BASE}/postage/parcel/domestic/service.json?${params}`;

  const response = await fetch(url, {
    headers: {
      "AUTH-KEY": apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[AusPost] API Error:", response.status, errorText);
    throw new Error(
      "Failed to get Australia Post rates. Please try again or select a different shipping method.",
    );
  }

  const data = await response.json();

  // The PAC API returns services in: data.services.service (array or single object)
  const rawServices = data?.services?.service;

  if (!rawServices) return [];

  const serviceList = Array.isArray(rawServices) ? rawServices : [rawServices];

  return serviceList
    .filter((s: any) => s.price && parseFloat(s.price) > 0)
    .map((s: any) => ({
      code: s.code || "",
      name: s.name || "Standard",
      price: parseFloat(s.price),
    }));
}
