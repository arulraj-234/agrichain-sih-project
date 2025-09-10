import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Transaction, Product } from '@/types'
import { ArrowRightLeft, Clock, DollarSign, User, FileText, Plus } from 'lucide-react'
import { ToastProvider, useToast } from '@/hooks/useToast'
// import { toast } from '@/hooks/use-toast'

interface TransactionsSectionProps {
  transactions: Transaction[]
  products: Product[]
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void
}

export function TransactionsSection({ transactions, products, onAddTransaction }: TransactionsSectionProps) {
  const [showForm, setShowForm] = React.useState(false)
  const [formData, setFormData] = React.useState({
    productId: '',
    fromStakeholder: '',
    toStakeholder: '',
    price: '',
    notes: ''
  })
  const [isLoading, setIsLoading] = React.useState(false)
    const {toast} = useToast()
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!formData.productId || !formData.fromStakeholder || !formData.toStakeholder || !formData.price) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          type: "warning",
        })
        return
      }

      onAddTransaction(formData)
      
      setFormData({
        productId: '',
        fromStakeholder: '',
        toStakeholder: '',
        price: '',
        notes: ''
      })

      setShowForm(false)

      toast({
        title: "Transaction Added Successfully! 🎉",
        description: "The transaction has been recorded on the blockchain.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
        type: "error",
      })
    } finally {
      setIsLoading(false)
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

      {/* Add Transaction Form */}
      {showForm && (
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/80 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Record New Transaction</CardTitle>
            <CardDescription>
              Add a new transaction to track product movement in the supply chain
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="productId" className="text-sm font-medium">
                    Product *
                  </Label>
                  <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
                    <SelectTrigger className="h-11 bg-background/50 border-border/50">
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} (ID: {product.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-medium">
                    Transaction Price (₹) *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="5000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="h-11 bg-background/50 border-border/50 focus:border-purple-500/50 focus:ring-purple-500/20"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fromStakeholder" className="text-sm font-medium">
                    From Stakeholder *
                  </Label>
                  <Input
                    id="fromStakeholder"
                    type="text"
                    placeholder="Stakeholder ID"
                    value={formData.fromStakeholder}
                    onChange={(e) => setFormData({ ...formData, fromStakeholder: e.target.value })}
                    className="h-11 bg-background/50 border-border/50 focus:border-purple-500/50 focus:ring-purple-500/20"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="toStakeholder" className="text-sm font-medium">
                    To Stakeholder *
                  </Label>
                  <Input
                    id="toStakeholder"
                    type="text"
                    placeholder="Stakeholder ID"
                    value={formData.toStakeholder}
                    onChange={(e) => setFormData({ ...formData, toStakeholder: e.target.value })}
                    className="h-11 bg-background/50 border-border/50 focus:border-purple-500/50 focus:ring-purple-500/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">
                  Transaction Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes about this transaction..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="bg-background/50 border-border/50 focus:border-purple-500/50 focus:ring-purple-500/20"
                  rows={3}
                />
              </div>

              <div className="flex space-x-4">
                <Button 
                  type="submit" 
                  className="flex-1 h-11 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Recording...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <ArrowRightLeft className="h-4 w-4" />
                      <span>Record Transaction</span>
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
          </CardContent>
        </Card>
      )}

      {/* Transactions List */}
      <div className="space-y-6">
        {transactions.length === 0 ? (
          <Card className="border-border/50 bg-gradient-to-br from-card to-card/80">
            <CardContent className="text-center py-12">
              <ArrowRightLeft className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Transactions Yet</h3>
              <p className="text-muted-foreground">
                Start by adding your first transaction to track product movement.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {transactions.map((transaction) => (
              <Card key={transaction.id} className="border-border/50 bg-gradient-to-br from-card to-card/80 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <ArrowRightLeft className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{getProductName(transaction.productId)}</h3>
                        <p className="text-sm text-muted-foreground">Transaction ID: {transaction.id}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(parseInt(transaction.timestamp)).toLocaleDateString()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>From:</span>
                      </div>
                      <p className="font-mono text-sm bg-muted px-2 py-1 rounded">
                        {transaction.fromStakeholder}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>To:</span>
                      </div>
                      <p className="font-mono text-sm bg-muted px-2 py-1 rounded">
                        {transaction.toStakeholder}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>Price:</span>
                      </div>
                      <p className="font-semibold text-lg text-emerald-600">
                        ₹{parseInt(transaction.price).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {transaction.notes && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>Notes:</span>
                      </div>
                      <p className="text-sm bg-muted/50 p-3 rounded-lg">
                        {transaction.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
        <ToastProvider />
    </div>
  )
}