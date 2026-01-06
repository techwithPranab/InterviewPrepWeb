'use client';

import { useState, useEffect } from 'react';
import { Trophy, Award, Lock } from 'lucide-react';
import { getRarityColor } from '@/lib/utils/badges';
import api from '@/lib/api';

interface Achievement {
  _id: string;
  badgeId: string;
  badgeName: string;
  badgeDescription: string;
  badgeIcon: string;
  badgeCategory: string;
  earnedAt: string;
  progress: {
    current: number;
    target: number;
  };
}

interface UnearnedBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  progress: number;
  earned: false;
  criteria: {
    type: string;
    target: number;
  };
}

export default function AchievementsPage() {
  const [earnedAchievements, setEarnedAchievements] = useState<Achievement[]>([]);
  const [unearnedBadges, setUnearnedBadges] = useState<UnearnedBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalAvailable, setTotalAvailable] = useState(0);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);

      const response = await api.get('/user/achievements');

      if (response.success) {
        setEarnedAchievements(response.data?.earnedAchievements || []);
        setUnearnedBadges(response.data?.unearnedBadges || []);
        setTotalEarned(response.data?.totalEarned || 0);
        setTotalAvailable(response.data?.totalAvailable || 0);
      } else {
        console.error('Failed to fetch achievements:', response.message);
      }

    } catch (err) {
      console.error('Failed to fetch achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEarned = filter === 'all' 
    ? earnedAchievements 
    : earnedAchievements.filter(a => a.badgeCategory === filter);

  const filteredUnearned = filter === 'all'
    ? unearnedBadges
    : unearnedBadges.filter(b => b.category === filter);

  const completionPercentage = totalAvailable > 0 
    ? Math.round((totalEarned / totalAvailable) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading achievements...</p>
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
                <Trophy className="w-8 h-8 text-yellow-500" />
                Achievements
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Track your progress and unlock badges
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Overview */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 mb-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">{totalEarned}</div>
              <div className="text-sm opacity-90">Badges Earned</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">{completionPercentage}%</div>
              <div className="text-sm opacity-90">Completion Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">{totalAvailable}</div>
              <div className="text-sm opacity-90">Total Available</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="w-full bg-white/20 rounded-full h-3">
              <div
                className="bg-white h-3 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex flex-wrap gap-2">
            {['all', 'interview', 'skill', 'milestone', 'special'].map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Earned Achievements */}
        {filteredEarned.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-green-600" />
              Earned Badges ({filteredEarned.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEarned.map((achievement) => (
                <div
                  key={achievement._id}
                  className="bg-white rounded-lg shadow-md p-6 border-2 border-green-200 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-5xl">{achievement.badgeIcon}</div>
                    <div className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full font-semibold">
                      EARNED
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {achievement.badgeName}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {achievement.badgeDescription}
                  </p>
                  <div className="text-xs text-gray-500">
                    Earned on {new Date(achievement.earnedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Locked Achievements */}
        {filteredUnearned.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-gray-400" />
              Locked Badges ({filteredUnearned.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUnearned.map((badge) => (
                <div
                  key={badge.id}
                  className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200 opacity-75 hover:opacity-100 transition-opacity"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-5xl grayscale">{badge.icon}</div>
                    <div className={`text-xs px-2 py-1 rounded-full font-semibold ${getRarityColor(badge.rarity)}`}>
                      {badge.rarity.toUpperCase()}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {badge.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {badge.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Lock className="w-3 h-3" />
                    Complete {badge.criteria.target} to unlock
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredEarned.length === 0 && filteredUnearned.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No achievements in this category yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}
