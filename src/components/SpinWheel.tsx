import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import type { Prize } from '@/types/prize';
import type { WheelConfig } from '@/lib/wheelDefaults';

interface SpinWheelProps {
  prizes: Prize[];
  onPrizeWon: (prize: Prize) => void;
  wheelConfig?: WheelConfig;
  onActivePrizeChange?: (prize: Prize | null) => void;
}

const MOVIN_SEGMENT_COLORS = ['#1f4f9b', '#f5c33f', '#f2f2f2', '#cfd3dc', '#2c6eb6'];

const NEWTON_ITERATIONS = 4;
const NEWTON_MIN_SLOPE = 0.001;
const SUBDIVISION_PRECISION = 0.0000001;
const SUBDIVISION_MAX_ITERATIONS = 10;
const SAMPLE_SIZE = 11;

const calcBezier = (t: number, a1: number, a2: number) => ((1 - 3 * a2 + 3 * a1) * t + (3 * a2 - 6 * a1)) * t * t + 3 * a1 * t;
const getSlope = (t: number, a1: number, a2: number) => 3 * (1 - 3 * a2 + 3 * a1) * t * t + 2 * (3 * a2 - 6 * a1) * t + 3 * a1;

const binarySubdivide = (x: number, a: number, b: number, mX1: number, mX2: number) => {
  let currentX;
  let currentT;
  let i = 0;
  do {
    currentT = a + (b - a) / 2;
    currentX = calcBezier(currentT, mX1, mX2) - x;
    if (currentX > 0) {
      b = currentT;
    } else {
      a = currentT;
    }
  } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
  return currentT;
};

const newtonRaphsonIterate = (x: number, guessT: number, mX1: number, mX2: number) => {
  for (let i = 0; i < NEWTON_ITERATIONS; i++) {
    const currentSlope = getSlope(guessT, mX1, mX2);
    if (currentSlope === 0) return guessT;
    const currentX = calcBezier(guessT, mX1, mX2) - x;
    guessT -= currentX / currentSlope;
  }
  return guessT;
};

