import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';

interface AudioContextType {
  isBgmPlaying: boolean;
  isMuted: boolean;
  bgmVolume: number;
  toggleBGM: () => void;
  toggleMute: () => void;
  setBgmVolume: (volume: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

interface AudioProviderProps {
  children: ReactNode;
}

export const AudioProvider = ({ children }: AudioProviderProps) => {
  const [isBgmPlaying, setIsBgmPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [bgmVolume, setBgmVolume] = useState(0.3);
  const bgmAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize BGM audio
  useEffect(() => {
    try {
      bgmAudioRef.current = new Audio('/sounds/bgm.mp3');
      bgmAudioRef.current.volume = bgmVolume;
      bgmAudioRef.current.loop = true;
      bgmAudioRef.current.preload = 'none';
    } catch (error) {
      console.warn('BGM initialization failed:', error);
    }

    return () => {
      if (bgmAudioRef.current) {
        bgmAudioRef.current.pause();
      }
    };
  }, []);

  // Update volume when it changes
  useEffect(() => {
    if (bgmAudioRef.current) {
      bgmAudioRef.current.volume = isMuted ? 0 : bgmVolume;
    }
  }, [bgmVolume, isMuted]);

  const toggleBGM = () => {
    if (isBgmPlaying) {
      if (bgmAudioRef.current) {
        bgmAudioRef.current.pause();
      }
      setIsBgmPlaying(false);
    } else {
      try {
        if (bgmAudioRef.current) {
          bgmAudioRef.current.volume = isMuted ? 0 : bgmVolume;
          bgmAudioRef.current.play().catch(console.error);
          setIsBgmPlaying(true);
        }
      } catch (error) {
        console.warn('BGM play error:', error);
      }
    }
  };

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (bgmAudioRef.current) {
      bgmAudioRef.current.volume = newMutedState ? 0 : bgmVolume;
    }
  };

  const handleSetBgmVolume = (volume: number) => {
    setBgmVolume(volume);
    if (bgmAudioRef.current) {
      bgmAudioRef.current.volume = isMuted ? 0 : volume;
    }
  };

  return (
    <AudioContext.Provider
      value={{
        isBgmPlaying,
        isMuted,
        bgmVolume,
        toggleBGM,
        toggleMute,
        setBgmVolume: handleSetBgmVolume,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
