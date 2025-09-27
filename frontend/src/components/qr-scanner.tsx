import React, { useState } from 'react';
import { qrAPI, trackingAPI } from '../lib/api';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
// import { Separator } from './ui/separator';
import { QrCode, Package, Clock, User, MapPin, Leaf } from 'lucide-react';
import { toast } from 'react-toastify';
import type { ProductTrackingData} from '../types';
import { formatNumber, formatCurrency, formatDate, getErrorMessage } from '../utils';

const QRScanner: React.FC = () => {
  const [productId, setProductId] = useState('');
  const [trackingData, setTrackingData] = useState<ProductTrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

  const stateNames = ['Produced', 'Processing', 'Shipped', 'Delivered', 'Sold'];
  const stateColors = ['bg-green-100 text-green-800', 'bg-yellow-100 text-yellow-800', 'bg-blue-100 text-blue-800', 'bg-purple-100 text-purple-800', 'bg-gray-100 text-gray-800'];

  const handleTrackProduct = async () => {
    if (!productId.trim()) {
      toast.error('Please enter a product ID');
      return;
    }

    setLoading(true);
    try {
      const response = await trackingAPI.getProductTracking(productId.trim());
      if (response.success && response.data) {
        setTrackingData(response.data);
        toast.success('Product found!');
      } else {
        toast.error('Product not found');
        setTrackingData(null);
      }
    } catch (error: any) {
      console.error('Tracking error:', error);
      toast.error(getErrorMessage(error) || 'Failed to track product');
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async () => {
    if (!productId.trim()) {
      toast.error('Please enter a product ID');
      return;
    }

    try {
      const response = await qrAPI.generateQR(productId.trim());
      if (response.success && response.data) {
        setQrCode(response.data.qrCode);
        setShowQR(true);
        toast.success('QR code generated!');
      } else {
        toast.error('Failed to generate QR code');
      }
    } catch (error: any) {
      console.error('QR generation error:', error);
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-6 w-6" />
            Product Tracking & QR Scanner
          </CardTitle>
          <CardDescription>
            Enter a product ID to track its journey or generate a QR code for easy scanning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Enter Product ID (e.g., PROD001)"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleTrackProduct()}
            />
            <div className="flex gap-2">
              <Button onClick={handleTrackProduct} disabled={loading}>
                {loading ? 'Tracking...' : 'Track Product'}
              </Button>
              <Button variant="outline" onClick={handleGenerateQR}>
                Generate QR
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {showQR && qrCode && (
        <Card>
          <CardHeader>
            <CardTitle>Generated QR Code</CardTitle>
            <CardDescription>
              Scan this QR code to track product: {productId}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <img src={qrCode} alt="Product QR Code" className="mx-auto mb-4" />
            <Button variant="outline" onClick={() => setShowQR(false)}>
              Close QR Code
            </Button>
          </CardContent>
        </Card>
      )}

      {trackingData && (
        <div className="space-y-6">
          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-6 w-6" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Product ID</label>
                  <p className="text-lg font-semibold">{trackingData.product.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-lg">{trackingData.product.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p>{trackingData.product.description}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Current Status</label>
                  <div>
                    <Badge className={stateColors[trackingData.product.currentState]}>
                      {stateNames[trackingData.product.currentState]}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Origin</label>
                  <p className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {trackingData.product.origin}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Harvest Date</label>
                  <p className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDate(trackingData.product.harvestDate)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Quantity</label>
                  <p>{formatNumber(trackingData.product.quantity)} units</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Price per Unit</label>
                  <p>{formatCurrency(trackingData.product.pricePerUnit)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Organic</label>
                  <div className="flex items-center gap-1">
                    {trackingData.product.isOrganic && <Leaf className="h-4 w-4 text-green-600" />}
                    <Badge variant={trackingData.product.isOrganic ? "default" : "secondary"}>
                      {trackingData.product.isOrganic ? 'Organic' : 'Non-Organic'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Current Owner</label>
                  <p className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {trackingData.currentOwner}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ownership Chain */}
          <Card>
            <CardHeader>
              <CardTitle>Ownership History</CardTitle>
              <CardDescription>
                Complete journey of the product from creation to current owner
              </CardDescription>
            </CardHeader>
            <CardContent>
              {trackingData.ownershipChain.length > 0 ? (
                <div className="space-y-4">
                  {trackingData.ownershipChain.map((step, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                        {step.step + 1}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-semibold">{step.action}</p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Owner:</span> {step.owner}
                        </p>
                        {step.previousOwner && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">From:</span> {step.previousOwner}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {formatDate(step.timestamp)}
                        </p>
                        {step.transactionId && (
                          <p className="text-xs text-blue-600 font-mono">
                            Transaction: {step.transactionId}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No ownership history available</p>
              )}
            </CardContent>
          </Card>

          {/* Transaction Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{trackingData.totalTransactions}</p>
                  <p className="text-sm text-gray-600">Total Transactions</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{trackingData.ownershipChain.length}</p>
                  <p className="text-sm text-gray-600">Ownership Changes</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{stateNames[trackingData.product.currentState]}</p>
                  <p className="text-sm text-gray-600">Current Status</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
