import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { ShopifyProduct } from '../utils/shopify-types';

interface ProductState {
  selectedProduct: ShopifyProduct | null;
  setSelectedProduct: (product: ShopifyProduct) => void;
}

export const useProductStore = create<ProductState>()(
  persist(
    (set) => ({
      selectedProduct: null,
      setSelectedProduct: (product) => set({ selectedProduct: product }),
    }),
    {
      name: 'product-storage',
    }
  )
);
