import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import type { Prize } from '@/types/prize';
import type { WheelConfig } from '@/lib/wheelDefaults';

interface SpinWheelProps {
  prizes: Prize[];
  onPrizeWon: (prize: Prize) => void;
  wheelConfig?: WheelConfig;
}

const MOVIN_SEGMENT_COLORS = ['#1f4f9b', '#f5c33f', '#f2f2f2', '#cfd3dc', '#2c6eb6'];

const getSegmentTextColor = (hexColor: string) => {
  const hex = hexColor.replace('#', '');
  const normalized = hex.length === 3
    ? hex.split('').map(char => char + char).join('')
    : hex.padEnd(6, 'f');

  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 160 ? '#0d3d75' : '#ffffff';
};

function PrizePopup({ prize, onClose }: { prize: Prize | null; onClose: () => void }) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; type: 'sparkle' | 'star' }>>([]);

  useEffect(() => {
    if (prize) {
      const newParticles = [];
      for (let i = 0; i < 30; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          type: Math.random() > 0.5 ? 'sparkle' : 'star',
        });
      }
      setParticles(newParticles);

      const timeout = window.setTimeout(() => setParticles([]), 3000);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [prize]);

  if (!prize) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      {particles.map(particle => (
        <div
          key={particle.id}
          className={particle.type === 'sparkle' ? 'sparkle' : 'star'}
          style={{
            left: particle.x,
            top: particle.y,
            animation:
              particle.type === 'sparkle'
                ? `sparkle-float ${1 + Math.random() * 2}s ease-out forwards`
                : `star-float ${1.5 + Math.random() * 2}s ease-out forwards`,
          }}
        />
      ))}

      <div className="relative min-w-[280px] max-w-[90vw] rounded-3xl bg-gradient-to-br from-[#1f4f9b] to-[#2c6eb6] p-8 text-center shadow-[0_25px_60px_rgba(15,58,100,0.45)] animate-scale-in">
        <div className="relative z-10 flex flex-col items-center gap-4">
          {prize.image && (
            <img
              src={prize.image}
              alt={prize.name}
              className="h-24 w-24 rounded-full border-4 border-white/80 shadow-lg animate-prize-glow"
            />
          )}
          <h2 className="text-3xl font-extrabold text-white drop-shadow-lg">Selamat!</h2>
          <p className="text-lg font-medium text-white/90">Kamu mendapatkan hadiah:</p>
          <p className="text-3xl font-black tracking-wide text-[#f5c33f] drop-shadow-[0_8px_18px_rgba(0,0,0,0.35)] animate-prize-glow">
            {prize.name}
          </p>
          <Button
            onClick={onClose}
            className="mt-2 rounded-full bg-white/90 px-8 py-3 text-base font-semibold text-[#1f4f9b] shadow-[0_12px_30px_rgba(15,58,100,0.35)] transition hover:bg-white"
          >
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}

