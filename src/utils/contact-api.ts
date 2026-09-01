import { shopifyFetch } from "./shopify-client";
import { cache } from "react";

/**
 * Service to fetch dynamic content for the Contact Us page from Shopify Metaobjects.
 * Requires a Metaobject definition with type "contact_page" and handle "contact-us".
 */
export const getContactPageData = cache(async (): Promise<{ data: any } | null> => {
  const query = `
    query getContactPage {
      metaobject(handle: { type: "contact_page", handle: "contact-us" }) {
        hero_title: field(key: "hero_title") { value }
        hero_subtitle: field(key: "hero_subtitle") { value }
        hero_image: field(key: "hero_image") { 
          reference {
            ... on MediaImage {
              image { url }
            }
          }
        }
        address: field(key: "address") { value }
        address_map_url: field(key: "address_map_url") { value }
        phone: field(key: "phone") { value }
        business_hours: field(key: "business_hours") { value }
        email: field(key: "email") { value }
        map_embed_url: field(key: "map_embed_url") { value }
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
      hero_title: metaobject.hero_title?.value,
      hero_subtitle: metaobject.hero_subtitle?.value,
      hero_image: metaobject.hero_image?.reference?.image?.url,
      address: metaobject.address?.value,
      address_map_url: metaobject.address_map_url?.value,
      phone: metaobject.phone?.value,
      business_hours: metaobject.business_hours?.value,
      email: metaobject.email?.value,
      map_embed_url: metaobject.map_embed_url?.value,
    };

    // Remove any undefined or null values so the frontend fallback can fill them in
    const data: Record<string, string> = {};
    Object.entries(rawData).forEach(([key, val]) => {
      if (val) data[key] = val;
    });

    return { data };
  } catch (error) {
    console.error("Failed to fetch Contact Page data from Shopify:", error);
    return { data: null };
  }
});
