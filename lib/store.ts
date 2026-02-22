import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from './types';

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  isCartOpen: boolean;

  // Getters
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,

      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      addItem: (newItem) => {
        // 1. Sanitize Incoming Data
        // Use default of 0 and 1 strictly to prevent NaNs
        const deduction = Math.max(1, Number(newItem.stockDeduction) || 1);
        let masterLimit = Number(newItem.masterStockTotal) || 0;
        const qtyToAdd = Math.max(1, Number(newItem.quantity) || 1);

        const currentItems = get().items;

        // 1.b. Recovery: Integrity Check
        // If this item has no limit, check if we know the limit from another item in the cart
        if (masterLimit <= 0) {
          const existingSameProduct = currentItems.find(i => i.productId === newItem.productId && (i.masterStockTotal || 0) > 0);
          if (existingSameProduct) {
            masterLimit = existingSameProduct.masterStockTotal;
          }
        }

        console.log(`[Cart Debug] Try Add: ${newItem.title} (${newItem.variantName})`);
        console.log(`[Cart Debug] Qty: ${qtyToAdd} | Deduction: ${deduction} | Master Limit: ${masterLimit}`);

        // 2. Calculate Projected State
        // We simulate the cart state *IF* we added this item
        let projectedItems = [...currentItems];
        const existingIndex = projectedItems.findIndex((i) => i.variantId === newItem.variantId);

        if (existingIndex > -1) {
          projectedItems[existingIndex] = {
            ...projectedItems[existingIndex],
            quantity: projectedItems[existingIndex].quantity + qtyToAdd,
            // Update metadata to latest known truth
            stockDeduction: deduction,
            masterStockTotal: masterLimit,
            maxStock: newItem.maxStock
          };
        } else {
          projectedItems.push({
            ...newItem,
            quantity: qtyToAdd,
            stockDeduction: deduction,
            masterStockTotal: masterLimit
          });
        }

        // 3. Validate Global Pool Limit
        // Sum total liquid consumption for this Product ID
        const relatedItems = projectedItems.filter(i => i.productId === newItem.productId);

        const totalSimulatedLiquid = relatedItems.reduce((sum, item) => {
          return sum + (Number(item.quantity) * Number(item.stockDeduction));
        }, 0);

        console.log(`[Cart Debug] Total Liquid Needed: ${totalSimulatedLiquid} / Available: ${masterLimit}`);

        if (masterLimit > 0 && totalSimulatedLiquid > masterLimit) {
          console.warn("[Cart Debug] Check Failed: Over Allocating");

          // Calculate informative error message
          const currentLiquid = currentItems
            .filter(i => i.productId === newItem.productId)
            .reduce((sum, item) => sum + (item.quantity * item.stockDeduction), 0);

          const remaining = Math.max(0, masterLimit - currentLiquid);
          const canAddAmount = Math.floor(remaining / deduction);

          alert(`Insufficient Stock! You currently have ${currentLiquid} units worth of this product in your cart. Only ${remaining} units remaining. You can add max ${canAddAmount} of this variant.`);
          return;
        }

        // 4. Commit
        set({
          items: projectedItems,
          isCartOpen: true
        });
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        }));
      },

      updateQuantity: (variantId, newQuantity) => {
        if (newQuantity < 1) return;

        // 1. Get Target
        const currentItems = get().items;
        const targetItem = currentItems.find((i) => i.variantId === variantId);

        if (!targetItem) return;

        const deduction = Math.max(1, Number(targetItem.stockDeduction) || 1);
        const masterLimit = Number(targetItem.masterStockTotal) || 0;

        // 2. Simulate
        const projectedItems = currentItems.map(item => {
          if (item.variantId === variantId) {
            return { ...item, quantity: newQuantity };
          }
          return item;
        });

        // 3. Validate
        const relatedItems = projectedItems.filter(i => i.productId === targetItem.productId);

        const totalSimulatedLiquid = relatedItems.reduce((sum, item) => {
          return sum + (Number(item.quantity) * Number(item.stockDeduction));
        }, 0);

        if (masterLimit > 0 && totalSimulatedLiquid > masterLimit) {
          const diff = totalSimulatedLiquid - masterLimit;
          const excessItems = Math.ceil(diff / deduction);
          alert(`Stock limit reached! Decrease by at least ${excessItems} to fit in stock.`);
          return;
        }

        // 4. Commit
        set({ items: projectedItems });
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
    }),
    {
      name: 'liquor-shop-cart',
    }
  )
);