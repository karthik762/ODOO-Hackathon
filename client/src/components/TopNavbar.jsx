import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Search, Bell, Settings } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Link } from 'react-router-dom'

export function TopNavbar() {
  const { user, logout } = useAuth()

  return (
    <header className="h-[70px] flex items-center justify-between px-6 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 w-full shrink-0">
      
      {/* Left side - Search */}
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-full max-w-sm hidden sm:flex">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search assets, users, or bookings..."
            className="w-full h-9 rounded-md border border-input bg-transparent px-9 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      {/* Right side - Actions & Profile */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="text-muted-foreground hidden sm:flex">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hidden sm:flex">
          <Settings className="h-5 w-5" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-2">
              <Avatar className="h-9 w-9">
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email || 'user@assetflow.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link to="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-500/10">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
