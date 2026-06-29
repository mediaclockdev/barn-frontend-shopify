import AboutSection from "@/src/components/landing/About";
import Blog from "@/src/components/landing/Blog";
import NewHero from "@/src/components/landing/NewHero";
import OnSale from "@/src/components/landing/OnSale";
import { fetchShopifyProducts } from "@/src/utils/shopify-products";
import { resolveHomepageBlogs } from "@/src/utils/blog-api";
import { getHomePageData } from "@/src/utils/home-api";
import { HOME_FALLBACK } from "@/src/utils/home-fallback";
import { constructMetadata } from "@/src/utils/seo";

export async function generateMetadata() {
  const home = await getHomePageData();
  const content = { ...HOME_FALLBACK, ...(home?.data || {}) };

  // For the homepage, we use the first slide's title and description for SEO
  return constructMetadata({
    title: `Barn | ${content.slide_1_title}`,
    description: content.slide_1_desc,
    image: content.slide_1_img,
  });
}

export default async function Page() {
  const res: any = await fetchShopifyProducts({ per_page: "6" }).catch((error) => {
    console.error("Failed to fetch Home products: ", error);
    return { products: [] };
  });

  const sale_products = res.products || [];

  const home = await getHomePageData();
  const content = { ...HOME_FALLBACK, ...(home?.data || {}) };

  // ── Blog data ──────────────────────────────────────────
  // TODO: Fetch blogs from WordPress API natively if needed
  const blogs = resolveHomepageBlogs([]).slice(0, 3);

  return (
    <>
      <NewHero
        slides={[
          {
            title: content.slide_1_title,
            desc: content.slide_1_desc,
            img: content.slide_1_img,
          },
          {
            title: content.slide_2_title,
            desc: content.slide_2_desc,
            img: content.slide_2_img,
          },
          {
            title: content.slide_3_title,
            desc: content.slide_3_desc,
            img: content.slide_3_img,
          },
        ]}
      />
      <AboutSection
        title={content.home_about_title}
        subtitle={content.home_about_content}
        image={content.home_about_image}
      />
      <OnSale
        products={sale_products}
        title={content.onsale_title}
        highlight={content.onsale_highlight}
      />
      <Blog
        blogs={blogs}
        title={content.blog_title}
        highlight={content.blog_highlight}
      />
    </>
  );
}
