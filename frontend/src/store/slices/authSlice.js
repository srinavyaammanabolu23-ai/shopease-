import { createSlice } from '@reduxjs/toolkit'

const storedUser = (() => {
  try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
})()

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!storedUser,
    loading: false,
    error: null,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload
      state.user = user
      state.token = accessToken
      state.isAuthenticated = true
      state.error = null
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('token', accessToken)
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
      localStorage.setItem('user', JSON.stringify(state.user))
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
  },
})

export const { setCredentials, updateUser, logout, setLoading, setError } = authSlice.actions
export const selectCurrentUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectIsAdmin = (state) => state.auth.user?.role === 'admin'
export const selectToken = (state) => state.auth.token
export default authSlice.reducer
