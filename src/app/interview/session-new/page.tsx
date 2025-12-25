'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAudioRecorder } from '@/app/hooks/useAudioRecorder';
import { AudioRecorder } from '@/app/components/AudioRecorder';
import { useVideoRecorder } from '@/app/hooks/useVideoRecorder';
import { VideoRecorder } from '@/app/components/VideoRecorder';

interface Question {
  questionId: string;
  questionNumber: number;
  question: string;
  type: string;
  difficulty: string;
  answer?: string | null;
  timeSpent?: number;
  evaluation?: any;
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
  progress: number;
  answeredQuestions: number;
  totalQuestions: number;
  startedAt: string;
}

function InterviewSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('id');

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState('');
  const [evaluation, setEvaluation] = useState<any>(null);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [responseMode, setResponseMode] = useState<'text' | 'audio' | 'video'>('text');

  // Audio recorder hook
  const audioRecorder = useAudioRecorder({
    onRecordingComplete: async (audioBlob, audioDuration) => {
      console.log('Recording completed:', { size: audioBlob.size, duration: audioDuration });
    },
    onError: (error) => {
      setError(`Audio recording error: ${error.message}`);
    }
  });

  // Video recorder hook
  const videoRecorder = useVideoRecorder({
    onRecordingComplete: async (videoBlob, videoDuration) => {
      console.log('Video recording completed:', { size: videoBlob.size, duration: videoDuration });
    },
    onError: (error) => {
      setError(`Video recording error: ${error.message}`);
    }
  });

  useEffect(() => {
    if (!sessionId) {
      router.push('/interview/new');
      return;
    }

    fetchSession();
  }, [sessionId]);

  useEffect(() => {
    // Timer countdown
    if (timeRemaining > 0 && session?.status === 'in-progress') {
      const timer = setTimeout(() => {
        setTimeRemaining(time => time - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && session?.status === 'in-progress') {
      handleCompleteInterview();
    }
  }, [timeRemaining, session]);

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
        throw new Error('Failed to load interview session');
      }

      const data = await response.json();
      setSession(data.session);
      
      // Set timer
      const elapsed = data.session.startedAt 
        ? Math.floor((Date.now() - new Date(data.session.startedAt).getTime()) / 1000)
        : 0;
      const remaining = Math.max(0, (data.session.duration * 60) - elapsed);
      setTimeRemaining(remaining);

      // Find first unanswered question
      const firstUnanswered = data.session.questions.findIndex((q: Question) => !q.answer);
      setCurrentQuestion(firstUnanswered >= 0 ? firstUnanswered : 0);
      setCurrentAnswer(data.session.questions[firstUnanswered >= 0 ? firstUnanswered : 0]?.answer || '');
      setQuestionStartTime(Date.now());

    } catch (err) {
      console.error('Failed to load session:', err);
      setError('Failed to load interview session');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      alert('Please provide an answer before proceeding.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const currentQ = session!.questions[currentQuestion];
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

      const response = await fetch(`/api/interview/${sessionId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          questionId: currentQ.questionId,
          answer: currentAnswer,
          timeSpent
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      const data = await response.json();
      
      // Show evaluation feedback
      setEvaluation(data.evaluation);
      setShowEvaluation(true);

      // Update session progress
      if (session) {
        const updatedQuestions = [...session.questions];
        updatedQuestions[currentQuestion] = {
          ...updatedQuestions[currentQuestion],
          answer: currentAnswer,
          timeSpent,
          evaluation: data.evaluation
        };
        
        setSession({
          ...session,
          questions: updatedQuestions,
          answeredQuestions: data.answeredQuestions,
          progress: data.progress
        });
      }

      // Clear audio recording if any
      audioRecorder.clearRecording();

      // Auto-advance after showing evaluation
      setTimeout(() => {
        setShowEvaluation(false);
        if (currentQuestion < session!.questions.length - 1) {
          handleNextQuestion();
        } else {
          // Last question - complete interview
          handleCompleteInterview();
        }
      }, 3000);

    } catch (err) {
      console.error('Failed to submit answer:', err);
      setError('Failed to submit answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAudioAnswer = async () => {
    if (!audioRecorder.audioBlob || uploadingAudio) return;

    setUploadingAudio(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const currentQ = session!.questions[currentQuestion];

      // Upload audio file
      const formData = new FormData();
      formData.append('audio', audioRecorder.audioBlob, `audio-${Date.now()}.webm`);
      formData.append('sessionId', sessionId || '');
      formData.append('questionId', currentQ.questionId);

      const uploadResponse = await fetch('/api/interview/audio/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload audio');
      }

      const uploadData = await uploadResponse.json();

      // Submit audio answer (using a placeholder text for now)
      const timeSpent = audioRecorder.recordingTime;
      const audioAnswer = `[Voice Response - Duration: ${timeSpent}s] Audio file: ${uploadData.filename}`;

      const submitResponse = await fetch(`/api/interview/${sessionId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          questionId: currentQ.questionId,
          answer: audioAnswer,
          timeSpent,
          audioUrl: uploadData.audioUrl
        })
      });

      if (!submitResponse.ok) {
        throw new Error('Failed to submit audio answer');
      }

      const submitData = await submitResponse.json();

      // Show evaluation feedback
      setEvaluation(submitData.evaluation);
      setShowEvaluation(true);

      // Update session progress
      if (session) {
        const updatedQuestions = [...session.questions];
        updatedQuestions[currentQuestion] = {
          ...updatedQuestions[currentQuestion],
          answer: audioAnswer,
          timeSpent,
          evaluation: submitData.evaluation
        };
        
        setSession({
          ...session,
          questions: updatedQuestions,
          answeredQuestions: submitData.answeredQuestions,
          progress: submitData.progress
        });
      }

      // Clear audio recording
      audioRecorder.clearRecording();

      // Auto-advance after showing evaluation
      setTimeout(() => {
        setShowEvaluation(false);
        if (currentQuestion < session!.questions.length - 1) {
          handleNextQuestion();
        } else {
          // Last question - complete interview
          handleCompleteInterview();
        }
      }, 3000);

    } catch (err) {
      console.error('Failed to submit audio answer:', err);
      setError('Failed to submit audio answer. Please try again.');
    } finally {
      setUploadingAudio(false);
    }
  };

  const handleSubmitVideoAnswer = async () => {
    if (!videoRecorder.videoBlob || uploadingVideo) return;

    setUploadingVideo(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const currentQ = session!.questions[currentQuestion];

      // Upload video file
      const formData = new FormData();
      formData.append('video', videoRecorder.videoBlob, `video-${Date.now()}.webm`);
      formData.append('sessionId', sessionId || '');
      formData.append('questionId', currentQ.questionId);

      const uploadResponse = await fetch('/api/interview/video/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload video');
      }

      const uploadData = await uploadResponse.json();

      // Submit video answer
      const timeSpent = videoRecorder.recordingTime;
      const videoAnswer = `[Video Response - Duration: ${timeSpent}s] Video file: ${uploadData.filename}`;

      const submitResponse = await fetch(`/api/interview/${sessionId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          questionId: currentQ.questionId,
          answer: videoAnswer,
          timeSpent,
          videoUrl: uploadData.videoUrl
        })
      });

      if (!submitResponse.ok) {
        throw new Error('Failed to submit video answer');
      }

      const submitData = await submitResponse.json();

      // Show evaluation feedback
      setEvaluation(submitData.evaluation);
      setShowEvaluation(true);

      // Update session progress
      if (session) {
        const updatedQuestions = [...session.questions];
        updatedQuestions[currentQuestion] = {
          ...updatedQuestions[currentQuestion],
          answer: videoAnswer,
          timeSpent,
          evaluation: submitData.evaluation
        };

        setSession({
          ...session,
          questions: updatedQuestions,
          answeredQuestions: submitData.answeredQuestions,
          progress: submitData.progress
        });
      }

      // Clear video recording
      videoRecorder.clearRecording();

      // Auto-advance after showing evaluation
      setTimeout(() => {
        setShowEvaluation(false);
        if (currentQuestion < session!.questions.length - 1) {
          handleNextQuestion();
        } else {
          // Last question - complete interview
          handleCompleteInterview();
        }
      }, 3000);

    } catch (err) {
      console.error('Failed to submit video answer:', err);
      setError('Failed to submit video answer. Please try again.');
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < session!.questions.length - 1) {
      setCurrentQuestion(curr => curr + 1);
      setCurrentAnswer(session!.questions[currentQuestion + 1]?.answer || '');
      setQuestionStartTime(Date.now());
      setEvaluation(null);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(curr => curr - 1);
      setCurrentAnswer(session!.questions[currentQuestion - 1]?.answer || '');
      setQuestionStartTime(Date.now());
      setEvaluation(null);
    }
  };

  const handleCompleteInterview = async () => {
    if (completing) return;
    
    setCompleting(true);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/interview/${sessionId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to complete interview');
      }

      // Navigate to results page
      router.push(`/interview/${sessionId}/report`);

    } catch (err) {
      console.error('Failed to complete interview:', err);
      setError('Failed to complete interview. Redirecting to summary...');
      setTimeout(() => router.push('/interview/summary'), 2000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your interview...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Session not found'}</p>
          <button
            onClick={() => router.push('/interview/new')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Start New Interview
          </button>
        </div>
      </div>
    );
  }

  const currentQ = session.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{session.title}</h1>
              <p className="text-sm text-gray-600 mt-1">
                {session.skills.join(', ')} • {session.difficulty}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`text-lg font-mono ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                ⏱️ {formatTime(timeRemaining)}
              </div>
              <button
                onClick={handleCompleteInterview}
                disabled={completing}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
              >
                {completing ? 'Completing...' : 'End Interview'}
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
              <span>Question {currentQuestion + 1} of {session.questions.length}</span>
              <span>{session.progress}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${session.progress}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  currentQ.type === 'technical' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                }`}>
                  {currentQ.type}
                </span>
                <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  {currentQ.difficulty}
                </span>
                {currentQ.answer && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                    ✓ Answered
                  </span>
                )}
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {currentQ.question}
              </h2>
            </div>

            {/* Response Mode Tabs */}
            {!currentQ.answer && (
              <div className="mb-4 flex gap-2 border-b border-gray-200">
                <button
                  onClick={() => setResponseMode('text')}
                  className={`px-4 py-2 font-medium text-sm transition-colors ${
                    responseMode === 'text'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📝 Text
                </button>
                <button
                  onClick={() => setResponseMode('audio')}
                  className={`px-4 py-2 font-medium text-sm transition-colors ${
                    responseMode === 'audio'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🎤 Audio
                </button>
                <button
                  onClick={() => setResponseMode('video')}
                  className={`px-4 py-2 font-medium text-sm transition-colors ${
                    responseMode === 'video'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🎥 Video
                </button>
              </div>
            )}

            {/* Answer Input */}
            <div>
              {responseMode === 'text' && (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Answer:
                  </label>
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    rows={10}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Type your detailed answer here... Be specific and provide examples where applicable."
                    disabled={showEvaluation || submitting || uploadingAudio || uploadingVideo}
                  />
                </>
              )}
            </div>

            {/* Audio Recorder */}
            {responseMode === 'audio' && !currentQ.answer && (
              <div className="mt-4">
                <AudioRecorder
                  isRecording={audioRecorder.isRecording}
                  isPaused={audioRecorder.isPaused}
                  recordingTime={audioRecorder.recordingTime}
                  audioUrl={audioRecorder.audioUrl}
                  onStartRecording={audioRecorder.startRecording}
                  onStopRecording={audioRecorder.stopRecording}
                  onPauseRecording={audioRecorder.pauseRecording}
                  onResumeRecording={audioRecorder.resumeRecording}
                  onClearRecording={audioRecorder.clearRecording}
                  onSubmitRecording={handleSubmitAudioAnswer}
                  disabled={showEvaluation || submitting || uploadingAudio}
                  error={audioRecorder.error}
                />
              </div>
            )}

            {/* Video Recorder */}
            {responseMode === 'video' && !currentQ.answer && (
              <div className="mt-4">
                <VideoRecorder
                  isRecording={videoRecorder.isRecording}
                  isPaused={videoRecorder.isPaused}
                  recordingTime={videoRecorder.recordingTime}
                  videoUrl={videoRecorder.videoUrl}
                  previewStream={videoRecorder.previewStream}
                  onStartRecording={videoRecorder.startRecording}
                  onStopRecording={videoRecorder.stopRecording}
                  onPauseRecording={videoRecorder.pauseRecording}
                  onResumeRecording={videoRecorder.resumeRecording}
                  onClearRecording={videoRecorder.clearRecording}
                  onSubmitRecording={handleSubmitVideoAnswer}
                  disabled={showEvaluation || submitting || uploadingVideo}
                  error={videoRecorder.error}
                />
              </div>
            )}

            {/* Evaluation Feedback */}
            {showEvaluation && evaluation && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">AI Evaluation</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Score:</span>
                    <span className="font-bold text-blue-600">{evaluation.score}/10</span>
                  </div>
                  <p className="text-sm text-gray-700">{evaluation.feedback}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            {!showEvaluation && !currentQ.answer && responseMode === 'text' && (
              <div className="mt-4">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={submitting || uploadingAudio || uploadingVideo || !currentAnswer.trim()}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {submitting ? 'Evaluating...' : 
                   uploadingAudio ? 'Uploading Audio...' : 
                   uploadingVideo ? 'Uploading Video...' :
                   'Submit Answer & Get AI Feedback'}
                </button>

                {(uploadingAudio || uploadingVideo) && (
                  <p className="text-sm text-gray-600 text-center mt-2">
                    Processing your {uploadingAudio ? 'audio' : 'video'} response...
                  </p>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0 || showEvaluation}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              
              {currentQ.answer && !showEvaluation && (
                <button
                  onClick={handleNextQuestion}
                  disabled={currentQuestion === session.questions.length - 1}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {currentQuestion === session.questions.length - 1 ? 'All Done!' : 'Next Question →'}
                </button>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
        </div>
      </main>

      {/* Session Info Footer */}
      <footer className="bg-white shadow-inner mt-8 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Started: {new Date(session.startedAt).toLocaleString()}</span>
            <span>Answered: {session.answeredQuestions}/{session.totalQuestions}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function InterviewSessionWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <InterviewSessionPage />
    </Suspense>
  );
}

export default InterviewSessionWrapper;
