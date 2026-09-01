import { shopifyFetch } from "./shopify-client";
import { cache } from "react";

export const getHomePageData = cache(async (): Promise<{ data: any } | null> => {
  const query = `
    query getHomePage {
      metaobject(handle: { type: "home_page", handle: "home-page" }) {
        slide_1_title: field(key: "slide_1_title") { value }
        slide_1_desc: field(key: "slide_1_desc") { value }
        slide_1_img: field(key: "slide_1_img") { 
          reference { ... on MediaImage { image { url } } }
        }
        slide_2_title: field(key: "slide_2_title") { value }
        slide_2_desc: field(key: "slide_2_desc") { value }
        slide_2_img: field(key: "slide_2_img") { 
          reference { ... on MediaImage { image { url } } }
        }
        slide_3_title: field(key: "slide_3_title") { value }
        slide_3_desc: field(key: "slide_3_desc") { value }
        slide_3_img: field(key: "slide_3_img") { 
          reference { ... on MediaImage { image { url } } }
        }
        home_about_title: field(key: "home_about_title") { value }
        home_about_content: field(key: "home_about_content") { value }
        home_about_image: field(key: "home_about_image") { 
          reference { ... on MediaImage { image { url } } }
        }
        onsale_title: field(key: "onsale_title") { value }
        onsale_highlight: field(key: "onsale_highlight") { value }
        blog_title: field(key: "blog_title") { value }
        blog_highlight: field(key: "blog_highlight") { value }
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
      slide_1_title: metaobject.slide_1_title?.value,
      slide_1_desc: metaobject.slide_1_desc?.value,
      slide_1_img: metaobject.slide_1_img?.reference?.image?.url,
      slide_2_title: metaobject.slide_2_title?.value,
      slide_2_desc: metaobject.slide_2_desc?.value,
      slide_2_img: metaobject.slide_2_img?.reference?.image?.url,
      slide_3_title: metaobject.slide_3_title?.value,
      slide_3_desc: metaobject.slide_3_desc?.value,
      slide_3_img: metaobject.slide_3_img?.reference?.image?.url,
      home_about_title: metaobject.home_about_title?.value,
      home_about_content: metaobject.home_about_content?.value,
      home_about_image: metaobject.home_about_image?.reference?.image?.url,
      onsale_title: metaobject.onsale_title?.value,
      onsale_highlight: metaobject.onsale_highlight?.value,
      blog_title: metaobject.blog_title?.value,
      blog_highlight: metaobject.blog_highlight?.value,
    };

    // Remove any undefined or null values so the frontend fallback can fill them in
    const data: Record<string, string> = {};
    Object.entries(rawData).forEach(([key, val]) => {
      if (val) data[key] = val;
    });

    return { data };
  } catch (error) {
    console.error("Failed to fetch Home Page data from Shopify:", error);
    return { data: null };
  }
});
