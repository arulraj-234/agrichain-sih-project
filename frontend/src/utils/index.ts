/**
 * Utility Functions
 * Agricultural Supply Chain Blockchain Project
 */

// ================================
// Number and Currency Formatting
// ================================

/**
 * Format a number with proper localization
 */
export const formatNumber = (value: number | string | undefined | null): string => {
  if (value === undefined || value === null) return '0';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? '0' : num.toLocaleString();
};

/**
 * Format currency with Indian Rupee symbol
 */
export const formatCurrency = (value: number | string | undefined | null): string => {
  if (value === undefined || value === null) return '₹0';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? '₹0' : `₹${num.toLocaleString('en-IN')}`;
};

/**
 * Parse a string value to number, with fallback
 */
export const parseNumber = (value: string | number | undefined | null): number => {
  if (value === undefined || value === null) return 0;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? 0 : num;
};

// ================================
// Date and Time Formatting
// ================================

/**
 * Format date with various options
 */
export const formatDate = (
  dateString: string | Date | undefined | null,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!dateString) return 'N/A';
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options || defaultOptions);
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Format date for display (short format)
 */
export const formatDateShort = (dateString: string | Date | undefined | null): string => {
  return formatDate(dateString, {
    year: '2-digit',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (dateString: string | Date | undefined | null): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return formatDateShort(dateString);
  } catch (error) {
    return 'Unknown';
  }
};

// ================================
// String Utilities
// ================================

/**
 * Truncate string with ellipsis
 */
export const truncateString = (str: string | undefined | null, maxLength: number): string => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength - 3)}...`;
};

/**
 * Capitalize first letter of each word
 */
export const titleCase = (str: string | undefined | null): string => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

/**
 * Generate random ID with prefix
 */
export const generateId = (prefix: string = 'ID'): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}${random}`.toUpperCase();
};

// ================================
// Validation Utilities
// ================================

/**
 * Validate email address
 */
export const isValidEmail = (email: string | undefined | null): boolean => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate Ethereum address
 */
export const isValidEthereumAddress = (address: string | undefined | null): boolean => {
  if (!address) return false;
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethAddressRegex.test(address);
};

/**
 * Validate product ID format
 */
export const isValidProductId = (id: string | undefined | null): boolean => {
  if (!id) return false;
  // Allow alphanumeric, underscore, hyphen (minimum 3 characters)
  const productIdRegex = /^[a-zA-Z0-9_-]{3,}$/;
  return productIdRegex.test(id);
};

// ================================
// Array and Object Utilities
// ================================

/**
 * Deep clone an object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 */
export const isEmpty = (obj: any): boolean => {
  if (obj === null || obj === undefined) return true;
  if (typeof obj === 'string') return obj.trim().length === 0;
  if (Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
};

/**
 * Remove duplicates from array based on key
 */
export const removeDuplicates = <T>(array: T[], key?: keyof T): T[] => {
  if (!key) return [...new Set(array)];
  return array.filter((item, index, self) => 
    index === self.findIndex(t => t[key] === item[key])
  );
};

/**
 * Sort array by key
 */
export const sortBy = <T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
  return array.sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

// ================================
// Error Handling
// ================================

/**
 * Extract error message from various error types
 */
export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.error) return error.response.data.error;
  return 'An unknown error occurred';
};

/**
 * Log error with context
 */
export const logError = (error: any, context?: string): void => {
  const message = getErrorMessage(error);
  console.error(`${context ? `[${context}] ` : ''}Error:`, message, error);
};

// ================================
// Local Storage Utilities
// ================================

/**
 * Safe localStorage getter
 */
export const getLocalStorage = <T>(key: string, defaultValue?: T): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue || null;
  } catch (error) {
    logError(error, 'getLocalStorage');
    return defaultValue || null;
  }
};

/**
 * Safe localStorage setter
 */
export const setLocalStorage = <T>(key: string, value: T): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    logError(error, 'setLocalStorage');
    return false;
  }
};

/**
 * Safe localStorage remover
 */
export const removeLocalStorage = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    logError(error, 'removeLocalStorage');
    return false;
  }
};

// ================================
// URL and Query Utilities
// ================================

/**
 * Build query string from object
 */
export const buildQueryString = (params: Record<string, any>): string => {
  const filteredParams = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  
  return filteredParams.length > 0 ? `?${filteredParams.join('&')}` : '';
};

/**
 * Parse query string to object
 */
export const parseQueryString = (search: string): Record<string, string> => {
  const params = new URLSearchParams(search);
  const result: Record<string, string> = {};
  
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  
  return result;
};

// ================================
// Development Utilities
// ================================

/**
 * Debug log (only in development)
 */
export const debugLog = (...args: any[]): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[DEBUG]', ...args);
  }
};

/**
 * Performance timer
 */
export const createTimer = (label: string) => {
  const start = performance.now();
  
  return {
    stop: () => {
      const end = performance.now();
      debugLog(`${label} took ${(end - start).toFixed(2)}ms`);
      return end - start;
    }
  };
};

export default {
  formatNumber,
  formatCurrency,
  parseNumber,
  formatDate,
  formatDateShort,
  getRelativeTime,
  truncateString,
  titleCase,
  generateId,
  isValidEmail,
  isValidEthereumAddress,
  isValidProductId,
  deepClone,
  isEmpty,
  removeDuplicates,
  sortBy,
  getErrorMessage,
  logError,
  getLocalStorage,
  setLocalStorage,
  removeLocalStorage,
  buildQueryString,
  parseQueryString,
  debugLog,
  createTimer
};
