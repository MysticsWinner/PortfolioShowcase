import axios, { AxiosRequestConfig } from 'axios';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

export type BackendStatus = 'online' | 'waking' | 'offline';

export interface BackendState {
  status: BackendStatus;
  isColdStarting: boolean;
  message: string;
  provider: string;
  backendUrl: string;
  frontendHost: string;
  lastChecked?: Date;
  latencyMs?: number;
}

export interface HostingInfo {
  provider: 'Render' | 'Vercel' | 'Production Cloud' | 'Local Development';
  isRender: boolean;
  isVercel: boolean;
  serviceName: string;
  serviceId?: string;
  externalUrl?: string;
  region: string;
  nodeEnv: string;
  platform: string;
  nodeVersion: string;
  gitCommit?: string;
  gitBranch?: string;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded';
  timestamp: string;
  uptimeSeconds: number;
  hosting: HostingInfo;
  services: {
    database: 'connected' | 'disconnected';
  };
}

// Global observable listeners for Render cold-start and backend health
type StatusListener = (state: BackendState) => void;
const listeners = new Set<StatusListener>();

let currentBackendState: BackendState = {
  status: 'online',
  isColdStarting: false,
  message: 'Backend operational',
  provider: API_URL.includes('onrender.com') ? 'Render' : 'Local Development',
  backendUrl: API_URL,
  frontendHost: 'Detecting...',
};

export function getFrontendHostInfo(): string {
  if (typeof window === 'undefined') {
    return process.env.VERCEL ? 'Vercel (Server)' : 'Node.js Runtime';
  }
  const hostname = window.location.hostname;
  if (hostname.includes('vercel.app')) return 'Vercel (Production/Preview)';
  if (hostname === 'localhost' || hostname === '127.0.0.1') return 'Localhost';
  return `Production (${hostname})`;
}

export function subscribeBackendStatus(listener: StatusListener): () => void {
  listeners.add(listener);
  listener(currentBackendState);
  return () => {
    listeners.delete(listener);
  };
}

function updateBackendState(partial: Partial<BackendState>) {
  currentBackendState = {
    ...currentBackendState,
    ...partial,
    frontendHost: getFrontendHostInfo(),
  };
  listeners.forEach(fn => fn(currentBackendState));
}

// Check if JWT token has expired based on its exp claim
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    if (!payload.exp) return false;
    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

// 75-second timeout to accommodate Render free-tier cold boot times (~30-60s)
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 75000,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      if (isTokenExpired(token)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.startsWith('/auth/')) {
          window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname);
        }
        return Promise.reject(new axios.Cancel('Session expired'));
      }
      if (config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  }
  return config;
});

// Cold-Start Resilience Interceptor: Handles 502/503/504 and Network Dropped frames during Render spin-ups
apiClient.interceptors.response.use(
  (response) => {
    if (currentBackendState.isColdStarting) {
      updateBackendState({
        status: 'online',
        isColdStarting: false,
        message: 'Connected to backend successfully',
      });
    }
    return response;
  },
  async (error) => {
    const config = error.config as (AxiosRequestConfig & { _retryCount?: number });
    const status = error.response?.status;
    const isNetworkError = !error.response && (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED' || error.message?.includes('Network Error') || error.message?.includes('timeout'));
    const isRenderColdStart = status === 502 || status === 503 || status === 504 || isNetworkError;

    // Detect and broadcast Render container cold start
    if (isRenderColdStart && config) {
      config._retryCount = (config._retryCount || 0) + 1;
      
      const isRender = API_URL.includes('onrender.com') || currentBackendState.provider === 'Render';
      const providerName = isRender ? 'Render' : 'Cloud';

      updateBackendState({
        status: 'waking',
        isColdStarting: true,
        message: `${providerName} backend is waking up from idle... Automatically retrying (attempt ${config._retryCount}/3)`,
      });

      // Max 3 retries with backoff during spin-up
      if (config._retryCount <= 3) {
        const delay = config._retryCount * 3500;
        await new Promise(resolve => setTimeout(resolve, delay));
        return apiClient(config);
      } else {
        updateBackendState({
          status: 'offline',
          isColdStarting: false,
          message: `${providerName} backend boot is taking longer than expected. Please verify service health.`,
        });
      }
    }

    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.startsWith('/auth/')) {
          window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname);
        }
      }
    }

    return Promise.reject(error);
  }
);

export interface Portfolio {
  id: string;
  title: string;
  data: string;
  fileName?: string;
  fileType?: string;
  createdAt: string;
}

