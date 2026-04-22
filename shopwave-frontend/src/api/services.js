import api from './axios';

// ─── Auth ───────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/update-password', data),
  addAddress: (data) => api.post('/auth/address', data),
  toggleWishlist: (productId) => api.post('/auth/wishlist', { productId }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
};

// ─── Products ───────────────────────────────────────────
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (id) => api.get(`/products/${id}`),
  getFeatured: () => api.get('/products/featured'),
  getCategories: () => api.get('/products/categories'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// ─── Orders ─────────────────────────────────────────────
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my-orders'),
  getVendorOrders: () => api.get('/orders/vendor-orders'),
  getOne: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  cancel: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
};

// ─── Payment ────────────────────────────────────────────
export const paymentAPI = {
  getKey: () => api.get('/payment/key'),
  createOrder: (data) => api.post('/payment/create-order', data),
  verify: (data) => api.post('/payment/verify', data),
};

// ─── Vendor ─────────────────────────────────────────────
export const vendorAPI = {
  register: (data) => api.post('/vendors/register', data),
  getAll: () => api.get('/vendors'),
  getOne: (id) => api.get(`/vendors/${id}`),
  getMyProfile: () => api.get('/vendors/me/profile'),
  updateProfile: (data) => api.put('/vendors/me/profile', data),
  getAnalytics: () => api.get('/vendors/me/analytics'),
};

// ─── Admin ──────────────────────────────────────────────
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUser: (id) => api.put(`/admin/users/${id}/toggle`),
  getPendingVendors: () => api.get('/admin/vendors/pending'),
  approveVendor: (id, approved) => api.put(`/admin/vendors/${id}/approve`, { approved }),
  getAllOrders: (params) => api.get('/admin/orders', { params }),
  toggleFeatured: (id) => api.put(`/admin/products/${id}/feature`),
};

// ─── Reviews ────────────────────────────────────────────
export const reviewAPI = {
  create: (data) => api.post('/reviews', data),
  getForProduct: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
  markHelpful: (id) => api.put(`/reviews/${id}/helpful`),
  delete: (id) => api.delete(`/reviews/${id}`),
};

// ─── Upload ─────────────────────────────────────────────
// Note: Do NOT set Content-Type header manually for FormData.
// The axios interceptor handles it — browser sets multipart boundary automatically.
export const uploadAPI = {
  uploadImage: (formData) => api.post('/upload/image', formData),
  uploadImages: (formData) => api.post('/upload/images', formData),
  deleteImage: (public_id) => api.delete('/upload/image', { data: { public_id } }),
};

// ─── Notifications ───────────────────────────────────────
export const notificationAPI = {
  getAll:      ()   => api.get('/notifications'),
  markRead:    (id) => api.put(`/notifications/${id}/read`),
  markAllRead: ()   => api.put('/notifications/read-all'),
  delete:      (id) => api.delete(`/notifications/${id}`),
};