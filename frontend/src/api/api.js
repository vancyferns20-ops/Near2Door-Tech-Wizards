const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://didactic-parakeet-jxv5j6j96672p4jx-5000.app.github.dev';

const api = {
  // ---------------------
  // Authentication
  // ---------------------
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    return { response, data };
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    return { response, data };
  },

  getUserById: async (userId, token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    } catch (err) {
      console.error('getUserById error:', err);
      return null;
    }
  },

  // ---------------------
  // Shops
  // ---------------------
  getShops: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/shops`);
      if (!response.ok) throw new Error('Failed to fetch shops');
      return response.json();
    } catch (err) {
      console.error('getShops error:', err);
      return [];
    }
  },

  getShopProfile: async (shopId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/shops/${shopId}`);
      if (!response.ok) throw new Error('Failed to fetch shop profile');
      return response.json();
    } catch (err) {
      console.error('getShopProfile error:', err);
      return null;
    }
  },

  updateShopProfile: async (shopId, profileData) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/shops/${shopId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(profileData),
      });
      if (!response.ok) throw new Error('Failed to update shop profile');
      return response.json();
    } catch (err) {
      console.error('updateShopProfile error:', err);
      throw err;
    }
  },

  getShopSalesSummary: async (shopId) => {
    console.log(`Fetching sales summary for shop ID: ${shopId}`);
    // Replace with backend call if available
    return { totalOrders: 15, totalProductsSold: 250, totalRevenue: 5000 };
  },

  // ---------------------
  // Shop Orders
  // ---------------------
  getShopOrders: async (shopId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/shops/${shopId}/orders`, {
        method: "GET",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch shop orders");
      return response.json();
    } catch (error) {
      console.error("getShopOrders error:", error);
      return [];
    }
  },

  // ---------------------
  // Products
  // ---------------------
  getProducts: async (shopId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/shops/${shopId}/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    } catch (err) {
      console.error('getProducts error:', err);
      return [];
    }
  },

  searchProducts: async (query, options = {}) => {
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (options.shopId) params.set('shopId', String(options.shopId));
      if (options.lat !== undefined) params.set('lat', String(options.lat));
      if (options.lng !== undefined) params.set('lng', String(options.lng));
      if (options.radius !== undefined) params.set('radius', String(options.radius));

      const response = await fetch(`${API_BASE_URL}/products/search?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to search products');
      return response.json();
    } catch (err) {
      console.error('searchProducts error:', err);
      return [];
    }
  },

  addProduct: async (shopId, productData) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/shops/${shopId}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(productData),
      });
      if (!response.ok) throw new Error('Failed to add product');
      return response.json();
    } catch (err) {
      console.error('addProduct error:', err);
      return null;
    }
  },

  updateProduct: async (shopId, productId, updatedData) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/shops/${shopId}/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) throw new Error('Failed to update product');
      return response.json();
    } catch (err) {
      console.error('updateProduct error:', err);
      return null;
    }
  },

  deleteProduct: async (shopId, productId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/shops/${shopId}/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return response.ok;
    } catch (err) {
      console.error('deleteProduct error:', err);
      return false;
    }
  },

  // ---------------------
  // Image Upload
  // ---------------------
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch(`${API_BASE_URL}/upload/image`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Image upload failed');
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('uploadImage error:', error);
      return null;
    }
  },

  // ---------------------
  // Users (Shops & Agents)
  // ---------------------
  getUsers: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    } catch (error) {
      console.error('getUsers error:', error);
      return [];
    }
  },

  getShopsByStatus: async (status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/shops?status=${status}`);
      if (!response.ok) throw new Error('Failed to fetch shops');
      return response.json();
    } catch (err) {
      console.error('getShopsByStatus error:', err);
      return [];
    }
  },

  getAgentsByStatus: async (status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/agents`);
      if (!response.ok) throw new Error('Failed to fetch agents');
      const agents = await response.json();
      return agents.filter(agent => agent.status === status);
    } catch (err) {
      console.error('getAgentsByStatus error:', err);
      return [];
    }
  },

  approveShop: async (shopId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/shops/${shopId}/approve`, { method: 'PUT' });
      return response.ok;
    } catch (err) {
      console.error('approveShop error:', err);
      return false;
    }
  },

  rejectShop: async (shopId, reason) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/shops/${shopId}/reject`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason }) });
      if (!response.ok) throw new Error('Failed to reject shop');
      return response.json();
    } catch (err) {
      console.error('rejectShop error:', err);
      return null;
    }
  },

  approveAgent: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/approve-user/${userId}`, { method: 'PUT' });
      return response.ok;
    } catch (err) {
      console.error('approveAgent error:', err);
      return false;
    }
  },

  // ---------------------
  // Delivery Agent APIs
  // ---------------------
  getAgents: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/agents`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch agents');
      return response.json();
    } catch (error) {
      console.error('getAgents error:', error);
      return [];
    }
  },

  getAgentOrders: async (agentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/agents/${agentId}/orders`, { method: "GET", headers: { "Content-Type": "application/json" } });
      if (!response.ok) throw new Error("Failed to fetch agent orders");
      const data = await response.json();
      return { response, data };
    } catch (error) {
      console.error("getAgentOrders error:", error);
      return { response: { ok: false }, data: { error: "Network error" } };
    }
  },

  getAgentEarnings: async (agentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/agents/${agentId}/earnings`, { method: "GET", headers: { "Content-Type": "application/json" } });
      if (!response.ok) throw new Error("Failed to fetch agent earnings");
      const data = await response.json();
      return { response, data };
    } catch (error) {
      console.error("getAgentEarnings error:", error);
      return { response: { ok: false }, data: { error: "Network error" } };
    }
  },

  updateDeliveryStatus: async (orderId, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/delivery-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update delivery status");
      const data = await response.json();
      return { response, data };
    } catch (error) {
      console.error("updateDeliveryStatus error:", error);
      return { response: { ok: false }, data: { error: "Network error" } };
    }
  },

  // ---------------------
  // Customer Orders
  // ---------------------
  placeOrder: async (payload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      return { ok: response.ok, data };
    } catch (error) {
      console.error("placeOrder error:", error);
      return { ok: false, data: { error: "Network error" } };
    }
  },

  getCustomerOrders: async (customerId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/customers/${customerId}/orders`, { method: "GET", headers: { "Content-Type": "application/json" } });
      if (!response.ok) throw new Error("Failed to fetch customer orders");
      return response.json();
    } catch (error) {
      console.error("getCustomerOrders error:", error);
      return [];
    }
  },

  updateOrderStatus: async (shopId, orderId, status) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/shops/${shopId}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update order status');
      return response.json();
    } catch (err) {
      console.error('updateOrderStatus error:', err);
      throw err;
    }
  },

  // ---------------------
  // Helpers
  // ---------------------
  getCustomerLocation: () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject("Geolocation not supported");
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }),
};

// ---------------------
// Helper function outside of api
// ---------------------
export const fetchShopProfile = async (shopId, setShopProfile, setValues) => {
  try {
    const res = await api.getShopProfile(shopId);
    const data = res?.shop || res;

    if (data) {
      setShopProfile(data);
      setValues({
        name: data.name || "",
        type: data.type || "",
        location: data.location || "",
        status: data.status || "closed",
        profileImage: data.profileImage || "",
      });
    }
  } catch (e) {
    console.error("fetchShopProfile error:", e);
  }
};

export default api;
