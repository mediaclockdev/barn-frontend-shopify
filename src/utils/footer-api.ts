import { shopifyFetch } from "./shopify-client";
import { cache } from "react";

/**
 * Service to fetch dynamic content for the Footer.
 * Requires a Metaobject definition with type "footer" and handle "footer".
 */
export const getFooterData = cache(async (): Promise<{ data: any } | null> => {
  const query = `
    query getFooter {
      metaobject(handle: { type: "footer", handle: "footer" }) {
        business_name: field(key: "business_name") { value }
        business_description: field(key: "business_description") { value }
        phone: field(key: "phone") { value }
        address: field(key: "address") { value }
        address_map_url: field(key: "address_map_url") { value }
        hours_mon_thu: field(key: "hours_mon_thu") { value }
        hours_fri: field(key: "hours_fri") { value }
        hours_sat: field(key: "hours_sat") { value }
        hours_sun: field(key: "hours_sun") { value }
        social_instagram: field(key: "social_instagram") { value }
        social_facebook: field(key: "social_facebook") { value }
        social_linkedin: field(key: "social_linkedin") { value }
        quick_link_1_label: field(key: "quick_link_1_label") { value }
        quick_link_1_url: field(key: "quick_link_1_url") { value }
        quick_link_2_label: field(key: "quick_link_2_label") { value }
        quick_link_2_url: field(key: "quick_link_2_url") { value }
        quick_link_3_label: field(key: "quick_link_3_label") { value }
        quick_link_3_url: field(key: "quick_link_3_url") { value }
        quick_link_4_label: field(key: "quick_link_4_label") { value }
        quick_link_4_url: field(key: "quick_link_4_url") { value }
        quick_link_5_label: field(key: "quick_link_5_label") { value }
        quick_link_5_url: field(key: "quick_link_5_url") { value }
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
      business_name: metaobject.business_name?.value,
      business_description: metaobject.business_description?.value,
      phone: metaobject.phone?.value,
      address: metaobject.address?.value,
      address_map_url: metaobject.address_map_url?.value,
      hours_mon_thu: metaobject.hours_mon_thu?.value,
      hours_fri: metaobject.hours_fri?.value,
      hours_sat: metaobject.hours_sat?.value,
      hours_sun: metaobject.hours_sun?.value,
      social_instagram: metaobject.social_instagram?.value,
      social_facebook: metaobject.social_facebook?.value,
      social_linkedin: metaobject.social_linkedin?.value,
      quick_link_1_label: metaobject.quick_link_1_label?.value,
      quick_link_1_url: metaobject.quick_link_1_url?.value,
      quick_link_2_label: metaobject.quick_link_2_label?.value,
      quick_link_2_url: metaobject.quick_link_2_url?.value,
      quick_link_3_label: metaobject.quick_link_3_label?.value,
      quick_link_3_url: metaobject.quick_link_3_url?.value,
      quick_link_4_label: metaobject.quick_link_4_label?.value,
      quick_link_4_url: metaobject.quick_link_4_url?.value,
      quick_link_5_label: metaobject.quick_link_5_label?.value,
      quick_link_5_url: metaobject.quick_link_5_url?.value,
    };

    // Remove any undefined or null values so the frontend fallback can fill them in
    const data: Record<string, string> = {};
    Object.entries(rawData).forEach(([key, val]) => {
      if (val) data[key] = val;
    });

    return { data };
  } catch (error) {
    console.error("Failed to fetch Footer data from Shopify:", error);
    return { data: null };
  }
});
