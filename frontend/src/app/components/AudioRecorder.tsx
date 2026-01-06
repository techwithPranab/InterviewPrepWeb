'use client';

import React from 'react';
import { Mic, Square, Pause, Play, Trash2, Send } from 'lucide-react';

interface AudioRecorderProps {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  audioUrl: string | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
  onClearRecording: () => void;
  onSubmitRecording: () => void;
  disabled?: boolean;
  error?: string | null;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  isRecording,
  isPaused,
  recordingTime,
  audioUrl,
  onStartRecording,
  onStopRecording,
  onPauseRecording,
  onResumeRecording,
  onClearRecording,
  onSubmitRecording,
  disabled = false,
  error = null
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Mic className="w-4 h-4" />
          Voice Response
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
        {/* Recording Controls */}
        <div className="flex items-center gap-2">
          {!isRecording && !audioUrl && (
            <button
              onClick={onStartRecording}
              disabled={disabled}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Mic className="w-5 h-5" />
              Start Recording
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

        {/* Audio Playback */}
        {audioUrl && !isRecording && (
          <div className="space-y-3">
            <audio
              src={audioUrl}
              controls
              className="w-full"
              style={{ height: '40px' }}
            />
            
            <div className="flex items-center gap-2">
              <button
                onClick={onClearRecording}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
              
              <button
                onClick={onSubmitRecording}
                disabled={disabled}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
                Submit Audio
              </button>
            </div>
          </div>
        )}

        {/* Help Text */}
        <p className="text-xs text-gray-500 text-center">
          {!isRecording && !audioUrl && 'Click "Start Recording" to record your voice response'}
          {isRecording && 'Recording in progress... Click "Stop" when finished'}
          {audioUrl && !isRecording && 'Review your recording and submit or re-record'}
        </p>
      </div>
    </div>
  );
};
