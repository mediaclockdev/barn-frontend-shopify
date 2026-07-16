import { shopifyFetch } from "./shopify-client";
import { ShopifyProduct } from "./shopify-types";

const getProductQuery = `
  query getProduct($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      descriptionHtml
      description
      tags
      productType
      availableForSale
      totalInventory
      priceRange {
        minVariantPrice { amount currencyCode }
        maxVariantPrice { amount currencyCode }
      }
      compareAtPriceRange {
        minVariantPrice { amount currencyCode }
        maxVariantPrice { amount currencyCode }
      }
      options {
        name
        values
      }
      variants(first: 100) {
        edges {
          node {
            id
            title
            sku
            availableForSale
            quantityAvailable
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            image {
              url
              altText
            }
            weight
            weightUnit
            selectedOptions {
              name
              value
            }
          }
        }
      }
      images(first: 100) {
        edges {
          node {
            id
            url
            altText
          }
        }
      }
      collections(first: 100) {
        edges {
          node {
            id
            title
            handle
          }
        }
      }
    }
  }
`;

export async function fetchShopifyProduct(handle: string): Promise<ShopifyProduct | null> {
  try {
    const { body } = await shopifyFetch<any>({
      query: getProductQuery,
      variables: { handle },
    });

    if (!body.data?.product) {
      return null;
    }

    const p = body.data.product;

    const mappedProduct: ShopifyProduct = {
      id: p.id,
      handle: p.handle,
      title: p.title,
      descriptionHtml: p.descriptionHtml,
      description: p.description,
      tags: p.tags || [],
      productType: p.productType || "simple",
      availableForSale: p.availableForSale,
      totalInventory: p.totalInventory ?? 0,
      priceRange: p.priceRange,
      compareAtPriceRange: p.compareAtPriceRange,
      options: p.options?.map((opt: any) => ({
        name: opt.name,
        values: opt.values,
      })) || [],
      variants: p.variants?.edges?.map(({ node: v }: any) => ({
        id: v.id,
        title: v.title,
        sku: v.sku || null,
        availableForSale: v.availableForSale,
        quantityAvailable: v.quantityAvailable ?? 0,
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        image: v.image || null,
        weight: v.weight || null,
        weightUnit: v.weightUnit || null,
        selectedOptions: v.selectedOptions || [],
      })) || [],
      images: p.images?.edges?.map(({ node: img }: any) => ({
        id: img.id,
        url: img.url,
        altText: img.altText || null,
      })) || [],
      collections: p.collections?.edges?.map(({ node: c }: any) => ({
        id: c.id,
        title: c.title,
        handle: c.handle,
      })) || [],
    };

    return mappedProduct;
  } catch (error) {
    console.error(`Failed to fetch shopify product with handle: ${handle}`, error);
    return null;
  }
}

const getProductsQuery = `
  query getProducts($first: Int!, $query: String) {
    products(first: $first, query: $query) {
      pageInfo {
        hasNextPage
      }
      edges {
        node {
          id
          handle
          title
          descriptionHtml
          description
          tags
          productType
          availableForSale
          totalInventory
          options {
            name
            values
          }
          variants(first: 100) {
            edges {
              node {
                id
                title
                sku
                availableForSale
                quantityAvailable
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                image {
                  url
                  altText
                }
                weight
                weightUnit
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
          images(first: 10) {
            edges {
              node {
                id
                url
                altText
              }
            }
          }
          collections(first: 10) {
            edges {
              node {
                id
                title
                handle
              }
            }
          }
        }
      }
    }
  }
`;

