import { shopifyFetch } from "./shopify-client";

// Mutations
const customerCreateMutation = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        firstName
        lastName
        email
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const customerAccessTokenCreateMutation = `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const customerRecoverMutation = `
  mutation customerRecover($email: String!) {
    customerRecover(email: $email) {
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const customerResetMutation = `
  mutation customerReset($id: ID!, $input: CustomerResetInput!) {
    customerReset(id: $id, input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const customerUpdateMutation = `
  mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
    customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
      customer {
        id
        firstName
        lastName
        email
        phone
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

// Queries

const getCustomerQuery = `
  query getCustomer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id
      firstName
      lastName
      displayName
      email
      phone
      defaultAddress {
        id
        firstName
        lastName
        address1
        address2
        city
        province
        zip
        country
        phone
      }
      orders(first: 100, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            orderNumber
            processedAt
            financialStatus
            fulfillmentStatus
            totalPrice {
              amount
              currencyCode
            }
            lineItems(first: 20) {
              edges {
                node {
                  title
                  quantity
                  originalTotalPrice {
                    amount
                  }
                  variant {
                    image {
                      url
                    }
                  }
                }
              }
            }
            successfulFulfillments(first: 10) {
              trackingCompany
              trackingInfo {
                number
                url
              }
            }
          }
        }
      }
    }
  }
`;

// Helper functions

export async function createCustomer(input: any) {
  const { body } = await shopifyFetch<any>({
    query: customerCreateMutation,
    variables: { input },
  });

  const errors = body.data?.customerCreate?.customerUserErrors;
  if (errors && errors.length > 0) {
    throw new Error(errors[0].message);
  }

  return body.data?.customerCreate?.customer;
}

export async function loginCustomer(input: any) {
  const { body } = await shopifyFetch<any>({
    query: customerAccessTokenCreateMutation,
    variables: { input },
  });

  const errors = body.data?.customerAccessTokenCreate?.customerUserErrors;
  if (errors && errors.length > 0) {
    throw new Error(errors[0].message);
  }

  return body.data?.customerAccessTokenCreate?.customerAccessToken;
}

export async function recoverCustomer(email: string) {
  const { body } = await shopifyFetch<any>({
    query: customerRecoverMutation,
    variables: { email },
  });

  const errors = body.data?.customerRecover?.customerUserErrors;
  if (errors && errors.length > 0) {
    throw new Error(errors[0].message);
  }

  return true;
}

export async function resetCustomer(id: string, input: any) {
  const { body } = await shopifyFetch<any>({
    query: customerResetMutation,
    variables: { id, input },
  });

  const errors = body.data?.customerReset?.customerUserErrors;
  if (errors && errors.length > 0) {
    throw new Error(errors[0].message);
  }

  return body.data?.customerReset?.customerAccessToken;
}

export async function updateCustomer(customerAccessToken: string, customer: any) {
  const { body } = await shopifyFetch<any>({
    query: customerUpdateMutation,
    variables: { customerAccessToken, customer },
  });

  const errors = body.data?.customerUpdate?.customerUserErrors;
  if (errors && errors.length > 0) {
    throw new Error(errors[0].message);
  }

  return body.data?.customerUpdate?.customer;
}

export async function getCustomer(customerAccessToken: string) {
  const { body } = await shopifyFetch<any>({
    query: getCustomerQuery,
    variables: { customerAccessToken },
  });

  return body.data?.customer;
}

const customerAddressCreateMutation = `
  mutation customerAddressCreate($customerAccessToken: String!, $address: MailingAddressInput!) {
    customerAddressCreate(customerAccessToken: $customerAccessToken, address: $address) {
      customerAddress {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

export async function createCustomerAddress(customerAccessToken: string, address: any) {
  const { body } = await shopifyFetch<any>({
    query: customerAddressCreateMutation,
    variables: { customerAccessToken, address },
  });

  const errors = body.data?.customerAddressCreate?.customerUserErrors;
  if (errors && errors.length > 0) {
    throw new Error(errors[0].message);
  }

  return body.data?.customerAddressCreate?.customerAddress;
}

const customerAddressUpdateMutation = `
  mutation customerAddressUpdate($customerAccessToken: String!, $id: ID!, $address: MailingAddressInput!) {
    customerAddressUpdate(customerAccessToken: $customerAccessToken, id: $id, address: $address) {
      customerAddress {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

const customerDefaultAddressUpdateMutation = `
  mutation customerDefaultAddressUpdate($customerAccessToken: String!, $addressId: ID!) {
    customerDefaultAddressUpdate(customerAccessToken: $customerAccessToken, addressId: $addressId) {
      customer {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

export async function updateCustomerAddress(customerAccessToken: string, id: string, address: any) {
  const { body } = await shopifyFetch<any>({
    query: customerAddressUpdateMutation,
    variables: { customerAccessToken, id, address },
  });

  const errors = body.data?.customerAddressUpdate?.customerUserErrors;
  if (errors && errors.length > 0) {
    throw new Error(errors[0].message);
  }

  return body.data?.customerAddressUpdate?.customerAddress;
}

export async function updateCustomerDefaultAddress(customerAccessToken: string, addressId: string) {
  const { body } = await shopifyFetch<any>({
    query: customerDefaultAddressUpdateMutation,
    variables: { customerAccessToken, addressId },
  });

  const errors = body.data?.customerDefaultAddressUpdate?.customerUserErrors;
  if (errors && errors.length > 0) {
    throw new Error(errors[0].message);
  }

  return body.data?.customerDefaultAddressUpdate?.customer;
}
