import React from "react";
import { Sidebar } from "@/components/sidebar";
// import { ProductCard } from "@/components/product-card";
// import { AddProductForm } from "@/components/add-product-form";
import { RegistrationForm } from "@/components/registration-form";
// import { MiddlemanRegistrationForm } from "@/components/middleman-registration-form";
import { TransactionsSection } from "@/components/transaction-section";
import type { Product } from "@/types";
import { Menu, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// import QRCode from "qrcode";
import { useProducts } from "../hooks/useProducts";
import { Dashboard } from "./dashboard";
import { useAuth } from "../hooks/useAuth";

function MainDashboard() {
  const [activeSection, setActiveSection] = React.useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [products, setProducts] = React.useState<Product[]>([]);
  // const [farmers, setFarmers] = React.useState<Farmer[]>([]);
  // const [middlemen, setMiddlemen] = React.useState<Middleman[]>([]);
  // const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(
    null
  );
  const [qrModalOpen, setQrModalOpen] = React.useState(false);
  const [qrModalProduct, setQrModalProduct] = React.useState<Product | null>(
    null
  );
  const [qrModalDataUrl, setQrModalDataUrl] = React.useState<string>("");
  const [qrLoading, setQrLoading] = React.useState(false);
  const [qrError, setQrError] = React.useState<string | null>(null);

  const [productsLoading, setProductsLoading] = React.useState(false);
  const { login, register, user, isAuthenticated, logout, loading } = useAuth();

  const { data: LoadProducts, isLoading } = useProducts();
  React.useEffect(() => {
    // Mock data initialization
    productsLoading;
    loading;
    const mockProducts: Product[] = [
      {
        id: "1",
        name: "Organic Rice",
        description: "Premium quality organic basmati rice",
        farmerId: "1",
        quantity: 1000,
        pricePerUnit: 50,
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
        quantity: 2000,
        pricePerUnit: 35,
        currentState: 1, // In Transit
        harvestDate: (Date.now() - 86400000 * 7).toString(), // 7 days ago
        origin: "Punjab, India",
        isOrganic: false,
        currentHolderId: "2",
      },
    ];

    // const mockTransactions: Transaction[] = [
    //   {
    //     id: "1",
    //     productId: "1",
    //     fromStakeholder: "1",
    //     toStakeholder: "2",
    //     timestamp: (Date.now() - 86400000).toString(), // 1 day ago
    //     price: "5000",
    //     notes: "Fresh harvest, packed for transport",
    //   },
    //   {
    //     id: "2",
    //     productId: "2",
    //     fromStakeholder: "2",
    //     toStakeholder: "3",
    //     timestamp: (Date.now() - 86400000 * 2).toString(), // 2 days ago
    //     price: "7000",
    //     notes: "Quality checked and approved for distribution",
    //   },
    // ];
    setProductsLoading(isLoading);
    setProducts(LoadProducts?.products || []);
    // setTransactions(mockTransactions);
    setSelectedProduct(mockProducts[0]);
  }, []);

  // const { mutate: createProduct } = useCreateProduct();

  // const addProduct = (
  //   productData: Omit<
  //     Product,
  //     "id" | "harvestDate" | "currentState" | "currentHolderId"
  //   >
  // ) => {
  //   const newProduct: Product = {
  //     ...productData,
  //     id: Date.now().toString(),
  //     harvestDate: Date.now().toString(),
  //     currentState: 0, // Produced
  //     currentHolderId: productData.farmerId,
  //   };
  //   createProduct(newProduct);
  //   setProducts((prev) => [...prev, newProduct]);
  //   if (!selectedProduct) {
  //     setSelectedProduct(newProduct);
  //   }
  // };

  // const addFarmer = (farmerData: Omit<Farmer, "id" | "registeredAt">) => {
  //   const newFarmer: Farmer = {
  //     ...farmerData,
  //     id: Date.now().toString(),
  //     registeredAt: new Date().toISOString(),
  //   };
  //   setFarmers((prev) => [...prev, newFarmer]);
  // };

  // const addMiddleman = (
  //   middlemanData: Omit<Middleman, "id" | "registeredAt">
  // ) => {
  //   const newMiddleman: Middleman = {
  //     ...middlemanData,
  //     id: Date.now().toString(),
  //     registeredAt: new Date().toISOString(),
  //   };
  //   setMiddlemen((prev) => [...prev, newMiddleman]);
  // };

  // const addTransaction = (
  //   transactionData: Omit<Transaction, "id" | "timestamp">
  // ) => {
  //   const newTransaction: Transaction = {
  //     ...transactionData,
  //     id: Date.now().toString(),
  //     timestamp: Date.now().toString(),
  //   };
  //   setTransactions((prev) => [...prev, newTransaction]);
  // };

  const handleGenerateQR = async (product: Product) => {
    setQrLoading(true);
    setQrError(null);

    try {
      console.log("🔄 Generating QR code for product:", product.id);

      // Import qrAPI here if not already imported at the top
      const { qrAPI } = await import("../lib/api");

      const response = await qrAPI.generateQR(product.id);
      console.log("📡 QR API Response:", response);

      if (response.success && response.qrCode) {
        console.log("✅ QR Code generated successfully");
        setSelectedProduct(product);
        setQrModalProduct(product);
        setQrModalDataUrl(response.qrCode);
        setQrModalOpen(true);
        console.log("✅ QR Code generated successfully");
        console.log("🔗 QR Code will redirect to:", response.trackingUrl);
      } else {
        const errorMsg =
          response.error || response.message || "Failed to generate QR code";
        console.error("❌ Failed to generate QR code:", errorMsg);
        setQrError(errorMsg);
        alert(`Failed to generate QR code: ${errorMsg}`);
      }
    } catch (error: any) {
      console.error("❌ Error generating QR code:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Network error. Please check if the backend server is running.";
      setQrError(errorMsg);
      alert(`Error generating QR code: ${errorMsg}`);
    } finally {
      setQrLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <RegistrationForm onLogin={login} onRegister={register} />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case "Dashboard":
        return (
          <div className="space-y-8">
            <Dashboard handleGenerateQR={handleGenerateQR} user={user} />
          </div>
        );
      case "transactions":
        return (
          <TransactionsSection
          // transactions={transactions}
          // products={products}
          // onAddTransaction={addTransaction}
          />
        );
      case "qr":
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-teal-500 bg-clip-text text-transparent mb-4">
                QR Code Management
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Generate and scan QR codes to verify product authenticity and
                track the supply chain.
              </p>
            </div>
            {/* QR Code Generation Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Selection */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">
                  Select Product for QR Generation
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedProduct?.id === product.id
                          ? "bg-primary/10 border-primary"
                          : "bg-card hover:bg-muted/50"
                      }`}
                      onClick={() => setSelectedProduct(product)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {product.origin} • Farmer: {product.farmerId}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateQR(product);
                          }}
                          disabled={qrLoading}
                          className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {qrLoading ? "Generating..." : "Generate QR"}
                        </button>
                      </div>
                    </div>
                  ))}
                  {products.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No products available. Add a product first.
                    </div>
                  )}
                </div>
              </div>

              {/* QR Code Display */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">
                  Generated QR Code
                </h3>
                {qrError && (
                  <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-sm">
                    <strong>Error:</strong> {qrError}
                  </div>
                )}
                {qrModalDataUrl && selectedProduct ? (
                  <div className="text-center space-y-4 p-6 bg-muted/30 rounded-lg">
                    <img
                      src={qrModalDataUrl}
                      alt="Product QR Code"
                      className="mx-auto border rounded-lg shadow-lg max-w-64"
                    />
                    <div className="space-y-2">
                      <h4 className="font-semibold text-lg">
                        {selectedProduct.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Origin: {selectedProduct.origin}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Farmer: {selectedProduct.farmerId}
                      </p>
                      <div className="flex justify-center gap-2 mt-4">
                        <button
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = qrModalDataUrl;
                            link.download = `qr-${selectedProduct.id}.png`;
                            link.click();
                          }}
                          className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
                        >
                          Download QR
                        </button>
                        <button
                          onClick={() => {
                            const trackingUrl = `${window.location.origin}/track/${selectedProduct.id}`;
                            navigator.clipboard.writeText(trackingUrl);
                            alert("Tracking URL copied to clipboard!");
                          }}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                        >
                          Copy Tracking URL
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-muted rounded-lg">
                    <QrCode className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Select a product and generate QR code to display here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        logOut={logout}
      />

      <main className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="flex items-center justify-between px-6 py-4">
            <span>
              Hello,{" "}
              <span className="font-bold text-chart-2 text-2xl ">
                {user?.role || user?.id}!
              </span>{" "}
              You are logged in.{" "}
            </span>
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
            {/* <div className="flex items-center space-x-4">
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
            </div> */}
            Your user id: {user?.id}
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
                <h3 className="font-semibold text-lg">{qrModalProduct.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Origin: {qrModalProduct.origin}
                </p>
                <p className="text-sm text-muted-foreground">
                  Farmer: {qrModalProduct.farmerId}
                </p>
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = qrModalDataUrl;
                      link.download = `qr-${qrModalProduct.id}.png`;
                      link.click();
                    }}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
                  >
                    Download QR
                  </button>
                  <button
                    onClick={() => {
                      const trackingUrl = `${window.location.origin}/track/${qrModalProduct.id}`;
                      navigator.clipboard.writeText(trackingUrl);
                      alert("Tracking URL copied to clipboard!");
                    }}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                  >
                    Copy Tracking URL
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MainDashboard;
