import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CartItem, CartState } from './cart.types';

const loadInitialState = (): CartState => {
  const saved = localStorage.getItem('cart');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse cart from storage', e);
    }
  }
  return {
    items: [],
    branchId: null,
  };
};

const initialState: CartState = loadInitialState();

const persistCart = (state: CartState) => {
  localStorage.setItem('cart', JSON.stringify(state));
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ item: CartItem; branchId: string }>) => {
      // If adding from a different branch, clear cart first
      if (state.branchId && state.branchId !== action.payload.branchId) {
        state.items = [action.payload.item];
      } else {
        const exists = state.items.find((i) => i.serviceId === action.payload.item.serviceId);
        if (!exists) {
          state.items.push(action.payload.item);
        }
      }
      state.branchId = action.payload.branchId;
      persistCart(state);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.serviceId !== action.payload);
      if (state.items.length === 0) {
        state.branchId = null;
      }
      persistCart(state);
    },
    updateStylist: (
      state,
      action: PayloadAction<{ serviceId: string; stylistId: string; stylistName: string }>,
    ) => {
      const item = state.items.find((i) => i.serviceId === action.payload.serviceId);
      if (item) {
        item.stylistId = action.payload.stylistId;
        item.stylistName = action.payload.stylistName;
        // Reset slot if stylist changes to ensure re-validation
        item.date = undefined;
        item.startTime = undefined;
      }
      persistCart(state);
    },
    updateItemSlot: (
      state,
      action: PayloadAction<{ serviceId: string; date: string; startTime: string; slotId: string }>,
    ) => {
      const item = state.items.find((i) => i.serviceId === action.payload.serviceId);
      if (item) {
        item.date = action.payload.date;
        item.startTime = action.payload.startTime;
        item.slotId = action.payload.slotId;
      }
      persistCart(state);
    },
    clearCart: (state) => {
      state.items = [];
      state.branchId = null;
      localStorage.removeItem('cart');
    },
  },
});

export const { addToCart, removeFromCart, clearCart, updateStylist, updateItemSlot } =
  cartSlice.actions;
export default cartSlice.reducer;
