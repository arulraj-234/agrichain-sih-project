import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/types'
import { QrCode, Scan, Check, X } from 'lucide-react'
import QRCode from 'qrcode'

interface QRSectionProps {
  products: Product[]
  selectedProduct: Product | null
  onSelectProduct: (product: Product) => void
}

export function QRSection({ products, selectedProduct, onSelectProduct }: QRSectionProps) {
  const [qrDataUrl, setQrDataUrl] = React.useState<string>('')
  const [scanInput, setScanInput] = React.useState('')
  const [scanResult, setScanResult] = React.useState<{
    success: boolean
    product?: Product
    message: string
  } | null>(null)

  React.useEffect(() => {
    if (selectedProduct) {
      const generateQR = async () => {
        try {
          const qrData = JSON.stringify({
            id: selectedProduct.id,
            name: selectedProduct.name,
            farmerId: selectedProduct.farmerId,
            origin: selectedProduct.origin,
            harvestDate: selectedProduct.harvestDate,
            isOrganic: selectedProduct.isOrganic
          })
          const dataUrl = await QRCode.toDataURL(qrData, {
            width: 300,
            margin: 2,
            color: {
              dark: '#10B981',
              light: '#FFFFFF'
            }
          })
          setQrDataUrl(dataUrl)
        } catch (error) {
          console.error('Error generating QR code:', error)
        }
      }
      generateQR()
    }
  }, [selectedProduct])

  const handleScan = () => {
    if (!scanInput.trim()) {
      setScanResult({
        success: false,
        message: "Please enter QR code data to scan"
      })
      return
    }

    try {
      const scanData = JSON.parse(scanInput)
      const foundProduct = products.find(p => p.id === scanData.id)
      
      if (foundProduct) {
        setScanResult({
          success: true,
          product: foundProduct,
          message: "Product verified successfully!"
        })
      } else {
        setScanResult({
          success: false,
          message: "Product not found in our database"
        })
      }
    } catch (error) {
      setScanResult({
        success: false,
        message: "Invalid QR code format"
      })
    }
  }

  const getSampleQRData = () => {
    if (products.length > 0) {
      return JSON.stringify({
        id: products[0].id,
        name: products[0].name,
        farmerId: products[0].farmerId,
        origin: products[0].origin,
        harvestDate: products[0].harvestDate,
        isOrganic: products[0].isOrganic
      })
    }
    return ''
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* QR Code Generation */}
      <Card className="border-border/50 bg-gradient-to-br from-card to-card/80 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mb-4">
            <QrCode className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent">
            QR Code Generator
          </CardTitle>
          <CardDescription>
            Generate QR codes for your registered products
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {products.length === 0 ? (
            <div className="text-center py-8">
              <QrCode className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">No products registered yet</p>
              <p className="text-sm text-muted-foreground">Add a product first to generate QR codes</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">Select Product:</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {products.map((product) => (
                    <Button
                      key={product.id}
                      variant={selectedProduct?.id === product.id ? "default" : "outline"}
                      className="justify-start h-auto p-4 space-y-1"
                      onClick={() => onSelectProduct(product)}
                    >
                      <div className="text-left w-full">
                        <div className="font-medium">{product.crop}</div>
                        <div className="text-xs opacity-70">{product.farmerName}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {selectedProduct && qrDataUrl && (
                <div className="text-center space-y-4 p-6 bg-muted/30 rounded-lg">
                  <img 
                    src={qrDataUrl} 
                    alt="Product QR Code" 
                    className="mx-auto border rounded-lg shadow-lg"
                  />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{selectedProduct.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Origin: {selectedProduct.origin} | Farmer: {selectedProduct.farmerId}
                    </p>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
                      Scan to verify authenticity
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code Scanner */}
      <Card className="border-border/50 bg-gradient-to-br from-card to-card/80 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center mb-4">
            <Scan className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-teal-600 bg-clip-text text-transparent">
            QR Code Scanner
          </CardTitle>
          <CardDescription>
            Verify product authenticity by scanning QR codes
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scanInput" className="text-sm font-medium">
                Enter QR Code Data (simulated scan):
              </Label>
              <Input
                id="scanInput"
                type="text"
                placeholder="Paste QR code JSON data here..."
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                className="h-11 bg-background/50 border-border/50 focus:border-teal-500/50 focus:ring-teal-500/20 font-mono text-sm"
              />
              {products.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScanInput(getSampleQRData())}
                  className="text-xs"
                >
                  Use sample QR data
                </Button>
              )}
            </div>

            <Button 
              onClick={handleScan}
              className="w-full h-11 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
              disabled={!scanInput.trim()}
            >
              <Scan className="h-4 w-4 mr-2" />
              Scan QR Code
            </Button>
          </div>

          {scanResult && (
            <Card className={`border-2 ${scanResult.success ? 'border-green-500/30 bg-green-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  {scanResult.success ? (
                    <Check className="h-6 w-6 text-green-500 mt-0.5" />
                  ) : (
                    <X className="h-6 w-6 text-red-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${scanResult.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                      {scanResult.message}
                    </p>
                    {scanResult.success && scanResult.product && (
                      <div className="mt-4 space-y-2 p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold">Product Details:</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Product:</span>
                            <span className="ml-2 font-medium">{scanResult.product.name}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Farmer:</span>
                            <span className="ml-2 font-medium">{scanResult.product.farmerId}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Origin:</span>
                            <span className="ml-2">{scanResult.product.origin}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Harvest:</span>
                            <span className="ml-2">{new Date(parseInt(scanResult.product.harvestDate)).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}