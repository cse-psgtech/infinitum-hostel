// API configuration and utility functions
const API_BASE = `${import.meta.env.VITE_API_BASE}/inf/api/acc` || 'http://localhost:3000/inf/api/acc';

// Generic fetch wrapper with error handling
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API request failed: ${url}`, error);
    throw error;
  }
};

// Accommodation API functions
export const accommodationAPI = {
  // Register accommodation
  register: async (accommodationData: any) => {
    return apiRequest('/accommodation/register', {
      method: 'POST',
      body: JSON.stringify(accommodationData),
    });
  },

  // Get accommodation by unique ID
  getByUniqueId: async (uniqueId: string) => {
    return apiRequest(`/accommodation/uniqueId/${uniqueId}`);
  },

  // Get accommodation by email
  getByEmail: async (email: string) => {
    return apiRequest(`/accommodation/email/${email}`);
  },

  // Get accommodation statistics
  getStats: async () => {
    return apiRequest('/accommodation/stats');
  },

  // Get all accommodations with room details
  getAll: async () => {
    return apiRequest('/accommodation/all');
  },

  // Update accommodation
  update: async (uniqueId: string, updateData: { remarks?: string; day?: string; optin?: boolean; allocated?: boolean; vacated?: boolean }) => {
    return apiRequest(`/accommodation/update/${uniqueId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },
};

// Desk session API functions
export const deskAPI = {
  // Create a new desk session
  createSession: async () => {
    return apiRequest('/desk/create', {
      method: 'POST',
    });
  },

  // Refresh desk session
  refreshSession: async (deskId: string, signature: string) => {
    return apiRequest('/desk/refresh', {
      method: 'POST',
      body: JSON.stringify({ deskId, signature }),
    });
  },
};

// User API functions
export const userAPI = {
  // Get all users
  getAllUsers: async () => {
    return apiRequest('/user/fetch');
  },
};

// Export default API configuration
export default {
  accommodationAPI,
  deskAPI,
  userAPI,
};