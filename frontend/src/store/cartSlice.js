import { createSlice } from "@reduxjs/toolkit";

const savedCart = (() => {
  try {
    return JSON.parse(localStorage.getItem("cart")) || [];
  } catch {
    return [];
  }
})();

const persist = (items) => {
  localStorage.setItem("cart", JSON.stringify(items));
};

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: savedCart,
  },
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existing = state.items.find(
        (i) => i.variant_id === item.variant_id,
      );

      if (existing) {
        existing.quantity += item.quantity || 1;
      } else {
        state.items.push({
          ...item,
          quantity: item.quantity || 1,
        });
      }
      persist(state.items);
    },
    updateQuantity: (state, action) => {
      const { variant_id, quantity } = action.payload;
      const item = state.items.find((i) => i.variant_id === variant_id);
      if (item) {
        item.quantity = Math.max(1, quantity);
      }
      persist(state.items);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(
        (i) => i.variant_id !== action.payload,
      );
      persist(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      persist(state.items);
    },
  },
});

export const { addToCart, updateQuantity, removeFromCart, clearCart } =
  cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0);
export const selectCartTotal = (state) =>
  state.cart.items.reduce(
    (sum, i) => sum + Number(i.unit_price) * i.quantity,
    0,
  );

export default cartSlice.reducer;
