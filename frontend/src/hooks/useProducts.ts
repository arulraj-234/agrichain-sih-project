import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import type { productsAPI, transactionsAPI, Product } from '../lib/api';
import { productsAPI, transactionsAPI } from '../lib/api';
import { toast } from 'react-toastify';

// Get all products with pagination
export const useProducts = (page = 0, limit = 10) => {
  return useQuery({
    queryKey: ['products', page, limit],
    queryFn: async () => {
      const response = await productsAPI.getProducts(page, limit);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch products');
      }
      return response.data;
    },
    staleTime: 30000, // 30 seconds
    retry: 3,
  });
};

// Get current user's products with pagination
export const useMyProducts = (page = 0, limit = 10) => {
  return useQuery({
    queryKey: ['my-products', page, limit],
    queryFn: async () => {
      const response = await productsAPI.getMyProducts(page, limit);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch user products');
      }
      return response.data;
    },
    staleTime: 30000, // 30 seconds
    retry: 3,
  });
};

// Get single product
export const useProduct = (productId: string) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const response = await productsAPI.getProduct(productId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch product');
      }
      return response.data;
    },
    enabled: !!productId,
    staleTime: 60000, // 1 minute
  });
};

// Create product mutation
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (productData: {
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
    }) => {
      const response = await productsAPI.createProduct(productData);
      if (!response.success) {
        throw new Error(response.message || 'Failed to create product');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate products queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['my-products'] });
      toast.success(`Product created successfully! Transaction: ${data?.transactionHash}`);
    },
    onError: (error: any) => {
      console.error('Create product error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create product';
      toast.error(errorMessage);
    },
  });
};

// Update product state mutation
export const useUpdateProductState = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ productId, newState }: { productId: string; newState: number }) => {
      const response = await productsAPI.updateProductState(productId, newState);
      if (!response.success) {
        throw new Error(response.message || 'Failed to update product state');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
      
      const stateNames = ['Produced', 'Processing', 'Shipped', 'Delivered', 'Sold'];
      toast.success(`Product state updated to ${stateNames[variables.newState]}!`);
    },
    onError: (error: any) => {
      console.error('Update product state error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update product state';
      toast.error(errorMessage);
    },
  });
};

// Transfer product ownership (create transaction)
export const useTransferProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ productId, fromUserId, toUserId }: { 
      productId: string; 
      fromUserId: string; 
      toUserId: string; 
    }) => {
      const response = await transactionsAPI.createTransaction({
        productId,
        fromUserId,
        toUserId,
      });
      if (!response.success) {
        throw new Error(response.message || 'Failed to transfer product');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['transactions', variables.productId] });
      
      toast.success(`Product transferred successfully! Transaction: ${data?.transactionHash}`);
    },
    onError: (error: any) => {
      console.error('Transfer product error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to transfer product';
      toast.error(errorMessage);
    },
  });
};

// Get product transaction history
export const useProductTransactions = (productId: string) => {
  return useQuery({
    queryKey: ['transactions', productId],
    queryFn: async () => {
      const response = await transactionsAPI.getProductTransactions(productId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch transactions');
      }
      return response.data;
    },
    enabled: !!productId,
    staleTime: 60000, // 1 minute
  });
};

// Get transaction chain for product
export const useTransactionChain = (productId: string) => {
  return useQuery({
    queryKey: ['transaction-chain', productId],
    queryFn: async () => {
      const response = await transactionsAPI.getTransactionChain(productId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch transaction chain');
      }
      return response.data;
    },
    enabled: !!productId,
    staleTime: 60000, // 1 minute
  });
};
