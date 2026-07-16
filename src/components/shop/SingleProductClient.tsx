"use client";

import ProductLayout from "./ProductLayout";
import { useProductStore } from "@/src/store/productStore";

const SingleProductClient = ({
  serverProduct,
  serverRelatedProducts = [],
  slug,
}: {
  serverProduct?: any;
  serverRelatedProducts?: any[];
  slug: string;
}) => {
  const storeProduct = useProductStore((state) => state.selectedProduct);

  const product = serverProduct || storeProduct;


  if (typeof window !== "undefined" && product) {
    console.log("=== FULL SHOPIFY PRODUCT DETAILS ===");
    console.log(product);
    console.log("===================================");
  }

  if (!product) {
    return (
      <div className="text-center py-20 text-2xl font-bold text-gray-800">
        Product Not Found
      </div>
    );
  }

  let rawDescription = (product.descriptionHtml || product.description || "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "") // Remove embedded style tags
    .replace(/(?:\.[a-zA-Z0-9_-]+\s*\{[^}]*\}\s*)+/g, "") // Remove stray MS Word CSS text
    .replace(/\s+/g, " ")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/(<br\s*\/?>\s*){3,}/gi, "<br/><br/>") // Only reduce 3+ to 2
    .replace(/<p[^>]*>\s*(?:<br\s*\/?>|&nbsp;|\s)*\s*<\/p>/gi, "")
    .trim();

  const isVariable =
    product.variants?.length > 1 ||
    (product.options &&
      product.options.length > 0 &&
      product.options[0]?.name !== "Title");

  return (
    <div>
      <ProductLayout
        id={product.id}
        title={product.title}
        price={parseFloat(product.variants?.[0]?.compareAtPrice?.amount || product.variants?.[0]?.price?.amount || "0")}
        image={product.images?.[0]?.url || "/images/placeholder.svg"}
        images={product.images}
        description={rawDescription || "No description available"}
        descriptionHtml={rawDescription}
        stars={5}
        type={isVariable ? "variable" : "simple"}
        attributes={product.options}
        variations={product.variants}
        relatedProducts={serverRelatedProducts}
        manageStock={true}
        stockQuantity={product.totalInventory}
        stockStatus={product.availableForSale ? "instock" : "outofstock"}
        slug={product.handle}
      />
    </div>
  );
};

export default SingleProductClient;
