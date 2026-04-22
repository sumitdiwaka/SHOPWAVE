import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

const loadCart = () => {
  try { return JSON.parse(localStorage.getItem('cart')) || []; }
  catch { return []; }
};

const saveCart = (items) => localStorage.setItem('cart', JSON.stringify(items));

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: loadCart() },
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const existing = state.items.find((i) => i._id === product._id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.stock) { toast.error('Not enough stock'); return; }
        existing.quantity = newQty;
        toast.success('Cart updated');
      } else {
        if (quantity > product.stock) { toast.error('Not enough stock'); return; }
        state.items.push({ ...product, quantity });
        toast.success('Added to cart!');
      }
      saveCart(state.items);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => i._id !== action.payload);
      saveCart(state.items);
      toast.success('Removed from cart');
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((i) => i._id === id);
      if (item) {
        if (quantity < 1) return;
        if (quantity > item.stock) { toast.error('Not enough stock'); return; }
        item.quantity = quantity;
        saveCart(state.items);
      }
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem('cart');
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;

export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, i) => sum + (i.discountPrice > 0 ? i.discountPrice : i.price) * i.quantity, 0);
export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0);

export default cartSlice.reducer;
