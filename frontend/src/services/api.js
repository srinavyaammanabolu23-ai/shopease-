import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: [
    'Products', 'Product', 'Categories', 'Category',
    'Cart', 'Orders', 'Order', 'Users', 'User',
    'Reviews', 'Coupons', 'Notifications', 'Profile',
    'Settings', 'Analytics'
  ],
  endpoints: (builder) => ({
    // ======================== AUTH ========================
    register: builder.mutation({
      query: (data) => ({ url: '/auth/register', method: 'POST', body: data }),
    }),
    login: builder.mutation({
      query: (data) => ({ url: '/auth/login', method: 'POST', body: data }),
      invalidatesTags: ['Cart', 'Profile'],
    }),
    logout: builder.mutation({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
    getMe: builder.query({
      query: () => '/auth/me',
      providesTags: ['Profile'],
    }),
    verifyOTP: builder.mutation({
      query: (data) => ({ url: '/auth/verify-otp', method: 'POST', body: data }),
    }),
    resendOTP: builder.mutation({
      query: (data) => ({ url: '/auth/resend-otp', method: 'POST', body: data }),
    }),
    forgotPassword: builder.mutation({
      query: (data) => ({ url: '/auth/forgot-password', method: 'POST', body: data }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({ url: '/auth/reset-password', method: 'POST', body: data }),
    }),

    // ======================== PRODUCTS ========================
    getProducts: builder.query({
      query: (params = {}) => ({ url: '/products', params }),
      providesTags: ['Products'],
    }),
    getProduct: builder.query({
      query: (slug) => `/products/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Product', id: slug }],
    }),
    searchProducts: builder.query({
      query: (q) => ({ url: '/products/search', params: { q } }),
    }),
    getRecommendations: builder.query({
      query: () => '/products/recommendations',
    }),
    getBrands: builder.query({
      query: () => '/products/brands',
    }),
    createProduct: builder.mutation({
      query: (data) => ({ url: '/products', method: 'POST', body: data }),
      invalidatesTags: ['Products'],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/products/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Products', 'Product'],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Products'],
    }),
    getAdminProducts: builder.query({
      query: (params = {}) => ({ url: '/products/admin/all', params }),
      providesTags: ['Products'],
    }),
    updateProductStatus: builder.mutation({
      query: ({ id, status }) => ({ url: `/products/${id}/status`, method: 'PUT', body: { status } }),
      invalidatesTags: ['Products'],
    }),

    // ======================== CATEGORIES ========================
    getCategories: builder.query({
      query: (params = {}) => ({ url: '/categories', params }),
      providesTags: ['Categories'],
    }),
    getCategory: builder.query({
      query: (slug) => `/categories/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Category', id: slug }],
    }),
    createCategory: builder.mutation({
      query: (data) => ({ url: '/categories', method: 'POST', body: data }),
      invalidatesTags: ['Categories'],
    }),
    updateCategory: builder.mutation({
      query: ({ id, data }) => ({ url: `/categories/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Categories'],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({ url: `/categories/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Categories'],
    }),

    // ======================== CART ========================
    getCart: builder.query({
      query: () => '/cart',
      providesTags: ['Cart'],
    }),
    addToCart: builder.mutation({
      query: (data) => ({ url: '/cart/add', method: 'POST', body: data }),
      invalidatesTags: ['Cart'],
    }),
    updateCartItem: builder.mutation({
      query: (data) => ({ url: '/cart/update', method: 'PUT', body: data }),
      invalidatesTags: ['Cart'],
    }),
    removeFromCart: builder.mutation({
      query: (itemId) => ({ url: `/cart/remove/${itemId}`, method: 'DELETE' }),
      invalidatesTags: ['Cart'],
    }),
    clearCart: builder.mutation({
      query: () => ({ url: '/cart/clear', method: 'DELETE' }),
      invalidatesTags: ['Cart'],
    }),
    applyCoupon: builder.mutation({
      query: (data) => ({ url: '/cart/coupon', method: 'POST', body: data }),
      invalidatesTags: ['Cart'],
    }),
    removeCoupon: builder.mutation({
      query: () => ({ url: '/cart/coupon', method: 'DELETE' }),
      invalidatesTags: ['Cart'],
    }),

    // ======================== ORDERS ========================
    createOrder: builder.mutation({
      query: (data) => ({ url: '/orders', method: 'POST', body: data }),
      invalidatesTags: ['Orders', 'Cart'],
    }),
    getMyOrders: builder.query({
      query: (params = {}) => ({ url: '/orders/my-orders', params }),
      providesTags: ['Orders'],
    }),
    getOrder: builder.query({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
    cancelOrder: builder.mutation({
      query: (id) => ({ url: `/orders/${id}/cancel`, method: 'PUT', body: { reason: 'Cancelled by customer' } }),
      invalidatesTags: ['Orders'],
    }),
    // Admin order routes
    getAllOrders: builder.query({
      query: (params = {}) => ({ url: '/orders/admin/all', params }),
      providesTags: ['Orders'],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/orders/${id}/status`, method: 'PUT', body: data }),
      invalidatesTags: ['Orders', 'Order'],
    }),
    getOrderAnalytics: builder.query({
      query: (params = {}) => ({ url: '/orders/admin/analytics', params }),
      providesTags: ['Analytics'],
    }),

    // ======================== USERS ========================
    getProfile: builder.query({
      query: () => '/users/profile',
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({ url: '/users/profile', method: 'PUT', body: data }),
      invalidatesTags: ['Profile'],
    }),
    changePassword: builder.mutation({
      query: (data) => ({ url: '/users/change-password', method: 'PUT', body: data }),
    }),
    addAddress: builder.mutation({
      query: (data) => ({ url: '/users/addresses', method: 'POST', body: data }),
      invalidatesTags: ['Profile'],
    }),
    updateAddress: builder.mutation({
      query: ({ id, data }) => ({ url: `/users/addresses/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Profile'],
    }),
    deleteAddress: builder.mutation({
      query: (id) => ({ url: `/users/addresses/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Profile'],
    }),
    toggleWishlist: builder.mutation({
      query: (productId) => ({ url: `/users/wishlist/${productId}`, method: 'POST' }),
      invalidatesTags: ['Profile'],
    }),
    getWishlist: builder.query({
      query: () => '/users/wishlist',
      providesTags: ['Profile'],
    }),
    getOrderHistory: builder.query({
      query: (params = {}) => ({ url: '/users/orders', params }),
    }),
    // Admin user routes
    getAllUsers: builder.query({
      query: (params = {}) => ({ url: '/users', params }),
      providesTags: ['Users'],
    }),
    getAdminUsers: builder.query({
      query: (params = {}) => ({ url: '/users', params }),
      providesTags: ['Users'],
    }),
    getUserById: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),
    toggleUserStatus: builder.mutation({
      query: (id) => ({ url: `/users/${id}/toggle-status`, method: 'PUT' }),
      invalidatesTags: ['Users'],
    }),
    blockUser: builder.mutation({
      query: ({ id, isBlocked }) => ({ url: `/users/${id}/block`, method: 'PUT', body: { isBlocked } }),
      invalidatesTags: ['Users'],
    }),
    updateUserRole: builder.mutation({
      query: ({ id, role }) => ({ url: `/users/${id}/role`, method: 'PUT', body: { role } }),
      invalidatesTags: ['Users'],
    }),
    getAdminUserStats: builder.query({
      query: () => '/users/admin/stats',
      providesTags: ['Analytics'],
    }),

    // ======================== REVIEWS ========================
    getProductReviews: builder.query({
      query: ({ productId, ...params }) => ({ url: `/reviews/product/${productId}`, params }),
      providesTags: (result, error, { productId }) => [{ type: 'Reviews', id: productId }],
    }),
    createReview: builder.mutation({
      query: (data) => ({ url: '/reviews', method: 'POST', body: data }),
      invalidatesTags: ['Reviews'],
    }),
    markHelpful: builder.mutation({
      query: (id) => ({ url: `/reviews/${id}/helpful`, method: 'POST' }),
    }),
    getAllReviews: builder.query({
      query: (params = {}) => ({ url: '/reviews', params }),
      providesTags: ['Reviews'],
    }),
    updateReviewStatus: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/reviews/${id}/status`, method: 'PUT', body: data }),
      invalidatesTags: ['Reviews'],
    }),
    deleteReview: builder.mutation({
      query: (id) => ({ url: `/reviews/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Reviews'],
    }),

    // ======================== COUPONS ========================
    getCoupons: builder.query({
      query: (params = {}) => ({ url: '/coupons', params }),
      providesTags: ['Coupons'],
    }),
    validateCoupon: builder.query({
      query: (code) => `/coupons/validate/${code}`,
    }),
    createCoupon: builder.mutation({
      query: (data) => ({ url: '/coupons', method: 'POST', body: data }),
      invalidatesTags: ['Coupons'],
    }),
    updateCoupon: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/coupons/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Coupons'],
    }),
    deleteCoupon: builder.mutation({
      query: (id) => ({ url: `/coupons/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Coupons'],
    }),

    // ======================== NOTIFICATIONS ========================
    getNotifications: builder.query({
      query: (params = {}) => ({ url: '/notifications', params }),
      providesTags: ['Notifications'],
    }),
    markNotificationRead: builder.mutation({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'PUT' }),
      invalidatesTags: ['Notifications'],
    }),
    markAllNotificationsRead: builder.mutation({
      query: () => ({ url: '/notifications/read-all', method: 'PUT' }),
      invalidatesTags: ['Notifications'],
    }),
    deleteNotification: builder.mutation({
      query: (id) => ({ url: `/notifications/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Notifications'],
    }),

    // ======================== PAYMENTS ========================
    createPaymentSession: builder.mutation({
      query: (data) => ({ url: '/payments/create-session', method: 'POST', body: data }),
      invalidatesTags: ['Cart'],
    }),
    verifyPayment: builder.mutation({
      query: (data) => ({ url: '/payments/verify', method: 'POST', body: data }),
      invalidatesTags: ['Orders', 'Order', 'Cart'],
    }),
  }),
})

export const {
  useRegisterMutation, useLoginMutation, useLogoutMutation, useGetMeQuery,
  useVerifyOTPMutation, useResendOTPMutation, useForgotPasswordMutation, useResetPasswordMutation,
  useGetProductsQuery, useGetProductQuery, useSearchProductsQuery, useGetRecommendationsQuery,
  useGetBrandsQuery, useCreateProductMutation, useUpdateProductMutation, useDeleteProductMutation,
  useGetAdminProductsQuery, useUpdateProductStatusMutation,
  useGetCategoriesQuery, useGetCategoryQuery, useCreateCategoryMutation,
  useUpdateCategoryMutation, useDeleteCategoryMutation,
  useGetCartQuery, useAddToCartMutation, useUpdateCartItemMutation, useRemoveFromCartMutation,
  useClearCartMutation, useApplyCouponMutation, useRemoveCouponMutation,
  useCreateOrderMutation, useGetMyOrdersQuery, useGetOrderQuery, useCancelOrderMutation,
  useGetAllOrdersQuery, useUpdateOrderStatusMutation, useGetOrderAnalyticsQuery,
  useGetProfileQuery, useUpdateProfileMutation, useChangePasswordMutation,
  useAddAddressMutation, useUpdateAddressMutation, useDeleteAddressMutation,
  useToggleWishlistMutation, useGetWishlistQuery, useGetOrderHistoryQuery,
  useGetAllUsersQuery, useGetAdminUsersQuery, useGetUserByIdQuery,
  useToggleUserStatusMutation, useBlockUserMutation, useUpdateUserRoleMutation,
  useGetAdminUserStatsQuery,
  useGetProductReviewsQuery, useCreateReviewMutation, useMarkHelpfulMutation,
  useGetAllReviewsQuery, useUpdateReviewStatusMutation, useDeleteReviewMutation,
  useGetCouponsQuery, useValidateCouponQuery, useCreateCouponMutation,
  useUpdateCouponMutation, useDeleteCouponMutation,
  useGetNotificationsQuery, useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation, useDeleteNotificationMutation,
  useCreatePaymentSessionMutation, useVerifyPaymentMutation,
} = api
