import axios from 'axios';
// Import types from centralized types file
import type {
  Product,
  // User,
  Transaction,
  // UserRole,
  // ProductState,
  // CreateProductData,
  // ProductCreateResponse,
  // QRGenerateResponse,
  // ProductTrackingData,
  // PaginationMeta,
  ApiResponse,
  LoginResponse
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

console.log('API Base URL:', API_BASE_URL);
// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookie-based auth
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Re-export commonly used types for convenience
export type { 
  Product, 
  User, 
  Transaction, 
  UserRole, 
  ProductState, 
  ApiResponse, 
  LoginResponse,
  CreateProductData,
  ProductCreateResponse,
  QRGenerateResponse,
  ProductTrackingData,
  PaginationMeta
} from '../types';

// Auth API calls
export const authAPI = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
    walletAddress?: string;
    profile?: any;
  }): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/register', userData);
    return response.data;
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>('/auth/logout');
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<any>> => {
    const response = await api.get<ApiResponse<any>>('/auth/me');
    return response.data;
  },

  updateProfile: async (profileData: any): Promise<ApiResponse<any>> => {
    const response = await api.put<ApiResponse<any>>('/auth/profile', profileData);
    return response.data;
  },
};

// Products API calls
export const productsAPI = {
  getProducts: async (page = 0, limit = 10): Promise<ApiResponse<{
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>> => {
    const response = await api.get<ApiResponse<any>>(`/products?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get user's own products
  getMyProducts: async (page = 0, limit = 10): Promise<ApiResponse<{
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>> => {
    const response = await api.get<ApiResponse<any>>(`/products/my?page=${page}&limit=${limit}`);
    return response.data;
  },

  getProduct: async (productId: string): Promise<ApiResponse<Product>> => {
    const response = await api.get<ApiResponse<Product>>(`/products/${productId}`);
    return response.data;
  },

  createProduct: async (productData: {
    id: string;
    name: string;
    description: string;
    quantity: number;
    pricePerUnit: number;
    harvestDate: string;
    origin: string;
    isOrganic: boolean;
    farmerId?: string;
    createdBy?: string;
  }): Promise<ApiResponse<{
    success: boolean;
    transactionHash: string;
    blockNumber: number;
    gasUsed: string;
    productId: string;
  }>> => {
    const response = await api.post<ApiResponse<any>>('/products', productData);
    return response.data;
  },

  updateProductState: async (productId: string, newState: number): Promise<ApiResponse<any>> => {
    const response = await api.put<ApiResponse<any>>(`/products/${productId}/state`, {
      newState,
    });
    return response.data;
  },
};

// Transactions API calls
export const transactionsAPI = {
  createTransaction: async (transactionData: {
    productId: string;
    fromUserId: string;
    toUserId: string;
  }): Promise<ApiResponse<Transaction>> => {
    const response = await api.post<ApiResponse<Transaction>>('/transactions', transactionData);
    return response.data;
  },

  getProductTransactions: async (productId: string): Promise<ApiResponse<Transaction[]>> => {
    const response = await api.get<ApiResponse<Transaction[]>>(`/transactions/product/${productId}`);
    return response.data;
  },

  getUserTransactions: async (userId: string): Promise<ApiResponse<Transaction[]>> => {
    const response = await api.get<ApiResponse<Transaction[]>>(`/transactions/user/${userId}`);
    return response.data;
  },

  getTransactionChain: async (productId: string): Promise<ApiResponse<any>> => {
    const response = await api.get<ApiResponse<any>>(`/transactions/product/${productId}/chain`);
    return response.data;
  },
};

// Product tracking API (public, no auth required)
export const trackingAPI = {
  getProductTracking: async (productId: string): Promise<ApiResponse<{
    product: Product;
    transactions: Transaction[];
    ownershipChain: any[];
    totalTransactions: number;
    currentOwner: string;
    trackingUrl: string;
  }>> => {
    const response = await api.get<ApiResponse<any>>(`/products/${productId}`);
    return response.data;
  },
};

// QR Code API calls
export const qrAPI = {
  generateQR: async (productId: string) => {
    const response = await api.get(`/qr/generate/${productId}`);
    return response.data;
  },

  generateQRImage: async (productId: string): Promise<Blob> => {
    const response = await api.get(`/qr/image/${productId}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  generateBatchQR: async (productIds: string[]): Promise<ApiResponse<{
    productId: string;
    trackingUrl: string;
    qrCode: string;
  }[]>> => {
    const response = await api.post<ApiResponse<any>>('/qr/batch', { productIds });
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async (): Promise<ApiResponse<{
    server: string;
    blockchain: string;
    database: string;
    timestamp: string;
    environment: string;
    networkInfo?: any;
    databaseInfo?: any;
  }>> => {
    const response = await api.get<ApiResponse<any>>('/health', {
      baseURL: 'http://192.168.43.160:3001', // Direct health endpoint
    });
    return response.data;
  },
};

export default api;