export const SpinWheel = ({ prizes, onPrizeWon, wheelConfig }: SpinWheelProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [popupPrize, setPopupPrize] = useState<Prize | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [showBounce, setShowBounce] = useState(false);
  const [wheelSize, setWheelSize] = useState(380);
  const wheelRef = useRef<HTMLDivElement>(null);

  const spinAudioRef = useRef<HTMLAudioElement | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    try {
      spinAudioRef.current = new Audio();
      winAudioRef.current = new Audio();

      if (spinAudioRef.current) {
        spinAudioRef.current.preload = 'none';
        spinAudioRef.current.volume = 0.7;
        spinAudioRef.current.crossOrigin = 'anonymous';
      }
      if (winAudioRef.current) {
        winAudioRef.current.preload = 'none';
        winAudioRef.current.volume = 0.7;
        winAudioRef.current.crossOrigin = 'anonymous';
      }
    } catch (error) {
      console.warn('Audio initialization failed:', error);
    }

    return () => {
      if (spinAudioRef.current) spinAudioRef.current.pause();
      if (winAudioRef.current) winAudioRef.current.pause();
    };
  }, []);

  const playSpinSound = () => {
    try {
      const audio = new Audio();
      audio.src = '/sounds/spin.mp3';
      audio.volume = 0.7;
      audio.play().catch(error => {
        console.warn('Spin audio play failed:', error);
      });
    } catch (error) {
      console.warn('Spin sound error:', error);
    }
  };

  const playWinSound = () => {
    try {
      const audio = new Audio();
      audio.src = '/sounds/win.mp3';
      audio.volume = 0.7;
      audio.play().catch(error => {
        console.warn('Win audio play failed:', error);
      });
    } catch (error) {
      console.warn('Win sound error:', error);
    }
  };

  const config = wheelConfig || {
    centerText: 'Putar',
    spinAnimation: 'smooth' as const,
    defaultColor: '#cfd3dc',
    showLabels: true,
    showImages: true,
    wheelSize: 380,
    showConfetti: true,
    showShake: true,
    showGlow: true,
    dummySegments: 0,
  };

  useEffect(() => {
    const updateWheelSize = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const isPortrait = screenHeight >= screenWidth;

      let sizeFromWidth: number;
      if (screenWidth < 480) {
        sizeFromWidth = screenWidth * (isPortrait ? 0.92 : 0.85);
      } else if (screenWidth < 768) {
        sizeFromWidth = screenWidth * (isPortrait ? 0.78 : 0.7);
      } else if (screenWidth < 1024) {
        sizeFromWidth = screenWidth * 0.6;
      } else {
        sizeFromWidth = Math.min(screenWidth * 0.45, 520);
      }

      const sizeFromHeight = screenHeight * (isPortrait ? 0.58 : 0.62);
      const baseline = config.wheelSize ?? 380;
      const finalSize = Math.max(Math.min(sizeFromWidth, sizeFromHeight), Math.min(280, baseline));
      setWheelSize(finalSize);
    };

    updateWheelSize();
    window.addEventListener('resize', updateWheelSize);

    return () => window.removeEventListener('resize', updateWheelSize);
  }, [config.wheelSize]);

  const baseSegments: Prize[] = [...prizes];
  for (let i = 0; i < config.dummySegments; i++) {
    baseSegments.push({
      id: `dummy-${i}`,
      name: 'Coba Lagi',
      color: config.defaultColor,
      quota: 999,
      won: 0,
      winPercentage: 0,
    });
  }

  const segments = baseSegments.map((segment, index) => ({
    prize: segment,
    color: segment.color ?? MOVIN_SEGMENT_COLORS[index % MOVIN_SEGMENT_COLORS.length],
  }));

  const availablePrizes = prizes.filter(prize => prize.won < prize.quota);

  const createEnhancedConfetti = () => {
    if (!config.showConfetti) return;

    const colors = ['#f5c33f', '#1f4f9b', '#f8f8f8', '#2c6eb6'];

    for (let i = 0; i < 45; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.top = '-12px';
      confetti.style.width = '12px';
      confetti.style.height = '18px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.borderRadius = '4px';
      confetti.style.pointerEvents = 'none';
      confetti.style.zIndex = '9999';
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
      confetti.style.animation = `confetti-fall ${2.2 + Math.random() * 2.5}s linear forwards`;
      document.body.appendChild(confetti);

      window.setTimeout(() => {
        if (confetti.parentNode) {
          confetti.parentNode.removeChild(confetti);
        }
      }, 5200);
    }
  };

  const spin = () => {
    if (isSpinning || availablePrizes.length === 0 || segments.length === 0) return;

    setIsSpinning(true);

    if (config.showShake) {
      setIsShaking(true);
      window.setTimeout(() => setIsShaking(false), 500);
    }

    playSpinSound();

    const spinDuration = 4 + Math.random() * 1.8;
    const spins = 10 + Math.random() * 5;
    const finalRotation = currentRotation + spins * 360;

    const selectWinningPrize = (pool: Prize[]) => {
      const prizeWithHundredPercent = pool.find(prize => prize.winPercentage >= 100);
      if (prizeWithHundredPercent) {
        return prizeWithHundredPercent;
      }

      const totalPercentage = pool.reduce((sum, prize) => sum + prize.winPercentage, 0);
      if (totalPercentage === 0) {
        return pool[Math.floor(Math.random() * pool.length)];
      }

      const random = Math.random() * totalPercentage;
      let current = 0;
      for (const prize of pool) {
        current += prize.winPercentage;
        if (random <= current) {
          return prize;
        }
      }

      return pool[pool.length - 1];
    };

    const selectedPrize = selectWinningPrize(availablePrizes);

    const segmentAngle = 360 / segments.length;
    const prizeIndex = segments.findIndex(segment => segment.prize.id === selectedPrize.id);
    const targetAngle = prizeIndex >= 0 ? prizeIndex * segmentAngle + segmentAngle / 2 : 0;
    const adjustedRotation = finalRotation - (finalRotation % 360) + (360 - targetAngle);

    if (wheelRef.current) {
      wheelRef.current.style.setProperty('--final-rotation', `${adjustedRotation}deg`);
      wheelRef.current.style.setProperty('--spin-duration', `${spinDuration}s`);
      wheelRef.current.style.animation = 'none';
      // force reflow
      void wheelRef.current.offsetHeight;

      let animationName = 'wheel-3d-rotate';
      if (config.spinAnimation === 'bounce') {
        animationName = 'wheel-bounce-stop';
      } else if (config.spinAnimation === 'natural') {
        animationName = 'spin-wheel-natural';
      }

      wheelRef.current.style.animation = `${animationName} var(--spin-duration) cubic-bezier(0.23, 1, 0.32, 1) forwards`;
    }

    setCurrentRotation(adjustedRotation);

    window.setTimeout(() => {
      setIsSpinning(false);
      playWinSound();
      onPrizeWon(selectedPrize);

      if (config.spinAnimation === 'bounce') {
        setShowBounce(true);
        window.setTimeout(() => setShowBounce(false), 800);
      }

      createEnhancedConfetti();
      setPopupPrize(selectedPrize);
    }, spinDuration * 1000);
  };

  const segmentCount = segments.length;
  const segmentAngle = segmentCount > 0 ? 360 / segmentCount : 0;
  const fontScale = segmentCount >= 16 ? 0.03 : segmentCount >= 12 ? 0.035 : 0.042;

  const wheelBackground = segmentCount > 0
    ? `conic-gradient(${segments
        .map(({ color }, index) => `${color} ${index * segmentAngle}deg ${(index + 1) * segmentAngle}deg`)
        .join(', ')})`
    : '#dce5f5';

  return (
    <div className={`relative flex w-full flex-col items-center ${isShaking ? 'animate-screen-shake' : ''}`}>
      <div
        className="relative mx-auto"
        style={{
          width: wheelSize,
          height: wheelSize,
          maxWidth: '92vw',
          marginTop: Math.max(wheelSize * 0.18, 56),
        }}
      >
        <div className="pointer-events-none absolute inset-[-14%] rounded-full bg-[#0e3f76]/15 blur-3xl" />
        <div className="absolute inset-0 rounded-full border-[14px] border-[#0f3a64] bg-white shadow-[0_25px_60px_rgba(15,58,100,0.35)]" />

        <div
          ref={wheelRef}
          className={`relative z-10 h-full w-full overflow-hidden rounded-full transition-transform duration-300 ease-out ${
            showBounce ? 'animate-wheel-bounce-stop' : ''
          }`}
          style={{
            background: wheelBackground,
            boxShadow: 'inset 0 12px 30px rgba(255,255,255,0.35), inset 0 -20px 40px rgba(13,61,117,0.3)',
          }}
        >
          {segments.map(({ prize, color }, index) => {
            const rotation = index * segmentAngle;
            const isAvailable = prize.won < prize.quota;
            const textColor = getSegmentTextColor(color);

            return (
              <div
                key={prize.id}
                className="absolute flex h-full w-full items-center justify-center"
                style={{
                  transform: `rotate(${rotation + segmentAngle / 2}deg)`,
                  transformOrigin: 'center',
                }}
              >
                {config.showLabels && (
                  <div
                    className={`flex w-full -translate-y-1/2 -rotate-90 flex-col items-center gap-2 text-center transition-opacity duration-300 ${
                      isAvailable ? 'opacity-100' : 'opacity-60'
                    } ${isSpinning ? 'animate-pulse' : ''}`}
                    style={{
                      marginTop: prize.image
                        ? `calc(-50% + ${Math.max(wheelSize * 0.045, 16)}px)`
                        : `calc(-50% + ${Math.max(wheelSize * 0.04, 14)}px)`,
                    }}
                  >
                    {prize.image && config.showImages && (
                      <img
                        src={prize.image}
                        alt={prize.name}
                        className="rounded-full border-2 border-white/70 object-cover shadow-lg"
                        style={{
                          width: `${Math.max(wheelSize * 0.12, 42)}px`,
                          height: `${Math.max(wheelSize * 0.12, 42)}px`,
                        }}
                      />
                    )}
                    <span
                      className="font-bold uppercase tracking-tight drop-shadow-sm"
                      style={{
                        fontSize: `${Math.max(wheelSize * fontScale, 13)}px`,
                        maxWidth: `${wheelSize * 0.4}px`,
                        color: textColor,
                        textShadow:
                          textColor === '#ffffff'
                            ? '0 0 12px rgba(13,61,117,0.45)'
                            : '0 0 10px rgba(255,255,255,0.45)',
                      }}
                    >
                      {prize.name}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={spin}
          disabled={isSpinning || availablePrizes.length === 0}
          className="absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-none outline-none focus-visible:ring-4 focus-visible:ring-[#f5c33f]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white shadow-[0_18px_35px_rgba(15,58,100,0.35)] transition-transform duration-200 ease-out hover:scale-[1.04] disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{
            width: `${Math.max(wheelSize * 0.26, 110)}px`,
            height: `${Math.max(wheelSize * 0.26, 110)}px`,
            backgroundImage: "url('/assets/WOF_Button.png')",
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            cursor: 'pointer',
          }}
          aria-label="Putar roda"
        >
          <span className="sr-only">{config.centerText}</span>
          {isSpinning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[#f7a21d] animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-[#f7a21d] animate-bounce [animation-delay:0.1s]" />
                <span className="h-2 w-2 rounded-full bg-[#f7a21d] animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          )}
        </button>

        <div
          className="pointer-events-none absolute left-1/2 z-30 -translate-x-1/2"
          style={{ top: `-${Math.max(wheelSize * 0.1, 76)}px` }}
        >
          <img
            src="/assets/WOF_Jarum.png"
            alt="Penunjuk roda"
            className={`select-none transition-transform duration-300 -rotate-90 ${showBounce ? 'animate-bounce' : ''}`}
            style={{
              width: `${Math.max(wheelSize * 0.34, 120)}px`,
              filter: 'drop-shadow(0 18px 25px rgba(15, 58, 100, 0.45))',
            }}
            draggable={false}
          />
        </div>
      </div>

      <PrizePopup prize={popupPrize} onClose={() => setPopupPrize(null)} />
    </div>
  );
};
