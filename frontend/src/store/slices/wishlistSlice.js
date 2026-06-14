import { createSlice } from '@reduxjs/toolkit'

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: [], // array of product IDs
  },
  reducers: {
    setWishlist: (state, action) => {
      state.items = action.payload || []
    },
    toggleWishlistItem: (state, action) => {
      const productId = action.payload
      const idx = state.items.indexOf(productId)
      if (idx > -1) {
        state.items.splice(idx, 1)
      } else {
        state.items.push(productId)
      }
    },
    clearWishlist: (state) => {
      state.items = []
    },
  },
})

export const { setWishlist, toggleWishlistItem, clearWishlist } = wishlistSlice.actions
export const selectWishlist = (state) => state.wishlist.items
export const selectIsWishlisted = (productId) => (state) =>
  state.wishlist.items.includes(productId) || state.wishlist.items.includes(productId?.toString())
export default wishlistSlice.reducer
