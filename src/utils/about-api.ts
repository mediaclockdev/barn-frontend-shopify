import { shopifyFetch } from "./shopify-client";
import { cache } from "react";

/**
 * Service to fetch dynamic content for the About Us page from Shopify Metaobjects.
 * Requires a Metaobject definition with type "about_page" and handle "about-page".
 */
export const getAboutPageData = cache(async (): Promise<{ data: any } | null> => {
  const query = `
    query getAboutPage {
      metaobject(handle: { type: "about_page", handle: "about-page" }) {
        hero_title: field(key: "hero_title") { value }
        hero_subtitle: field(key: "hero_subtitle") { value }
        hero_image: field(key: "hero_image") { 
          reference {
            ... on MediaImage {
              image { url }
            }
          }
        }
        story_title: field(key: "story_title") { value }
        story_content: field(key: "story_content") { value }
        story_image: field(key: "story_image") { 
          reference {
            ... on MediaImage {
              image { url }
            }
          }
        }
        core_value_1: field(key: "core_value_1") { value }
        core_value_2: field(key: "core_value_2") { value }
        core_value_3: field(key: "core_value_3") { value }
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
      story_title: metaobject.story_title?.value,
      story_content: metaobject.story_content?.value,
      story_image: metaobject.story_image?.reference?.image?.url,
      core_value_1: metaobject.core_value_1?.value,
      core_value_2: metaobject.core_value_2?.value,
      core_value_3: metaobject.core_value_3?.value,
    };

    // Remove any undefined or null values so the frontend fallback can fill them in
    const data: Record<string, string> = {};
    Object.entries(rawData).forEach(([key, val]) => {
      if (val) data[key] = val;
    });

    return { data };
  } catch (error) {
    console.error("Failed to fetch About Page data from Shopify:", error);
    return { data: null };
  }
});

