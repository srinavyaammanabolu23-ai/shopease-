import { createSlice } from '@reduxjs/toolkit'

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    coupon: null,
    couponDiscount: 0,
    subtotal: 0,
    itemsCount: 0,
    loading: false,
  },
  reducers: {
    setCart: (state, action) => {
      const cart = action.payload
      state.items = cart.items || []
      state.coupon = cart.coupon || null
      state.couponDiscount = cart.couponDiscount || 0
      state.subtotal = cart.items?.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0) || 0
      state.itemsCount = cart.items?.reduce((count, item) => count + item.quantity, 0) || 0
    },
    clearCart: (state) => {
      state.items = []
      state.coupon = null
      state.couponDiscount = 0
      state.subtotal = 0
      state.itemsCount = 0
    },
    setCartLoading: (state, action) => {
      state.loading = action.payload
    },
    // Optimistic update: increment badge count
    incrementCartCount: (state, action) => {
      state.itemsCount += action.payload || 1
    },
  },
})

export const { setCart, clearCart, setCartLoading, incrementCartCount } = cartSlice.actions
export const selectCart = (state) => state.cart
export const selectCartCount = (state) => state.cart.itemsCount
export const selectCartSubtotal = (state) => state.cart.subtotal
export default cartSlice.reducer
