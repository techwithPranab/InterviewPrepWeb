'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface AnalyticsData {
  scoreTrend: { date: string; score: number }[];
  skillProficiency: { skill: string; avgScore: number; interviewCount: number }[];
  questionTypePerformance: { type: string; avgScore: number; count: number }[];
  difficultyPerformance: { difficulty: string; avgScore: number; count: number }[];
  monthlyProgress: { month: string; interviews: number; avgScore: number }[];
  recommendations: string[];
  totalInterviews: number;
  averageScore: number;
  improvementRate: number;
  strongestSkill: string;
  weakestSkill: string;
}

export default function AnalyticsDashboard() {
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

      const response = await api.get('/user/analytics', {
        params: { timeRange }
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch analytics');
      }

      setAnalytics(response.data);

    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 7) return 'bg-green-500';
    if (score >= 5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Analytics not available'}</p>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Performance Analytics</h1>
              <p className="mt-1 text-sm text-gray-600">
                Track your interview performance and identify areas for improvement
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as '30d' | '90d' | '1y')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Interviews</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalInterviews}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(analytics.averageScore)}`}>
                  {analytics.averageScore.toFixed(1)}/10
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${analytics.improvementRate >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <svg className={`w-8 h-8 ${analytics.improvementRate >= 0 ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Improvement Rate</p>
                <p className={`text-2xl font-bold ${analytics.improvementRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analytics.improvementRate >= 0 ? '+' : ''}{analytics.improvementRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Strongest Skill</p>
                <p className="text-lg font-bold text-gray-900">{analytics.strongestSkill}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Score Trend Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Score Trend Over Time</h2>
          <div className="h-64 flex items-end justify-between space-x-2">
            {analytics.scoreTrend.map((point, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className={`w-full ${getScoreBgColor(point.score)} rounded-t transition-all duration-300 hover:opacity-80`}
                  style={{ height: `${(point.score / 10) * 100}%` }}
                  title={`Score: ${point.score}/10 on ${new Date(point.date).toLocaleDateString()}`}
                />
                <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top">
                  {new Date(point.date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between text-sm text-gray-600">
            <span>0</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>

        {/* Skill Proficiency Heatmap */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Skill Proficiency</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analytics.skillProficiency.map((skill, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900">{skill.skill}</h3>
                  <span className={`text-sm font-bold ${getScoreColor(skill.avgScore)}`}>
                    {skill.avgScore.toFixed(1)}/10
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full ${getScoreBgColor(skill.avgScore)}`}
                    style={{ width: `${(skill.avgScore / 10) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{skill.interviewCount} interviews</p>
              </div>
            ))}
          </div>
        </div>

        {/* Performance by Question Type */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Performance by Question Type</h2>
            <div className="space-y-4">
              {analytics.questionTypePerformance.map((type, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 capitalize">{type.type}</span>
                      <span className={`text-sm font-bold ${getScoreColor(type.avgScore)}`}>
                        {type.avgScore.toFixed(1)}/10
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getScoreBgColor(type.avgScore)}`}
                        style={{ width: `${(type.avgScore / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="ml-4 text-xs text-gray-500">({type.count})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Performance by Difficulty</h2>
            <div className="space-y-4">
              {analytics.difficultyPerformance.map((diff, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 capitalize">{diff.difficulty}</span>
                      <span className={`text-sm font-bold ${getScoreColor(diff.avgScore)}`}>
                        {diff.avgScore.toFixed(1)}/10
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getScoreBgColor(diff.avgScore)}`}
                        style={{ width: `${(diff.avgScore / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="ml-4 text-xs text-gray-500">({diff.count})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Progress */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Progress</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interviews
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Average Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.monthlyProgress.map((month, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {month.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {month.interviews}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`font-medium ${getScoreColor(month.avgScore)}`}>
                        {month.avgScore.toFixed(1)}/10
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {index > 0 && analytics.monthlyProgress[index - 1] && (
                        <span className={`flex items-center ${
                          month.avgScore > analytics.monthlyProgress[index - 1].avgScore
                            ? 'text-green-600'
                            : month.avgScore < analytics.monthlyProgress[index - 1].avgScore
                            ? 'text-red-600'
                            : 'text-gray-400'
                        }`}>
                          {month.avgScore > analytics.monthlyProgress[index - 1].avgScore ? '↗' :
                           month.avgScore < analytics.monthlyProgress[index - 1].avgScore ? '↘' : '→'}
                          <span className="ml-1">
                            {(month.avgScore - analytics.monthlyProgress[index - 1].avgScore).toFixed(1)}
                          </span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">AI Recommendations</h2>
          {analytics.recommendations.length > 0 ? (
            <div className="space-y-3">
              {analytics.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="ml-3 text-sm text-gray-700">{rec}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Complete more interviews to receive personalized recommendations.</p>
          )}
        </div>
      </main>
    </div>
  );
}
