/**
 * Shared shipping cost calculation logic.
 * Used by both /api/shipping/calculate (to show cost to user)
 * and /api/orders/create (to enforce correct cost on the server).
 */

export interface ShippingResult {
  available: boolean;
  cost: number | null;
  zone: number;
  distanceKm: number;
  message?: string;
}

export async function calculateShippingCost(
  destinationAddress: string,
): Promise<ShippingResult> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const origin =
    process.env.SHOP_ORIGIN_ADDRESS ||
    "62-76 Kilmore Rd, Heathcote VIC 3523, Australia";

  if (!apiKey) {
    throw new Error("GOOGLE_MAPS_API_KEY is not configured.");
  }

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destinationAddress)}&units=metric&key=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== "OK" || data.rows[0].elements[0].status !== "OK") {
    throw new Error(
      "Could not calculate distance to the provided address. Please check your address.",
    );
  }

  const distanceMeters = data.rows[0].elements[0].distance.value;
  const distanceKm = distanceMeters / 1000;

  // Zone 1 = within 10km = $25.00
  // Zone 2 = 10km to 25km = $55.00
  // Zone 3 = 25km+ = Contact store
  if (distanceKm <= 10) {
    return { available: true, cost: 25.0, zone: 1, distanceKm };
  } else if (distanceKm > 10 && distanceKm <= 25) {
    return { available: true, cost: 55.0, zone: 2, distanceKm };
  } else {
    return {
      available: false,
      cost: null,
      zone: 3,
      distanceKm,
      message: "Contact the store for a quote.",
    };
  }
}
