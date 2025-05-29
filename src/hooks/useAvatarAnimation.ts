import { useState, useEffect } from 'react';

// Animation states for avatar
export type AvatarAnimationState = 'idle' | 'talking' | 'listening';

interface AvatarAnimationHook {
  animationState: AvatarAnimationState;
  setTalking: (isTalking: boolean) => void;
  setListening: (isListening: boolean) => void;
}

export const useAvatarAnimation = (initialState: AvatarAnimationState = 'idle'): AvatarAnimationHook => {
  const [animationState, setAnimationState] = useState<AvatarAnimationState>(initialState);
  const [isTalking, setIsTalking] = useState(false);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (isTalking) {
      setAnimationState('talking');
    } else if (isListening) {
      setAnimationState('listening');
    } else {
      setAnimationState('idle');
    }
  }, [isTalking, isListening]);

  const setTalking = (talking: boolean) => {
    setIsTalking(talking);
    if (talking) {
      setIsListening(false);
    }
  };

  const setListening = (listening: boolean) => {
    setIsListening(listening);
    if (listening) {
      setIsTalking(false);
    }
  };

  return {
    animationState,
    setTalking,
    setListening,
  };
};
