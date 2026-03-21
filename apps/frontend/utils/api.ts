import axios from 'axios';

// The Backend requires NEXT_PUBLIC_API_URL to be defined cleanly from .env.local
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("CRITICAL: NEXT_PUBLIC_API_URL is undefined in your .env.local!");
}

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
  fileUrl?: string;
  fileType?: string;
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
  },
  async verifyOTP(email: string, otp: string) {
    const response = await apiClient.post(`/auth/verify`, { email, otp });
    return response.data;
  },
  async resendOTP(email: string) {
    const response = await apiClient.post(`/auth/resend-otp`, { email });
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

  /**
   * Transmit a native binary file buffer to the authenticated backend routes securely.
   */
  async uploadPortfolioFile(portfolioId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(`/portfolios/${portfolioId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Safely intercept and download protected HTTP file streams without exposing raw public URL links.
   */
  async downloadPortfolioFile(portfolioId: string, filename: string) {
    const response = await apiClient.get(`/portfolios/${portfolioId}/download`, {
      responseType: 'blob',
    });
    
    // Architect virtual anchor execution to physically pull the Blob onto the hard drive
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    
    // Cleanly obliterate the DOM node and blob cache
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export const adminApi = {
  async getAllUsers() {
    const response = await apiClient.get('/admin/users');
    return response.data;
  },
  async toggleUserStatus(userId: string) {
    const response = await apiClient.patch(`/admin/users/${userId}/status`);
    return response.data;
  },
  async toggleUserRole(userId: string) {
    const response = await apiClient.patch(`/admin/users/${userId}/role`);
    return response.data;
  }
};
