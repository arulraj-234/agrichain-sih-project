import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from './theme-toggle'
import { 
  Plus, 
  UserPlus, 
  QrCode, 
  Menu,
  X,
  Sprout,
  ArrowRightLeft
} from 'lucide-react'

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  isOpen: boolean
  onToggle: () => void
  logOut: any
}

export function Sidebar({ activeSection, onSectionChange, isOpen, onToggle,logOut }: SidebarProps) {
  const menuItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: Plus },
    // { id: 'farmer', label: 'Register Farmer', icon: UserPlus },
    // { id: 'middleman', label: 'Register Middleman', icon: UserPlus },
    { id: 'transactions', label: 'Transactions', icon: ArrowRightLeft },
    // { id: 'qr', label: 'QR Showcase', icon: QrCode },
  ]

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-screen w-64 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-r border-border transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Sprout className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 bg-clip-text text-transparent">
                Agri<span className='text-chart-4/90'>CHAIN </span>
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start h-11 transition-all duration-200 hover:bg-accent",
                    activeSection === item.id && "bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20"
                  )}
                  onClick={() => {
                    onSectionChange(item.id)
                    if (window.innerWidth < 1024) onToggle()
                  }}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Button>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="mt-auto pt-4 ">
            <div className="flex items-center justify-between">
              <Button className='hover:bg-red-500 hover:text-white font-bold' onClick={logOut}>Log-Out</Button>
            </div>
          </div>
          <div className="mt-auto pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}