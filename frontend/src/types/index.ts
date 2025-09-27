/**
 * Comprehensive TypeScript Type Definitions
 * Agricultural Supply Chain Blockchain Project
 */

// ================================
// Base Types and Utilities
// ================================

export type UserRole = 'farmer' | 'distributor' | 'retailer' | 'trader' | 'consumer' | 'admin' | 'processor' | 'supplier';

export type ProductState = 0 | 1 | 2 | 3 | 4 | 5; // Created, Harvested, Processing, Quality_Checked, Shipped, Delivered

// ================================
// API Response Types
// ================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

// ================================
// User Types
// ================================

export interface UserProfile {
  company?: string;
  location?: string;
  contact?: string;
  specialties?: string[];
  licenseNumber?: string;
  verified: boolean;
}

export interface User {
  id: string;
  _id?: string; // MongoDB ObjectId
  name: string;
  email: string;
  role: UserRole;
  walletAddress?: string;
  profile: UserProfile;
  isActive: boolean;
  lastLogin?: string | Date;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

// Alternate LoginResponse format for backward compatibility
export interface LoginResponseLegacy {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    walletAddress?: string;
    profile: any;
    verified: boolean;
    isActive: boolean;
    createdAt: string;
    lastLogin?: string;
  };
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  walletAddress?: string;
  profile?: Partial<UserProfile>;
}

// ================================
// Product Types
// ================================

export interface Product {
  id: string;
  _id?: string; // MongoDB ObjectId
  name: string;
  description: string;
  farmerId: string;
  quantity: number; // Fixed: should be number, not string
  pricePerUnit: number; // Fixed: should be number, not string
  currentState: ProductState;
  harvestDate: string|Date;
  origin: string;
  isOrganic: boolean;
  currentHolderId: string;
  createdBy?: string;
  createdAt?: string | Date | undefined;
  updatedAt?: string | Date;
  
  // Additional fields that might come from blockchain
  category?: string;
  batch?: string;
  certifications?: string[];
  storageConditions?: string;
  expiryDate?: string | Date;
  
  // Legacy fields for compatibility
  crop?: string;
  batchId?: string;
  owner?: string;
  farmerName?: string;
  qrCode?: string;
}

export interface CreateProductData {
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
  category?: string;
  batch?: string;
  certifications?: string[];
  storageConditions?: string;
  expiryDate?: string;
}

export interface ProductCreateResponse {
  success: boolean;
  transactionHash: string;
  blockNumber: number;
  gasUsed: string;
  productId: string;
}

// ================================
// Transaction Types
// ================================

export interface Transaction {
  id?: string;
  _id?: string; // MongoDB ObjectId
  transactionId: string;
  productId: string;
  fromUserId: string;
  toUserId: string;
  timestamp: string | Date;
  transactionHash: string;
  blockNumber: number;
  gasUsed: string;
  amount?: number; // Transaction value if applicable
  notes?: string; // Additional transaction notes
  
  // Legacy fields for compatibility
  fromStakeholder?: string;
  toStakeholder?: string;
  price?: string;
}

export interface CreateTransactionData {
  productId: string;
  fromUserId: string;
  toUserId: string;
  amount?: number;
  notes?: string;
}

export interface OwnershipChainStep {
  step: number;
  owner: string;
  ownerName?: string; // User name for display
  previousOwner?: string;
  action: 'Created' | 'Transferred' | 'Processed' | 'Quality_Checked';
  timestamp: string | Date;
  transactionId: string | null;
  transactionHash?: string;
}

// ================================
// Legacy Types (for compatibility)
// ================================

export interface Farmer {
  id: string;
  name: string;
  location: string;
  contact: string;
  walletAddress: string;
  registeredAt: string;
}

export interface Middleman {
  id: string;
  name: string;
  location: string;
  contact: string;
  walletAddress: string;
  registeredAt: string;
}

// ================================
// Constants
// ================================

export const PRODUCT_STATES: Record<ProductState, string> = {
  0: 'Created',
  1: 'Harvested',
  2: 'Processing',
  3: 'Quality Checked',
  4: 'Shipped',
  5: 'Delivered'
};

// Legacy constant for backward compatibility
export const ProductStates = {
  0: 'Created',
  1: 'Harvested',
  2: 'Processing',
  3: 'Quality Checked',
  4: 'Shipped',
  5: 'Delivered'
} as const;

export const USER_ROLES: Record<UserRole, string> = {
  farmer: 'Farmer',
  distributor: 'Distributor',
  retailer: 'Retailer',
  trader: 'Trader',
  consumer: 'Consumer',
  admin: 'Administrator',
  processor: 'Processor',
  supplier: 'Supplier'
};

// ================================
// QR Code Types
// ================================

export interface QRCodeData {
  productId: string;
  trackingUrl: string;
  qrCode: string; // Base64 encoded QR code image
}

export interface QRGenerateResponse {
  productId: string;
  trackingUrl: string;
  qrCode: string;
}

// ================================
// Product Tracking Types
// ================================

export interface ProductTrackingData {
  product: Product;
  transactions: Transaction[];
  ownershipChain: OwnershipChainStep[];
  totalTransactions: number;
  currentOwner: string;
  currentOwnerDetails?: User;
  trackingUrl: string;
}

// Export default type for convenience
export type { Product as DefaultProduct, User as DefaultUser, Transaction as DefaultTransaction };
