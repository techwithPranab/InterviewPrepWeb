'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Question {
  _id: string;
  question: string;
  type: string;
  difficulty: string;
  timeLimit: string;
  assessmentCriteria: string[];
}

interface Assessment {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  keywordMatch: number;
  isComplete: boolean;
}

interface OnlineInterviewProps {
  sessionId: string;
  questions: Question[];
  sessionTitle: string;
}

export default function OnlineInterviewSession({
  sessionId,
  questions,
  sessionTitle
}: OnlineInterviewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: questions.length, percentage: 0 });
  
  const router = useRouter();
  const currentQuestion = questions[currentQuestionIndex];
  const timeLimit = parseInt(currentQuestion?.timeLimit || '3') * 60; // Convert to seconds

  // Start timer when question loads
  useEffect(() => {
    if (currentQuestion && !isInterviewComplete) {
      setStartTime(new Date());
      setTimeRemaining(timeLimit);
      setAnswer(''); // Clear previous answer
      setAssessment(null); // Clear previous assessment
      
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitAnswer(); // Auto-submit when time runs out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentQuestionIndex, currentQuestion, isInterviewComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeSpent = () => {
    if (!startTime) return 0;
    return Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
  };

  const handleSubmitAnswer = async () => {
    if (isSubmitting || !answer.trim()) return;

    setIsSubmitting(true);
    const timeSpent = getTimeSpent();

    try {
      const response = await api.post(`/interview/${sessionId}/assess`, {
        questionIndex: currentQuestionIndex,
        candidateAnswer: answer,
        timeSpent
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to submit answer');
      }

      const result = response.data;
      setAssessment(result?.assessment);
      setProgress(result?.overallProgress);

      if (result?.assessment?.isComplete) {
        setIsInterviewComplete(true);
      }

      // Show assessment for 3 seconds, then move to next question
      setTimeout(() => {
        if (result?.nextQuestion !== null) {
          setCurrentQuestionIndex(result?.nextQuestion);
        }
      }, 3000);

    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to submit answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTimeColor = (timeRemaining: number, timeLimit: number) => {
    const percentage = (timeRemaining / timeLimit) * 100;
    if (percentage <= 20) return 'text-red-600';
    if (percentage <= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (isInterviewComplete) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Interview Completed!</h2>
            <p className="text-gray-600">Thank you for completing the interview session.</p>
          </div>

          {assessment && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Final Assessment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getScoreColor(assessment.score)}`}>
                    {assessment.score}/10
                  </div>
                  <div className="text-sm text-gray-600">Overall Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {progress.percentage}%
                  </div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                </div>
              </div>
              
              <div className="mt-4 text-left">
                <p className="text-gray-700 mb-4">{assessment.feedback}</p>
                
                {assessment.strengths.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-green-700 mb-2">Strengths:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {assessment.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {assessment.improvements.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-2">Areas for Improvement:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {assessment.improvements.map((improvement, index) => (
                        <li key={index}>{improvement}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return <div className="text-center p-6">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{sessionTitle}</h1>
          <div className={`text-xl font-bold ${getTimeColor(timeRemaining, timeLimit)}`}>
            ⏰ {formatTime(timeRemaining)}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress: {progress.completed}/{progress.total} questions</span>
            <span>{progress.percentage}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>
        </div>
        
        {/* Question Info */}
        <div className="flex items-center gap-4 text-sm">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {currentQuestion.type}
          </span>
          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
            {currentQuestion.difficulty}
          </span>
          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
            {currentQuestion.timeLimit} min limit
          </span>
        </div>
      </div>

      {/* Current Question */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Question {currentQuestionIndex + 1} of {questions.length}
        </h2>
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-gray-800 leading-relaxed">{currentQuestion.question}</p>
        </div>

        {/* Assessment Criteria */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Assessment Criteria:</h3>
          <div className="flex flex-wrap gap-2">
            {currentQuestion.assessmentCriteria.map((criteria, index) => (
              <span
                key={index}
                className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded"
              >
                {criteria.replace('_', ' ')}
              </span>
            ))}
          </div>
        </div>

        {/* Answer Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Answer:
          </label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            disabled={isSubmitting || assessment !== null}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>

        {/* Action Buttons */}
        {!assessment && (
          <div className="flex justify-between">
            <button
              onClick={handleSkipQuestion}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Skip Question
            </button>
            <button
              onClick={handleSubmitAnswer}
              disabled={isSubmitting || !answer.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 font-semibold"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Answer'}
            </button>
          </div>
        )}
      </div>

      {/* Assessment Results */}
      {assessment && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">AI Assessment</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(assessment.score)}`}>
                {assessment.score}/10
              </div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {assessment.keywordMatch}%
              </div>
              <div className="text-sm text-gray-600">Keyword Match</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-gray-800">{assessment.feedback}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assessment.strengths.length > 0 && (
              <div>
                <h4 className="font-semibold text-green-700 mb-2">✅ Strengths:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {assessment.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {assessment.improvements.length > 0 && (
              <div>
                <h4 className="font-semibold text-blue-700 mb-2">💡 Improvements:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {assessment.improvements.map((improvement, index) => (
                    <li key={index}>{improvement}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {!assessment.isComplete && (
            <div className="text-center mt-6">
              <p className="text-gray-600">Moving to next question in 3 seconds...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
