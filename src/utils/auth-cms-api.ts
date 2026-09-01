import { shopifyFetch } from "./shopify-client";
import { cache } from "react";

/**
 * Service to fetch dynamic content for the Auth pages.
 * Requires a Metaobject definition with type "auth_page" and handle "auth-page".
 */
export const getAuthPageData = cache(async (): Promise<{ data: any } | null> => {
  const query = `
    query getAuthPage {
      metaobject(handle: { type: "auth_page", handle: "auth-page" }) {
        login_title: field(key: "login_title") { value }
        signup_title: field(key: "signup_title") { value }
        forget_title: field(key: "forget_title") { value }
        reset_title: field(key: "reset_title") { value }
        login_image: field(key: "login_image") { 
          reference { ... on MediaImage { image { url } } }
        }
        signup_image: field(key: "signup_image") { 
          reference { ... on MediaImage { image { url } } }
        }
        forget_image: field(key: "forget_image") { 
          reference { ... on MediaImage { image { url } } }
        }
        reset_image: field(key: "reset_image") { 
          reference { ... on MediaImage { image { url } } }
        }
      }
    }
  `;

  try {
    const res = await shopifyFetch<any>({ query });
    const metaobject = res?.body?.data?.metaobject;
    
    if (!metaobject) {
      return { data: null };
    }

    // Safely extract values from the metaobject fields
    const rawData = {
      login_title: metaobject.login_title?.value,
      signup_title: metaobject.signup_title?.value,
      forget_title: metaobject.forget_title?.value,
      reset_title: metaobject.reset_title?.value,
      login_image: metaobject.login_image?.reference?.image?.url,
      signup_image: metaobject.signup_image?.reference?.image?.url,
      forget_image: metaobject.forget_image?.reference?.image?.url,
      reset_image: metaobject.reset_image?.reference?.image?.url,
    };

    // Remove any undefined or null values so the frontend fallback can fill them in
    const data: Record<string, string> = {};
    Object.entries(rawData).forEach(([key, val]) => {
      if (val) data[key] = val;
    });

    return { data };
  } catch (error) {
    console.error("Failed to fetch Auth Page data from Shopify:", error);
    return { data: null };
  }
});
