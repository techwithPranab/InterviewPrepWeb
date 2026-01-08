"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  // Initialize auth state on mount
  const updateAuthState = () => {
    if (typeof window !== 'undefined') {
      const token = api.getToken(); // Use API client token instead of localStorage directly
      const userData = localStorage.getItem('user');
      
      if (token && userData && userData.trim() !== '') {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAdmin(parsedUser.role === 'admin');
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error parsing user data:', error);
          // Clear invalid user data from localStorage
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('auth_token');
          api.clearToken();
          setIsAuthenticated(false);
          setUser(null);
          setIsAdmin(false);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setIsAdmin(false);
      }
    }
  };

  useEffect(() => {
    updateAuthState();

    // Listen for storage changes (from other tabs)
    const handleStorageChange = () => {
      updateAuthState();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event listener for auth updates from same tab
    const handleAuthChange = () => {
      updateAuthState();
    };
    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    api.clearToken();
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUser(null);
    setIsMobileMenuOpen(false);
    // Dispatch auth change event
    window.dispatchEvent(new Event('authChange'));
    router.push('/login');
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    switch (user.role) {
      case 'interviewer':
        return '/interviewer-dashboard';
      case 'admin':
        return '/admin';
      case 'candidate':
      default:
        return '/dashboard';
    }
  };

  return (
    <header className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 shadow-md sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-lg sm:text-xl md:text-2xl font-bold text-blue-700 tracking-tight"
            onClick={closeMobileMenu}
          >
            <span className="hidden sm:inline">MeritAI</span>
            <span className="sm:hidden">MeritAI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-4 lg:space-x-6 items-center">
            <Link href="/interview-guides" className="text-sm lg:text-base text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Interview Guides
            </Link>
            {isAuthenticated ? (
              <>
                {/* Simple Dashboard Link */}
                <Link 
                  href={getDashboardLink()}
                  className="text-sm lg:text-base text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link href="/profile" className="text-sm lg:text-base text-gray-700 hover:text-blue-600 font-medium transition-colors">Profile</Link>
                {isAdmin && (
                  <Link href="/admin/interview-guides" className="text-sm lg:text-base text-blue-600 hover:text-blue-800 font-medium transition-colors">
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-sm lg:text-base text-gray-700 hover:text-red-600 font-medium bg-transparent border-none cursor-pointer transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm lg:text-base text-gray-700 hover:text-blue-600 font-medium transition-colors">Login</Link>
                <Link 
                  href="/register" 
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-sm text-sm lg:text-base"
                >
                  Register
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-1">
              <Link 
                href="/interview-guides" 
                className="text-sm text-gray-700 hover:text-blue-600 font-medium py-2 px-2 hover:bg-gray-50 rounded transition-colors"
                onClick={closeMobileMenu}
              >
                Interview Guides
              </Link>
              {isAuthenticated ? (
                <>
                  {/* Simple Dashboard Link */}
                  <Link 
                    href={getDashboardLink()}
                    className="text-sm text-gray-700 hover:text-blue-600 font-medium py-2 px-2 hover:bg-gray-50 rounded transition-colors block"
                    onClick={closeMobileMenu}
                  >
                    Dashboard
                  </Link>
                  
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <Link 
                      href="/profile" 
                      className="text-sm text-gray-700 hover:text-blue-600 font-medium py-2 px-2 hover:bg-gray-50 rounded transition-colors flex items-center gap-2"
                      onClick={closeMobileMenu}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </Link>
                  </div>

                  {isAdmin && (
                    <Link 
                      href="/admin/interview-guides" 
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium py-2 px-2 hover:bg-blue-50 rounded transition-colors"
                      onClick={closeMobileMenu}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-sm text-left text-red-600 hover:text-red-700 font-medium py-2 px-2 hover:bg-red-50 rounded bg-transparent border-none cursor-pointer transition-colors w-full"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="text-sm text-gray-700 hover:text-blue-600 font-medium py-2 px-2 hover:bg-gray-50 rounded transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Login
                  </Link>
                  <Link 
                    href="/register" 
                    className="text-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 font-medium py-2.5 px-3 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all flex items-center justify-center shadow-sm"
                    onClick={closeMobileMenu}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
