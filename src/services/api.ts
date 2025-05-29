// services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

class ApiService {
  private api: AxiosInstance;
  private authToken: string | null = null;
// https://vai-backend.onrender.com/api
  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:3001/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.authToken || localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const { status } = error.response;
          
          if (status === 401) {
            this.clearAuthToken();
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
          
          console.error('API Error:', error.response.data);
        } else if (error.request) {
          console.error('No response received:', error.request);
        } else {
          console.error('Request error:', error.message);
        }
        
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token: string): void {
    this.authToken = token;
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  }

  getAuthToken(): string | null {
    return this.authToken || localStorage.getItem('token');
  }

  clearAuthToken(): void {
    this.authToken = null;
    delete this.api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.get(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.post(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.put(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.delete(url, config);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.patch(url, data, config);
  }

  // Google OAuth login
  async loginWithGoogle(credential: string): Promise<AxiosResponse<any>> {
    return this.post('/auth/google', { credential });
  }
}

export default new ApiService();
