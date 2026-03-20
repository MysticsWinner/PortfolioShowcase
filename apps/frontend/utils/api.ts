import axios from 'axios';

// The Backend runs on port 3000 by default in NestJS, configure it here.
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface Portfolio {
  id: string;
  title: string;
  data: string;
  createdAt: string;
}

export const portfolioApi = {
  /**
   * Fetch all portfolios for a user.
   */
  async getPortfolios(userId: string) {
    const response = await axios.get(`${API_URL}/portfolios`, {
      params: { userId },
    });
    return response.data;
  },

  /**
   * Securely upload a structurally sound portfolio block.
   */
  async createPortfolio(userId: string, title: string, data: string) {
    const response = await axios.post(`${API_URL}/portfolios`, {
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
    const response = await axios.delete(`${API_URL}/portfolios/${portfolioId}`, {
      params: { userId },
    });
    return response.data;
  },
};
