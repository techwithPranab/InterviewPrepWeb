"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check for token in localStorage
    if (typeof window !== 'undefined') {
      setIsAuthenticated(!!localStorage.getItem('token'));
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        setIsAdmin(userData.role === 'admin');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setIsAdmin(false);
    setIsMobileMenuOpen(false);
    router.push('/login');
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-lg sm:text-xl md:text-2xl font-bold text-blue-700 tracking-tight"
            onClick={closeMobileMenu}
          >
            <span className="hidden sm:inline">Mock Interview Platform</span>
            <span className="sm:hidden">Mock Interview</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-4 lg:space-x-6">
            <Link href="/interview-guides" className="text-sm lg:text-base text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Interview Guides
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="text-sm lg:text-base text-gray-700 hover:text-blue-600 font-medium transition-colors">Dashboard</Link>
                <Link href="/profile" className="text-sm lg:text-base text-gray-700 hover:text-blue-600 font-medium transition-colors">Profile</Link>
                <Link href="/interview/new" className="text-sm lg:text-base text-gray-700 hover:text-blue-600 font-medium transition-colors">New Interview</Link>
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
                <Link href="/register" className="text-sm lg:text-base text-gray-700 hover:text-blue-600 font-medium transition-colors">Register</Link>
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
            <div className="flex flex-col space-y-3">
              <Link 
                href="/interview-guides" 
                className="text-sm text-gray-700 hover:text-blue-600 font-medium py-2 px-2 hover:bg-gray-50 rounded transition-colors"
                onClick={closeMobileMenu}
              >
                Interview Guides
              </Link>
              {isAuthenticated ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="text-sm text-gray-700 hover:text-blue-600 font-medium py-2 px-2 hover:bg-gray-50 rounded transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/profile" 
                    className="text-sm text-gray-700 hover:text-blue-600 font-medium py-2 px-2 hover:bg-gray-50 rounded transition-colors"
                    onClick={closeMobileMenu}
                  >
                    Profile
                  </Link>
                  <Link 
                    href="/interview/new" 
                    className="text-sm text-gray-700 hover:text-blue-600 font-medium py-2 px-2 hover:bg-gray-50 rounded transition-colors"
                    onClick={closeMobileMenu}
                  >
                    New Interview
                  </Link>
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
                    className="text-sm text-left text-gray-700 hover:text-red-600 font-medium py-2 px-2 hover:bg-red-50 rounded bg-transparent border-none cursor-pointer transition-colors"
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
                    className="text-sm text-gray-700 hover:text-blue-600 font-medium py-2 px-2 hover:bg-gray-50 rounded transition-colors"
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
