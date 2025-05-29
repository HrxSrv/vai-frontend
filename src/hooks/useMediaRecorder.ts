import { useState, useRef, useEffect, useCallback } from 'react';
import { useSession } from '../context/SessionContext';

interface MediaRecorderHook {
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  isRecording: boolean;
  recordingTime: number;
  videoStream: MediaStream | null;
  videoRef: React.RefObject<HTMLVideoElement>;
  error: string | null;
}

export const useMediaRecorder = (): MediaRecorderHook => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const recordedChunks = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  
  const { logActivity } = useSession();

  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    
    const startTime = Date.now();
    
    timerRef.current = window.setInterval(() => {
      setRecordingTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
      stopTimer();
    };
  }, [videoStream, stopTimer]);

  const startRecording = async (): Promise<void> => {
    try {
      setError(null);
      recordedChunks.current = [];
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        },
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }
      });
      
      setVideoStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Check supported MIME types and use the best available
      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8,opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }
      }
      
      mediaRecorder.current = new MediaRecorder(stream, {
        mimeType: mimeType
      });
      
      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };
      
      mediaRecorder.current.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('Recording error occurred');
      };
      
      mediaRecorder.current.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);
      startTimer();
      
      await logActivity('recording_start');
      await logActivity('camera_permission_granted');
      await logActivity('microphone_permission_granted');
      
    } catch (err: any) {
      console.error('Error starting recording:', err);
      
      let errorMessage = 'Failed to start recording';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera and microphone access denied. Please allow permissions.';
        await logActivity('camera_permission_denied');
        await logActivity('microphone_permission_denied');
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera or microphone found.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Camera or microphone is already in use.';
      }
      
      setError(errorMessage);
    }
  };

  const stopRecording = async (): Promise<Blob | null> => {
    if (!mediaRecorder.current || mediaRecorder.current.state === 'inactive') {
      return null;
    }
    
    return new Promise<Blob | null>((resolve) => {
      if (!mediaRecorder.current) {
        resolve(null);
        return;
      }
      
      mediaRecorder.current.onstop = async () => {
        // Stop all tracks
        if (videoStream) {
          videoStream.getTracks().forEach(track => {
            track.stop();
          });
        }
        
        setVideoStream(null);
        setIsRecording(false);
        stopTimer();
        
        if (recordedChunks.current.length > 0) {
          const blob = new Blob(recordedChunks.current, {
            type: 'video/webm'
          });
          
          console.log(`Recording stopped. Blob size: ${blob.size} bytes`);
          await logActivity('recording_stop', {
            duration: recordingTime,
            fileSize: blob.size
          });
          
          resolve(blob);
        } else {
          console.warn('No recorded chunks available');
          resolve(null);
        }
        
        // Clear the video element
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };
      
      try {
        mediaRecorder.current.stop();
      } catch (err) {
        console.error('Error stopping recorder:', err);
        resolve(null);
      }
    });
  };

  return {
    startRecording,
    stopRecording,
    isRecording,
    recordingTime,
    videoStream,
    videoRef,
    error
  };
};
