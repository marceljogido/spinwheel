import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { 
  Volume2, 
  VolumeX, 
  Music, 
  Music2, 
  Settings,
  Play,
  Pause
} from 'lucide-react';

interface AudioManagerProps {
  onSpinStart?: () => void;
  onWin?: () => void;
}

export const AudioManager = ({ onSpinStart, onWin }: AudioManagerProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.7);
  const [bgmVolume, setBgmVolume] = useState(0.5);
  const [isBgmPlaying, setIsBgmPlaying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Audio refs
  const spinAudioRef = useRef<HTMLAudioElement | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);
  const bgmAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements
  useEffect(() => {
    try {
      // Create audio elements
      spinAudioRef.current = new Audio();
      winAudioRef.current = new Audio();
      bgmAudioRef.current = new Audio();

      // Set audio properties
      if (spinAudioRef.current) {
        spinAudioRef.current.volume = masterVolume;
        spinAudioRef.current.loop = false;
        spinAudioRef.current.preload = 'none';
      }

      if (winAudioRef.current) {
        winAudioRef.current.volume = masterVolume;
        winAudioRef.current.loop = false;
        winAudioRef.current.preload = 'none';
      }

      if (bgmAudioRef.current) {
        bgmAudioRef.current.volume = bgmVolume;
        bgmAudioRef.current.loop = true;
        bgmAudioRef.current.preload = 'none';
      }
    } catch (error) {
      console.warn('Audio initialization failed:', error);
    }

    // Cleanup
    return () => {
      if (spinAudioRef.current) spinAudioRef.current.pause();
      if (winAudioRef.current) winAudioRef.current.pause();
      if (bgmAudioRef.current) bgmAudioRef.current.pause();
    };
  }, []);

  // Update volumes when they change
  useEffect(() => {
    if (spinAudioRef.current) {
      spinAudioRef.current.volume = isMuted ? 0 : masterVolume;
    }
    if (winAudioRef.current) {
      winAudioRef.current.volume = isMuted ? 0 : masterVolume;
    }
    if (bgmAudioRef.current) {
      bgmAudioRef.current.volume = isMuted ? 0 : bgmVolume;
    }
  }, [masterVolume, bgmVolume, isMuted]);

  // Play spin sound
  const playSpinSound = () => {
    if (!isMuted) {
      try {
        const audio = new Audio('/sounds/spin.mp3');
        audio.volume = masterVolume;
        audio.play().catch(console.error);
      } catch (error) {
        console.warn('Spin sound error:', error);
      }
    }
    onSpinStart?.();
  };

  // Play win sound
  const playWinSound = () => {
    if (!isMuted) {
      try {
        const audio = new Audio('/sounds/win.mp3');
        audio.volume = masterVolume;
        audio.play().catch(console.error);
      } catch (error) {
        console.warn('Win sound error:', error);
      }
    }
    onWin?.();
  };

  // Toggle BGM
  const toggleBGM = () => {
    if (isBgmPlaying) {
      if (bgmAudioRef.current) {
        bgmAudioRef.current.pause();
      }
      setIsBgmPlaying(false);
    } else {
      try {
        const audio = new Audio('/sounds/bgm.mp3');
        audio.volume = bgmVolume;
        audio.loop = true;
        audio.play().catch(console.error);
        bgmAudioRef.current = audio;
        setIsBgmPlaying(true);
      } catch (error) {
        console.warn('BGM error:', error);
      }
    }
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (isBgmPlaying && bgmAudioRef.current) {
      if (!isMuted) {
        bgmAudioRef.current.pause();
        setIsBgmPlaying(false);
      } else {
        bgmAudioRef.current.play().catch(console.error);
        setIsBgmPlaying(true);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Audio Controls */}
      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleMute}
          className="flex items-center gap-2"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          {isMuted ? 'Unmute' : 'Mute'}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={toggleBGM}
          className="flex items-center gap-2"
        >
          {isBgmPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isBgmPlaying ? 'Stop BGM' : 'Play BGM'}
        </Button>
      </div>

      {/* Audio Settings */}
      <div className="space-y-6">
        {/* Master Volume */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Master Volume
            </Label>
            <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
              {Math.round(masterVolume * 100)}%
            </span>
          </div>
          <Slider
            value={[masterVolume]}
            onValueChange={(value) => setMasterVolume(value[0])}
            max={1}
            min={0}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* BGM Volume */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Music className="w-4 h-4" />
              Background Music Volume
            </Label>
            <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
              {Math.round(bgmVolume * 100)}%
            </span>
          </div>
          <Slider
            value={[bgmVolume]}
            onValueChange={(value) => setBgmVolume(value[0])}
            max={1}
            min={0}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Sound Effects Toggle */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="space-y-1">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Music2 className="w-4 h-4" />
              Sound Effects
            </Label>
            <p className="text-xs text-muted-foreground">
              Suara saat spin dan menang hadiah
            </p>
          </div>
          <Switch
            checked={!isMuted}
            onCheckedChange={setIsMuted}
          />
        </div>

        {/* Background Music Toggle */}
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="space-y-1">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Music className="w-4 h-4" />
              Background Music
            </Label>
            <p className="text-xs text-muted-foreground">
              Musik latar belakang yang berulang
            </p>
          </div>
          <Switch
            checked={isBgmPlaying}
            onCheckedChange={toggleBGM}
          />
        </div>

        {/* Test Audio Buttons */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Test Audio</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const audio = new Audio('/sounds/spin.mp3');
                audio.volume = masterVolume;
                audio.play().catch(console.error);
              }}
              className="flex items-center gap-2"
            >
              <Play className="w-3 h-3" />
              Test Spin
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const audio = new Audio('/sounds/win.mp3');
                audio.volume = masterVolume;
                audio.play().catch(console.error);
              }}
              className="flex items-center gap-2"
            >
              <Play className="w-3 h-3" />
              Test Win
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const audio = new Audio('/sounds/bgm.mp3');
                audio.volume = bgmVolume;
                audio.play().catch(console.error);
              }}
              className="flex items-center gap-2"
            >
              <Play className="w-3 h-3" />
              Test BGM
            </Button>
          </div>
        </div>

        {/* Tips */}
        <div className="text-xs text-muted-foreground p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="font-medium text-blue-700 dark:text-blue-300 mb-2">💡 Tips Penggunaan Audio:</p>
          <ul className="space-y-1 text-blue-600 dark:text-blue-400">
            <li>• Upload file audio di folder <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">public/sounds/</code></li>
            <li>• <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">spin.mp3</code> - untuk suara roda berputar</li>
            <li>• <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">win.mp3</code> - untuk suara menang hadiah</li>
            <li>• <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">bgm.mp3</code> - untuk background music</li>
            <li>• Format yang didukung: MP3, WAV, OGG</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Export functions untuk digunakan di komponen lain
export const useAudio = () => {
  const audioManagerRef = useRef<{
    playSpinSound: () => void;
    playWinSound: () => void;
  } | null>(null);

  const playSpinSound = () => {
    audioManagerRef.current?.playSpinSound();
  };

  const playWinSound = () => {
    audioManagerRef.current?.playWinSound();
  };

  return {
    audioManagerRef,
    playSpinSound,
    playWinSound
  };
}; 