import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
// import { toast } from '@/hooks/use-toast'
import type { Product } from "@/types";
import { Plus, Sparkles } from "lucide-react";
import { ToastProvider, useToast } from "@/hooks/useToast";
import { useCreateProduct } from "@/hooks/useProducts";

interface AddProductFormProps {
  onAddProduct: (
    product: Omit<
      Product,
      "id" | "harvestDate" | "currentState" | "currentHolderId"
    >
  ) => void;
}

export function AddProductForm({ onAddProduct }: AddProductFormProps) {
  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    farmerId: "",
    quantity: "",
    pricePerUnit: "",
    origin: "",
    isOrganic: false,
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    

    try {
      if (
        !formData.name ||
        !formData.farmerId ||
        !formData.quantity ||
        !formData.pricePerUnit ||
        !formData.origin
      ) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          type: "warning",
        });
        return;
      }

      onAddProduct(formData);

      setFormData({
        name: "",
        description: "",
        farmerId: "",
        quantity: "",
        pricePerUnit: "",
        origin: "",
        isOrganic: false,
      });

      toast({
        title: "Product Added Successfully! 🎉",
        description: `${formData.name} has been registered to the blockchain.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-border/50 bg-gradient-to-br from-card to-card/80 shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center mb-4">
            <Plus className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">
            Register New Product
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Add your crop to the blockchain for full traceability and
            transparency
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Product Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., Organic Rice, Premium Wheat"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="h-11 bg-background/50 border-border/50 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="farmerId" className="text-sm font-medium">
                  Farmer ID *
                </Label>
                <Input
                  id="farmerId"
                  type="text"
                  placeholder="Enter farmer ID"
                  value={formData.farmerId}
                  onChange={(e) =>
                    setFormData({ ...formData, farmerId: e.target.value })
                  }
                  className="h-11 bg-background/50 border-border/50 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your product quality, variety, etc."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="bg-background/50 border-border/50 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm font-medium">
                  Quantity (kg) *
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="1000"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  className="h-11 bg-background/50 border-border/50 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricePerUnit" className="text-sm font-medium">
                  Price per Unit (₹) *
                </Label>
                <Input
                  id="pricePerUnit"
                  type="number"
                  placeholder="50"
                  value={formData.pricePerUnit}
                  onChange={(e) =>
                    setFormData({ ...formData, pricePerUnit: e.target.value })
                  }
                  className="h-11 bg-background/50 border-border/50 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="origin" className="text-sm font-medium">
                Origin Location *
              </Label>
              <Input
                id="origin"
                type="text"
                placeholder="e.g., Cuttack, Odisha"
                value={formData.origin}
                onChange={(e) =>
                  setFormData({ ...formData, origin: e.target.value })
                }
                className="h-11 bg-background/50 border-border/50 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isOrganic"
                checked={formData.isOrganic}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isOrganic: checked })
                }
              />
              <Label htmlFor="isOrganic" className="text-sm font-medium">
                Organic Product
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium transition-all duration-200 transform hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Adding Product...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Add to Blockchain</span>
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      <ToastProvider />
    </div>
  );
}
