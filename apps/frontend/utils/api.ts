import axios from 'axios';

// The Backend runs on port 3001 based on main.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface Portfolio {
  id: string;
  title: string;
  data: string;
  createdAt: string;
}

export const authApi = {
  async login(email: string, pass: string) {
    const response = await apiClient.post(`/auth/login`, { email, password: pass });
    return response.data;
  },
  async register(name: string, email: string, pass: string) {
    const response = await apiClient.post(`/auth/register`, { name, email, password: pass });
    return response.data;
  }
};

export const portfolioApi = {
  /**
   * Fetch all portfolios for a user.
   */
  async getPortfolios(userId: string) {
    const response = await apiClient.get(`/portfolios`, {
      params: { userId },
    });
    return response.data;
  },

  /**
   * Securely upload a structurally sound portfolio block.
   */
  async createPortfolio(userId: string, title: string, data: string) {
    const response = await apiClient.post(`/portfolios`, {
      userId,
      title,
      data,
    });
    return response.data;
  },

  /**
   * Delete an existing portfolio belonging to the user.
   */
  async deletePortfolio(userId: string, portfolioId: string) {
    const response = await apiClient.delete(`/portfolios/${portfolioId}`, {
      params: { userId },
    });
    return response.data;
  },
};
