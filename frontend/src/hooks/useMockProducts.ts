// import { useState} from 'react';
// // import { Product } from '@/types';

// // Mock data for demonstration
// const mockProducts = [
//   {
//     id: '1',
//     name: 'Organic Basmati Rice',
//     description: 'Premium quality organic basmati rice from traditional farming methods',
//     farmerId: 'FARMER001',
//     quantity: 1500,
//     pricePerUnit: 75,
//     origin: 'Punjab, India',
//     isOrganic: true,
//     harvestDate: '2024-01-15',
//     currentState: 'harvested',
//     currentHolderId: 'FARMER001',
//     createdAt: '2024-01-16'
//   },
//   {
//     id: '2',
//     name: 'Premium Wheat',
//     description: 'High-grade wheat suitable for premium flour production',
//     farmerId: 'FARMER002',
//     quantity: 2000,
//     pricePerUnit: 40,
//     origin: 'Haryana, India',
//     isOrganic: false,
//     harvestDate: '2024-01-10',
//     currentState: 'processing',
//     currentHolderId: 'MILL001',
//     createdAt: '2024-01-11'
//   },
//   {
//     id: '3',
//     name: 'Organic Turmeric',
//     description: 'Fresh organic turmeric with high curcumin content',
//     farmerId: 'FARMER003',
//     quantity: 500,
//     pricePerUnit: 120,
//     origin: 'Kerala, India',
//     isOrganic: true,
//     harvestDate: '2024-01-20',
//     currentState: 'distributed',
//     currentHolderId: 'DIST001',
//     createdAt: '2024-01-21'
//   }
// ];

// export const useProducts = () => {
//   const [products, setProducts] = useState<Product[]>(mockProducts);
//   const [loading, setLoading] = useState(false);

//   const addProduct = (newProduct: Omit<Product, 'id' | 'harvestDate' | 'currentState' | 'currentHolderId'>) => {
//     const product: Product = {
//       ...newProduct,
//       id: Date.now().toString(),
//       quantity: Number(newProduct.quantity),
//       pricePerUnit: Number(newProduct.pricePerUnit),
//       harvestDate: new Date().toISOString().split('T')[0],
//       currentState: 'harvested',
//       currentHolderId: newProduct.farmerId,
//       createdAt: new Date().toISOString().split('T')[0]
//     };
    
//     setProducts(prev => [product, ...prev]);
//   };

//   return {
//     products,
//     loading,
//     addProduct
//   };
// };

// export const useCreateProduct = () => {
//   const createProduct = async (product: any) => {
//     // Mock API call
//     return new Promise((resolve) => {
//       setTimeout(resolve, 1000);
//     });
//   };

//   return { createProduct };
// };