export async function fetchShopifyProducts(
  params?: Record<string, string>,
): Promise<{
  products: ShopifyProduct[];
  totalPages: number;
  totalItems: number;
}> {
  try {
    const page = parseInt(params?.page || "1", 10);
    const perPage = parseInt(params?.per_page || "12", 10);
    
    // Simplistic pagination: fetch enough to cover the requested page, then slice.
    // A robust Shopify implementation would use cursors instead.
    const first = page * perPage;
    
    // Basic search/filter mapping
    let queryFragments = [];
    if (params?.search) queryFragments.push(`title:*${params.search}*`);
    if (params?.stock_status === "instock") queryFragments.push(`available_for_sale:true`);
    else if (params?.stock_status === "outofstock") queryFragments.push(`-available_for_sale:true`);
    if (params?.on_sale === "true") queryFragments.push(`is_price_reduced:true`);
    else if (params?.on_sale === "false") queryFragments.push(`-is_price_reduced:true`);
    if (params?.category) {
      const tags = params.category.split(",").map(tag => `tag:"${tag.trim()}"`);
      if (tags.length > 0) {
        queryFragments.push(`(${tags.join(" OR ")})`);
      }
    }
    
    const query = queryFragments.length > 0 ? queryFragments.join(" AND ") : null;

    const { body } = await shopifyFetch<any>({
      query: getProductsQuery,
      variables: { first, query },
    });

    if (!body.data?.products?.edges) {
      return { products: [], totalPages: 1, totalItems: 0 };
    }

    const edges = body.data.products.edges;
    
    // Slice to the correct page
    const startIndex = (page - 1) * perPage;
    const pageEdges = edges.slice(startIndex, startIndex + perPage);

    const products = pageEdges.map(({ node: p }: any) => {
      return {
        id: p.id,
        handle: p.handle,
        title: p.title,
        descriptionHtml: p.descriptionHtml,
        description: p.description,
        tags: p.tags || [],
        productType: p.productType || "simple",
        availableForSale: p.availableForSale,
        totalInventory: p.totalInventory ?? 0,
        priceRange: p.priceRange || {
          minVariantPrice: { amount: "0", currencyCode: "AUD" },
          maxVariantPrice: { amount: "0", currencyCode: "AUD" },
        },
        compareAtPriceRange: p.compareAtPriceRange || undefined,
        options: p.options?.map((opt: any) => ({
          name: opt.name,
          values: opt.values,
        })) || [],
        variants: p.variants?.edges?.map(({ node: v }: any) => ({
          id: v.id,
          title: v.title,
          sku: v.sku || null,
          availableForSale: v.availableForSale,
          quantityAvailable: v.quantityAvailable ?? 0,
          price: v.price,
          compareAtPrice: v.compareAtPrice,
          image: v.image || null,
          weight: v.weight || null,
          weightUnit: v.weightUnit || null,
          selectedOptions: v.selectedOptions || [],
        })) || [],
        images: p.images?.edges?.map(({ node: img }: any) => ({
          id: img.id,
          url: img.url,
          altText: img.altText || null,
        })) || [],
        collections: p.collections?.edges?.map(({ node: c }: any) => ({
          id: c.id,
          title: c.title,
          handle: c.handle,
        })) || [],
      } as ShopifyProduct;
    });

    // Determine total pages. Since we do simplistic pagination, if hasNextPage is true, we guess there is at least one more page.
    const hasNextPage = body.data.products.pageInfo.hasNextPage;
    const totalPages = hasNextPage ? page + 1 : Math.ceil(edges.length / perPage) || 1;

    return {
      products,
      totalPages,
      totalItems: edges.length, // Not accurate for total store products, but reflects current fetched batch
    };
  } catch (error) {
    console.error("Error fetching Shopify Products:", error);
    return { products: [], totalPages: 1, totalItems: 0 };
  }
}



const getCollectionsQuery = `
  query getCollections {
    collections(first: 100) {
      edges {
        node {
          id
          handle
          title
          metafield(namespace: "custom", key: "sidebar_filters") {
            value
            references(first: 50) {
              edges {
                node {
                  ... on Metaobject {
                    id
                    fields {
                      key
                      value
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export async function fetchShopifyCategories() {
  try {
    const { body } = await shopifyFetch<any>({
      query: getCollectionsQuery,
    });

    if (!body.data?.collections?.edges) {
      return [];
    }

    const categories = body.data.collections.edges.map(({ node }: any) => {
      let filters = [];
      if (node.metafield?.references?.edges) {
        filters = node.metafield.references.edges.map((refEdge: any) => {
          const fields = refEdge.node.fields;
          const labelField = fields.find((f: any) => f.key === "label")?.value;
          const tagsFieldRaw = fields.find((f: any) => f.key === "tags")?.value;
          
          let parsedTags: string[] = [];
          try {
            parsedTags = JSON.parse(tagsFieldRaw || "[]");
          } catch (e) {
            // fallback if it's not valid json string array
            parsedTags = tagsFieldRaw ? tagsFieldRaw.split(",").map((t: string) => t.trim()) : [];
          }

          return {
            id: refEdge.node.id, // Metaobject ID
            title: labelField,
            // The frontend expands category group IDs into tags using items array
            items: parsedTags.map(tag => ({ id: tag, name: tag })),
          };
        });
      }

      return {
        category: node.title,
        title: node.title,
        slug: node.handle,
        filters: filters
      };
    });

    // Return the mapped collections as top-level categories, excluding Shopify system defaults
    const excludedTitles = ["home page", "automated collection", "hydrogen"];
    return categories.filter((c: any) => !excludedTitles.includes(c.title.toLowerCase()));
  } catch (error) {
    console.error("Failed to fetch shopify categories", error);
    return [];
  }
}


const getProductsByIdsQuery = `
  query getProductsByIds($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        id
        handle
        title
        descriptionHtml
        description
        tags
        productType
        availableForSale
        totalInventory
        priceRange {
          minVariantPrice { amount currencyCode }
          maxVariantPrice { amount currencyCode }
        }
        compareAtPriceRange {
          minVariantPrice { amount currencyCode }
          maxVariantPrice { amount currencyCode }
        }
        options {
          name
          values
        }
        variants(first: 100) {
          edges {
            node {
              id
              title
              sku
              availableForSale
              quantityAvailable
              price { amount currencyCode }
              compareAtPrice { amount currencyCode }
              image { url altText }
              weight
              weightUnit
              selectedOptions { name value }
            }
          }
        }
        images(first: 10) {
          edges {
            node { id url altText }
          }
        }
        collections(first: 10) {
          edges {
            node { id title handle }
          }
        }
      }
    }
  }
