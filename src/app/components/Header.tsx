"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check for token in localStorage
    if (typeof window !== 'undefined') {
      setIsAuthenticated(!!localStorage.getItem('token'));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    router.push('/login');
  };

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <Link href="/" className="text-2xl font-bold text-blue-700 tracking-tight">
          Mock Interview Platform
        </Link>
        <nav className="flex space-x-6">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">Dashboard</Link>
              <Link href="/profile" className="text-gray-700 hover:text-blue-600 font-medium">Profile</Link>
              <Link href="/interview/new" className="text-gray-700 hover:text-blue-600 font-medium">New Interview</Link>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-red-600 font-medium bg-transparent border-none cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-700 hover:text-blue-600 font-medium">Login</Link>
              <Link href="/register" className="text-gray-700 hover:text-blue-600 font-medium">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
