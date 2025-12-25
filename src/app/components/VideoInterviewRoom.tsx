'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface VideoInterviewRoomProps {
  sessionId: string;
  userRole: 'interviewer' | 'candidate';
  userName: string;
  onEndCall?: () => void;
}

interface AISuggestion {
  type: 'follow_up' | 'assessment' | 'next_question' | 'concern';
  content: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: Date;
}

interface CallState {
  isConnected: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  participants: string[];
  duration: number;
}

export default function VideoInterviewRoom({
  sessionId,
  userRole,
  userName,
  onEndCall
}: VideoInterviewRoomProps) {
  const [callState, setCallState] = useState<CallState>({
    isConnected: false,
    isMuted: false,
    isVideoOff: false,
    isScreenSharing: false,
    participants: [userName],
    duration: 0
  });
  
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [sessionNotes, setSessionNotes] = useState<string[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'failed' | 'disconnected'>('connecting');
  
  // Video refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callState.isConnected) {
      interval = setInterval(() => {
        setCallState(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callState.isConnected]);

  // Initialize WebRTC
  const initializeWebRTC = useCallback(async () => {
    try {
      setConnectionStatus('connecting');
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const configuration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };
      
      const peerConnection = new RTCPeerConnection(configuration);
      peerConnectionRef.current = peerConnection;

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Handle connection state
      peerConnection.onconnectionstatechange = () => {
        const state = peerConnection.connectionState;
        if (state === 'connected') {
          setConnectionStatus('connected');
          setCallState(prev => ({ ...prev, isConnected: true }));
        } else if (state === 'failed' || state === 'disconnected') {
          setConnectionStatus('failed');
          setCallState(prev => ({ ...prev, isConnected: false }));
        }
      };

      // For demo purposes, simulate connection after 2 seconds
      setTimeout(() => {
        setConnectionStatus('connected');
        setCallState(prev => ({ ...prev, isConnected: true }));
      }, 2000);

    } catch (error) {
      console.error('Error initializing WebRTC:', error);
      setConnectionStatus('failed');
    }
  }, []);

  useEffect(() => {
    initializeWebRTC();
    
    // Cleanup on unmount
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [initializeWebRTC]);

  // Generate AI suggestions for interviewers
  const generateAISuggestion = useCallback(async () => {
    if (userRole !== 'interviewer') return;
    
    try {
      const response = await fetch(`/api/interview/${sessionId}/ai-suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: 'live_interview',
          duration: callState.duration,
          notes: sessionNotes
        })
      });

      if (response.ok) {
        const suggestion = await response.json();
        setAiSuggestions(prev => [...prev, {
          type: suggestion.type,
          content: suggestion.content,
          priority: suggestion.priority,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error generating AI suggestion:', error);
    }
  }, [sessionId, userRole, callState.duration, sessionNotes]);

  // Auto-generate suggestions every 2 minutes for interviewers
  useEffect(() => {
    if (userRole === 'interviewer' && callState.isConnected) {
      const interval = setInterval(generateAISuggestion, 120000); // 2 minutes
      return () => clearInterval(interval);
    }
  }, [userRole, callState.isConnected, generateAISuggestion]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = callState.isMuted;
      });
      setCallState(prev => ({ ...prev, isMuted: !prev.isMuted }));
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = callState.isVideoOff;
      });
      setCallState(prev => ({ ...prev, isVideoOff: !prev.isVideoOff }));
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!callState.isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        // Replace video track with screen share
        if (peerConnectionRef.current) {
          const sender = peerConnectionRef.current.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          if (sender) {
            await sender.replaceTrack(screenStream.getVideoTracks()[0]);
          }
        }
        
        setCallState(prev => ({ ...prev, isScreenSharing: true }));
      } else {
        // Go back to camera
        if (localStreamRef.current && peerConnectionRef.current) {
          const videoTrack = localStreamRef.current.getVideoTracks()[0];
          const sender = peerConnectionRef.current.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          );
          if (sender && videoTrack) {
            await sender.replaceTrack(videoTrack);
          }
        }
        setCallState(prev => ({ ...prev, isScreenSharing: false }));
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  };

  const addNote = () => {
    if (currentNote.trim()) {
      setSessionNotes(prev => [...prev, `${new Date().toLocaleTimeString()}: ${currentNote}`]);
      setCurrentNote('');
    }
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    setCallState(prev => ({ ...prev, isConnected: false }));
    onEndCall?.();
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'follow_up': return '🤔';
      case 'assessment': return '📊';
      case 'next_question': return '❓';
      case 'concern': return '⚠️';
      default: return '💡';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  if (connectionStatus === 'connecting') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Connecting to Interview Room...</h2>
          <p className="text-gray-400">Setting up your camera and microphone</p>
        </div>
      </div>
    );
  }

  if (connectionStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">Connection Failed</h2>
          <p className="text-gray-400 mb-4">Unable to connect to the interview room</p>
          <button
            onClick={initializeWebRTC}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-white font-semibold">Live Interview</span>
            </div>
            <span className="text-gray-400">Duration: {formatDuration(callState.duration)}</span>
            <span className="text-gray-400">Participants: {callState.participants.length}</span>
          </div>
          
          {userRole === 'interviewer' && (
            <button
              onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
            >
              <span>🤖</span>
              <span>AI Assistant</span>
            </button>
          )}
        </div>

        {/* Video Grid */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            {/* Remote Video */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                {userRole === 'interviewer' ? 'Candidate' : 'Interviewer'}
              </div>
            </div>
            
            {/* Local Video */}
            <div className="relative bg-gray-700 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${callState.isVideoOff ? 'opacity-0' : ''}`}
              />
              {callState.isVideoOff && (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl">👤</span>
                    </div>
                    <p>Camera Off</p>
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                You ({userName})
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 p-4">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={toggleMute}
              className={`p-3 rounded-full ${callState.isMuted ? 'bg-red-600' : 'bg-gray-600'} hover:opacity-80 text-white`}
            >
              {callState.isMuted ? '🔇' : '🎤'}
            </button>
            
            <button
              onClick={toggleVideo}
              className={`p-3 rounded-full ${callState.isVideoOff ? 'bg-red-600' : 'bg-gray-600'} hover:opacity-80 text-white`}
            >
              {callState.isVideoOff ? '📹' : '📹'}
            </button>
            
            <button
              onClick={toggleScreenShare}
              className={`p-3 rounded-full ${callState.isScreenSharing ? 'bg-blue-600' : 'bg-gray-600'} hover:opacity-80 text-white`}
            >
              🖥️
            </button>
            
            <button
              onClick={endCall}
              className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white"
            >
              📞
            </button>
          </div>
        </div>
      </div>

      {/* AI Assistant Panel (for interviewers) */}
      {userRole === 'interviewer' && isAiPanelOpen && (
        <div className="w-96 bg-white border-l border-gray-300 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
              <span>🤖</span>
              <span>AI Assistant</span>
            </h3>
          </div>
          
          {/* AI Suggestions */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Suggestions</h4>
              {aiSuggestions.slice(-5).map((suggestion, index) => (
                <div
                  key={index}
                  className={`p-3 border-l-4 rounded-r ${getPriorityColor(suggestion.priority)} mb-2`}
                >
                  <div className="flex items-start space-x-2">
                    <span className="text-lg">{getSuggestionIcon(suggestion.type)}</span>
                    <div>
                      <p className="text-sm text-gray-800">{suggestion.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {suggestion.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {aiSuggestions.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  AI suggestions will appear here during the interview
                </p>
              )}
            </div>

            <button
              onClick={generateAISuggestion}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded text-sm"
            >
              Generate New Suggestion
            </button>
          </div>
          
          {/* Notes Section */}
          <div className="p-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Session Notes</h4>
            <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
              {sessionNotes.map((note, index) => (
                <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                  {note}
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addNote()}
                placeholder="Add a note..."
                className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
              />
              <button
                onClick={addNote}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
