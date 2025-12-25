'use client';

import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, TrendingUp, Calendar } from 'lucide-react';

interface LeaderboardEntry {
  _id: string;
  userId: string;
  name: string;
  email: string;
  rank: number;
  totalInterviews: number;
  averageScore: number;
  totalQuestions: number;
  lastInterviewDate: string;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all-time');
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    fetchLeaderboard();
    fetchCurrentUser();
  }, [timeframe, selectedSkill]);

  const fetchCurrentUser = () => {
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        setCurrentUserId(userData._id || userData.id);
      }
    } catch (err) {
      console.error('Failed to get current user:', err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        timeframe,
        ...(selectedSkill && { skill: selectedSkill })
      });

      const response = await fetch(`/api/leaderboard?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      setLeaderboard(data.leaderboard);

    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-300';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-blue-600 bg-blue-100';
    if (score >= 4) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                Leaderboard
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                See how you rank against other candidates
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeframe
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all-time">All Time</option>
                <option value="month">This Month</option>
                <option value="week">This Week</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Skill
              </label>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Skills</option>
                <option value="Java">Java</option>
                <option value="JavaScript">JavaScript</option>
                <option value="Python">Python</option>
                <option value="React">React</option>
                <option value="Node.js">Node.js</option>
              </select>
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
              🏆 Top Performers
            </h2>
            <div className="flex items-end justify-center gap-4">
              {/* 2nd Place */}
              <div className="flex flex-col items-center flex-1 max-w-xs">
                <Medal className="w-12 h-12 text-gray-400 mb-2" />
                <div className="bg-gradient-to-b from-gray-100 to-gray-200 rounded-t-lg p-6 w-full text-center h-32 flex flex-col justify-center border-2 border-gray-300">
                  <div className="font-bold text-gray-900 text-lg mb-1">{leaderboard[1].name}</div>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(leaderboard[1].averageScore)}`}>
                    {leaderboard[1].averageScore}/10
                  </div>
                </div>
              </div>

              {/* 1st Place */}
              <div className="flex flex-col items-center flex-1 max-w-xs">
                <Trophy className="w-16 h-16 text-yellow-500 mb-2 animate-bounce" />
                <div className="bg-gradient-to-b from-yellow-100 to-yellow-200 rounded-t-lg p-6 w-full text-center h-40 flex flex-col justify-center border-2 border-yellow-400">
                  <div className="font-bold text-gray-900 text-xl mb-2">{leaderboard[0].name}</div>
                  <div className={`inline-block px-4 py-2 rounded-full text-base font-bold ${getScoreColor(leaderboard[0].averageScore)}`}>
                    {leaderboard[0].averageScore}/10
                  </div>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="flex flex-col items-center flex-1 max-w-xs">
                <Award className="w-12 h-12 text-amber-600 mb-2" />
                <div className="bg-gradient-to-b from-amber-100 to-amber-200 rounded-t-lg p-6 w-full text-center h-28 flex flex-col justify-center border-2 border-amber-300">
                  <div className="font-bold text-gray-900 text-lg mb-1">{leaderboard[2].name}</div>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(leaderboard[2].averageScore)}`}>
                    {leaderboard[2].averageScore}/10
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Average Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interviews
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Questions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaderboard.map((entry) => (
                  <tr
                    key={entry._id}
                    className={`${getRankBgColor(entry.rank)} ${
                      entry.userId === currentUserId ? 'ring-2 ring-blue-500' : ''
                    } transition-colors hover:bg-gray-50`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getRankIcon(entry.rank)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="font-medium text-gray-900 flex items-center gap-2">
                            {entry.name}
                            {entry.userId === currentUserId && (
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{entry.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(entry.averageScore)}`}>
                        {entry.averageScore}/10
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.totalInterviews}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.totalQuestions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(entry.lastInterviewDate).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {leaderboard.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No data available</h3>
            <p className="text-gray-500">
              Be the first to complete an interview and claim the top spot!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
