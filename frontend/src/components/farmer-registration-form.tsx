import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
// import { toast } from '@/hooks/use-toast'
import type { Farmer } from '@/types'
import { UserPlus, MapPin, Phone, Wallet } from 'lucide-react'
import { ToastProvider, useToast } from '@/hooks/useToast'

interface FarmerRegistrationFormProps {
  onRegisterFarmer: (farmer: Omit<Farmer, 'id' | 'registeredAt'>) => void
}

export function FarmerRegistrationForm({ onRegisterFarmer }: FarmerRegistrationFormProps) {
  const [formData, setFormData] = React.useState({
    name: '',
    location: '',
    contact: '',
    walletAddress: ''
  })
  const [isLoading, setIsLoading] = React.useState(false)
  const {toast} = useToast()
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!formData.name || !formData.location || !formData.contact || !formData.walletAddress) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          type: "warning",
        })
        return
      }

      onRegisterFarmer(formData)
      
      setFormData({
        name: '',
        location: '',
        contact: '',
        walletAddress: ''
      })

      toast({
        title: "Farmer Registered Successfully! 🎉",
        description: `${formData.name} has been added to the network.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register farmer. Please try again.",
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-border/50 bg-gradient-to-br from-card to-card/80 shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mb-4">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
            Register as Farmer
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Join our decentralized farming network and start tracking your produce
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium flex items-center space-x-2">
                <UserPlus className="h-4 w-4" />
                <span>Full Name *</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-11 bg-background/50 border-border/50 focus:border-blue-500/50 focus:ring-blue-500/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Location *</span>
              </Label>
              <Input
                id="location"
                type="text"
                placeholder="City, State, Country"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="h-11 bg-background/50 border-border/50 focus:border-blue-500/50 focus:ring-blue-500/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact" className="text-sm font-medium flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>Contact Information *</span>
              </Label>
              <Input
                id="contact"
                type="text"
                placeholder="Phone number or email"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="h-11 bg-background/50 border-border/50 focus:border-blue-500/50 focus:ring-blue-500/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="walletAddress" className="text-sm font-medium flex items-center space-x-2">
                <Wallet className="h-4 w-4" />
                <span>Wallet Address *</span>
              </Label>
              <Input
                id="walletAddress"
                type="text"
                placeholder="0x1234...5678"
                value={formData.walletAddress}
                onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                className="h-11 bg-background/50 border-border/50 focus:border-blue-500/50 focus:ring-blue-500/20 font-mono"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium transition-all duration-200 transform hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Registering...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Register as Farmer</span>
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
        <ToastProvider />
    </div>
  )
}