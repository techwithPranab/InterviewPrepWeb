'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Trophy, Calendar, Target, Award } from 'lucide-react';
import api from '@/lib/api';

interface SharedSession {
  id: string;
  title: string;
  type: string;
  difficulty: string;
  skills: string[];
  completedAt: string;
  totalQuestions: number;
  answeredQuestions: number;
  averageScore: string;
  overallEvaluation?: {
    overallScore: number;
    summary: string;
    strengths: string[];
    areasForImprovement: string[];
  };
}

export default function SharedInterviewPage() {
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<SharedSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSharedSession();
  }, [sessionId]);

  const fetchSharedSession = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/interview/share/${sessionId}`);

      if (response.success) {
        setSession(response.data?.session);
      } else {
        throw new Error(response.message || 'Failed to load shared interview');
      }
    } catch (err) {
      console.error('Failed to load shared interview:', err);
      setError('Failed to load shared interview');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shared interview...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Interview not found'}</p>
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const scoreColor = parseFloat(session.averageScore) >= 7 ? 'green' : 
                     parseFloat(session.averageScore) >= 5 ? 'yellow' : 'red';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Shared Interview Results
            </h1>
            <p className="text-gray-600">
              Check out this impressive interview performance!
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Score Card */}
        <div className={`bg-gradient-to-r ${
          scoreColor === 'green' ? 'from-green-500 to-emerald-600' :
          scoreColor === 'yellow' ? 'from-yellow-500 to-orange-500' :
          'from-red-500 to-pink-600'
        } rounded-2xl shadow-2xl p-8 mb-8 text-white`}>
          <div className="text-center">
            <div className="text-6xl font-bold mb-2">{session.averageScore}/10</div>
            <div className="text-xl opacity-90">Average Score</div>
          </div>
        </div>

        {/* Interview Details */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{session.title}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <Target className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <div className="text-sm text-gray-600">Type & Difficulty</div>
                <div className="font-semibold text-gray-900">
                  {session.type} - {session.difficulty}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600 mt-1" />
              <div>
                <div className="text-sm text-gray-600">Completed On</div>
                <div className="font-semibold text-gray-900">
                  {new Date(session.completedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <Award className="w-5 h-5 text-green-600 mt-1" />
              <div>
                <div className="text-sm text-gray-600">Questions Answered</div>
                <div className="font-semibold text-gray-900">
                  {session.answeredQuestions} / {session.totalQuestions}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
              <Trophy className="w-5 h-5 text-orange-600 mt-1" />
              <div>
                <div className="text-sm text-gray-600">Skills Tested</div>
                <div className="font-semibold text-gray-900">
                  {session.skills.join(', ')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Strengths & Improvements */}
        {session.overallEvaluation && (
          <>
            {session.overallEvaluation.strengths.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">💪</span>
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {session.overallEvaluation.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {session.overallEvaluation.areasForImprovement.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📈</span>
                  Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {session.overallEvaluation.areasForImprovement.map((area, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">→</span>
                      <span className="text-gray-700">{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-2">Ready to Test Your Skills?</h3>
          <p className="mb-6 opacity-90">
            Join thousands of candidates preparing for their dream jobs with MeritAI
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Start Your Interview Journey
          </Link>
        </div>
      </main>
    </div>
  );
}
