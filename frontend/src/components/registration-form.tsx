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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { User, UserRole } from "@/types";
import {
  LogIn,
  UserPlus,
  MapPin,
  Phone,
  Wallet,
  Mail,
  Eye,
  EyeOff,
  Tractor,
  Truck,
  Store,
} from "lucide-react";
import { ToastProvider, useToast } from "@/hooks/useToast";

interface LoginRegisterFormProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (user: any) => Promise<void>;
}

export function RegistrationForm({
  onLogin,
  onRegister,
}: LoginRegisterFormProps) {
  const [mode, setMode] = React.useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  // Login form data
  const [loginData, setLoginData] = React.useState({
    email: "",
    password: "",
  });

  // Register form data
  const [registerData, setRegisterData] = React.useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "farmer",
    location: "",
    contact: "",
    walletAddress: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!loginData.email || !loginData.password) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          type: "warning",
        });
        return;
      }

      await onLogin(loginData.email, loginData.password);

      toast({
        title: "Welcome back! 🎉",
        description: "You have successfully logged in.",
        type: "success",
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const requiredFields = ["name", "email", "password", "role"];
      const missingFields = requiredFields.filter(
        (field) => !registerData[field as keyof typeof registerData]
      );

      if (missingFields.length > 0) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          type: "warning",
        });
        return;
      }

      if (registerData.password !== registerData.confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "Passwords do not match. Please try again.",
          type: "error",
        });
        return;
      }

      if (registerData.password.length < 6) {
        toast({
          title: "Weak Password",
          description: "Password must be at least 6 characters long.",
          type: "warning",
        });
        return;
      }

      const { confirmPassword, ...userData } = registerData;
      await onRegister(userData);

      // Reset form
      setRegisterData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "farmer",
        location: "",
        contact: "",
        walletAddress: "",
      });

      toast({
        title: "Account Created Successfully! 🎉",
        description: `Welcome to our platform, ${registerData.name}!`,
        type: "success",
      });

      // Switch to login mode after successful registration
      setMode("login");
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Unable to create account. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: any) => {
    switch (role) {
      case "farmer":
        return <Tractor className="h-4 w-4" />;
      case "trader":
        return <Truck className="h-4 w-4" />;
      case "retailer":
        return <Store className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role : any) => {
    switch (role) {
      case "farmer":
        return "from-green-500 to-green-600";
      case "trader":
        return "from-blue-500 to-blue-600";
      case "retailer":
        return "from-purple-500 to-purple-600";
    }
  };

  const currentRoleColor = getRoleColor(
    mode === "register" ? registerData.role : "farmer"
  );

  return (
 <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
  <div className="w-full max-w-md sm:max-w-lg lg:max-w-2xl">
    <Card className="border-border/50 bg-gradient-to-br from-card to-card/80 shadow-xl backdrop-blur-sm">
      <CardHeader className="text-center pb-6 px-4 sm:px-6 lg:px-8">
        <div
          className={`mx-auto w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-r ${currentRoleColor} flex items-center justify-center mb-4`}
        >
          {mode === "login" ? (
            <LogIn className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
          ) : (
            getRoleIcon(registerData.role)
          )}
        </div>
        <CardTitle
          className={`text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r ${currentRoleColor} bg-clip-text text-transparent`}
        >
          {mode === "login" ? "Welcome Back" : "Create Account"}
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm sm:text-base">
          {mode === "login"
            ? "Sign in to your account to continue"
            : "Join our decentralized supply chain network"}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-4 sm:px-6 lg:px-8 pb-6">
        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="login-email"
                className="text-sm font-medium flex items-center space-x-2"
              >
                <Mail className="h-4 w-4" />
                <span>Email Address *</span>
              </Label>
              <Input
                id="login-email"
                type="email"
                placeholder="Enter your email"
                value={loginData.email}
                onChange={(e) =>
                  setLoginData({ ...loginData, email: e.target.value })
                }
                className="h-11 sm:h-12 bg-background/50 border-border/50 focus:border-blue-500/50 focus:ring-blue-500/20 text-sm sm:text-base"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="login-password"
                className="text-sm font-medium flex items-center space-x-2"
              >
                <span>Password *</span>
              </Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                  className="h-11 sm:h-12 bg-background/50 border-border/50 focus:border-blue-500/50 focus:ring-blue-500/20 pr-10 text-sm sm:text-base"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className={`w-full h-11 sm:h-12 bg-gradient-to-r ${currentRoleColor} hover:from-blue-600 hover:to-blue-700 text-white font-medium transition-all duration-200 transform hover:scale-[1.02] text-sm sm:text-base`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </div>
              )}
            </Button>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign up here
                </button>
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="role"
                className="text-sm font-medium flex items-center space-x-2"
              >
                {getRoleIcon(registerData.role)}
                <span>Role *</span>
              </Label>
              <Select
                value={registerData.role}
                onValueChange={(value: any) =>
                  setRegisterData({
                    ...registerData,
                    role: value,
                  })
                }
              >
                <SelectTrigger className="w-full h-11 sm:h-12">
                  <SelectValue placeholder="ROLE" />
                </SelectTrigger>
                <SelectContent className="bg-background/50 border-border/50 focus:border-blue-500/50 focus:ring-blue-500/20">
                  <SelectItem value="farmer">🚜 Farmer</SelectItem>
                  <SelectItem value="trader">🚛 Trader</SelectItem>
                  <SelectItem value="retailer">🏪 Retailer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="register-name"
                className="text-sm font-medium flex items-center space-x-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>Full Name *</span>
              </Label>
              <Input
                id="register-name"
                type="text"
                placeholder="Enter your full name"
                value={registerData.name}
                onChange={(e) =>
                  setRegisterData({ ...registerData, name: e.target.value })
                }
                className="h-11 sm:h-12 bg-background/50 border-border/50 focus:border-blue-500/50 focus:ring-blue-500/20 text-sm sm:text-base"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="register-email"
                className="text-sm font-medium flex items-center space-x-2"
              >
                <Mail className="h-4 w-4" />
                <span>Email Address *</span>
              </Label>
              <Input
                id="register-email"
                type="email"
                placeholder="Enter your email"
                value={registerData.email}
                onChange={(e) =>
                  setRegisterData({ ...registerData, email: e.target.value })
                }
                className="h-11 sm:h-12 bg-background/50 border-border/50 focus:border-blue-500/50 focus:ring-blue-500/20 text-sm sm:text-base"
                required
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="register-password"
                  className="text-sm font-medium"
                >
                  Password *
                </Label>
                <div className="relative">
                  <Input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create password"
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        password: e.target.value,
                      })
                    }
                    className="h-11 sm:h-12 bg-background/50 border-border/50 focus:border-blue-500/50 focus:ring-blue-500/20 pr-10 text-sm sm:text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirm-password"
                  className="text-sm font-medium"
                >
                  Confirm Password *
                </Label>
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={registerData.confirmPassword}
                  onChange={(e) =>
                    setRegisterData({
                      ...registerData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="h-11 sm:h-12 bg-background/50 border-border/50 focus:border-blue-500/50 focus:ring-blue-500/20 text-sm sm:text-base"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="register-location"
                className="text-sm font-medium flex items-center space-x-2"
              >
                <MapPin className="h-4 w-4" />
                <span>Location</span>
              </Label>
              <Input
                id="register-location"
                type="text"
                placeholder="City, State, Country"
                value={registerData.location}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    location: e.target.value,
                  })
                }
                className="h-11 sm:h-12 bg-background/50 border-border/50 focus:border-blue-500/50 focus:ring-blue-500/20 text-sm sm:text-base"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="register-contact"
                className="text-sm font-medium flex items-center space-x-2"
              >
                <Phone className="h-4 w-4" />
                <span>Contact Information</span>
              </Label>
              <Input
                id="register-contact"
                type="text"
                placeholder="Phone number or email"
                value={registerData.contact}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    contact: e.target.value,
                  })
                }
                className="h-11 sm:h-12 bg-background/50 border-border/50 focus:border-blue-500/50 focus:ring-blue-500/20 text-sm sm:text-base"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="register-wallet"
                className="text-sm font-medium flex items-center space-x-2"
              >
                <Wallet className="h-4 w-4" />
                <span>Wallet Address</span>
              </Label>
              <Input
                id="register-wallet"
                type="text"
                placeholder="0x1234...5678"
                value={registerData.walletAddress}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    walletAddress: e.target.value,
                  })
                }
                className="h-11 sm:h-12 bg-background/50 border-border/50 focus:border-blue-500/50 focus:ring-blue-500/20 font-mono text-sm sm:text-base"
              />
            </div>

            <Button
              type="submit"
              className={`w-full h-11 sm:h-12 bg-gradient-to-r ${currentRoleColor} hover:opacity-90 text-white font-medium transition-all duration-200 transform hover:scale-[1.02] text-sm sm:text-base`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  {getRoleIcon(registerData.role)}
                  <span>Create Account</span>
                </div>
              )}
            </Button>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
    <ToastProvider />
  </div>
</div>
  );
}
