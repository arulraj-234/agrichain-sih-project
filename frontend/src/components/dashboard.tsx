import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AddProductForm } from "@/components/add-product-form";
import { useMyProducts, useCreateProduct } from "@/hooks/useProducts";
import {
  Plus,
  Search,
  Package,
  TrendingUp,
  Users,
  Leaf,
  MapPin,
  Calendar,
  Hash,
  Filter,
  QrCode,
} from "lucide-react";
import { ProductCard } from "./product-card";
import QRCode from "qrcode";
import type { Product } from "@/types";


interface DashboardProps {
  handleGenerateQR?: (product: Product) => void;
  user?: any;
}

export function Dashboard({ handleGenerateQR ,user}: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [qrModalOpen, setQrModalOpen] = React.useState(false);
  const [qrModalProduct, setQrModalProduct] = React.useState<Product | null>(null);
  const [qrModalDataUrl, setQrModalDataUrl] = React.useState<string>("");

  // Use the real API hooks - fetch user's own products only
  const { data: productsData, isLoading, error } = useMyProducts(0, 50); // Get user's first 50 products
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();

  // Extract products from API response
  const products = productsData?.products || [];

  console.log("User's Products:", products);
  const filteredProducts = products.filter(
    (product: Product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.farmerId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  

  const totalProducts = products.length;
  const organicProducts = products.filter((p: Product) => p.isOrganic).length;
  const totalValue = products.reduce(
    (sum: number, product: Product) => sum + (parseFloat(product.quantity) * parseFloat(product.pricePerUnit)),
    0
  );
  const uniqueFarmers = new Set(products.map((p: Product) => p.farmerId)).size;

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: // Produced
        return "bg-blue-50 text-blue-700 border-blue-200";
      case 1: // Processing
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case 2: // Shipped
        return "bg-purple-50 text-purple-700 border-purple-200";
      case 3: // Delivered
        return "bg-green-50 text-green-700 border-green-200";
      case 4: // Sold
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusText = (status: number) => {
    const statusNames = ['Produced', 'Processing', 'Shipped', 'Delivered', 'Sold'];
    return statusNames[status] || 'Unknown';
  };

  const handleAddProduct = (productData: any) => {
    // Convert form data to API format
    const apiProductData = {
      id: Date.now().toString(),
      name: productData.name,
      description: productData.description,
      quantity: parseFloat(productData.quantity),
      pricePerUnit: parseFloat(productData.pricePerUnit),
      harvestDate: productData.harvestDate,
      origin: productData.origin,
      isOrganic: productData.isOrganic || false,
      farmerId: productData.farmerId,
      createdBy: user.id,
      
    };
    
    createProduct(apiProductData, {
      onSuccess: () => {
        setShowAddForm(false);
      },
    });
  };

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-chart-2 to-chart-2 bg-clip-text text-transparent mb-2">
              My Products Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              Track and manage your agricultural products on the blockchain
            </p>
          </div>

          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogTrigger>
              <Button className="mt-4 lg:mt-0 bg-gradient-to-r from-chart-2 to-chart-2 hover:from-chart-2 hover:to-chart-2/80 text-white font-medium transition-all duration-200 transform hover:scale-105 shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Add New Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
              <div className="p-6">
                <AddProductForm onAddProduct={handleAddProduct} />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-border/50 bg-gradient-to-br from-card to-card/80 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Products
              </CardTitle>
              <Package className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground/90">
                {totalProducts}
              </div>
              <p className="text-xs text-muted-foreground">
                Products registered on blockchain
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-gradient-to-br from-card to-card/80 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground/90">
                ₹{totalValue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Combined product value
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-gradient-to-br from-card to-card/80 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Farmers
              </CardTitle>
              <Users className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground/90">
                {uniqueFarmers}
              </div>
              <p className="text-xs text-muted-foreground">
                Registered farmers
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-gradient-to-br from-card to-card/80 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Organic Products
              </CardTitle>
              <Leaf className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground/90">
                {organicProducts}
              </div>
              <p className="text-xs text-muted-foreground">
                Certified organic products
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8 border-border/50 bg-gradient-to-br from-card to-card/80 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-chart-2" />
              Search & Filter Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by product name, origin, or farmer ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50 focus:border-chart-2/50 focus:ring-chart-2/20"
                />
              </div>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-chart-2 border-t-transparent" />
              <span className="text-lg">Loading products...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="text-center py-8">
              <Package className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Failed to Load Products
              </h3>
              <p className="text-red-600">
                {error.message || 'Something went wrong while fetching products.'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Products Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product: Product) => (
              
              <Card
                key={product.id}
                className="border-border/50 bg-gradient-to-br from-card to-card/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-foreground mb-1">
                        {product.name}{product.currentHolderId === user.id ? "" : <span className="bg-red-500/60 border-2 border-red-300 rounded-3xl text-white text-xs px-2 py-1 ml-2"> (SOLD)</span>}
                      </CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        {product.isOrganic && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-chart-2/50 text-chart-2 text-xs font-medium rounded-full border border-chart-2-200">
                            <Leaf className="h-3 w-3" />
                            Organic
                          </span>
                        )}
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                            product.currentState
                          )}`}
                        >
                          {getStatusText(product.currentState)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-sm text-foreground/90">
                    {product.description || "No description provided"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-gray-400" />
                      <span className="text-foreground">{product.farmerId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-foreground truncate">
                        {product.origin}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="text-foreground">
                        {product.quantity} kg
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-foreground">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground/80">
                        Price per unit
                      </span>
                      <span className="text-lg font-bold text-foreground">
                        ₹{product.pricePerUnit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-foreground/80">
                        Total value
                      </span>
                      <span className="text-lg font-bold text-foreground">
                        ₹{(parseFloat(product.quantity) * parseFloat(product.pricePerUnit)).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      variant="outline"
                      className="w-full h-10 flex items-center justify-center gap-2 rounded-xl border-blue-500/40 text-blue-600 hover:bg-blue-50 hover:scale-[1.01] transition-all"
                      onClick={() => handleGenerateQR && handleGenerateQR(product)}
                    >
                      <QrCode className="h-4 w-4" />
                      Get QR Code
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && (
          <Card className="border-border/50 bg-gradient-to-br from-card to-card/80 shadow-lg">
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? "Try adjusting your search terms or filters."
                  : "Get started by adding your first product to the blockchain."}
              </p>
              <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                <DialogTrigger>
                  <Button className="bg-gradient-to-r from-chart-2/90 to-chart-2 hover:from-chart-2 hover:to-chart-2 text-white font-medium transition-all duration-200">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
                  <div className="p-6">
                    <AddProductForm onAddProduct={handleAddProduct} isLoading={isCreating} />
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
      
  );
}
