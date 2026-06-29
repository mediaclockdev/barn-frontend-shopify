export interface ShopifyImage {
  id: string;
  url: string;
  altText: string | null;
}

export interface ShopifyOption {
  name: string;
  values: string[];
}

export interface ShopifySelectedOption {
  name: string;
  value: string;
}

export interface ShopifyVariant {
  id: string;
  title: string;
  sku: string | null;
  availableForSale: boolean;
  quantityAvailable: number;
  price: {
    amount: string;
    currencyCode: string;
  };
  compareAtPrice: {
    amount: string;
    currencyCode: string;
  } | null;
  weight: number | null;
  weightUnit: string | null;
  image?: {
    url: string;
    altText?: string | null;
  } | null;
  selectedOptions: ShopifySelectedOption[];
}

export interface ShopifyCollection {
  id: string;
  title: string;
  handle: string;
}

export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  descriptionHtml: string;
  description: string;
  tags: string[];
  productType: string;
  availableForSale: boolean;
  totalInventory: number;
  options: ShopifyOption[];
  variants: ShopifyVariant[];
  images: ShopifyImage[];
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice: { amount: string; currencyCode: string };
  };
  compareAtPriceRange?: {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice: { amount: string; currencyCode: string };
  };
  collections: ShopifyCollection[];
}
