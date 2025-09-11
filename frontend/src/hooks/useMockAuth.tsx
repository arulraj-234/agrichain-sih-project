import React from "react"

export type UserRole = "farmer" | "trader" | "retailer"

interface User {
  id: string
  name: string
  email: string
  password: string // ⚠️ only for mock – don’t store plain passwords in real apps
  role: UserRole
}

interface AuthContextValue {
  user: Omit<User, "password"> | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: Omit<User, "id">) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<Omit<User, "password"> | null>(null)
  const [loading, setLoading] = React.useState(false)

  // Mock "database"
  const usersRef = React.useRef<User[]>([])

  const login = async (email: string, password: string) => {
    setLoading(true)
    await new Promise((res) => setTimeout(res, 800)) // simulate network delay

    const existingUser = usersRef.current.find((u) => u.email === email && u.password === password)
    if (existingUser) {
      const { password: _, ...safeUser } = existingUser
      setUser(safeUser)
    } else {
      throw new Error("Invalid email or password.")
    }
    setLoading(false)
  }

  const register = async (userData: Omit<User, "id">) => {
    setLoading(true)
    await new Promise((res) => setTimeout(res, 1000)) // simulate network delay

    const alreadyExists = usersRef.current.some((u) => u.email === userData.email)
    if (alreadyExists) {
      throw new Error("Email already registered.")
    }

    const newUser: User = { id: crypto.randomUUID(), ...userData }
    usersRef.current.push(newUser)

    const { password: _, ...safeUser } = newUser
    setUser(safeUser)
    setLoading(false)
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
