import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getCart,
  addToCart,
  updateQuantityAPI,
  removeFromCartAPI,
  clearCartAPI,
} from "@/src/lib/services/cart";
import useAuthStore from "./authStore";

const updateTimeouts: Record<string, NodeJS.Timeout> = {};
const fallbackStates: Record<string, CartItem[]> = {};

export interface CartItem {
  line_id?: string; // Shopify Cart Line ID
  product_id: string | number; // Shopify Product ID or Handle
  variation_id?: string | number; // Shopify Variant ID
  variation_name?: string;
  variation_attributes?: Record<string, string>;
  quantity: number;
  
  // Hydrated data returned from Shopify
  name?: string;
  price?: number;
  image?: string;
  slug?: string;
  maxQuantity?: number;
}

interface CartState {
  cartId: string | null;
  checkoutUrl: string | null;
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  hasHydrated: boolean;
  setCartId: (id: string | null) => void;
  setCheckoutUrl: (url: string | null) => void;
  fetchCart: () => Promise<void>;
  addItem: (
    product_id: number | string,
    quantity: number,
    variation_id?: string | number,
    variation_name?: string,
    variation_attributes?: Record<string, string>,
  ) => Promise<void>;
  updateQuantity: (
    product_id: number | string,
    quantity: number,
    variation_id?: string | number,
    line_id?: string,
  ) => Promise<void>;
  removeItem: (
    product_id: number | string, 
    variation_id?: string | number,
    line_id?: string,
  ) => Promise<void>;
  clearCart: () => void;
  totalItems: () => number;
  deliveryMethod: "pickup" | "delivery" | "auspost" | "";
  shippingCost: number | null;
  setShippingInfo: (
    method: "pickup" | "delivery" | "auspost" | "",
    cost: number | null,
    requiresQuote?: boolean,
  ) => void;
  requiresShippingQuote: boolean;
  setHasHydrated: (value: boolean) => void;
  couponCode: string | null;
  couponDiscount: number;
  couponError: string | null;
  applyCoupon: (code: string, cartTotal: number) => Promise<void>;
  removeCoupon: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartId: null,
      checkoutUrl: null,
      items: [],
      isLoading: false,
      error: null,
      hasHydrated: false,
      deliveryMethod: "",
      shippingCost: null,
      requiresShippingQuote: false,
      couponCode: null,
      couponDiscount: 0,
      couponError: null,

      setHasHydrated: (value) => set({ hasHydrated: value }),
      setCartId: (id) => set({ cartId: id }),
      setCheckoutUrl: (url) => set({ checkoutUrl: url }),

      setShippingInfo: (
        method,
        cost,
        requiresQuote = false,
      ) => {
        set({
          deliveryMethod: method,
          shippingCost: cost,
          requiresShippingQuote: requiresQuote,
        });
      },

      fetchCart: async () => {
        const { cartId } = get();
        if (!cartId) return;

        set({ isLoading: true, error: null });
        try {
          const data = await getCart(cartId);
          set({ items: data?.items || [], checkoutUrl: data?.checkoutUrl || null, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      addItem: async (
        product_id,
        quantity,
        variation_id = 0,
        variation_name = "",
        variation_attributes = {},
      ) => {
        const { cartId } = get();
        const previousItems = [...get().items];

        set({ isLoading: true, error: null });
        try {
          const data = await addToCart(
            cartId,
            variation_id || product_id, // Shopify relies on variant ID. If product has no variants, product ID is passed but ideally it's always variant ID.
            quantity
          );
          if (data && !data.error) {
            set({ 
              items: data.items || [], 
              cartId: data.cartId || cartId, 
              checkoutUrl: data.checkoutUrl || get().checkoutUrl,
              isLoading: false 
            });
          } else {
            set({
              items: previousItems,
              error: data.error || "Failed to add item",
              isLoading: false
            });
          }
        } catch (error: any) {
          set({
            items: previousItems,
            error: error.message || "Failed to add item",
            isLoading: false
          });
        }
      },

      updateQuantity: async (
        product_id,
        quantity,
        variation_id = 0,
        line_id = ""
      ) => {
        const { cartId } = get();
        if (!cartId || !line_id) return;

        const updateKey = line_id;

        if (!updateTimeouts[updateKey]) {
          fallbackStates[updateKey] = [...get().items];
        }

        // Optimistic update
        const newItems = get().items.map((i) =>
          i.line_id === line_id ? { ...i, quantity } : i
        );
        set({ items: newItems, error: null });

        if (updateTimeouts[updateKey]) {
          clearTimeout(updateTimeouts[updateKey]);
        }

        updateTimeouts[updateKey] = setTimeout(async () => {
          const fallback = fallbackStates[updateKey];
          delete updateTimeouts[updateKey];
          delete fallbackStates[updateKey];

          try {
            const data = await updateQuantityAPI(
              cartId,
              line_id,
              quantity
            );
            if (data && !data.error) {
              set({ items: data.items || [], checkoutUrl: data.checkoutUrl || get().checkoutUrl });
            } else {
              set({
                items: fallback,
                error: data.error || "Failed to update quantity",
              });
            }
          } catch (error: any) {
            set({
              items: fallback,
              error: error.message || "Failed to update quantity",
            });
          }
        }, 600); // 600ms debounce
      },

      removeItem: async (product_id, variation_id = 0, line_id = "") => {
        const { cartId } = get();
        if (!cartId || !line_id) return;

        const previousItems = [...get().items];

        // Optimistic update
        const newItems = previousItems.filter((i) => i.line_id !== line_id);
        set({ items: newItems, error: null });

        try {
          const data = await removeFromCartAPI(
            cartId,
            line_id
          );
          if (data && !data.error) {
            set({ items: data.items || [], checkoutUrl: data.checkoutUrl || get().checkoutUrl });
          } else {
            set({
              items: previousItems,
              error: data.error || "Failed to remove item",
            });
          }
        } catch (error: any) {
          set({
            items: previousItems,
            error: error.message || "Failed to remove item",
          });
        }
      },

      clearCart: async () => {
        // Completely destroy the local cart session instead of just emptying the lines.
        // This ensures the next user gets a brand new cart ID without the previous user's identity attached.
        set({ 
          items: [], 
          cartId: null, 
          checkoutUrl: null, 
          couponCode: null, 
          couponDiscount: 0,
          deliveryMethod: "",
          shippingCost: null 
        });
      },

      applyCoupon: async (code: string, cartTotal: number) => {
        // Shopify applies coupons using cartDiscountCodesUpdate (TODO if needed)
        // For now we keep the UI function.
        set({ couponCode: code, couponDiscount: 0 });
      },

      removeCoupon: () => {
        set({ couponCode: null, couponDiscount: 0, couponError: null });
      },

      totalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),
    }),
    {
      name: "cart-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        // Automatically sync with Shopify when returning to the site
        // This clears out stale completed carts after they checkout.
        if (state?.cartId) {
          state.fetchCart();
        }
      },
    },
  ),
);

export default useCartStore;
