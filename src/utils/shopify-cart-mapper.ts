import { ShopifyCart } from "./shopify-cart";

export function mapShopifyCart(shopifyCart: ShopifyCart) {
  if (!shopifyCart) return { items: [], cartId: null, checkoutUrl: null };

  const items = shopifyCart.lines.edges.map(({ node }) => {
    return {
      line_id: node.id,
      product_id: node.merchandise.product.id,
      variation_id: node.merchandise.id,
      name: node.merchandise.product.title,
      quantity: node.quantity,
      price: parseFloat(node.merchandise.price.amount),
      image: node.merchandise.image?.url || node.merchandise.product.featuredImage?.url || "",
      slug: node.merchandise.product.handle,
      variation_name: node.merchandise.title !== "Default Title" ? node.merchandise.title : "",
      variation_attributes: node.merchandise.selectedOptions.reduce((acc, opt) => {
        acc[opt.name] = opt.value;
        return acc;
      }, {} as Record<string, string>)
    };
  });

  return {
    items,
    cartId: shopifyCart.id,
    checkoutUrl: shopifyCart.checkoutUrl,
  };
}
