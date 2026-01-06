/**
 * Centralized API client for the frontend
 * All API requests go through this utility for consistency and error handling
 */

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
}

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  guide?: T;
  user?: any;
  token?: string;
  errors?: any;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    // Use NEXT_PUBLIC_API_URL if available, otherwise construct from host
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 
      (typeof window !== 'undefined' 
        ? `${window.location.origin.replace(':3001', ':5000')}/api`
        : 'http://localhost:5000/api');
    console.log('API Base URL:', this.baseURL);
    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  /**
   * Set authentication token
   */
  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  /**
   * Clear authentication token
   */
  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    let url = `${this.baseURL}${endpoint}`;

    if (params) {
      const queryString = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&');

      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return url;
  }

  /**
   * Make API request
   */
  async request<T = any>(endpoint: string, options: ApiOptions = {}): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      body,
      headers = {},
      params
    } = options;

    const url = this.buildUrl(endpoint, params);

    // Build headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers
    };

    // Add authentication token if available
    if (this.token) {
      requestHeaders['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include' // Include cookies for CORS requests
      });

      const data: ApiResponse<T> = await response.json();

      // Handle authentication errors
      if (response.status === 401) {
        this.clearToken();
        // You might want to redirect to login here or emit an event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
      }

      // If response is not ok but we got data, still return it with status check
      if (!response.ok && !data.success) {
        throw new Error(data.message || `HTTP Error: ${response.status}`);
      }

      return data;
    } catch (error: any) {
      console.error('API Request Error:', error);
      
      return {
        success: false,
        message: error.message || 'An error occurred while making the request',
        errors: error
      };
    }
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, options?: Omit<ApiOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = any>(endpoint: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  /**
   * PUT request
   */
  async put<T = any>(endpoint: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, options?: Omit<ApiOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(endpoint: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  // ==================== AUTH ENDPOINTS ====================

  /**
   * Register new user
   */
  async register(firstName: string, lastName: string, email: string, password: string, role?: string) {
    const response = await this.post('/auth/register', {
      firstName,
      lastName,
      email,
      password,
      role: role || 'candidate'
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  /**
   * Login user
   */
  async login(email: string, password: string) {
    const response = await this.post('/auth/login', { email, password });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  /**
   * Logout user
   */
  async logout() {
    const response = await this.post('/auth/logout');
    this.clearToken();
    return response;
  }

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    return this.get('/auth/me');
  }

  /**
   * Refresh authentication token
   */
  async refreshToken() {
    const response = await this.post('/auth/refresh-token');

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string) {
    return this.post('/auth/change-password', {
      currentPassword,
      newPassword
    });
  }

  // ==================== USER ENDPOINTS ====================

  /**
   * Get all users (admin only)
   */
  async getUsers(page = 1, limit = 10) {
    return this.get('/users', { params: { page, limit } });
  }

  /**
   * Get user by ID
   */
  async getUser(userId: string) {
    return this.get(`/users/${userId}`);
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, data: any) {
    return this.put(`/users/${userId}`, data);
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId: string) {
    return this.delete(`/users/${userId}`);
  }

  /**
   * Get user's interviews
   */
  async getUserInterviews(userId: string, page = 1, limit = 10) {
    return this.get(`/users/${userId}/interviews`, { params: { page, limit } });
  }

  /**
   * Get user's skills
   */
  async getUserSkills(userId: string) {
    return this.get(`/users/${userId}/skills`);
  }

  /**
   * Add skill to user
   */
  async addUserSkill(userId: string, skillId: string) {
    return this.post(`/users/${userId}/skills`, { skillId });
  }

  /**
   * Remove skill from user
   */
  async removeUserSkill(userId: string, skillId: string) {
    return this.delete(`/users/${userId}/skills/${skillId}`);
  }

  // ==================== SKILLS ENDPOINTS ====================

  /**
   * Get all skills
   */
  async getSkills(page = 1, limit = 10, category?: string, search?: string) {
    const params: any = { page, limit };
    if (category) params.category = category;
    if (search) params.search = search;

    return this.get('/skills', { params });
  }

  /**
   * Get skill by ID
   */
  async getSkill(skillId: string) {
    return this.get(`/skills/${skillId}`);
  }

  /**
   * Get skill categories
   */
  async getSkillCategories() {
    return this.get('/skills/categories');
  }

  /**
   * Create skill (admin only)
   */
  async createSkill(name: string, category: string, description?: string, level?: string) {
    return this.post('/skills', {
      name,
      category,
      description,
      level
    });
  }

  /**
   * Update skill (admin only)
   */
  async updateSkill(skillId: string, data: any) {
    return this.put(`/skills/${skillId}`, data);
  }

  /**
   * Delete skill (admin only)
   */
  async deleteSkill(skillId: string) {
    return this.delete(`/skills/${skillId}`);
  }

  /**
   * Get questions for a skill
   */
  async getSkillQuestions(skillId: string, page = 1, limit = 10) {
    return this.get(`/skills/${skillId}/questions`, { params: { page, limit } });
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.token !== null;
  }

  /**
   * Get API base URL
   */
  getBaseURL(): string {
    return this.baseURL;
  }

  /**
   * Upload file with multipart form data
   */
  async uploadFile(endpoint: string, file: File, additionalData?: Record<string, any>) {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers: Record<string, string> = {};

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include'
      });

      return await response.json();
    } catch (error: any) {
      console.error('File Upload Error:', error);
      return {
        success: false,
        message: error.message || 'File upload failed'
      };
    }
  }

  /**
   * Upload multiple files/data with FormData
   */
  async uploadFormData(endpoint: string, formData: FormData) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers: Record<string, string> = {};

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP Error: ${response.status}`);
      }

      return data;
    } catch (error: any) {
      console.error('FormData Upload Error:', error);
      return {
        success: false,
        message: error.message || 'Upload failed'
      };
    }
  }

  /**
   * Download file as blob (for CSV, PDF, etc.)
   */
  async downloadBlob(endpoint: string, filename?: string): Promise<{ success: boolean; message?: string }> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers: Record<string, string> = {};

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Download failed' }));
        throw new Error(errorData.message || `HTTP Error: ${response.status}`);
      }

      const blob = await response.blob();
      
      // Create download link
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      
      // Use provided filename or extract from response headers
      if (filename) {
        a.download = filename;
      } else {
        const contentDisposition = response.headers.get('Content-Disposition');
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
          if (filenameMatch) {
            a.download = filenameMatch[1];
          }
        }
      }
      
      if (!a.download) {
        a.download = `download-${Date.now()}`;
      }

      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);

      return { success: true };
    } catch (error: any) {
      console.error('Blob Download Error:', error);
      return {
        success: false,
        message: error.message || 'Download failed'
      };
    }
  }
}

// Export singleton instance
export const api = new ApiClient();

// Also export the class for testing purposes
export default api;
