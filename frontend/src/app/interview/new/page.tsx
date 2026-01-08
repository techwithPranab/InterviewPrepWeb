'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  profile: {
    experience: string;
    skills: string[];
  };
}

interface Skill {
  _id: string;
  name: string;
  category: string;
  description?: string;
}

export default function NewInterviewPage() {
  const [user, setUser] = useState<User | null>(null);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const [interviewConfig, setInterviewConfig] = useState({
    selectedSkills: [] as string[],
    duration: '30',
    difficulty: 'intermediate',
    includeBehavioral: true,
    includeTechnical: true,
    interviewType: 'online', // online or in-person
    scheduledFor: '', // for in-person interviews
    meetingLink: '' // for online interviews
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchUserProfile();
    fetchAvailableSkills();
  }, [router]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.getCurrentUser();

      if (response.success) {
        setUser(response.data?.user);
        // Pre-select user's skills
        setInterviewConfig(prev => ({
          ...prev,
          selectedSkills: response.data?.user?.profile?.skills || []
        }));
      } else if (response.message?.includes('401') || response.message?.includes('Unauthorized')) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSkills = async () => {
    try {
      const response = await api.get('/skills');
      if (response.success) {
        setAvailableSkills(response.data || []);
      } else {
        console.error('Error fetching skills:', response.message);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const handleSkillToggle = (skillName: string) => {
    setInterviewConfig(prev => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(skillName)
        ? prev.selectedSkills.filter(s => s !== skillName)
        : [...prev.selectedSkills, skillName]
    }));
  };

  const handleStartInterview = async () => {
    if (interviewConfig.selectedSkills.length === 0) {
      alert('Please select at least one skill for the interview.');
      return;
    }

    setCreating(true);

    try {
      // Calculate question count based on duration
      const questionCount = Math.ceil(parseInt(interviewConfig.duration) / 5);

      // Create interview session via API
      const response = await api.post('/interview/create', {
        title: `MeritAI Interview - ${new Date().toLocaleDateString()}`,
        skills: interviewConfig.selectedSkills,
        duration: parseInt(interviewConfig.duration),
        difficulty: interviewConfig.difficulty,
        type: interviewConfig.includeTechnical && interviewConfig.includeBehavioral
          ? 'mixed'
          : interviewConfig.includeTechnical
            ? 'technical'
            : 'behavioral',
        questionCount
      });

      if (response.success) {
        // Store session ID and navigate to session
        localStorage.setItem('currentInterviewId', response.data?.session?._id);
        localStorage.removeItem('currentInterview'); // Clean up old localStorage data

        // Navigate to interview session with the session ID
        router.push(`/interview/session?id=${response.data?.session?._id}`);
      } else {
        throw new Error(response.message || 'Failed to create interview session');
      }
    } catch (error) {
      console.error('Error starting interview:', error);
      alert('Failed to start interview. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Start New Interview</h2>
            <p className="mt-2 text-gray-600">
              Configure your mock interview settings and begin your practice session.
            </p>
          </div>

          <div className="bg-white shadow rounded-lg p-6 space-y-8">
            {/* Skills Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Select Skills to Interview On
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Choose the skills you want to be questioned about during the interview.
              </p>
              {availableSkills.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {availableSkills.map((skill) => (
                    <label
                      key={skill._id}
                      className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={interviewConfig.selectedSkills.includes(skill.name)}
                        onChange={() => handleSkillToggle(skill.name)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {skill.name}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No skills available.</p>
                  <Link 
                    href="/profile" 
                    className="text-blue-600 hover:text-blue-500 mt-2 inline-block"
                  >
                    Update your profile to add skills
                  </Link>
                </div>
              )}
            </div>

            {/* Interview Type Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Interview Type
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Choose between AI-driven online interview or live in-person session.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  interviewConfig.interviewType === 'online' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name="interviewType"
                    value="online"
                    checked={interviewConfig.interviewType === 'online'}
                    onChange={(e) => setInterviewConfig({ ...interviewConfig, interviewType: e.target.value })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Online Interview (AI-Driven)
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      AI generates questions and provides automated assessment
                    </div>
                  </div>
                </label>

                <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  interviewConfig.interviewType === 'in-person' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}>
                  <input
                    type="radio"
                    name="interviewType"
                    value="in-person"
                    checked={interviewConfig.interviewType === 'in-person'}
                    onChange={(e) => setInterviewConfig({ ...interviewConfig, interviewType: e.target.value })}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      In-Person Interview (Live)
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Schedule a live video session with an interviewer
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Interview Duration */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Interview Duration
              </h3>
              <select
                value={interviewConfig.duration}
                onChange={(e) => setInterviewConfig({ ...interviewConfig, duration: e.target.value })}
                className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
              </select>
            </div>

            {/* Difficulty Level */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Difficulty Level
              </h3>
              <div className="space-y-2">
                {['beginner', 'intermediate', 'advanced'].map((level) => (
                  <label key={level} className="flex items-center">
                    <input
                      type="radio"
                      name="difficulty"
                      value={level}
                      checked={interviewConfig.difficulty === level}
                      onChange={(e) => setInterviewConfig({ ...interviewConfig, difficulty: e.target.value })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700 capitalize">
                      {level}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Question Types */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Question Types
              </h3>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={interviewConfig.includeTechnical}
                    onChange={(e) => setInterviewConfig({ ...interviewConfig, includeTechnical: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Technical Questions
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={interviewConfig.includeBehavioral}
                    onChange={(e) => setInterviewConfig({ ...interviewConfig, includeBehavioral: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Behavioral Questions
                  </span>
                </label>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Interview Summary</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  <strong>Skills:</strong> {interviewConfig.selectedSkills.length > 0 
                    ? interviewConfig.selectedSkills.join(', ') 
                    : 'None selected'}
                </li>
                <li><strong>Duration:</strong> {interviewConfig.duration} minutes</li>
                <li><strong>Difficulty:</strong> {interviewConfig.difficulty}</li>
                <li>
                  <strong>Question Types:</strong> {
                    [
                      interviewConfig.includeTechnical && 'Technical',
                      interviewConfig.includeBehavioral && 'Behavioral'
                    ].filter(Boolean).join(', ') || 'None selected'
                  }
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <Link
                href="/dashboard"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                onClick={handleStartInterview}
                disabled={creating || interviewConfig.selectedSkills.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Starting...' : 'Start Interview'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