`;

export async function fetchShopifyProductsByIds(ids: string[]): Promise<ShopifyProduct[]> {
  try {
    const { body } = await shopifyFetch<any>({
      query: getProductsByIdsQuery,
      variables: { ids },
    });

    if (!body.data?.nodes) {
      return [];
    }

    return body.data.nodes.filter(Boolean).map((p: any) => ({
      id: p.id,
      handle: p.handle,
      title: p.title,
      descriptionHtml: p.descriptionHtml,
      description: p.description,
      tags: p.tags || [],
      productType: p.productType || "simple",
      availableForSale: p.availableForSale,
      totalInventory: p.totalInventory ?? 0,
      priceRange: p.priceRange || {
        minVariantPrice: { amount: "0", currencyCode: "AUD" },
        maxVariantPrice: { amount: "0", currencyCode: "AUD" },
      },
      compareAtPriceRange: p.compareAtPriceRange || undefined,
      options: p.options?.map((opt: any) => ({
        name: opt.name,
        values: opt.values,
      })) || [],
      variants: p.variants?.edges?.map(({ node: v }: any) => ({
        id: v.id,
        title: v.title,
        sku: v.sku || null,
        availableForSale: v.availableForSale,
        quantityAvailable: v.quantityAvailable ?? 0,
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        image: v.image || null,
        weight: v.weight || null,
        weightUnit: v.weightUnit || null,
        selectedOptions: v.selectedOptions || [],
      })) || [],
      images: p.images?.edges?.map(({ node: img }: any) => ({
        id: img.id,
        url: img.url,
        altText: img.altText || null,
      })) || [],
      collections: p.collections?.edges?.map(({ node: c }: any) => ({
        id: c.id,
        title: c.title,
        handle: c.handle,
      })) || [],
    }));
  } catch (error) {
    console.error("Error fetching Shopify Products by IDs:", error);
    return [];
  }
}

const getRecommendationsQuery = `
  query getProductRecommendations($productId: ID!) {
    productRecommendations(productId: $productId) {
      id
      handle
      title
      descriptionHtml
      description
      tags
      productType
      availableForSale
      totalInventory
      priceRange {
        minVariantPrice { amount currencyCode }
        maxVariantPrice { amount currencyCode }
      }
      compareAtPriceRange {
        minVariantPrice { amount currencyCode }
        maxVariantPrice { amount currencyCode }
      }
      options {
        name
        values
      }
      variants(first: 100) {
        edges {
          node {
            id
            title
            sku
            availableForSale
            quantityAvailable
            price { amount currencyCode }
            compareAtPrice { amount currencyCode }
            image { url altText }
            weight
            weightUnit
            selectedOptions { name value }
          }
        }
      }
      images(first: 10) {
        edges {
          node { id url altText }
        }
      }
      collections(first: 10) {
        edges {
          node { id title handle }
        }
      }
    }
  }
