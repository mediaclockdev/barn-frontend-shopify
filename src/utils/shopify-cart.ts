import { shopifyFetch } from "./shopify-client";

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    price: {
      amount: string;
      currencyCode: string;
    };
    image?: {
      url: string;
      altText?: string;
    };
    product: {
      id: string;
      title: string;
      handle: string;
      featuredImage?: {
        url: string;
      };
    };
    selectedOptions: {
      name: string;
      value: string;
    }[];
  };
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  cost: {
    subtotalAmount: {
      amount: string;
      currencyCode: string;
    };
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
  };
  lines: {
    edges: {
      node: ShopifyCartLine;
    }[];
  };
}

const CART_FRAGMENT = `
  fragment CartDetails on Cart {
    id
    checkoutUrl
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              id
              title
              price {
                amount
                currencyCode
              }
              image {
                url
                altText
              }
              product {
                id
                title
                handle
                featuredImage {
                  url
                }
              }
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
  }
`;

const CREATE_CART_MUTATION = `
  mutation cartCreate($input: CartInput) {
    cartCreate(input: $input) {
      cart {
        ...CartDetails
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

const ADD_LINES_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartDetails
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

const UPDATE_LINES_MUTATION = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartDetails
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

const REMOVE_LINES_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartDetails
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;

const GET_CART_QUERY = `
  query getCart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartDetails
    }
  }
  ${CART_FRAGMENT}
`;

export async function createShopifyCart(variantId: string, quantity: number): Promise<ShopifyCart> {
  const { body } = await shopifyFetch<any>({
    query: CREATE_CART_MUTATION,
    variables: {
      input: {
        lines: [
          {
            merchandiseId: variantId,
            quantity: quantity,
          },
        ],
      },
    },
  });

  if (body.data?.cartCreate?.userErrors?.length > 0) {
    throw new Error(body.data.cartCreate.userErrors[0].message);
  }

  return body.data.cartCreate.cart;
}

export async function addLinesToCart(cartId: string, variantId: string, quantity: number): Promise<ShopifyCart> {
  const { body } = await shopifyFetch<any>({
    query: ADD_LINES_MUTATION,
    variables: {
      cartId,
      lines: [
        {
          merchandiseId: variantId,
          quantity: quantity,
        },
      ],
    },
  });

  if (body.data?.cartLinesAdd?.userErrors?.length > 0) {
    throw new Error(body.data.cartLinesAdd.userErrors[0].message);
  }

  return body.data.cartLinesAdd.cart;
}

export async function updateCartLine(cartId: string, lineId: string, quantity: number): Promise<ShopifyCart> {
  const { body } = await shopifyFetch<any>({
    query: UPDATE_LINES_MUTATION,
    variables: {
      cartId,
      lines: [
        {
          id: lineId,
          quantity: quantity,
        },
      ],
    },
  });

  if (body.data?.cartLinesUpdate?.userErrors?.length > 0) {
    throw new Error(body.data.cartLinesUpdate.userErrors[0].message);
  }

  return body.data.cartLinesUpdate.cart;
}

export async function removeCartLines(cartId: string, lineIds: string[]): Promise<ShopifyCart> {
  const { body } = await shopifyFetch<any>({
    query: REMOVE_LINES_MUTATION,
    variables: {
      cartId,
      lineIds,
    },
  });

  if (body.data?.cartLinesRemove?.userErrors?.length > 0) {
    throw new Error(body.data.cartLinesRemove.userErrors[0].message);
  }

  return body.data.cartLinesRemove.cart;
}

export async function fetchShopifyCart(cartId: string): Promise<ShopifyCart | null> {
  try {
    const { body } = await shopifyFetch<any>({
      query: GET_CART_QUERY,
      variables: { cartId },
    });

    return body.data?.cart || null;
  } catch (error) {
    console.error("Error fetching cart from Shopify:", error);
    return null;
  }
}

const UPDATE_BUYER_IDENTITY_MUTATION = `
  mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function updateCartBuyerIdentity(cartId: string, customerAccessToken: string): Promise<void> {
  const { body } = await shopifyFetch<any>({
    query: UPDATE_BUYER_IDENTITY_MUTATION,
    variables: {
      cartId,
      buyerIdentity: {
        customerAccessToken,
      },
    },
  });

  if (body.data?.cartBuyerIdentityUpdate?.userErrors?.length > 0) {
    console.error("Failed to update cart buyer identity:", body.data.cartBuyerIdentityUpdate.userErrors);
  }
}
