export const wcApiUrl = process.env.WC_API_URL;
export const wcConsumerKey = process.env.WC_CONSUMER_KEY;
export const wcConsumerSecret = process.env.WC_CONSUMER_SECRET;

export interface WcApiResponse<T> {
  data: T;
  headers: Headers;
  status: number;
}

export async function fetchWcApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<WcApiResponse<T>> {
  if (!wcApiUrl || !wcConsumerKey || !wcConsumerSecret) {
    console.warn("[API Client] WooCommerce API credentials missing. Bypassing fetch and returning null.");
    return {
      data: null as unknown as T,
      headers: new Headers(),
      status: 200,
    };
  }

  const credentials = Buffer.from(
    `${wcConsumerKey}:${wcConsumerSecret}`,
  ).toString("base64");

  const defaultHeaders = {
    Authorization: `Basic ${credentials}`,
    "Content-Type": "application/json",
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const baseUrl = wcApiUrl.replace(/\/$/, "");

  const path = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  const url = `${baseUrl}/${path}`;

  const response = await fetch(url, config);

  let data;
  let rawData = "";
  try {
    rawData = await response.text();
    data = rawData ? JSON.parse(rawData) : null;
  } catch (err) {
    if (response.ok) {
      console.error(`[API Client] ❌ Failed to parse JSON response.`, err);
      throw err;
    }
    // If not OK, allow the error handling block below to process the HTTP error
  }

  if (!response.ok) {
    const errorMsg = `API Error: ${response.status} ${response.statusText} - ${
      data?.message || (rawData.length > 200 ? rawData.substring(0, 200) + "..." : rawData) || ""
    }`;

    // Suppress errors for CMS pages during migration so it doesn't crash SSR or spam console
    if (
      (response.status === 403 || response.status === 401 || response.status === 404) &&
      endpoint.includes("wp/v2/pages")
    ) {
      console.warn(`[API Client] Suppressed CMS fetch error for ${endpoint}: ${response.status}`);
      return {
        data: null as unknown as T,
        headers: response.headers,
        status: response.status,
      };
    }

    throw new Error(errorMsg);
  }

  return {
    data: data as T,
    headers: response.headers,
    status: response.status,
  };
}
