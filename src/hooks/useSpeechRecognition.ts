import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from '../context/SessionContext';

interface SpeechRecognitionHook {
  transcript: string;
  isListening: boolean;
  confidence: number;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  resetTranscript: () => void;
  error: string | null;
}

export const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);
  const finalTranscriptRef = useRef(''); // Track final transcript separately
  
  const { logActivity } = useSession();

  useEffect(() => {
    // Check if browser supports SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser');
      return;
    }
    
    if (!isInitializedRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      
      recognition.onstart = () => {
        console.log('Speech recognition started');
        setError(null);
        setIsListening(true);
      };
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        // Process all results from the last processed index
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcriptValue = result[0].transcript;
          
          if (result.isFinal) {
            finalTranscript += transcriptValue;
            setConfidence(result[0].confidence || 0);
          } else {
            interimTranscript += transcriptValue;
          }
        }
        
        // Update final transcript reference
        if (finalTranscript) {
          finalTranscriptRef.current += finalTranscript;
        }
        
        // Set complete transcript (final + interim)
        const completeTranscript = finalTranscriptRef.current + interimTranscript;
        setTranscript(completeTranscript);
      };
      
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        
        // Handle different error types
        switch (event.error) {
          case 'no-speech':
            setError('No speech detected. Please try speaking again.');
            break;
          case 'audio-capture':
            setError('Audio capture failed. Please check your microphone.');
            break;
          case 'not-allowed':
            setError('Microphone access denied. Please allow microphone permissions.');
            break;
          case 'network':
            setError('Network error occurred. Please check your connection.');
            break;
          case 'aborted':
            // Don't show error for intentional stops
            break;
          default:
            setError(`Speech recognition error: ${event.error}`);
        }
        
        setIsListening(false);
      };
      
      recognition.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
      isInitializedRef.current = true;
    }
    
    return () => {
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.warn('Error stopping recognition:', e);
        }
      }
    };
  }, [isListening]);

  const startListening = useCallback(async () => {
    if (!recognitionRef.current) {
      setError('Speech recognition not initialized');
      return;
    }
    
    if (isListening) {
      console.log('Already listening');
      return;
    }
    
    try {
      setError(null);
      startTimeRef.current = Date.now();
      
      // Reset transcript tracking
      finalTranscriptRef.current = transcript;
      
      recognitionRef.current.start();
      await logActivity('voice_input_start');
    } catch (err: any) {
      console.error('Error starting speech recognition:', err);
      setError('Failed to start speech recognition');
      setIsListening(false);
    }
  }, [isListening, logActivity, transcript]);

  const stopListening = useCallback(async () => {
    if (!recognitionRef.current || !isListening) {
      return;
    }
    
    try {
      recognitionRef.current.stop();
      
      const duration = startTimeRef.current 
        ? Math.floor((Date.now() - startTimeRef.current) / 1000)
        : 0;
      
      await logActivity('voice_input_end', {
        duration,
        confidence,
        transcriptLength: transcript.length
      });
      
      startTimeRef.current = null;
    } catch (err) {
      console.error('Error stopping speech recognition:', err);
    }
  }, [isListening, transcript, confidence, logActivity]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setConfidence(0);
    finalTranscriptRef.current = '';
  }, []);

  return {
    transcript,
    isListening,
    confidence,
    startListening,
    stopListening,
    resetTranscript,
    error
  };
};