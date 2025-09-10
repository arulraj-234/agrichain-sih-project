import React from "react";
import { ThemeProvider } from "@/providers/theme-provider";
// import { Toaster } from '@/components/ui/toaster'
import { Sidebar } from "@/components/sidebar";
import { ProductCard } from "@/components/product-card";
import { AddProductForm } from "@/components/add-product-form";
import { FarmerRegistrationForm } from "@/components/farmer-registration-form";
import { MiddlemanRegistrationForm } from "@/components/middleman-registration-form";
import { TransactionsSection } from "@/components/transaction-section";
// import { QRSection } from "@/components/qr-section";
import type { Product, Farmer, Middleman, Transaction } from "@/types";
import { Menu, Package, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QRCode from "qrcode";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCreateProduct, useProducts } from "./hooks/useProducts";
function App() {
  const [activeSection, setActiveSection] = React.useState("products");
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [farmers, setFarmers] = React.useState<Farmer[]>([]);
  const [middlemen, setMiddlemen] = React.useState<Middleman[]>([]);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(
    null
  );
  const [qrModalOpen, setQrModalOpen] = React.useState(false);
  const [qrModalProduct, setQrModalProduct] = React.useState<Product | null>(
    null
  );
  const [qrModalDataUrl, setQrModalDataUrl] = React.useState<string>("");
  const [productsLoading, setProductsLoading] = React.useState(false);

  const { data: LoadProducts, isLoading } = useProducts();
  React.useEffect(() => {
    // Mock data initialization

    const mockProducts: Product[] = [
      {
        id: "1",
        name: "Organic Rice",
        description: "Premium quality organic basmati rice",
        farmerId: "1",
        quantity: "1000",
        pricePerUnit: "50",
        currentState: 0, // Produced
        harvestDate: Date.now().toString(),
        origin: "Cuttack, Odisha",
        isOrganic: true,
        currentHolderId: "1",
      },
      {
        id: "2",
        name: "Premium Wheat",
        description: "High-quality wheat grains for premium flour",
        farmerId: "2",
        quantity: "2000",
        pricePerUnit: "35",
        currentState: 1, // In Transit
        harvestDate: (Date.now() - 86400000 * 7).toString(), // 7 days ago
        origin: "Punjab, India",
        isOrganic: false,
        currentHolderId: "2",
      },
    ];

    const mockTransactions: Transaction[] = [
      {
        id: "1",
        productId: "1",
        fromStakeholder: "1",
        toStakeholder: "2",
        timestamp: (Date.now() - 86400000).toString(), // 1 day ago
        price: "5000",
        notes: "Fresh harvest, packed for transport",
      },
      {
        id: "2",
        productId: "2",
        fromStakeholder: "2",
        toStakeholder: "3",
        timestamp: (Date.now() - 86400000 * 2).toString(), // 2 days ago
        price: "7000",
        notes: "Quality checked and approved for distribution",
      },
    ];
    setProductsLoading(isLoading);
    setProducts(LoadProducts || mockProducts);
    setTransactions(mockTransactions);
    setSelectedProduct(mockProducts[0]);
  }, []);

  const { mutate: createProduct } = useCreateProduct();

  const addProduct = (
    productData: Omit<
      Product,
      "id" | "harvestDate" | "currentState" | "currentHolderId"
    >
  ) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      harvestDate: Date.now().toString(),
      currentState: 0, // Produced
      currentHolderId: productData.farmerId,
    };
    createProduct(newProduct);
    setProducts((prev) => [...prev, newProduct]);
    if (!selectedProduct) {
      setSelectedProduct(newProduct);
    }
  };

  const addFarmer = (farmerData: Omit<Farmer, "id" | "registeredAt">) => {
    const newFarmer: Farmer = {
      ...farmerData,
      id: Date.now().toString(),
      registeredAt: new Date().toISOString(),
    };
    setFarmers((prev) => [...prev, newFarmer]);
  };

  const addMiddleman = (
    middlemanData: Omit<Middleman, "id" | "registeredAt">
  ) => {
    const newMiddleman: Middleman = {
      ...middlemanData,
      id: Date.now().toString(),
      registeredAt: new Date().toISOString(),
    };
    setMiddlemen((prev) => [...prev, newMiddleman]);
  };

  const addTransaction = (
    transactionData: Omit<Transaction, "id" | "timestamp">
  ) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString(),
      timestamp: Date.now().toString(),
    };
    setTransactions((prev) => [...prev, newTransaction]);
  };

  const handleGenerateQR = async (product: Product) => {
    try {
      const qrData = JSON.stringify({
        id: product.id,
        name: product.name,
        farmerId: product.farmerId,
        origin: product.origin,
        harvestDate: product.harvestDate,
        isOrganic: product.isOrganic,
      });
      const dataUrl = await QRCode.toDataURL(qrData, {
        width: 400,
        margin: 3,
        color: {
          dark: "#10B981",
          light: "#FFFFFF",
        },
      });
      setQrModalProduct(product);
      setQrModalDataUrl(dataUrl);
      setQrModalOpen(true);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "products":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent mb-4">
                Add New Product
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Register your crops on the blockchain for complete traceability
                and transparency in the supply chain.
              </p>
            </div>
            <AddProductForm onAddProduct={addProduct} />

            {products.length > 0 && !productsLoading ? (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-center mb-8">
                  Your Registered Products
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onGenerateQR={handleGenerateQR}
                    />
                  ))}
                </div>
              </div>
            ) : (
              "Loading..."
            )}
          </div>
        );
      case "farmer":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent mb-4">
                Farmer Registration
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join our decentralized farming network and start building trust
                with your customers.
              </p>
            </div>
            <FarmerRegistrationForm onRegisterFarmer={addFarmer} />

            {farmers.length > 0 && (
              <div className="mt-12 max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-center mb-8">
                  Registered Farmers
                </h2>
                <div className="grid gap-4">
                  {farmers.map((farmer) => (
                    <div
                      key={farmer.id}
                      className="p-4 border rounded-lg bg-card"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="font-medium">{farmer.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Farmer
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Location
                          </p>
                          <p className="font-medium">{farmer.location}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Contact
                          </p>
                          <p className="font-medium">{farmer.contact}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Wallet
                          </p>
                          <p className="font-mono text-xs">
                            {farmer.walletAddress}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case "middleman":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent mb-4">
                Middleman Registration
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Connect with farmers and consumers as a trusted distributor in
                our supply chain network.
              </p>
            </div>
            <MiddlemanRegistrationForm onRegisterMiddleman={addMiddleman} />

            {middlemen.length > 0 && (
              <div className="mt-12 max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-center mb-8">
                  Registered Middlemen
                </h2>
                <div className="grid gap-4">
                  {middlemen.map((middleman) => (
                    <div
                      key={middleman.id}
                      className="p-4 border rounded-lg bg-card"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="font-medium">{middleman.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Distributor
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Location
                          </p>
                          <p className="font-medium">{middleman.location}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Contact
                          </p>
                          <p className="font-medium">{middleman.contact}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Wallet
                          </p>
                          <p className="font-mono text-xs">
                            {middleman.walletAddress}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case "transactions":
        return (
          <TransactionsSection
            transactions={transactions}
            products={products}
            onAddTransaction={addTransaction}
          />
        );
      case "qr":
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-teal-500 bg-clip-text text-transparent mb-4">
                QR Code Showcase
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Generate and scan QR codes to verify product authenticity and
                track the supply chain.
              </p>
            </div>
            {/* <QRSection
              products={products}
              selectedProduct={selectedProduct}
              onSelectProduct={setSelectedProduct}
            /> */}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="farming-ui-theme">
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="lg:ml-64 min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-semibold">
                    {activeSection === "products" && "Product Management"}
                    {activeSection === "farmer" && "Farmer Registration"}
                    {activeSection === "middleman" && "Middleman Registration"}
                    {activeSection === "transactions" && "Transaction History"}
                    {activeSection === "qr" && "QR Code Management"}
                  </h1>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="hidden sm:flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {products.length} Products
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {transactions.length} Transactions
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-6">{renderContent()}</div>
        </main>

        {/* QR Modal */}
        <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center">Product QR Code</DialogTitle>
            </DialogHeader>
            {qrModalProduct && (
              <div className="text-center space-y-4 p-4">
                {qrModalDataUrl && (
                  <img
                    src={qrModalDataUrl}
                    alt="Product QR Code"
                    className="mx-auto border rounded-lg shadow-lg"
                  />
                )}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">
                    {qrModalProduct.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Origin: {qrModalProduct.origin}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Farmer: {qrModalProduct.farmerId}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* <Toaster /> */}
      </div>
    </ThemeProvider>
  );
}

export default App;

export function ToastProvider() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
    />
  );
}
