export interface Product {
  id: string
  name: string
  description: string
  farmerId: string
  quantity: string
  pricePerUnit: string
  currentState: number // 0: Produced, 1: In Transit, 2: Delivered
  harvestDate: string
  origin: string
  isOrganic: boolean
  currentHolderId: string
  // Legacy fields for compatibility
  crop?: string
  batchId?: string
  owner?: string
  farmerName?: string
  createdAt?: string
  qrCode?: string
}

export interface Transaction {
  id: string
  productId: string
  fromStakeholder: string
  toStakeholder: string
  timestamp: string
  price: string
  notes: string
}

export interface Farmer {
  id: string
  name: string
  location: string
  contact: string
  walletAddress: string
  registeredAt: string
}

export interface Middleman {
  id: string
  name: string
  location: string
  contact: string
  walletAddress: string
  registeredAt: string
}

export const ProductStates = {
  0: 'Produced',
  1: 'In Transit',
  2: 'Delivered'
} as const