'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Analytics {
  userStats: {
    totalInterviews: number;
    averageScore: number;
    scoreDistribution: {
      label: string;
      count: number;
    }[];
  };
  industryBenchmark: {
    averageScore: number;
    percentile: number;
    totalParticipants: number;
  };
  skillComparison: {
    skill: string;
    averageScore: number;
    interviewCount: number;
  }[];
  progressTrend: {
    date: string;
    score: number;
  }[];
}

export default function AdvancedAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedSkill]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = selectedSkill 
        ? `/api/analytics/advanced?skill=${encodeURIComponent(selectedSkill)}`
        : '/api/analytics/advanced';

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-blue-500';
    if (score >= 4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
              <p className="mt-1 text-sm text-gray-600">
                Deep insights into your interview performance and industry benchmarks
              </p>
            </div>
            <Link
              href="/dashboard/analytics"
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Basic Analytics
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Your Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
              Your Performance
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Total Interviews</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.userStats.totalInterviews}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.userStats.averageScore}/10</p>
              </div>
            </div>
          </div>

          {/* Industry Benchmark */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              Industry Benchmark
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Industry Average</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.industryBenchmark.averageScore}/10</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Participants</p>
                <p className="text-xl font-semibold text-gray-700">{analytics.industryBenchmark.totalParticipants.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Percentile Rank */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Your Percentile Rank
            </h2>
            <div>
              <p className="text-5xl font-bold mb-2">{analytics.industryBenchmark.percentile}%</p>
              <p className="text-sm opacity-90">
                {analytics.industryBenchmark.percentile >= 75 
                  ? 'You\'re in the top quartile! Excellent work!' 
                  : analytics.industryBenchmark.percentile >= 50
                  ? 'You\'re above average. Keep improving!'
                  : 'Keep practicing to improve your ranking!'}
              </p>
            </div>
          </div>
        </div>

        {/* Score Distribution */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Score Distribution</h2>
          <div className="space-y-3">
            {analytics.userStats.scoreDistribution.map((range) => {
              const maxCount = Math.max(...analytics.userStats.scoreDistribution.map(r => r.count));
              const percentage = maxCount > 0 ? (range.count / maxCount) * 100 : 0;
              
              return (
                <div key={range.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{range.label}</span>
                    <span className="text-gray-600">{range.count} interviews</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Trend */}
        {analytics.progressTrend.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Progress Trend (Last 10 Interviews)</h2>
            <div className="flex items-end justify-between h-64 gap-2">
              {analytics.progressTrend.map((point, index) => {
                const height = (point.score / 10) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="relative w-full flex items-end justify-center" style={{ height: '200px' }}>
                      <div
                        className={`w-full ${getScoreColor(point.score)} rounded-t transition-all duration-500 flex items-end justify-center pb-2`}
                        style={{ height: `${height}%` }}
                      >
                        <span className="text-xs text-white font-bold">{point.score}</span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 transform rotate-45 origin-left mt-2">
                      {point.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Skill Comparison */}
        {analytics.skillComparison.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Skills Performance Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Skill</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Average Score</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Interviews</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.skillComparison.map((skill, index) => (
                    <tr key={skill.skill} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{skill.skill}</td>
                      <td className="py-3 px-4">
                        <span className={`text-sm font-bold ${
                          skill.averageScore >= 7 ? 'text-green-600' :
                          skill.averageScore >= 5 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {skill.averageScore}/10
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{skill.interviewCount}</td>
                      <td className="py-3 px-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getScoreColor(skill.averageScore)}`}
                            style={{ width: `${(skill.averageScore / 10) * 100}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
