import { createSlice } from '@reduxjs/toolkit'

const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
const storedTheme = localStorage.getItem('theme')
const initialDark = storedTheme === 'dark' || (!storedTheme && prefersDark)

// Apply theme to document on init
if (initialDark) {
  document.documentElement.classList.add('dark')
} else {
  document.documentElement.classList.remove('dark')
}

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    darkMode: initialDark,
    sidebarOpen: false, // admin sidebar
    cartDrawerOpen: false,
    searchOpen: false,
    mobileMenuOpen: false,
    compareList: [], // product comparison
    recentlyViewed: JSON.parse(localStorage.getItem('recentlyViewed') || '[]'),
  },
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode
      if (state.darkMode) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
    },
    setDarkMode: (state, action) => {
      state.darkMode = action.payload
      if (action.payload) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('theme', 'light')
      }
    },
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen },
    setSidebarOpen: (state, action) => { state.sidebarOpen = action.payload },
    toggleCartDrawer: (state) => { state.cartDrawerOpen = !state.cartDrawerOpen },
    setCartDrawerOpen: (state, action) => { state.cartDrawerOpen = action.payload },
    setSearchOpen: (state, action) => { state.searchOpen = action.payload },
    setMobileMenuOpen: (state, action) => { state.mobileMenuOpen = action.payload },
    addToCompare: (state, action) => {
      if (state.compareList.length < 4 && !state.compareList.find(p => p._id === action.payload._id)) {
        state.compareList.push(action.payload)
      }
    },
    removeFromCompare: (state, action) => {
      state.compareList = state.compareList.filter(p => p._id !== action.payload)
    },
    clearCompare: (state) => { state.compareList = [] },
    addRecentlyViewed: (state, action) => {
      const product = action.payload
      state.recentlyViewed = [product, ...state.recentlyViewed.filter(p => p._id !== product._id)].slice(0, 10)
      localStorage.setItem('recentlyViewed', JSON.stringify(state.recentlyViewed))
    },
  },
})

export const {
  toggleDarkMode, setDarkMode, toggleSidebar, setSidebarOpen,
  toggleCartDrawer, setCartDrawerOpen, setSearchOpen, setMobileMenuOpen,
  addToCompare, removeFromCompare, clearCompare, addRecentlyViewed,
} = uiSlice.actions

export const selectDarkMode = (state) => state.ui.darkMode
export const selectSidebarOpen = (state) => state.ui.sidebarOpen
export const selectCartDrawerOpen = (state) => state.ui.cartDrawerOpen
export const selectSearchOpen = (state) => state.ui.searchOpen
export const selectCompareList = (state) => state.ui.compareList
export const selectRecentlyViewed = (state) => state.ui.recentlyViewed
export default uiSlice.reducer