const createCubicBezier = (mX1: number, mY1: number, mX2: number, mY2: number) => {
  if (mX1 < 0 || mX1 > 1 || mX2 < 0 || mX2 > 1) {
    throw new Error('cubic-bezier x values must be in [0, 1] range');
  }

  if (mX1 === mY1 && mX2 === mY2) {
    return (t: number) => t;
  }

  const sampleStep = 1 / (SAMPLE_SIZE - 1);
  const sampleValues = new Float32Array(SAMPLE_SIZE);
  for (let i = 0; i < SAMPLE_SIZE; i++) {
    sampleValues[i] = calcBezier(i * sampleStep, mX1, mX2);
  }

  const getTForX = (x: number) => {
    let intervalStart = 0;
    let currentSample = 1;
    const lastSample = SAMPLE_SIZE - 1;

    for (; currentSample !== lastSample && sampleValues[currentSample] <= x; currentSample++) {
      intervalStart += sampleStep;
    }
    currentSample--;

    const dist = (x - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
    let guessForT = intervalStart + dist * sampleStep;

    const initialSlope = getSlope(guessForT, mX1, mX2);
    if (initialSlope >= NEWTON_MIN_SLOPE) {
      return newtonRaphsonIterate(x, guessForT, mX1, mX2);
    }
    if (initialSlope === 0) {
      return guessForT;
    }
    return binarySubdivide(x, intervalStart, intervalStart + sampleStep, mX1, mX2);
  };

  return (t: number) => calcBezier(getTForX(t), mY1, mY2);
};

const easeOutCubic = createCubicBezier(0.23, 1, 0.32, 1);

const normalizeDegrees = (value: number) => {
  const normalized = value % 360;
  return normalized < 0 ? normalized + 360 : normalized;
};

const getPointerIndexFromRotation = (rotation: number, segmentsLength: number) => {
  if (segmentsLength <= 0) return -1;
  const segmentAngle = 360 / segmentsLength;
  const normalizedRotation = normalizeDegrees(rotation);
  const pointerAngle = (360 - normalizedRotation) % 360;
  const index = Math.floor(pointerAngle / segmentAngle);
  return Math.min(Math.max(index, 0), segmentsLength - 1);
};

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

  const losingKeywords = ['coba lagi', 'anda belum beruntung', 'belum beruntung', 'tidak berhasil'];
  const isLosingPrize = losingKeywords.some(keyword => prize.name.toLowerCase().includes(keyword));

  const headingText = isLosingPrize ? 'Sayang Sekali!' : 'Selamat!';
  const messageText = isLosingPrize ? 'Hadiah belum berpihak kali ini. Putar roda lagi untuk kesempatan berikutnya.' : 'Kamu mendapatkan hadiah:';
  const actionLabel = isLosingPrize ? 'Spin Lagi' : 'Tutup';
  const gradientClass = isLosingPrize ? 'from-[#1a1f2a] to-[#10141a]' : 'from-[#0b5b2f] via-[#11a84f] to-[#7bf59d]';
  const highlightClass = isLosingPrize
    ? 'mt-2 rounded-full bg-white/10 px-6 py-2 text-xl font-semibold uppercase tracking-wide text-white shadow-[0_6px_18px_rgba(0,0,0,0.35)]'
    : 'mt-1 text-3xl font-black uppercase tracking-wide text-[#ffe889]';
  const buttonClasses = `mt-2 rounded-full px-8 py-3 text-base font-semibold text-[#0e6635] shadow-[0_12px_30px_rgba(0,0,0,0.35)] transition hover:bg-white ${isLosingPrize ? 'bg-white/85' : 'bg-white/95'}`;
  const highlightText = isLosingPrize ? 'Tetap Semangat!' : prize.name;

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

      <div className={`relative min-w-[280px] max-w-[90vw] rounded-3xl bg-gradient-to-br ${gradientClass} p-8 text-center shadow-[0_25px_60px_rgba(15,58,100,0.45)] animate-scale-in`}>
        <div className="relative z-10 flex flex-col items-center gap-4">
          {prize.image && (
            <img
              src={prize.image}
              alt={prize.name}
              className="h-24 w-24 rounded-full border-4 border-white/80 shadow-lg animate-prize-glow"
            />
          )}
          <h2 className="text-3xl font-extrabold text-white drop-shadow-lg">{headingText}</h2>
          <p className="text-lg font-medium text-white/85">{messageText}</p>
          {highlightText && (
            <p
              className={highlightClass}
              style={{
                textShadow: isLosingPrize ? '0 10px 24px rgba(0,0,0,0.4)' : '0 8px 18px rgba(0,0,0,0.35)',
              }}
            >
              {highlightText}
            </p>
          )}
          <Button
            onClick={onClose}
            className={buttonClasses}
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export const SpinWheel = ({ prizes, onPrizeWon, wheelConfig, onActivePrizeChange }: SpinWheelProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [popupPrize, setPopupPrize] = useState<Prize | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [showBounce, setShowBounce] = useState(false);
  const [wheelSize, setWheelSize] = useState(380);
  const wheelRef = useRef<HTMLDivElement>(null);

  const spinAudioRef = useRef<HTMLAudioElement | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);
  const activeTickerFrameRef = useRef<number | null>(null);
  const activeTickerStartTimeRef = useRef<number | null>(null);
  const lastActiveIndexRef = useRef<number | null>(null);
  const hasCompletedSpinRef = useRef(false);

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
      if (activeTickerFrameRef.current !== null) {
        cancelAnimationFrame(activeTickerFrameRef.current);
        activeTickerFrameRef.current = null;
      }
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

  const updateActivePrizeForRotation = (rotationValue: number, segmentsSnapshot = segments) => {
    if (!onActivePrizeChange || segmentsSnapshot.length === 0) return;
    const pointerIndex = getPointerIndexFromRotation(rotationValue, segmentsSnapshot.length);
    if (pointerIndex < 0 || pointerIndex >= segmentsSnapshot.length) return;
    if (lastActiveIndexRef.current === pointerIndex) return;
    lastActiveIndexRef.current = pointerIndex;
    onActivePrizeChange(segmentsSnapshot[pointerIndex].prize);
  };

  const availablePrizes = prizes.filter(prize => prize.won < prize.quota);

  useEffect(() => {
    if (!onActivePrizeChange) return;
    if (segments.length === 0) {
      lastActiveIndexRef.current = null;
      onActivePrizeChange(null);
      return;
    }
    if (!hasCompletedSpinRef.current || isSpinning) return;
    updateActivePrizeForRotation(currentRotation);
  }, [isSpinning, currentRotation, segments, onActivePrizeChange]);

  const createEnhancedConfetti = () => {
    if (!config.showConfetti) return;

    const colors = ['#ffde59', '#0b5b2f', '#1aa953', '#80f5a5', '#ffffff'];

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

    const segmentsSnapshot = [...segments];
    const startRotation = currentRotation;

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
    const durationMs = spinDuration * 1000;
    const rotationDelta = adjustedRotation - startRotation;

    if (onActivePrizeChange && segmentsSnapshot.length > 0) {
      if (activeTickerFrameRef.current !== null) {
        cancelAnimationFrame(activeTickerFrameRef.current);
      }
      activeTickerStartTimeRef.current = null;
      lastActiveIndexRef.current = null;
      updateActivePrizeForRotation(startRotation, segmentsSnapshot);

      const step = (timestamp: number) => {
        if (activeTickerStartTimeRef.current === null) {
          activeTickerStartTimeRef.current = timestamp;
        }
        const elapsed = timestamp - activeTickerStartTimeRef.current;
        const progress = Math.min(elapsed / durationMs, 1);
        const easedProgress = easeOutCubic(progress);
        const currentRotationValue = startRotation + rotationDelta * easedProgress;
        updateActivePrizeForRotation(currentRotationValue, segmentsSnapshot);
        if (progress < 1) {
          activeTickerFrameRef.current = requestAnimationFrame(step);
        }
      };

      activeTickerFrameRef.current = requestAnimationFrame(step);
    }

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
      hasCompletedSpinRef.current = true;
      if (activeTickerFrameRef.current !== null) {
        cancelAnimationFrame(activeTickerFrameRef.current);
        activeTickerFrameRef.current = null;
      }
      activeTickerStartTimeRef.current = null;
      updateActivePrizeForRotation(adjustedRotation, segmentsSnapshot);
      if (onActivePrizeChange) {
        lastActiveIndexRef.current = segmentsSnapshot.findIndex(segment => segment.prize.id === selectedPrize.id);
        onActivePrizeChange(selectedPrize);
      }

      if (config.spinAnimation === 'bounce') {
        setShowBounce(true);
        window.setTimeout(() => setShowBounce(false), 800);
      }

      createEnhancedConfetti();
      setPopupPrize(selectedPrize);
    }, durationMs);
  };

  const segmentCount = segments.length;
  const segmentAngle = segmentCount > 0 ? 360 / segmentCount : 0;
  const fontScale = segmentCount >= 16 ? 0.03 : segmentCount >= 12 ? 0.035 : 0.042;
  const wheelInsetPx = 6;
  const innerWheelSize = Math.max(wheelSize - wheelInsetPx * 2, 0);
  const pointerWidth = Math.max(innerWheelSize * 0.1, 48);
  const pointerHeight = Math.max(innerWheelSize * 0.28, 70);
  const pointerTopOffset = Math.max(pointerHeight * 0.6, 34);

  const wheelBackground = segmentCount > 0
    ? `conic-gradient(${segments
        .map(({ color }, index) => `${color} ${index * segmentAngle}deg ${(index + 1) * segmentAngle}deg`)
        .join(', ')})`
    : '#dce5f5';
  const dividerBackground = segmentCount > 0
    ? (() => {
        const dividerWidth = 0.6;
        return `repeating-conic-gradient(#0a1d21 0deg, #0a1d21 ${dividerWidth}deg, transparent ${dividerWidth}deg, transparent ${segmentAngle}deg)`;
      })()
    : 'transparent';
  const combinedWheelBackground = segmentCount > 0 ? `${dividerBackground}, ${wheelBackground}` : wheelBackground;

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
        <div className="pointer-events-none absolute inset-[-12%] rounded-full bg-[#0b5b2f]/20 blur-[90px]" />
        <div className="pointer-events-none absolute inset-0 z-20 rounded-full border-[2px] border-[#0a1d21] shadow-[0_12px_30px_rgba(0,0,0,0.32)]" />
        <div
          className="pointer-events-none absolute inset-[1px] z-10 rounded-full border-[6px] border-white"
          style={{ boxShadow: 'inset 0 0 0 1px #0a1d21' }}
        />

        <div
          ref={wheelRef}
          className={`relative z-0 overflow-hidden rounded-full transition-transform duration-300 ease-out ${
            showBounce ? 'animate-wheel-bounce-stop' : ''
          }`}
          style={{
            width: `${innerWheelSize}px`,
            height: `${innerWheelSize}px`,
            margin: `${wheelInsetPx}px auto`,
            backgroundImage: combinedWheelBackground,
            backgroundColor: segmentCount > 0 ? 'transparent' : '#dce5f5',
            boxShadow: 'inset 0 12px 30px rgba(255,255,255,0.35), inset 0 -20px 40px rgba(13,61,117,0.3)',
            border: '2px solid #0a1d21',
          }}
        >
          {segments.map(({ prize, color }, index) => {
            const rotation = index * segmentAngle;
            const isAvailable = prize.won < prize.quota;
            const textColor = getSegmentTextColor(color);
            const baseLabelOffset = Math.min(Math.max(innerWheelSize * 0.006 + 2, 8), innerWheelSize * 0.06);
            const normalizedNameLength = prize.name.replace(/\s+/g, '').length;
            const shortNamePullout = normalizedNameLength <= 12 ? Math.min(innerWheelSize * 0.015, 5) : 0;
            const veryShortCompensation = normalizedNameLength <= 7 ? Math.min(innerWheelSize * 0.01, 4) : 0;
            const effectiveLabelOffset = Math.max(baseLabelOffset - shortNamePullout - veryShortCompensation, 5);

            let basePercent = -58;
            if (innerWheelSize < 260) {
              basePercent = -50;
            } else if (innerWheelSize < 320) {
              basePercent = -52;
            } else if (innerWheelSize < 380) {
              basePercent = -54;
            } else if (innerWheelSize < 460) {
              basePercent = -56;
            }

            const labelFontSize = Math.min(Math.max(innerWheelSize * fontScale, 11.5), 17.5);
            const labelMaxWidth = Math.min(Math.max(innerWheelSize * 0.26, 90), 160);
            const lineHeight = segments.length <= 6 ? (innerWheelSize < 360 ? 1.16 : 1.12) : 1.18;

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
                      marginTop: `calc(${basePercent}% + ${effectiveLabelOffset}px)`,
                    }}
                  >
                    {prize.image && config.showImages && (
                      <img
                        src={prize.image}
                        alt={prize.name}
                        className="rounded-full border-2 border-white/70 object-cover shadow-lg"
                        style={{
                          width: `${Math.max(innerWheelSize * 0.12, 42)}px`,
                          height: `${Math.max(innerWheelSize * 0.12, 42)}px`,
                        }}
                      />
                    )}
                    <span
                      className="font-black uppercase tracking-[0.01em] text-[#0a1d21]"
                      style={{
                        fontSize: `${labelFontSize}px`,
                        maxWidth: `${labelMaxWidth}px`,
                        color: '#0a1d21',
                        lineHeight,
                        wordBreak: 'normal',
                        whiteSpace: 'normal',
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
          className="absolute top-1/2 left-1/2 z-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-none outline-none focus-visible:ring-4 focus-visible:ring-[#f5c33f]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-transform duration-200 ease-out hover:scale-[1.04] disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{
            width: `${Math.max(innerWheelSize * 0.26, 90)}px`,
            height: `${Math.max(innerWheelSize * 0.26, 90)}px`,
            backgroundImage: "url('/assets/Button.png')",
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            cursor: 'pointer',
          }}
          aria-label="Putar roda"
        >
          <span className="sr-only">{config.centerText}</span>
        </button>

        <div
          className="pointer-events-none absolute left-1/2 z-30 -translate-x-1/2 flex justify-center"
          style={{ top: `-${pointerTopOffset}px`, width: `${pointerWidth}px` }}
        >
          <img
            src="/assets/pointer.png"
            alt="Penunjuk roda"
            className="select-none transition-transform duration-300"
            style={{
              width: '100%',
              height: `${pointerHeight}px`,
              objectFit: 'contain',
              filter: 'drop-shadow(0 18px 28px rgba(0, 0, 0, 0.55))',
            }}
            draggable={false}
          />
        </div>
      </div>

      <PrizePopup prize={popupPrize} onClose={() => setPopupPrize(null)} />
    </div>
  );
};
