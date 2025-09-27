import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { trackingAPI, transactionsAPI } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { 
  Package, 
  MapPin, 
  Calendar, 
  User, 
  CheckCircle, 
  Clock, 
  Leaf, 
  Shield, 
  ExternalLink,
  ArrowRight,
  Info,
  History,
  Share2
} from 'lucide-react';
import { toast } from 'react-toastify';

// interface OwnershipChainStep {
//   owner: string;
//   previousOwner?: string;
//   action?: string;
//   timestamp?: string;
//   from?: string;
//   transactionId?: string;
// }

// interface ProductTrackingData {
//   id: string;
//   name: string;
//   description: string;
//   farmerId: string;
//   quantity: string;
//   pricePerUnit: string;
//   currentState: number;
//   harvestDate: string;
//   origin: string;
//   isOrganic: boolean;
//   currentHolderId: string;
//   createdBy: string;
//   createdAt: string;
//   productId?: string;
//   transactions: any[];
//   ownershipChain: OwnershipChainStep[];
//   totalTransactions: number;
//   currentOwner: string;
//   trackingUrl: string;
// }

const ProductTrackingPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stateNames = ['Produced', 'Processing', 'Shipped', 'Delivered', 'Sold'];
  const stateColors: Record<number, string> = {
    0: 'bg-green-500',
    1: 'bg-yellow-500', 
    2: 'bg-blue-500',
    3: 'bg-purple-500',
    4: 'bg-gray-500'
  };
  const stateDescriptions: Record<number, string> = {
    0: 'Product has been harvested and is ready for processing',
    1: 'Product is being processed or prepared for shipment',
    2: 'Product is in transit to its destination',
    3: 'Product has been delivered to the recipient',
    4: 'Product has been sold to the end consumer'
  };

  useEffect(() => {
    if (productId) {
      fetchProductData();
    }
  }, [productId]);

  const fetchProductData = async () => {
    if (!productId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await trackingAPI.getProductTracking(productId);
      const chainResponse = await transactionsAPI.getTransactionChain(productId);
      // console.log('📡 Tracking API Response:', response.data);
      // console.log('📡 Chain API Response:', chainResponse.data);
      if (response.success && response.data) {
        setTrackingData({...response.data , ownershipChain: chainResponse.data.ownershipChain || []});
      } else {
        setError('Product not found');
      }
    } catch (error: any) {
      console.error('Tracking error:', error);
      setError(error.response?.data?.message || 'Failed to load product information');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleShare = () => {
    if (navigator.share && productId) {
      navigator.share({
        title: `Product Tracking - ${trackingData?.name || productId}`,
        text: `Check out the journey of this product from farm to table`,
        url: window.location.href
      }).catch(() => {
        // Fallback to copy URL
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-4xl mx-auto pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Loading product information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="max-w-4xl mx-auto pt-20">
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl text-red-600 dark:text-red-400">Product Not Found</CardTitle>
              <CardDescription>
                {error} - Please check the product ID and try again.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={fetchProductData} variant="outline">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!trackingData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-green-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Product Authentication
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Blockchain Verified</p>
              </div>
            </div>
            <Button onClick={handleShare} variant="outline" size="sm" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-8 pb-20">
        {/* Product Status Card */}
        <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Package className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              {trackingData.name}
            </CardTitle>
            <CardDescription className="text-lg mt-2">
              {trackingData.description}
            </CardDescription>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Badge 
                className={`${stateColors[trackingData.currentState]} text-white px-4 py-2 text-lg`}
              >
                {stateNames[trackingData.currentState]}
              </Badge>
              {trackingData.isOrganic && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 px-4 py-2">
                  <Leaf className="h-4 w-4 mr-1" />
                  Organic
                </Badge>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* Product Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Details */}
          <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Product Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Package className="h-5 w-5 text-blue-500 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Product ID</p>
                    <p className="font-mono text-lg font-semibold">{trackingData.productId || trackingData.id}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <MapPin className="h-5 w-5 text-green-500 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Origin</p>
                    <p className="text-lg">{trackingData.origin}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-500 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Harvest Date</p>
                    <p className="text-lg">{formatDate(trackingData.harvestDate)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <User className="h-5 w-5 text-orange-500 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Owner</p>
                    <p className="text-lg">{trackingData.currentOwner}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Quantity</p>
                    <p className="text-xl font-bold">{trackingData.quantity}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Price/Unit</p>
                    <p className="text-xl font-bold">₹{trackingData.pricePerUnit}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Status */}
          <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Current Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${stateColors[trackingData.currentState]} shadow-lg mb-4`}>
                    <span className="text-2xl font-bold text-white">{trackingData.currentState + 1}</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{stateNames[trackingData.currentState]}</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {stateDescriptions[trackingData.currentState]}
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-semibold">Journey Progress</h4>
                  <div className="space-y-2">
                    {stateNames.map((state, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${
                          index <= trackingData.currentState 
                            ? 'bg-green-500' 
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`} />
                        <span className={
                          index <= trackingData.currentState 
                            ? 'text-green-600 dark:text-green-400 font-medium' 
                            : 'text-gray-500 dark:text-gray-400'
                        }>
                          {state}
                        </span>
                        {index === trackingData.currentState && (
                          <Badge className="ml-auto bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            Current
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ownership History */}
        <Card className="border-0 shadow-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Ownership History
              <Badge className="ml-2">{trackingData.ownershipChain.length} Steps</Badge>
            </CardTitle>
            <CardDescription>
              Complete journey from creation to current owner
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trackingData.ownershipChain.map((step:any, index:any) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-lg">{step.action || (index === 0 ? 'Created' : 'Transferred')}</h4>
                      {(step.action === 'Created' || index === 0) && <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Origin</Badge>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Owner:</span>
                        <span className="ml-2 font-medium">{step.owner}</span>
                      </div>
                      {step.previousOwner && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">From:</span>
                          <span className="ml-2 font-medium">{step.previousOwner}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(step.timestamp || step.from || '')}
                      </div>
                      {step.transactionId && (
                        <div className="flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />
                          <span className="font-mono">{step.transactionId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {index < trackingData.ownershipChain.length - 1 && (
                    <div className="flex-shrink-0 pt-8">
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Transaction Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold mb-2">{trackingData.totalTransactions}</div>
              <div className="text-blue-100">Total Transactions</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-xl bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold mb-2">{trackingData.ownershipChain.length}</div>
              <div className="text-green-100">Ownership Changes</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold mb-2">{stateNames[trackingData.currentState]}</div>
              <div className="text-purple-100">Current Status</div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-center">
          <CardContent className="p-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-6 w-6 text-green-600" />
              <span className="text-lg font-semibold">Blockchain Verified</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              This product information is secured and verified on the blockchain, ensuring authenticity and traceability.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Powered by Agricultural Supply Chain Blockchain System
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductTrackingPage;