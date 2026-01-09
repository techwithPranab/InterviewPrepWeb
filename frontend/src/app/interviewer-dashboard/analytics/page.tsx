'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface AnalyticsData {
  totalInterviews: number;
  completedInterviews: number;
  pendingInterviews: number;
  averageRating: number;
  completionRate: number;
  monthlyProgress: { month: string; interviews: number; completed: number }[];
  topPerformers: { candidateId: string; candidateName: string; avgScore: number; interviewCount: number }[];
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '1y'>('90d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/interviewers/analytics', { params: { timeRange } });

      if (response.success) {
        setAnalytics(response.data);
        setError('');
      } else {
        throw new Error(response.message || 'Failed to fetch analytics');
      }

    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">📈 Analytics</h1>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as '30d' | '90d' | '1y')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
          >
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {analytics && (
          <>
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Total Interviews</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{analytics.totalInterviews}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{analytics.completedInterviews}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{analytics.pendingInterviews}</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Avg. Rating</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{analytics.averageRating.toFixed(1)}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Completion Rate */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Completion Rate</h2>
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="8"
                        strokeDasharray={`${analytics.completionRate * 2.827} 282.7`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-900">{analytics.completionRate}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      {analytics.completedInterviews} out of {analytics.totalInterviews} interviews completed
                    </p>
                  </div>
                </div>
              </div>

              {/* Top Performers */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Top Candidates</h2>
                <div className="space-y-3">
                  {analytics.topPerformers.length > 0 ? (
                    analytics.topPerformers.map((performer, idx) => (
                      <div key={performer.candidateId} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-gray-500 w-6">{idx + 1}.</span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{performer.candidateName}</p>
                            <p className="text-xs text-gray-500">{performer.interviewCount} interview{performer.interviewCount !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-green-600">{performer.avgScore.toFixed(1)}/10</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No completed interviews yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Monthly Trend */}
            {analytics.monthlyProgress.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Monthly Trend</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Month</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Total</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Completed</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.monthlyProgress.map((month) => (
                        <tr key={month.month} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 text-xs text-gray-900">{month.month}</td>
                          <td className="px-4 py-3 text-xs font-medium text-gray-900">{month.interviews}</td>
                          <td className="px-4 py-3 text-xs font-medium text-green-600">{month.completed}</td>
                          <td className="px-4 py-3 text-xs">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {month.interviews > 0 ? Math.round((month.completed / month.interviews) * 100) : 0}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }
