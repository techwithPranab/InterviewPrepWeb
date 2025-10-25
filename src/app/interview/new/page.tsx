'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
    includeaBehavioral: true,
    includeTechnical: true
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
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        // Pre-select user's skills
        setInterviewConfig(prev => ({
          ...prev,
          selectedSkills: data.user.profile.skills
        }));
      } else if (response.status === 401) {
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
      const response = await fetch('/api/skills');
      if (response.ok) {
        const data = await response.json();
        setAvailableSkills(data.skills || []);
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
      // For now, we'll just navigate to a mock interview session
      // In the future, this would create an interview session in the backend
      const sessionData = {
        skills: interviewConfig.selectedSkills,
        duration: parseInt(interviewConfig.duration),
        difficulty: interviewConfig.difficulty,
        includeBehavioral: interviewConfig.includeaBehavioral,
        includeTechnical: interviewConfig.includeTechnical,
        startTime: new Date().toISOString()
      };

      // Store session data temporarily in localStorage
      localStorage.setItem('currentInterview', JSON.stringify(sessionData));
      
      // Navigate to interview session
      router.push('/interview/session');
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
            <h2 className="text-3xl font-bold text-gray-900">Start New Interview</h2>
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
                    checked={interviewConfig.includeaBehavioral}
                    onChange={(e) => setInterviewConfig({ ...interviewConfig, includeaBehavioral: e.target.checked })}
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
                      interviewConfig.includeaBehavioral && 'Behavioral'
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
