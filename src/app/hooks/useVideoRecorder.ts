'use client';

import { useState, useRef, useCallback } from 'react';

interface UseVideoRecorderOptions {
  onRecordingComplete?: (videoBlob: Blob, videoDuration: number) => void;
  onError?: (error: Error) => void;
}

interface UseVideoRecorderReturn {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  videoBlob: Blob | null;
  videoUrl: string | null;
  previewStream: MediaStream | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  clearRecording: () => void;
  error: string | null;
}

export const useVideoRecorder = (
  options: UseVideoRecorderOptions = {}
): UseVideoRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now() - pausedTimeRef.current;
    timerIntervalRef.current = setInterval(() => {
      setRecordingTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      videoChunksRef.current = [];

      // Request camera and microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      streamRef.current = stream;
      setPreviewStream(stream);

      // Create MediaRecorder instance
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4';

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 2500000 // 2.5 Mbps
      });

      mediaRecorderRef.current = mediaRecorder;

      // Handle data available event
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop event
      mediaRecorder.onstop = () => {
        const videoBlob = new Blob(videoChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(videoBlob);

        setVideoBlob(videoBlob);
        setVideoUrl(url);

        if (options.onRecordingComplete) {
          options.onRecordingComplete(videoBlob, recordingTime);
        }

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        setPreviewStream(null);
      };

      // Handle errors
      mediaRecorder.onerror = (event: Event) => {
        const error = new Error('Video recording error occurred');
        setError(error.message);
        if (options.onError) {
          options.onError(error);
        }
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setIsPaused(false);
      pausedTimeRef.current = 0;
      setRecordingTime(0);
      startTimer();

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to start video recording');
      setError(error.message);
      if (options.onError) {
        options.onError(error);
      }
    }
  }, [options, recordingTime, startTimer]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      stopTimer();
    }
  }, [isRecording, stopTimer]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      pausedTimeRef.current = Date.now() - startTimeRef.current;
      stopTimer();
    }
  }, [isRecording, isPaused, stopTimer]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      startTimer();
    }
  }, [isRecording, isPaused, startTimer]);

  const clearRecording = useCallback(() => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setVideoBlob(null);
    setVideoUrl(null);
    setPreviewStream(null);
    setRecordingTime(0);
    pausedTimeRef.current = 0;
    videoChunksRef.current = [];
  }, [videoUrl]);

  return {
    isRecording,
    isPaused,
    recordingTime,
    videoBlob,
    videoUrl,
    previewStream,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
    error
  };
};
