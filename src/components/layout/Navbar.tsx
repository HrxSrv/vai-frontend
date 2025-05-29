import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, MessageSquare, History, LogOut, HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/buttonSC';
// import solo from '@/assets/white.png';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
// import { Badge } from '@/components/ui/badge';
import ThemeToggle from '../ui/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
// import Image from 'next/image'
// Mock auth context for demo
// const useAuth = () => ({
//   user: { name: 'John Doe', email: 'john@example.com' },
//   isAuthenticated: true,
//   logout: () => console.log('Logout clicked')
// });

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  // console.log('Navbar user:', user);
  const location = useLocation();

  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: <HomeIcon size={18} />,
    },
    {
      name: 'Chat',
      path: '/chat',
      icon: <MessageSquare size={18} />,
      authRequired: true,
    },
    {
      name: 'Sessions',
      path: '/dashboard',
      icon: <History size={18} />,
      authRequired: true,
    },
  ];

  const NavLink = ({ item, mobile = false }) => {
    const isActive = location.pathname === item.path;
    
    return (
      <Button
        asChild
        variant={isActive ? "secondary" : "ghost"}
        size={mobile ? "default" : "sm"}
        className={`${mobile ? 'w-full justify-start' : ''} ${
          isActive 
            ? 'bg-red-50 text-red-600 hover:bg-red-160 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900' 
            : 'hover:text-red-600 dark:hover:text-red-400'
        }`}
      >
        <Link to={item.path} className="flex items-center">
          {item.icon && <span className="mr-2">{item.icon}</span>}
          {item.name}
        </Link>
      </Button>
    );
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className=" mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
         <Link to="/" className="flex items-center space-x-2">
  {/* <img 
    src={solo} 
    alt="Logo" 
    className="h-16 w-16 rounded-full object-cover" // Increased size slightly for better alignment
  /> */}
  <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent leading-none">
    VAI
  </span>
</Link>



          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <div className="flex items-center space-x-2">
              {navItems
                .filter(item => !item.authRequired || isAuthenticated)
                .map(item => (
                  <NavLink key={item.path} item={item} />
                ))}
            </div>

            <ThemeToggle />

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="" alt={user?.name} />
                      <AvatarFallback className="bg-red-160 text-red-600 dark:bg-red-900 dark:text-red-400">
                        {user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="ghost" size="sm">
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild size="sm" className="text-black bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800 dark:text-white ">
                  <Link to="/register">Sign up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
            
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="px-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                {/* <SheetHeader>
                  <SheetTitle className="text-left text-red-600 dark:text-red-400">
                    Ask the AI
                  </SheetTitle>
                </SheetHeader> */}
                
                <div className="mt-6 space-y-4">
                  {/* Navigation Items */}
                  <div className="space-y-2">
                    {navItems
                      .filter(item => !item.authRequired || isAuthenticated)
                      .map(item => (
                        <div key={item.path} onClick={() => setIsMenuOpen(false)}>
                          <NavLink item={item} mobile />
                        </div>
                      ))}
                  </div>

                  {/* User Section */}
                  <div className="border-t pt-4">
                    {isAuthenticated ? (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 rounded-lg border p-3">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src="" alt={user?.name} />
                            <AvatarFallback className="bg-red-160 text-red-600 dark:bg-red-900 dark:text-red-400">
                              {user?.name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">{user?.name}</p>
                            <p className="text-xs text-muted-foreground">{user?.email}</p>
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950"
                          onClick={() => {
                            logout();
                            setIsMenuOpen(false);
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Log out
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Button asChild variant="outline" className="w-full">
                          <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                            Log in
                          </Link>
                        </Button>
                        <Button asChild className="w-full bg-red-600 hover:bg-red-700">
                          <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                            Sign up
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;