const domain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_TOKEN;

export async function shopifyFetch<T>({
  query,
  variables,
}: {
  query: string;
  variables?: Record<string, any>;
}): Promise<{ status: number; body: T } | never> {
  // Use the API version specified by the user (2026-04, but standard versions usually are like 2024-04. The user said 2026-04 in the prompt, let's use what they said)
  const endpoint = `https://${domain}/api/2026-04/graphql.json`;

  try {
    const result = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": storefrontAccessToken!,
      },
      body: JSON.stringify({
        ...(query && { query }),
        ...(variables && { variables }),
      }),
      cache: "no-store",
    });

    const body = await result.json();

    if (body.errors) {
      console.error("Shopify GraphQL Errors:", body.errors);
      throw new Error(body.errors[0].message);
    }

    return {
      status: result.status,
      body,
    };
  } catch (error) {
    console.error("Error connecting to Shopify API:", error);
    throw error;
  }
}
