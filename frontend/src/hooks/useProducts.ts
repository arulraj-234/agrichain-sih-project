import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const API_URL = "http://localhost:3001/api/products"; // change if needed

// Types
export interface Product {
  id: string;
  name: string;
  description: string;
  farmerId: string;
  quantity: string;
  pricePerUnit: string;
  currentState: number;
  harvestDate: string;
  origin: string;
  isOrganic: boolean;
  currentHolderId: string;
}

export interface Transaction {
  productId: string;
  fromStakeholder: string;
  toStakeholder: string;
  timestamp: string;
  price: string;
  notes: string;
}

// Get all products
export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/`);
      console.log(res.data.data);
      return res.data.data;
    },
  });
}

// Get product by ID
export function useProduct(id: string) {
  return useQuery<Product>({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
}

// Create product
export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newProduct: Omit<Product, "id" | "farmerId" | "currentState" | "harvestDate" | "currentHolderId">) => {
      const res = await axios.post(`${API_URL}/create`, newProduct);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// Transfer product ownership
export function useTransferProduct(productId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { toStakeholderId: string; price: string; notes?: string }) => {
      const res = await axios.post(`${API_URL}/${productId}/transfer`, payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      queryClient.invalidateQueries({ queryKey: ["transactions", productId] });
    },
  });
}

// Get product transaction history
export function useProductTransactions(productId: string) {
  return useQuery<Transaction[]>({
    queryKey: ["transactions", productId],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/${productId}/transactions`);
      return res.data.data;
    },
    enabled: !!productId,
  });
}
