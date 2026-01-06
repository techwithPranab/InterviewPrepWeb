'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import OnlineInterviewSession from '../../components/OnlineInterviewSession';
import VideoInterviewRoom from '../../components/VideoInterviewRoom';
import { api } from '../../../lib/api';

interface InterviewSession {
  _id: string;
  title: string;
  description: string;
  interviewType: 'online' | 'in-person';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  duration: number;
  difficulty: string;
  skills: string[];
  questions: any[];
  candidate: any;
  interviewer: any;
  meetingLink?: string;
  scheduledFor?: string;
  overallEvaluation?: any;
}

export default function InterviewSessionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await api.get(`/interviews/${id}`);
        if (response.success && response.data) {
          setSession(response.data);
        } else {
          setError('Interview not found');
        }
      } catch (err) {
        console.error('Error fetching interview:', err);
        setError('Failed to load interview');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-red-900 mb-2">Interview Not Found</h2>
          <p className="text-red-700">{error || 'The interview you are looking for does not exist.'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-6 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Check if this is an online interview
  if (session.interviewType !== 'online') {
    // Handle in-person video interviews
    if (session.status === 'in-progress') {
      return (
        <VideoInterviewRoom
          sessionId={session._id}
          userRole="candidate"
          userName={session.candidate?.name || 'User'}
          onEndCall={() => router.push('/dashboard')}
        />
      );
    }

    // Show in-person interview info for non-active sessions
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Video Interview</h2>
          <p className="text-gray-600 mb-6">This is a video interview session. Click the button below to join when ready.</p>
          {session.meetingLink && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-blue-800 font-medium">Meeting Link:</p>
              <a href={session.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                {session.meetingLink}
              </a>
            </div>
          )}
          {session.scheduledFor && (
            <div className="text-gray-600 mb-6">
              <p>Scheduled for: {new Date(session.scheduledFor).toLocaleString()}</p>
            </div>
          )}
          
          {session.status === 'scheduled' && (
            <button
              onClick={async () => {
                try {
                  await api.post(`/interviews/${session._id}/start`, {});
                  window.location.reload();
                } catch (err) {
                  console.error('Error starting interview:', err);
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg text-lg"
            >
              🎥 Join Video Interview
            </button>
          )}
        </div>
      </div>
    );
  }

  // Check interview status
  if (session.status === 'completed') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Interview Completed</h2>
          <p className="text-gray-600 mb-6">This interview has already been completed.</p>
          
          {session.overallEvaluation && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Final Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {session.overallEvaluation.totalScore || session.overallEvaluation.averageScore || 0}/10
                  </div>
                  <div className="text-sm text-gray-600">Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {session.overallEvaluation.completedQuestions || session.questions.length}/{session.questions.length}
                  </div>
                  <div className="text-sm text-gray-600">Questions Answered</div>
                </div>
              </div>
              
              {session.overallEvaluation.feedback && (
                <p className="text-gray-700 mb-4">{session.overallEvaluation.feedback}</p>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {session.overallEvaluation.strengths && session.overallEvaluation.strengths.length > 0 && (
                  <div className="text-left">
                    <h4 className="font-semibold text-green-700 mb-2">Strengths:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {session.overallEvaluation.strengths.map((strength: string, index: number) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {session.overallEvaluation.improvements && session.overallEvaluation.improvements.length > 0 && (
                  <div className="text-left">
                    <h4 className="font-semibold text-blue-700 mb-2">Areas for Improvement:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {session.overallEvaluation.improvements.map((improvement: string, index: number) => (
                        <li key={index}>{improvement}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (session.status === 'cancelled') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Interview Cancelled</h2>
          <p className="text-gray-600">This interview has been cancelled.</p>
        </div>
      </div>
    );
  }

  // For scheduled interviews, show start button
  if (session.status === 'scheduled') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{session.title}</h2>
          <p className="text-gray-600 mb-6">{session.description}</p>
          
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-blue-800">{session.duration} minutes</div>
                <div className="text-sm text-blue-600">Duration</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-blue-800">{session.questions.length}</div>
                <div className="text-sm text-blue-600">Questions</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-blue-800">{session.difficulty}</div>
                <div className="text-sm text-blue-600">Difficulty</div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Skills to be assessed:</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {session.skills.map((skill: string, index: number) => (
                <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={async () => {
              try {
                await api.post(`/interviews/${session._id}/start`, {});
                window.location.reload();
              } catch (err) {
                console.error('Error starting interview:', err);
              }
            }}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg text-lg"
          >
            Start Interview
          </button>
        </div>
      </div>
    );
  }

  // For in-progress interviews, show the interview component
  return (
    <OnlineInterviewSession
      sessionId={session._id}
      questions={session.questions}
      sessionTitle={session.title}
    />
  );
}
