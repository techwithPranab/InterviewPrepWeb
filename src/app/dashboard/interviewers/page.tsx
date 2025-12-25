'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Interviewer {
  id: string;
  name: string;
  bio: string;
  expertise: string[];
  availability: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
  hourlyRate?: number;
  rating: number;
  totalInterviews: number;
  verified: boolean;
  languages: string[];
}

export default function BrowseInterviewersPage() {
  const router = useRouter();
  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    expertise: '',
    minRating: '',
    verified: false,
    language: '',
  });

  useEffect(() => {
    fetchInterviewers();
  }, [filters]);

  const fetchInterviewers = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.expertise) params.append('expertise', filters.expertise);
      if (filters.minRating) params.append('minRating', filters.minRating);
      if (filters.verified) params.append('verified', 'true');
      if (filters.language) params.append('language', filters.language);

      const response = await fetch(`/api/interviewers?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setInterviewers(data.interviewers);
      }
    } catch (error) {
      console.error('Failed to fetch interviewers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating.toFixed(1)})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading interviewers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Browse Interviewers</h1>
          <p className="mt-1 text-sm text-gray-600">
            Find expert interviewers to help you practice
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expertise
              </label>
              <input
                type="text"
                value={filters.expertise}
                onChange={(e) => setFilters({ ...filters, expertise: e.target.value })}
                placeholder="e.g., Java, React"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Rating
              </label>
              <select
                value={filters.minRating}
                onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any</option>
                <option value="3">3+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <input
                type="text"
                value={filters.language}
                onChange={(e) => setFilters({ ...filters, language: e.target.value })}
                placeholder="e.g., English"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.verified}
                  onChange={(e) => setFilters({ ...filters, verified: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Verified Only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Interviewers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interviewers.map((interviewer) => (
            <div key={interviewer.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    {interviewer.name}
                    {interviewer.verified && (
                      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </h3>
                  {renderStars(interviewer.rating)}
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-3">{interviewer.bio}</p>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Expertise</h4>
                <div className="flex flex-wrap gap-2">
                  {interviewer.expertise.slice(0, 4).map((skill) => (
                    <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {skill}
                    </span>
                  ))}
                  {interviewer.expertise.length > 4 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{interviewer.expertise.length - 4}
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Languages</h4>
                <p className="text-sm text-gray-600">{interviewer.languages.join(', ')}</p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500">{interviewer.totalInterviews} interviews</p>
                  {interviewer.hourlyRate && (
                    <p className="text-lg font-bold text-gray-900">${interviewer.hourlyRate}/hr</p>
                  )}
                </div>
                <button
                  onClick={() => router.push(`/dashboard/interviewers/${interviewer.id}/schedule`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Schedule
                </button>
              </div>
            </div>
          ))}
        </div>

        {interviewers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No interviewers found matching your criteria.</p>
          </div>
        )}
      </main>
    </div>
  );
}