`;

export async function fetchShopifyRecommendations(productId: string): Promise<ShopifyProduct[]> {
  try {
    const { body } = await shopifyFetch<any>({
      query: getRecommendationsQuery,
      variables: { productId },
    });

    if (!body.data?.productRecommendations) {
      return [];
    }

    return body.data.productRecommendations.map((p: any) => ({
      id: p.id,
      handle: p.handle,
      title: p.title,
      descriptionHtml: p.descriptionHtml,
      description: p.description,
      tags: p.tags || [],
      productType: p.productType || "simple",
      availableForSale: p.availableForSale,
      totalInventory: p.totalInventory ?? 0,
      priceRange: p.priceRange || {
        minVariantPrice: { amount: "0", currencyCode: "AUD" },
        maxVariantPrice: { amount: "0", currencyCode: "AUD" },
      },
      compareAtPriceRange: p.compareAtPriceRange || undefined,
      options: p.options?.map((opt: any) => ({
        name: opt.name,
        values: opt.values,
      })) || [],
      variants: p.variants?.edges?.map(({ node: v }: any) => ({
        id: v.id,
        title: v.title,
        sku: v.sku || null,
        availableForSale: v.availableForSale,
        quantityAvailable: v.quantityAvailable ?? 0,
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        image: v.image || null,
        weight: v.weight || null,
        weightUnit: v.weightUnit || null,
        selectedOptions: v.selectedOptions || [],
      })) || [],
      images: p.images?.edges?.map(({ node: img }: any) => ({
        id: img.id,
        url: img.url,
        altText: img.altText || null,
      })) || [],
      collections: p.collections?.edges?.map(({ node: c }: any) => ({
        id: c.id,
        title: c.title,
        handle: c.handle,
      })) || [],
    }));
  } catch (error) {
    console.error("Error fetching Shopify recommendations:", error);
    return [];
  }
}

export async function fetchCustomSimilarProducts(product: ShopifyProduct): Promise<ShopifyProduct[]> {
  try {
    let queryFragments = [];
    
    // 1. Try matching by the first tag
    if (product.tags && product.tags.length > 0) {
      queryFragments.push(`tag:"${product.tags[0]}"`);
    } 
    // 2. Fallback to matching by the first collection if no tags exist
    // Note: To truly filter by collection in the general query, we might need to rely on the collection ID if the backend supports it, 
    // or just return generic products if all else fails. For this storefront, let's use the productType if no tags exist.
    else if (product.productType && product.productType !== "simple" && product.productType !== "") {
      queryFragments.push(`product_type:"${product.productType}"`);
    }

    const query = queryFragments.length > 0 ? queryFragments.join(" AND ") : null;

    // We fetch a few extra in case the current product is in the results
    const res = await shopifyFetch<any>({
      query: getProductsQuery,
      variables: { first: 6, query },
    });

    if (!res.body.data?.products?.edges) {
      return [];
    }

    const products = res.body.data.products.edges.map(({ node }: any) => ({
      id: node.id,
      handle: node.handle,
      title: node.title,
      descriptionHtml: node.descriptionHtml,
      description: node.description,
      tags: node.tags || [],
      productType: node.productType || "simple",
      availableForSale: node.availableForSale,
      totalInventory: node.totalInventory ?? 0,
      priceRange: node.priceRange || {
        minVariantPrice: { amount: "0", currencyCode: "AUD" },
        maxVariantPrice: { amount: "0", currencyCode: "AUD" },
      },
      compareAtPriceRange: node.compareAtPriceRange || undefined,
      options: node.options?.map((opt: any) => ({
        name: opt.name,
        values: opt.values,
      })) || [],
      variants: node.variants?.edges?.map(({ node: v }: any) => ({
        id: v.id,
        title: v.title,
        sku: v.sku || null,
        availableForSale: v.availableForSale,
        quantityAvailable: v.quantityAvailable ?? 0,
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        image: v.image || null,
        weight: v.weight || null,
        weightUnit: v.weightUnit || null,
        selectedOptions: v.selectedOptions || [],
      })) || [],
      images: node.images?.edges?.map(({ node: img }: any) => ({
        id: img.id,
        url: img.url,
        altText: img.altText || null,
      })) || [],
      collections: node.collections?.edges?.map(({ node: c }: any) => ({
        id: c.id,
        title: c.title,
        handle: c.handle,
      })) || [],
    }));

    // Filter out the current product and return exactly 4 related products
    return products.filter((p: ShopifyProduct) => p.id !== product.id).slice(0, 4);
    
  } catch (error) {
    console.error("Error fetching custom similar products:", error);
    return [];
  }
}
