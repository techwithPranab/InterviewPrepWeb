'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface InterviewSession {
  skills: string[];
  duration: number;
  difficulty: string;
  includeBehavioral: boolean;
  includeTechnical: boolean;
  startTime: string;
}

interface Question {
  id: number;
  text: string;
  type: 'technical' | 'behavioral';
  skill?: string;
}

export default function InterviewSessionPage() {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Load session data
    const sessionData = localStorage.getItem('currentInterview');
    if (!sessionData) {
      router.push('/interview/new');
      return;
    }

    const parsedSession = JSON.parse(sessionData);
    setSession(parsedSession);
    setTimeRemaining(parsedSession.duration * 60); // Convert to seconds

    // Generate mock questions based on session config
    generateQuestions(parsedSession);
  }, [router]);

  useEffect(() => {
    // Timer countdown
    if (timeRemaining > 0 && !sessionEnded) {
      const timer = setTimeout(() => {
        setTimeRemaining(time => time - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && !sessionEnded) {
      handleEndInterview();
    }
  }, [timeRemaining, sessionEnded]);

  const generateQuestions = (session: InterviewSession) => {
    const mockQuestions: Question[] = [];
    let id = 1;

    // Generate technical questions for each skill
    if (session.includeTechnical) {
      session.skills.forEach(skill => {
        mockQuestions.push({
          id: id++,
          text: `Explain the core concepts of ${skill} and provide an example of how you've used it in a project.`,
          type: 'technical',
          skill
        });
        
        if (session.difficulty === 'advanced') {
          mockQuestions.push({
            id: id++,
            text: `What are the advanced features or best practices when working with ${skill}?`,
            type: 'technical',
            skill
          });
        }
      });
    }

    // Generate behavioral questions
    if (session.includeBehavioral) {
      const behavioralQuestions = [
        'Tell me about a challenging project you worked on and how you overcame obstacles.',
        'Describe a time when you had to work with a difficult team member.',
        'How do you handle tight deadlines and pressure?',
        'Give an example of when you had to learn a new technology quickly.',
        'Describe a situation where you had to make a difficult technical decision.'
      ];

      const numBehavioral = Math.min(3, behavioralQuestions.length);
      for (let i = 0; i < numBehavioral; i++) {
        mockQuestions.push({
          id: id++,
          text: behavioralQuestions[i],
          type: 'behavioral'
        });
      }
    }

    // Limit total questions based on duration
    const maxQuestions = Math.min(mockQuestions.length, Math.floor(session.duration / 5));
    setQuestions(mockQuestions.slice(0, maxQuestions));
    setAnswers(new Array(maxQuestions).fill(''));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      // Save current answer
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = currentAnswer;
      setAnswers(newAnswers);
      
      // Move to next question
      setCurrentQuestion(current => current + 1);
      setCurrentAnswer(answers[currentQuestion + 1] || '');
    } else {
      handleEndInterview();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      // Save current answer
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = currentAnswer;
      setAnswers(newAnswers);
      
      // Move to previous question
      setCurrentQuestion(current => current - 1);
      setCurrentAnswer(answers[currentQuestion - 1] || '');
    }
  };

  const handleEndInterview = () => {
    // Save final answer
    const finalAnswers = [...answers];
    finalAnswers[currentQuestion] = currentAnswer;
    setAnswers(finalAnswers);
    
    // Save interview results
    const results = {
      session,
      questions,
      answers: finalAnswers,
      endTime: new Date().toISOString(),
      completed: true
    };
    
    localStorage.setItem('lastInterviewResults', JSON.stringify(results));
    localStorage.removeItem('currentInterview');
    setSessionEnded(true);
    
    // Navigate to results
    router.push('/interview/summary');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!session || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Preparing your interview...</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Mock Interview Session</h1>
            <div className="flex items-center space-x-4">
              <div className={`text-lg font-mono ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                ⏱️ {formatTime(timeRemaining)}
              </div>
              <button
                onClick={handleEndInterview}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                End Interview
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  currentQ.type === 'technical' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {currentQ.type === 'technical' ? 'Technical' : 'Behavioral'}
                </span>
                {currentQ.skill && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {currentQ.skill}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {currentQ.text}
              </h2>
            </div>

            {/* Answer Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Answer:
              </label>
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                rows={8}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Type your answer here... Take your time to think through your response."
              />
            </div>

            {/* Voice Recording Placeholder */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsRecording(!isRecording)}
                  className={`px-4 py-2 rounded font-medium ${
                    isRecording 
                      ? 'bg-red-100 text-red-700 border border-red-300' 
                      : 'bg-blue-100 text-blue-700 border border-blue-300'
                  }`}
                >
                  {isRecording ? '⏹️ Stop Recording' : '🎤 Start Voice Recording'}
                </button>
                <span className="text-sm text-gray-600">
                  {isRecording ? 'Recording in progress...' : 'Click to record your verbal response'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            
            <button
              onClick={handleNextQuestion}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {currentQuestion === questions.length - 1 ? 'Finish Interview' : 'Next →'}
            </button>
          </div>
        </div>
      </main>

      {/* Session Info */}
      <footer className="bg-white shadow-inner mt-8 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {session && session.startTime ? (
            <div className="text-sm text-gray-600">
              Start Time: {new Date(session.startTime).toLocaleString()}
            </div>
          ) : (
            <div className="text-sm text-gray-400">
              No session data available.
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
