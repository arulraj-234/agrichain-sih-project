import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
// import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Product } from '@/types'
import type { Transaction } from '@/lib/api'
import { ArrowRightLeft, Clock, User, Plus, AlertCircle } from 'lucide-react'
import { useTransferProduct, useProductTransactions, useMyProducts } from '@/hooks/useProducts'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-toastify'

interface TransactionsSectionProps {
  
  // Remove props since we'll fetch data via API
}

export function TransactionsSection({ }: TransactionsSectionProps) {
  const [showForm, setShowForm] = React.useState(false)
  const [formData, setFormData] = React.useState({
    productId: '',
    fromUserId: '',
    toUserId: '',
  })
  const [selectedProduct, setSelectedProduct] = React.useState('')
  
  // Use real API hooks
  const { user } = useAuth()
  const { data: productsData, isLoading: productsLoading } = useMyProducts(0, 50)
  const { mutate: transferProduct, isPending: isTransferring } = useTransferProduct()
  const { data: transactionsData, isLoading: transactionsLoading } = useProductTransactions(selectedProduct)
  
  // Extract data from API responses
  const products = productsData?.products || []
  const transactions = transactionsData || []
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (!formData.productId || !formData.fromUserId || !formData.toUserId) {
        toast.error('Please fill in all required fields.')
        return
      }

      if (!user?.id) {
        toast.error('User not authenticated.')
        return
      }

      transferProduct({
        productId: formData.productId,
        fromUserId: formData.fromUserId,
        toUserId: formData.toUserId,
      }, {
        onSuccess: () => {
          setFormData({
            productId: '',
            fromUserId: '',
            toUserId: '',
          })
          setShowForm(false)
        },
      })
    } catch (error) {
      console.error('Transaction error:', error)
      toast.error('Failed to create transaction. Please try again.')
    }
  }

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId)
    return product ? product.name : `Product ${productId}`
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
          Transaction History
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Track all product transfers and transactions across the supply chain network.
        </p>
      </div>

      {/* Add Transaction Button */}
      <div className="flex justify-center">
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Transaction
        </Button>
      </div>

      {/* Product Selection for Transaction History */}
      {!showForm && (
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/80 shadow-lg mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-purple-500" />
              View Transaction History
            </CardTitle>
            <CardDescription>
              Select a product to view its transaction history
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productSelect" className="text-sm font-medium">
                  Select Product
                </Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger className="h-11 bg-background/50 border-border/50">
                    <SelectValue placeholder="Choose a product to view its transactions" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product: Product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - {product.origin}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Transaction Form */}
      {showForm && (
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/80 shadow-xl mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Transfer Product Ownership</CardTitle>
            <CardDescription>
              Transfer a product from one stakeholder to another on the blockchain
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {productsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                  <span>Loading products...</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="productId" className="text-sm font-medium">
                    Product *
                  </Label>
                  <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
                    <SelectTrigger className="h-11 bg-background/50 border-border/50">
                      <SelectValue placeholder="Select a product to transfer" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product: Product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - {product.origin} (Current: {product.currentHolderId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fromUserId" className="text-sm font-medium">
                      From User ID *
                    </Label>
                    <Input
                      id="fromUserId"
                      type="text"
                      placeholder="Current owner's user ID"
                      value={formData.fromUserId}
                      onChange={(e) => setFormData({ ...formData, fromUserId: e.target.value })}
                      className="h-11 bg-background/50 border-border/50 focus:border-purple-500/50 focus:ring-purple-500/20"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="toUserId" className="text-sm font-medium">
                      To User ID *
                    </Label>
                    <Input
                      id="toUserId"
                      type="text"
                      placeholder="New owner's user ID"
                      value={formData.toUserId}
                      onChange={(e) => setFormData({ ...formData, toUserId: e.target.value })}
                      className="h-11 bg-background/50 border-border/50 focus:border-purple-500/50 focus:ring-purple-500/20"
                      required
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button 
                    type="submit" 
                    className="flex-1 h-11 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-all duration-200"
                    disabled={isTransferring}
                  >
                    {isTransferring ? (
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Transferring...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <ArrowRightLeft className="h-4 w-4" />
                        <span>Transfer Ownership</span>
                      </div>
                    )}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="px-6"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Transactions List */}
      <div className="space-y-6">
        {transactionsLoading && selectedProduct && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
              <span className="text-lg">Loading transactions...</span>
            </div>
          </div>
        )}

        {!selectedProduct && !showForm && (
          <Card className="border-border/50 bg-gradient-to-br from-card to-card/80">
            <CardContent className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Product Selected</h3>
              <p className="text-muted-foreground">
                Please select a product above to view its transaction history.
              </p>
            </CardContent>
          </Card>
        )}

        {selectedProduct && !transactionsLoading && transactions.length === 0 && (
          <Card className="border-border/50 bg-gradient-to-br from-card to-card/80">
            <CardContent className="text-center py-12">
              <ArrowRightLeft className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Transactions Found</h3>
              <p className="text-muted-foreground">
                This product doesn't have any transactions yet. Transfer ownership to create the first transaction.
              </p>
            </CardContent>
          </Card>
        )}

        {selectedProduct && !transactionsLoading && transactions.length > 0 && (
          <div className="grid gap-6">
            {transactions.map((transaction: Transaction) => (
              <Card key={transaction.transactionId} className="border-border/50 bg-gradient-to-br from-card to-card/80 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <ArrowRightLeft className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{getProductName(transaction.productId)}</h3>
                        <p className="text-sm text-muted-foreground">Transaction ID: {transaction.transactionId}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(transaction.timestamp).toLocaleDateString()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>From User:</span>
                      </div>
                      <p className="font-mono text-sm bg-muted px-2 py-1 rounded">
                        {transaction.fromUserId}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>To User:</span>
                      </div>
                      <p className="font-mono text-sm bg-muted px-2 py-1 rounded">
                        {transaction.toUserId}
                      </p>
                    </div>
                  </div>

                  {/* Blockchain Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>Transaction Hash:</span>
                      </div>
                      <p className="font-mono text-xs bg-muted px-2 py-1 rounded break-all">
                        {transaction.transactionHash}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>Block Number:</span>
                      </div>
                      <p className="font-semibold text-sm text-blue-600">
                        #{transaction.blockNumber}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>Gas Used:</span>
                      </div>
                      <p className="font-semibold text-sm text-orange-600">
                        {transaction.gasUsed}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}