export interface UserRole {
  id?: string;
  type: 'ADMIN' | 'MEMBER' | 'VIEWER' | string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  role?: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export const systemApi = {
  /**
   * Health and hosting diagnostic probe (triggers container wake-up on Render)
   */
  async getHealth(): Promise<HealthResponse> {
    const startTime = Date.now();
    try {
      const response = await apiClient.get<HealthResponse>('/health', { timeout: 45000 });
      const latencyMs = Date.now() - startTime;
      updateBackendState({
        status: 'online',
        isColdStarting: false,
        message: 'Backend operational',
        provider: response.data.hosting?.provider || 'Render',
        lastChecked: new Date(),
        latencyMs,
      });
      return response.data;
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      updateBackendState({
        status: 'waking',
        isColdStarting: true,
        lastChecked: new Date(),
        latencyMs,
      });
      throw err;
    }
  },

  async getSystemInfo() {
    const response = await apiClient.get('/system/info', { timeout: 45000 });
    return response.data;
  },

  /**
   * Fast non-blocking ping to initiate Render cold-start wake-up early
   */
  wakeUpBackend() {
    this.getHealth().catch(() => {
      // Intentionally swallowed: early wake-up probe runs silently in background
    });
  }
};

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
  },
  async getProfile(): Promise<User> {
    const response = await apiClient.get(`/auth/me`);
    return response.data;
  }
};

export const portfolioApi = {
  async getPortfolios(userId: string) {
    const response = await apiClient.get(`/portfolios`, {
      params: { userId },
    });
    return response.data;
  },

  async createPortfolio(userId: string, title: string, data: string) {
    const response = await apiClient.post(`/portfolios`, {
      userId,
      title,
      data,
    });
    return response.data;
  },

  async deletePortfolio(userId: string, portfolioId: string) {
    const response = await apiClient.delete(`/portfolios/${portfolioId}`, {
      params: { userId },
    });
    return response.data;
  },

  async uploadPortfolioFile(portfolioId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(`/portfolios/${portfolioId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async downloadPortfolioFile(portfolioId: string, filename: string) {
    const response = await apiClient.get(`/portfolios/${portfolioId}/download`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
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

export interface RubricCriteria {
  label: string;
  maxPoints: number;
  earnedPoints: number;
  details: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  content?: string | null;
  visibility: 'PUBLIC' | 'PRIVATE';
  status: 'DRAFT' | 'PUBLISHED';
  repoUrl?: string | null;
  liveUrl?: string | null;
  thumbnail?: string | null;
  workabilityScore?: number | null;
  healthStatus?: 'ONLINE' | 'DEGRADED' | 'OFFLINE' | 'PENDING' | 'NO_LINK' | string | null;
  lastHealthCheck?: string | null;
  rubricConfig?: Record<string, number> | null;
  technologies?: Array<{ technology: { id: string; name: string; category?: string | null } } | any>;
  tags?: Array<{ tag: { id: string; name: string } }>;
  breakdown?: Record<string, RubricCriteria>;
  rubric?: Record<string, number>;
  creatorId: string;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export const projectsApi = {
  async getPublicProjects(): Promise<Project[]> {
    const response = await apiClient.get('/projects');
    return response.data;
  },
  async getMyProjects(): Promise<Project[]> {
    const response = await apiClient.get('/projects/my');
    return response.data;
  },
  async getProject(id: string): Promise<Project> {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  },
  async createProject(data: Partial<Project> & { technologies?: string[] }): Promise<Project> {
    const response = await apiClient.post('/projects', data);
    return response.data;
  },
  async bulkCreate(projects: Array<Partial<Project> & { technologies?: string[] }>): Promise<{ count: number; projects: Project[] }> {
    const response = await apiClient.post('/projects/bulk', { projects });
    return response.data;
  },
  async checkHealth(id: string): Promise<{ project: Project; score: number; healthStatus: string; breakdown: Record<string, RubricCriteria>; rubric: Record<string, number> }> {
    const response = await apiClient.post(`/projects/${id}/health-check`);
    return response.data;
  },
  async updateRubric(id: string, rubricConfig: Record<string, number>): Promise<{ project: Project; score: number; breakdown: Record<string, RubricCriteria>; rubric: Record<string, number> }> {
    const response = await apiClient.patch(`/projects/${id}/rubric`, rubricConfig);
    return response.data;
  },
  async updateProject(id: string, data: Partial<Project> & { technologies?: string[] }): Promise<Project> {
    const response = await apiClient.patch(`/projects/${id}`, data);
    return response.data;
  },
  async deleteProject(id: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`/projects/${id}`);
    return response.data;
  },
};


export const messagesApi = {
  async getMessages(): Promise<ContactMessage[]> {
    const response = await apiClient.get('/contact');
    return response.data;
  },
  async markAsRead(id: string, isRead: boolean = true): Promise<ContactMessage> {
    const response = await apiClient.patch(`/contact/${id}/read`, { isRead });
    return response.data;
  },
  async deleteMessage(id: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete(`/contact/${id}`);
    return response.data;
  },
  async sendMessage(name: string, email: string, message: string): Promise<ContactMessage> {
    const response = await apiClient.post('/contact', { name, email, message });
    return response.data;
  },
};

export const settingsApi = {
  async updateProfile(data: { name?: string }): Promise<User> {
    const response = await apiClient.patch('/auth/profile', data);
    return response.data;
  },
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },
};

