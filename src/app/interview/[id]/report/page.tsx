'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Question {
  questionId: string;
  questionNumber: number;
  question: string;
  type: string;
  difficulty: string;
  answer?: string;
  timeSpent?: number;
  evaluation?: {
    score: number;
    feedback: string;
    criteria: {
      technical_accuracy: number;
      communication: number;
      problem_solving: number;
      confidence: number;
    };
    strengths: string[];
    improvements: string[];
  };
}

interface InterviewSession {
  _id: string;
  title: string;
  type: string;
  difficulty: string;
  skills: string[];
  duration: number;
  status: string;
  questions: Question[];
  overallEvaluation?: {
    overallScore: number;
    summary: string;
    performanceBySkill: { [key: string]: number };
    criteriaBreakdown: {
      technical_accuracy: number;
      communication: number;
      problem_solving: number;
      confidence: number;
    };
    strengths: string[];
    areasForImprovement: string[];
    recommendations: string[];
  };
  startedAt: string;
  completedAt?: string;
}

export default function InterviewReportPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.id as string;

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'feedback'>('overview');

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/interview/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load interview report');
      }

      const data = await response.json();
      setSession(data.session);

    } catch (err) {
      console.error('Failed to load report:', err);
      setError('Failed to load interview report');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    // Placeholder for PDF export functionality
    alert('PDF export functionality coming soon!');
  };

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 7) return 'bg-green-100';
    if (score >= 5) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading interview report...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Report not found'}</p>
          <Link
            href="/dashboard/interviews"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Interviews
          </Link>
        </div>
      </div>
    );
  }

  const answeredQuestions = session.questions.filter(q => q.answer);
  const avgScore = answeredQuestions.length > 0
    ? answeredQuestions.reduce((sum, q) => sum + (q.evaluation?.score || 0), 0) / answeredQuestions.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/dashboard/interviews" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
                ← Back to Interviews
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">{session.title}</h1>
              <p className="mt-1 text-sm text-gray-600">
                Completed on {session.completedAt ? new Date(session.completedAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              📄 Export PDF
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overall Score Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 mb-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-sm opacity-90 mb-2">Overall Score</p>
              <p className="text-5xl font-bold">
                {session.overallEvaluation?.overallScore?.toFixed(1) || avgScore.toFixed(1)}/10
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm opacity-90 mb-2">Questions Answered</p>
              <p className="text-3xl font-bold">{answeredQuestions.length}/{session.questions.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm opacity-90 mb-2">Duration</p>
              <p className="text-3xl font-bold">{session.duration} min</p>
            </div>
            <div className="text-center">
              <p className="text-sm opacity-90 mb-2">Difficulty</p>
              <p className="text-3xl font-bold capitalize">{session.difficulty}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'questions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Question Details
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'feedback'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              AI Feedback
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Performance Criteria */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {session.overallEvaluation?.criteriaBreakdown ? (
                  Object.entries(session.overallEvaluation.criteriaBreakdown).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className={`text-sm font-bold ${getScoreColor(value)}`}>
                          {value.toFixed(1)}/10
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            value >= 7 ? 'bg-green-500' : value >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${(value / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 col-span-2">No criteria breakdown available</p>
                )}
              </div>
            </div>

            {/* Skills Performance */}
            {session.overallEvaluation?.performanceBySkill && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Performance by Skill</h2>
                <div className="space-y-4">
                  {Object.entries(session.overallEvaluation.performanceBySkill).map(([skill, score]) => (
                    <div key={skill}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{skill}</span>
                        <span className={`text-sm font-bold ${getScoreColor(score as number)}`}>
                          {(score as number).toFixed(1)}/10
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${((score as number) / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            {session.overallEvaluation?.summary && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Summary</h2>
                <p className="text-gray-700 leading-relaxed">{session.overallEvaluation.summary}</p>
              </div>
            )}
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            {session.questions.map((question, index) => (
              <div key={question.questionId} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        Question {index + 1}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                        {question.type}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                        {question.difficulty}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{question.question}</h3>
                  </div>
                  {question.evaluation && (
                    <div className={`ml-4 px-4 py-2 rounded-lg ${getScoreBgColor(question.evaluation.score)}`}>
                      <p className={`text-2xl font-bold ${getScoreColor(question.evaluation.score)}`}>
                        {question.evaluation.score}/10
                      </p>
                    </div>
                  )}
                </div>

                {question.answer ? (
                  <>
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Your Answer:</p>
                      <div className="bg-gray-50 rounded p-4">
                        <p className="text-gray-700 whitespace-pre-wrap">{question.answer}</p>
                      </div>
                      {question.timeSpent && (
                        <p className="text-xs text-gray-500 mt-2">
                          Time spent: {Math.floor(question.timeSpent / 60)}m {question.timeSpent % 60}s
                        </p>
                      )}
                    </div>

                    {question.evaluation && (
                      <div className="border-t pt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">AI Feedback:</p>
                        <p className="text-gray-700 mb-4">{question.evaluation.feedback}</p>

                        {question.evaluation.strengths && question.evaluation.strengths.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-green-700 mb-1">✓ Strengths:</p>
                            <ul className="list-disc list-inside space-y-1">
                              {question.evaluation.strengths.map((strength, idx) => (
                                <li key={idx} className="text-sm text-gray-600">{strength}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {question.evaluation.improvements && question.evaluation.improvements.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-orange-700 mb-1">→ Areas for Improvement:</p>
                            <ul className="list-disc list-inside space-y-1">
                              {question.evaluation.improvements.map((improvement, idx) => (
                                <li key={idx} className="text-sm text-gray-600">{improvement}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                    <p className="text-yellow-800 text-sm">This question was not answered</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* AI Feedback Tab */}
        {activeTab === 'feedback' && session.overallEvaluation && (
          <div className="space-y-6">
            {/* Strengths */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-green-700 mb-4">✓ Strengths</h2>
              {session.overallEvaluation.strengths && session.overallEvaluation.strengths.length > 0 ? (
                <ul className="space-y-2">
                  {session.overallEvaluation.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-600 mr-2">•</span>
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No specific strengths identified</p>
              )}
            </div>

            {/* Areas for Improvement */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-orange-700 mb-4">→ Areas for Improvement</h2>
              {session.overallEvaluation.areasForImprovement && session.overallEvaluation.areasForImprovement.length > 0 ? (
                <ul className="space-y-2">
                  {session.overallEvaluation.areasForImprovement.map((area, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-orange-600 mr-2">•</span>
                      <span className="text-gray-700">{area}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No specific areas for improvement identified</p>
              )}
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-blue-700 mb-4">💡 Recommendations</h2>
              {session.overallEvaluation.recommendations && session.overallEvaluation.recommendations.length > 0 ? (
                <ul className="space-y-2">
                  {session.overallEvaluation.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No specific recommendations available</p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex justify-center space-x-4">
          <Link
            href="/interview/new"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Start New Interview
          </Link>
          <Link
            href="/dashboard/interviews"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            View All Interviews
          </Link>
        </div>
      </main>
    </div>
  );
}
