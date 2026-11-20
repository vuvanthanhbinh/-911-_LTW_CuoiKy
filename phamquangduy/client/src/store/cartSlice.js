import { createSlice } from '@reduxjs/toolkit';

// Giỏ hàng khi tạo đơn (Redux Toolkit; Immer giữ state bất biến)
const cart = createSlice({
  name: 'cart', initialState: { items: [] },
  reducers: {
    add(state, { payload: p }) {
      const x = state.items.find((i) => i.product_id === p.id);
      if (x) x.quantity = Math.min(x.quantity + 1, p.stock);
      else state.items.push({ product_id: p.id, name: p.name, price: p.price, stock: p.stock, quantity: 1 });
    },
    setQty(state, { payload: { id, quantity } }) {
      const x = state.items.find((i) => i.product_id === id);
      if (x) x.quantity = Math.max(1, Math.min(Number(quantity) || 1, x.stock));
    },
    remove(state, { payload: id }) { state.items = state.items.filter((i) => i.product_id !== id); },
    clear(state) { state.items = []; },
  },
});
export const cartActions = cart.actions;
export default cart.reducer;
