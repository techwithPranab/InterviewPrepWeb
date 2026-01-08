'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Question {
  id: number;
  text: string;
  type: 'technical' | 'behavioral';
  skill?: string;
}

interface InterviewResults {
  session: {
    skills: string[];
    duration: number;
    difficulty: string;
    startTime: string;
  };
  questions: Question[];
  answers: string[];
  endTime: string;
  completed: boolean;
}

export default function InterviewSummaryPage() {
  const [results, setResults] = useState<InterviewResults | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Load interview results
    const resultsData = localStorage.getItem('lastInterviewResults');
    if (!resultsData) {
      router.push('/dashboard');
      return;
    }

    const parsedResults = JSON.parse(resultsData);
    setResults(parsedResults);
    setLoading(false);
  }, [router]);

  const calculateDuration = () => {
    if (!results) return '0 minutes';
    
    const start = new Date(results.session.startTime);
    const end = new Date(results.endTime);
    const durationMs = end.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };

  const getCompletionPercentage = () => {
    if (!results) return 0;
    const answeredQuestions = results.answers.filter(answer => answer.trim().length > 0).length;
    return Math.round((answeredQuestions / results.questions.length) * 100);
  };

  const generateFeedback = (answer: string, question: Question) => {
    if (!answer.trim()) {
      return {
        score: 0,
        feedback: 'No answer provided.',
        color: 'text-red-600'
      };
    }

    const wordCount = answer.trim().split(/\s+/).length;
    
    if (wordCount < 10) {
      return {
        score: 2,
        feedback: 'Answer is too brief. Try to provide more detailed explanations and examples.',
        color: 'text-red-600'
      };
    } else if (wordCount < 50) {
      return {
        score: 6,
        feedback: 'Good start! Consider adding more specific examples and details to strengthen your answer.',
        color: 'text-yellow-600'
      };
    } else if (wordCount < 100) {
      return {
        score: 8,
        feedback: 'Well-structured answer with good detail. Great job!',
        color: 'text-green-600'
      };
    } else {
      return {
        score: 9,
        feedback: 'Comprehensive and detailed answer. Excellent response!',
        color: 'text-green-600'
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No interview results found.</p>
          <Link
            href="/dashboard"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const answeredQuestions = results.answers.filter(answer => answer.trim().length > 0).length;
  const averageScore = results.answers.reduce((acc, answer, index) => {
    const feedback = generateFeedback(answer, results.questions[index]);
    return acc + feedback.score;
  }, 0) / results.questions.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-semibold text-gray-900">
                MeritAI
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-blue-600 hover:text-blue-500"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Interview Summary</h2>
            <p className="mt-2 text-gray-600">
              Review your performance and get feedback on your interview session.
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      ⏱️
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Duration
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {calculateDuration()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      ✅
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Completion
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {getCompletionPercentage()}%
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      📊
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Avg. Score
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {averageScore.toFixed(1)}/10
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      🎯
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Questions
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {answeredQuestions}/{results.questions.length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Questions and Answers */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Question Review & Feedback
            </h3>
            
            {results.questions.map((question, index) => {
              const answer = results.answers[index] || '';
              const feedback = generateFeedback(answer, question);
              
              return (
                <div key={question.id} className="bg-white shadow rounded-lg p-6">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-500">
                          Question {index + 1}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          question.type === 'technical' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {question.type === 'technical' ? 'Technical' : 'Behavioral'}
                        </span>
                        {question.skill && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {question.skill}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`font-medium ${feedback.color}`}>
                          Score: {feedback.score}/10
                        </span>
                      </div>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900">
                      {question.text}
                    </h4>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Your Answer:</h5>
                      <div className="bg-gray-50 p-4 rounded border">
                        {answer.trim() ? (
                          <p className="text-gray-900 whitespace-pre-wrap">{answer}</p>
                        ) : (
                          <p className="text-gray-500 italic">No answer provided</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Feedback:</h5>
                      <p className={`text-sm ${feedback.color}`}>
                        {feedback.feedback}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-center space-x-4">
            <Link
              href="/interview/new"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Start New Interview
            </Link>
            <Link
              href="/dashboard"
              className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
