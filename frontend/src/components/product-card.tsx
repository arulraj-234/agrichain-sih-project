import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Product } from '@/types'
import { ProductStates } from '@/types'
import { QrCode, Calendar, User, Hash, MapPin, Leaf, Package, DollarSign } from 'lucide-react'
import QRCode from 'qrcode'

interface ProductCardProps {
  product: Product
  onGenerateQR: (product: Product) => void
}

export function ProductCard({ product, onGenerateQR }: ProductCardProps) {
  const [qrDataUrl, setQrDataUrl] = React.useState<string>('')

  React.useEffect(() => {
    const generateQR = async () => {
      try {
        const qrData = JSON.stringify({
          id: product.id,
          name: product.name,
          farmerId: product.farmerId,
          origin: product.origin,
          harvestDate: product.harvestDate,
          isOrganic: product.isOrganic
        })
        const dataUrl = await QRCode.toDataURL(qrData, {
          width: 120,
          margin: 1,
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
  }, [product])

  const getStateColor = (state: number) => {
    switch (state) {
      case 0: return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
      case 1: return 'bg-amber-500/10 text-amber-600 border-amber-500/20'
      case 2: return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20'
    }
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border/50 bg-gradient-to-br from-card to-card/80">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <CardTitle className="text-xl font-bold text-foreground group-hover:text-emerald-500 transition-colors">
                {product.name}
              </CardTitle>
              {product.isOrganic && (
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                  <Leaf className="h-3 w-3 mr-1" />
                  Organic
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {product.description}
            </p>
          </div>
          <Badge variant="secondary" className={getStateColor(product.currentState)}>
            {ProductStates[product.currentState as keyof typeof ProductStates]}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Quantity:</span>
            </div>
            <p className="text-sm font-semibold">
              {product.quantity} kg
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Price/Unit:</span>
            </div>
            <p className="text-sm font-semibold">
              ₹{product.pricePerUnit}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Origin:</span>
            </div>
            <p className="text-sm">
              {product.origin}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Harvest:</span>
            </div>
            <p className="text-sm">
              {new Date(parseInt(product.harvestDate)).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Current Holder:</span>
          </div>
          <p className="text-sm font-mono bg-muted px-2 py-1 rounded break-all">
            {product.currentHolderId}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center space-x-2">
            {qrDataUrl && (
              <img 
                src={qrDataUrl} 
                alt="QR Code" 
                className="h-12 w-12 rounded border"
              />
            )}
            <div>
              <p className="text-xs text-muted-foreground">QR Code</p>
              <p className="text-xs">Scan to verify</p>
            </div>
          </div>
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onGenerateQR(product)}
            className="hover:bg-emerald-500/10 hover:border-emerald-500/30"
          >
            <QrCode className="h-4 w-4 mr-2" />
            View QR
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}