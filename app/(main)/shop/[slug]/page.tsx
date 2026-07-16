import { Metadata } from "next";
import { fetchShopifyProduct, fetchCustomSimilarProducts } from "@/src/utils/shopify-products";
import { constructMetadata } from "@/src/utils/seo";
import SingleProductClient from "@/src/components/shop/SingleProductClient";
import { cache } from "react";

type Props = {
  params: Promise<{ slug: string }>;
};

const getProduct = cache(async (slug: string) => {
  return fetchShopifyProduct(slug).catch(() => null);
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return constructMetadata({
      title: "Product Not Found | Barn Shop",
      description: "Discover our wide range of products at Barn.",
      noIndex: true,
    });
  }

  return constructMetadata({
    title: `${product.title} | Barn Shop`,
    description:
      (product.descriptionHtml || product.description || "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]*>?/gm, "")
        .replace(/\*\*/g, "")
        .replace(/Â/g, "")
        .trim() || `Shop the best deals on ${product.title} at Barn.`,
    url: `/shop/${slug}`,
  });
}

const page = async ({ params }: Props) => {
  const { slug } = await params;
  const product = await getProduct(slug);
  
  let recommendations = [];
  if (product) {
    recommendations = await fetchCustomSimilarProducts(product).catch(() => []);
  }

  return <SingleProductClient serverProduct={product} serverRelatedProducts={recommendations} slug={slug} />;
};

export default page;
