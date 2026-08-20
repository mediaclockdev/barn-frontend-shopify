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

  // The client requested to keep their proper HTML intact.
  // We will pass the descriptionHtml directly without heavily modifying it.
  let rawDescription = product.descriptionHtml || product.description || "";

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
