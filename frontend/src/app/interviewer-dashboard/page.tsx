'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profile: {
    experience: string;
    skills: string[];
    bio?: string;
  };
}

export default function InterviewerDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    scheduledInterviews: 0,
    completedAssessments: 0,
    activeCandidates: 0,
    avgRating: 0
  });
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated using API client
    if (!api.getToken()) {
      router.push('/login');
      return;
    }

    // Try to get user from Local Storage first
    const storedUser = localStorage.getItem('user');
    console.log('Stored user data:', storedUser);

    if (storedUser && storedUser !== 'null' && storedUser !== 'undefined') {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        console.log('Parsed user data:', userData);

        // Validate that userData has required properties
        if (!userData || typeof userData !== 'object' || !userData.role) {
          throw new Error('Invalid user data structure');
        }

        // Redirect if not interviewer
        if (userData.role !== 'interviewer') {
          if (userData.role === 'candidate') {
            router.push('/dashboard');
          } else if (userData.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/login');
          }
          return;
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('auth_token');
        router.push('/login');
        return;
      }
    } else {
      // No valid user data stored, redirect to login
      router.push('/login');
      return;
    }

    // Fetch fresh user data and stats
    fetchUserProfile();
  }, [router]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/me');

      if (response.success) {
        setUser(response.data?.user);
        localStorage.setItem('user', JSON.stringify(response.data?.user));

        // Fetch real stats from API
        try {
          const statsResponse = await api.get('/interviewers/stats');
          console.log('Stats response:', statsResponse);
          if (statsResponse.success && (statsResponse as any).stats) {
            setStats((statsResponse as any).stats);
          } else {
            console.error('Failed to fetch stats:', statsResponse.message);
            // Fallback to default stats
            setStats({
              scheduledInterviews: 0,
              completedAssessments: 0,
              activeCandidates: 0,
              avgRating: 0
            });
          }
        } catch (statsError) {
          console.error('Error fetching stats:', statsError);
          // Fallback to default stats
          setStats({
            scheduledInterviews: 0,
            completedAssessments: 0,
            activeCandidates: 0,
            avgRating: 0
          });
        }
      } else {
        console.error('Failed to fetch user profile:', response.message);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'interviewer') {
    return null;
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Welcome Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.firstName}! 👨‍💼
        </h1>
        <p className="mt-2 text-gray-600">
          Manage your interviews and assess candidates effectively
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled Interviews</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.scheduledInterviews}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Assessments</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.completedAssessments}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8l2 2 4-4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Candidates</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.activeCandidates}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-teal-600 overflow-hidden shadow-sm rounded-xl hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-100">Average Rating</p>
                <p className="text-3xl font-bold text-white mt-2">
                  {stats.avgRating}/5.0
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Schedule New Interview
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Set up an online or in-person interview session with candidates.
                </p>
                <Link
                  href="/interviewer-dashboard/schedule"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2.5 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all font-medium shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Schedule Interview
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  View Assessments
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Review completed interview assessments and candidate evaluations.
                </p>
                <Link
                  href="/interviewer-dashboard/assessments"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-all font-medium shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  View Assessments
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* More Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/interviewer-dashboard/interviews" className="block bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1">
          <div className="p-6">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              My Interviews
            </h3>
            <p className="text-gray-600 text-sm">
              Manage and review all your scheduled and completed interviews.
            </p>
          </div>
        </Link>

        <Link href="/interviewer-dashboard/candidates" className="block bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1">
          <div className="p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Candidate Management
            </h3>
            <p className="text-gray-600 text-sm">
              View candidate profiles, resumes, and interview history.
            </p>
          </div>
        </Link>

        <Link href="/interviewer-dashboard/analytics" className="block bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1">
          <div className="p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Analytics & Reports
            </h3>
            <p className="text-gray-600 text-sm">
              Track your interview performance and candidate insights.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
