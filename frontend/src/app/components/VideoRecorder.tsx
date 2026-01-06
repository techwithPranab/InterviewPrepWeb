'use client';

import { useEffect, useRef } from 'react';
import { Video, Square, Pause, Play, Trash2, Send, Camera } from 'lucide-react';

interface VideoRecorderProps {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  videoUrl: string | null;
  previewStream: MediaStream | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  onClearRecording: () => void;
  onSubmitRecording: () => void;
  disabled?: boolean;
  error?: string | null;
}

export const VideoRecorder: React.FC<VideoRecorderProps> = ({
  isRecording,
  isPaused,
  recordingTime,
  videoUrl,
  previewStream,
  onStartRecording,
  onStopRecording,
  onPauseRecording,
  onResumeRecording,
  onClearRecording,
  onSubmitRecording,
  disabled = false,
  error = null
}) => {
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const playbackVideoRef = useRef<HTMLVideoElement>(null);

  // Setup preview stream
  useEffect(() => {
    if (previewVideoRef.current && previewStream) {
      previewVideoRef.current.srcObject = previewStream;
    }
  }, [previewStream]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Video className="w-4 h-4" />
          Video Response
        </h3>
        {isRecording && (
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
            <span className="text-sm font-mono text-gray-700">
              {formatTime(recordingTime)}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {/* Video Preview/Playback */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
          {!isRecording && !videoUrl && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Camera className="w-16 h-16 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Camera preview will appear here</p>
              </div>
            </div>
          )}

          {isRecording && (
            <video
              ref={previewVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          )}

          {videoUrl && !isRecording && (
            <video
              ref={playbackVideoRef}
              src={videoUrl}
              controls
              playsInline
              className="w-full h-full object-cover"
            />
          )}

          {isRecording && (
            <div className="absolute top-4 left-4 px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              REC
            </div>
          )}
        </div>

        {/* Recording Controls */}
        <div className="flex items-center gap-2">
          {!isRecording && !videoUrl && (
            <button
              onClick={onStartRecording}
              disabled={disabled}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Video className="w-5 h-5" />
              Start Video Recording
            </button>
          )}

          {isRecording && (
            <>
              {!isPaused ? (
                <button
                  onClick={onPauseRecording}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  <Pause className="w-5 h-5" />
                  Pause
                </button>
              ) : (
                <button
                  onClick={onResumeRecording}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Play className="w-5 h-5" />
                  Resume
                </button>
              )}

              <button
                onClick={onStopRecording}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Square className="w-5 h-5" />
                Stop
              </button>
            </>
          )}
        </div>

        {/* Playback Actions */}
        {videoUrl && !isRecording && (
          <div className="flex items-center gap-2">
            <button
              onClick={onClearRecording}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear & Re-record
            </button>

            <button
              onClick={onSubmitRecording}
              disabled={disabled}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
              Submit Video
            </button>
          </div>
        )}

        {/* Help Text */}
        <p className="text-xs text-gray-500 text-center">
          {!isRecording && !videoUrl && 'Click "Start Video Recording" to record your video response'}
          {isRecording && 'Recording in progress... Click "Stop" when finished'}
          {videoUrl && !isRecording && 'Review your video and submit or re-record'}
        </p>

        {/* Browser Compatibility Notice */}
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-xs text-blue-700">
            <strong>Note:</strong> Video recording requires camera and microphone permissions. 
            Make sure to allow access when prompted.
          </p>
        </div>
      </div>
    </div>
  );
};
