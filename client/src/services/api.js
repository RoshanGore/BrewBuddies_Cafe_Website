import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 10000,
});

// Request interceptor: attach token (cleanly separating Owner and Customer sessions)
API.interceptors.request.use(
  (config) => {
    const isOwnerPath =
      (typeof window !== "undefined" && window.location.pathname.startsWith("/owner")) ||
      config.url?.startsWith("/analytics") ||
      config.url?.startsWith("/customers") ||
      (config.url?.startsWith("/tables") && config.method !== "get") ||
      (config.url?.startsWith("/orders") &&
        !config.url?.startsWith("/orders/my-orders") &&
        !config.url?.startsWith("/orders/track") &&
        config.method !== "post");

    const ownerToken = localStorage.getItem("bb_owner_token");
    const customerToken = localStorage.getItem("bb_token");

    const token = isOwnerPath && ownerToken ? ownerToken : (customerToken || ownerToken);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: extract error message cleanly
API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong. Please check your connection.";
    return Promise.reject(new Error(message));
  }
);

// Fast in-memory cache for static/frequently-read data
let productsCache = { data: null, timestamp: 0 };
let categoriesCache = { data: null, timestamp: 0 };
let offersCache = { data: null, timestamp: 0 };
const CACHE_TTL = 30000; // 30 seconds

// API Methods
export const api = {
  // Auth & Multi-Method Customer Security
  login: (credentials) => API.post("/auth/login", credentials),
  register: (data) => API.post("/auth/register", data),
  customerSession: (data) => API.post("/auth/customer-session", data),
  firebaseCustomerLogin: (data) => API.post("/auth/customer/firebase-login", data),
  sendCustomerOtp: (data) => API.post("/auth/customer/send-otp", data),
  verifyCustomerOtp: (data) => API.post("/auth/customer/verify-otp", data),
  linkCustomerProvider: (data) => API.post("/auth/customer/link-provider", data),
  unlinkCustomerProvider: (data) => API.post("/auth/customer/unlink-provider", data),
  getCustomerSecurityStatus: () => API.get("/auth/customer/security-status"),
  getMe: () => API.get("/auth/me"),
  updateProfile: (data) => API.put("/auth/profile", data),

  // Products & Categories (with client-side fast cache)
  getProducts: async (params) => {
    // If fetching without custom search/filter, serve from memory cache if fresh
    const isBasicQuery = !params || Object.keys(params).length === 0;
    const now = Date.now();
    if (isBasicQuery && productsCache.data && now - productsCache.timestamp < CACHE_TTL) {
      return productsCache.data;
    }
    const res = await API.get("/products", { params });
    if (isBasicQuery && res?.success) {
      productsCache = { data: res, timestamp: now };
    }
    return res;
  },
  getProductById: (id) => API.get(`/products/${id}`),
  createProduct: (data) => {
    productsCache = { data: null, timestamp: 0 }; // invalidate cache
    return API.post("/products", data);
  },
  updateProduct: (id, data) => {
    productsCache = { data: null, timestamp: 0 };
    return API.put(`/products/${id}`, data);
  },
  toggleProductStock: (id) => {
    productsCache = { data: null, timestamp: 0 };
    return API.patch(`/products/${id}/toggle-stock`);
  },
  deleteProduct: (id) => {
    productsCache = { data: null, timestamp: 0 };
    return API.delete(`/products/${id}`);
  },
  getCategories: async () => {
    const now = Date.now();
    if (categoriesCache.data && now - categoriesCache.timestamp < CACHE_TTL) {
      return categoriesCache.data;
    }
    const res = await API.get("/products/categories");
    if (res?.success) {
      categoriesCache = { data: res, timestamp: now };
    }
    return res;
  },
  createCategory: (data) => {
    categoriesCache = { data: null, timestamp: 0 };
    return API.post("/products/categories", data);
  },

  // Orders
  createOrder: (orderData) => API.post("/orders", orderData),
  getMyOrders: (phone) => API.get(phone ? `/orders/my-orders?phone=${encodeURIComponent(phone)}` : "/orders/my-orders"),
  getCustomerOrders: (phone) => API.get(phone ? `/orders/my-orders?phone=${encodeURIComponent(phone)}` : "/orders/my-orders"),
  getOrderById: (orderId) => API.get(`/orders/track/${orderId}`),
  trackOrder: (orderId) => API.get(`/orders/track/${orderId}`),
  getLiveOrders: () => API.get("/orders/live"),
  getAllOrders: (params) => API.get("/orders", { params }),
  updateOrderStatus: (id, data) => API.patch(`/orders/${id}/status`, data),

  // Rewards & Loyalty
  getRewards: (params) => API.get("/rewards", { params }),
  redeemReward: (data) => API.post("/rewards/redeem", data),
  getRedemptionHistory: () => API.get("/rewards/history"),
  getPointsSummary: () => API.get("/points"),
  getPointsHistory: () => API.get("/points/history"),
  createReward: (data) => API.post("/rewards", data),
  updateReward: (id, data) => API.put(`/rewards/${id}`, data),
  deleteReward: (id) => API.delete(`/rewards/${id}`),

  // Offers
  getOffers: async () => {
    const now = Date.now();
    if (offersCache.data && now - offersCache.timestamp < CACHE_TTL) {
      return offersCache.data;
    }
    const res = await API.get("/offers");
    if (res?.success) {
      offersCache = { data: res, timestamp: now };
    }
    return res;
  },
  validateOffer: (data) => API.post("/offers/validate", data),
  createOffer: (data) => {
    offersCache = { data: null, timestamp: 0 };
    return API.post("/offers", data);
  },
  updateOffer: (id, data) => {
    offersCache = { data: null, timestamp: 0 };
    return API.put(`/offers/${id}`, data);
  },
  deleteOffer: (id) => {
    offersCache = { data: null, timestamp: 0 };
    return API.delete(`/offers/${id}`);
  },

  // Tables
  getTables: () => API.get("/tables"),
  resolveTable: (token) => API.get(`/tables/resolve/${encodeURIComponent(token)}`),
  verifyTable: (tableNum) => API.get(`/tables/verify/${tableNum}`),
  createTable: (data) => API.post("/tables", data),
  updateTable: (id, data) => API.put(`/tables/${id}`, data),
  deleteTable: (id) => API.delete(`/tables/${id}`),

  // Customers (Owner)
  getCustomers: (params) => API.get("/customers", { params }),
  getCustomerById: (id) => API.get(`/customers/${id}`),

  // Analytics (Owner)
  getSummary: (params) => API.get("/analytics/summary", { params }),
  getCharts: (params) => API.get("/analytics/charts", { params }),

  // Settings
  getSettings: () => API.get("/settings"),
  updateSettings: (data) => API.put("/settings", data),

};

export default api;
