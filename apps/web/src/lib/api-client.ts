/**
 * OmniFlow Web API Client
 * Connects Next.js Frontend & Admin to NestJS Backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message?: string;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

class OmniApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('omniflow_token', token);
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      return localStorage.getItem('omniflow_token');
    }
    return null;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
      const json = await res.json();
      return json;
    } catch (err: any) {
      return {
        success: false,
        statusCode: 500,
        message: err.message || 'Network error connecting to OmniFlow Backend',
        data: null as any,
      };
    }
  }

  // API Methods
  async getProducts() {
    return this.request<any[]>('/products');
  }

  async getOrders() {
    return this.request<any[]>('/orders');
  }

  async getHealth() {
    return this.request<{ status: string; timestamp: string }>('/health');
  }

  async askAi(prompt: string) {
    return this.request<{ text: string }>('/ai/ask', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  }

  async getAiStatus() {
    return this.request<{ engine: string; configured: boolean; model: string; status: string }>('/ai/status');
  }

  async generateProductDescription(name: string, category?: string, keywords?: string[]) {
    return this.request<{ productName: string; generatedContent: string }>('/ai/description', {
      method: 'POST',
      body: JSON.stringify({ name, category, keywords }),
    });
  }

  async createToken(name: string, abilities = ['*']) {
    return this.request<{ token: string }>('/auth/tokens', {
      method: 'POST',
      body: JSON.stringify({ name, abilities }),
    });
  }
}

export const api = new OmniApiClient();
