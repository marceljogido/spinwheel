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
    // Create audio elements
    spinAudioRef.current = new Audio();
    winAudioRef.current = new Audio();
    bgmAudioRef.current = new Audio();

    // Set audio sources (placeholder URLs - bisa diganti nanti)
    if (spinAudioRef.current) {
      spinAudioRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
      spinAudioRef.current.volume = masterVolume;
      spinAudioRef.current.loop = false;
    }

    if (winAudioRef.current) {
      winAudioRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
      winAudioRef.current.volume = masterVolume;
      winAudioRef.current.loop = false;
    }

    if (bgmAudioRef.current) {
      bgmAudioRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
      bgmAudioRef.current.volume = bgmVolume;
      bgmAudioRef.current.loop = true;
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
    if (spinAudioRef.current && !isMuted) {
      spinAudioRef.current.currentTime = 0;
      spinAudioRef.current.play().catch(console.error);
    }
    onSpinStart?.();
  };

  // Play win sound
  const playWinSound = () => {
    if (winAudioRef.current && !isMuted) {
      winAudioRef.current.currentTime = 0;
      winAudioRef.current.play().catch(console.error);
    }
    onWin?.();
  };

  // Toggle BGM
  const toggleBGM = () => {
    if (bgmAudioRef.current) {
      if (isBgmPlaying) {
        bgmAudioRef.current.pause();
        setIsBgmPlaying(false);
      } else {
        bgmAudioRef.current.play().catch(console.error);
        setIsBgmPlaying(true);
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
    <div className="fixed bottom-4 right-4 z-50">
      {/* Main Audio Controls */}
      <div className="flex items-center gap-2 mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleMute}
          className="bg-background/80 backdrop-blur-sm border-border"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={toggleBGM}
          className="bg-background/80 backdrop-blur-sm border-border"
        >
          {isBgmPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="bg-background/80 backdrop-blur-sm border-border"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Audio Settings Panel */}
      {showSettings && (
        <Card className="p-4 bg-background/90 backdrop-blur-sm border-border min-w-[280px]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Master Volume</Label>
              <span className="text-xs text-muted-foreground">
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

            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">BGM Volume</Label>
              <span className="text-xs text-muted-foreground">
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

            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Sound Effects</Label>
              <Switch
                checked={!isMuted}
                onCheckedChange={setIsMuted}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Background Music</Label>
              <Switch
                checked={isBgmPlaying}
                onCheckedChange={toggleBGM}
              />
            </div>

            <div className="text-xs text-muted-foreground pt-2 border-t border-border">
              <p>💡 Tips: Upload file audio sendiri di folder public/sounds/</p>
              <p>• spin.mp3 - untuk suara roda berputar</p>
              <p>• win.mp3 - untuk suara menang</p>
              <p>• bgm.mp3 - untuk background music</p>
            </div>
          </div>
        </Card>
      )}
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