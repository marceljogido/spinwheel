import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Prize } from '@/types/prize';
import type { WheelConfig } from '@/lib/wheelDefaults';

interface SpinWheelProps {
  prizes: Prize[];
  onPrizeWon: (prize: Prize) => void;
  wheelConfig?: WheelConfig;
}

// Komponen Popup Hadiah dengan efek visual yang lebih menarik
function PrizePopup({ prize, onClose }: { prize: Prize | null; onClose: () => void }) {
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, type: 'sparkle' | 'star'}>>([]);

  useEffect(() => {
    if (prize) {
      // Create particles
      const newParticles = [];
      for (let i = 0; i < 30; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          type: Math.random() > 0.5 ? 'sparkle' : 'star'
        });
      }
      setParticles(newParticles);

      // Clear particles after animation
      setTimeout(() => setParticles([]), 3000);
    }
  }, [prize]);

  if (!prize) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      {/* Particle Effects */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={particle.type === 'sparkle' ? 'sparkle' : 'star'}
          style={{
            left: particle.x,
            top: particle.y,
            animation: particle.type === 'sparkle' 
              ? `sparkle-float ${1 + Math.random() * 2}s ease-out forwards`
              : `star-float ${1.5 + Math.random() * 2}s ease-out forwards`
          }}
        />
      ))}

      <div className="bg-gradient-to-br from-primary to-accent rounded-3xl shadow-2xl p-8 md:p-12 text-center relative animate-scale-in min-w-[300px] max-w-[90vw] animate-prize-glow">
        <div className="flex flex-col items-center gap-4 z-20 relative">
          {prize.image && (
            <img 
              src={prize.image} 
              alt={prize.name} 
              className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg mb-2 animate-bounce animate-prize-glow-pulse animate-prize-float" 
            />
          )}
          <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg animate-bounce">
            🎉 Selamat! 🎉
          </h2>
          <div className="text-lg md:text-2xl font-semibold text-white drop-shadow-lg animate-bounce">
            Kamu mendapatkan:
          </div>
          <div className="text-2xl md:text-4xl font-extrabold text-yellow-300 drop-shadow-xl animate-bounce mb-2 animate-prize-glow animate-prize-float-slow">
            {prize.name}
          </div>
          <Button 
            onClick={onClose} 
            className="mt-4 px-8 py-3 text-lg font-bold rounded-full shadow-glow-primary bg-white/90 text-primary hover:bg-white hover:scale-105 transition-transform duration-200"
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
  const [spinCount, setSpinCount] = useState(0);
  const [popupPrize, setPopupPrize] = useState<Prize | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [winningPrize, setWinningPrize] = useState<Prize | null>(null);
  const [showBounce, setShowBounce] = useState(false);
  const [wheelSize, setWheelSize] = useState(340);
  const wheelRef = useRef<HTMLDivElement>(null);

  // Audio refs
  const spinAudioRef = useRef<HTMLAudioElement | null>(null);
  const winAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    try {
      // Create audio elements without setting src immediately
      spinAudioRef.current = new Audio();
      winAudioRef.current = new Audio();
      
      // Set audio properties
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

  // Audio functions
  const playSpinSound = () => {
    try {
      // Create new audio instance each time to avoid download issues
      const audio = new Audio();
      audio.src = '/sounds/spin.mp3';
      audio.volume = 0.7;
      audio.play().catch((error) => {
        console.warn('Spin audio play failed:', error);
      });
    } catch (error) {
      console.warn('Spin sound error:', error);
    }
  };

  const playWinSound = () => {
    try {
      // Create new audio instance each time to avoid download issues
      const audio = new Audio();
      audio.src = '/sounds/win.mp3';
      audio.volume = 0.7;
      audio.play().catch((error) => {
        console.warn('Win audio play failed:', error);
      });
    } catch (error) {
      console.warn('Win sound error:', error);
    }
  };

  // Default config jika tidak ada
  const config = wheelConfig || {
    centerText: 'SPIN!',
    spinAnimation: 'smooth',
    defaultColor: '#FFD700',
    showLabels: true,
    showImages: true,
    wheelSize: 340,
    showConfetti: true,
    showShake: true,
    showGlow: true,
    dummySegments: 0,
  };

  // Responsive wheel size using flexible units
  useEffect(() => {
    const updateWheelSize = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      // Tentukan ukuran berbasis lebar (seperti sebelumnya)
      let sizeFromWidth: number;
      if (screenWidth < 480) {
        sizeFromWidth = Math.min(screenWidth * 0.6, 250);
      } else if (screenWidth < 640) {
        sizeFromWidth = Math.min(screenWidth * 0.5, 280);
      } else if (screenWidth < 768) {
        sizeFromWidth = Math.min(screenWidth * 0.45, 320);
      } else if (screenWidth < 1024) {
        sizeFromWidth = Math.min(screenWidth * 0.35, 380);
      } else {
        sizeFromWidth = Math.min(screenWidth * 0.3, 400);
      }

      // Batasi juga terhadap tinggi agar tidak melebihi 50vh
      const sizeFromHeight = screenHeight * 0.5;

      // Batasi terhadap lebar max container (90vw)
      const sizeFromViewportWidth = screenWidth * 0.9;

      // Ambil nilai minimum agar width === height dan tidak ter-clamp berbeda
      const finalSize = Math.min(sizeFromWidth, sizeFromHeight, sizeFromViewportWidth);
      setWheelSize(finalSize);
    };

    updateWheelSize();
    window.addEventListener('resize', updateWheelSize);
    
    return () => window.removeEventListener('resize', updateWheelSize);
  }, [config.wheelSize]);

  // Gabungkan hadiah dengan dummy segments
  const allSegments = [...prizes];
  for (let i = 0; i < config.dummySegments; i++) {
    allSegments.push({
      id: `dummy-${i}`,
      name: 'Try Again',
      color: config.defaultColor,
      quota: 999,
      won: 0
    });
  }

  const availablePrizes = prizes.filter(prize => prize.won < prize.quota);
  
  // Enhanced confetti effect with sparkles and stars
  const createEnhancedConfetti = () => {
    if (!config.showConfetti) return;
    
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
    
    // Create confetti
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.top = '-10px';
      confetti.style.width = '10px';
      confetti.style.height = '10px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.borderRadius = '50%';
      confetti.style.pointerEvents = 'none';
      confetti.style.zIndex = '9999';
      confetti.style.animation = `confetti-fall ${2 + Math.random() * 3}s linear forwards`;
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        document.body.removeChild(confetti);
      }, 5000);
    }

    // Create sparkles
    for (let i = 0; i < 20; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'sparkle';
      sparkle.style.left = Math.random() * 100 + 'vw';
      sparkle.style.top = Math.random() * 100 + 'vh';
      sparkle.style.animation = `sparkle-float ${1 + Math.random() * 2}s ease-out forwards`;
      sparkle.style.zIndex = '9999';
      document.body.appendChild(sparkle);
      
      setTimeout(() => {
        document.body.removeChild(sparkle);
      }, 3000);
    }

    // Create stars
    for (let i = 0; i < 15; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = Math.random() * 100 + 'vw';
      star.style.top = Math.random() * 100 + 'vh';
      star.style.animation = `star-float ${1.5 + Math.random() * 2}s ease-out forwards`;
      star.style.zIndex = '9999';
      document.body.appendChild(star);
      
      setTimeout(() => {
        document.body.removeChild(star);
      }, 3500);
    }
  };

  const spin = () => {
    if (isSpinning || availablePrizes.length === 0) return;

    setIsSpinning(true);
    setSpinCount(prev => prev + 1);
    
    // Start screen shake
    if (config.showShake) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
    
    // Play spin sound
    playSpinSound();
    
    // Random spin duration between 4-6 seconds for more excitement
    const spinDuration = 4 + Math.random() * 2;
    
    // Calculate random rotation (10-15 full spins for more drama)
    const spins = 10 + Math.random() * 5;
    const finalRotation = currentRotation + (spins * 360);
    
    // Select winning prize based on percentage
    const selectWinningPrize = (prizes: Prize[]) => {
      // Check if any prize has 100% win percentage
      const prizeWith100Percent = prizes.find(prize => prize.winPercentage >= 100);
      if (prizeWith100Percent) {
        console.log('🎯 100% prize found:', prizeWith100Percent.name);
        return prizeWith100Percent;
      }
      
      // Calculate total percentage of available prizes
      const totalPercentage = prizes.reduce((sum, prize) => sum + prize.winPercentage, 0);
      
      if (totalPercentage === 0) {
        // Fallback to random selection if no percentages set
        return prizes[Math.floor(Math.random() * prizes.length)];
      }
      
      // Generate random number between 0 and total percentage
      const random = Math.random() * totalPercentage;
      let currentPercentage = 0;
      
      console.log('🎲 Random selection:', {
        totalPercentage,
        random,
        prizes: prizes.map(p => ({ name: p.name, percentage: p.winPercentage })),
        availablePrizes: availablePrizes.map(p => ({ name: p.name, percentage: p.winPercentage }))
      });
      
      // Find the prize based on percentage ranges
      for (const prize of prizes) {
        currentPercentage += prize.winPercentage;
        if (random <= currentPercentage) {
          console.log('🎯 Selected prize:', prize.name, 'at percentage:', currentPercentage);
          return prize;
        }
      }
      
      // Fallback to last prize if something goes wrong
      console.log('⚠️ Fallback to last prize');
      return prizes[prizes.length - 1];
    };
    
    const winningPrize = selectWinningPrize(availablePrizes);
    
    // Calculate exact position for the winning prize
    const segmentAngle = 360 / allSegments.length;
    const prizeIndex = allSegments.findIndex(p => p.id === winningPrize.id);
    const targetAngle = (prizeIndex * segmentAngle) + (segmentAngle / 2);
    const adjustedRotation = finalRotation - (finalRotation % 360) + (360 - targetAngle);
    
    // Apply smooth rotation with natural easing and 3D effects
    if (wheelRef.current) {
      wheelRef.current.style.setProperty('--final-rotation', `${adjustedRotation}deg`);
      wheelRef.current.style.setProperty('--spin-duration', `${spinDuration}s`);
      wheelRef.current.style.animation = 'none';
      wheelRef.current.offsetHeight; // Force reflow
      
      // Use animation based on config
      let animationName = 'wheel-3d-rotate';
      if (config.spinAnimation === 'bounce') {
        animationName = 'wheel-bounce-stop';
      } else if (config.spinAnimation === 'natural') {
        animationName = 'spin-wheel-natural';
      }
      
      wheelRef.current.style.animation = `${animationName} var(--spin-duration) cubic-bezier(0.23, 1, 0.32, 1) forwards`;
    }
    
    setCurrentRotation(adjustedRotation);
    
    // Show result after animation completes
    setTimeout(() => {
      setIsSpinning(false);
      setWinningPrize(winningPrize);
      
      // Play win sound
      playWinSound();
      
      onPrizeWon(winningPrize);
      
      // Show bounce effect
      if (config.spinAnimation === 'bounce') {
        setShowBounce(true);
        setTimeout(() => setShowBounce(false), 800);
      }
      
      createEnhancedConfetti();
      setPopupPrize(winningPrize);
    }, spinDuration * 1000);
  };

  const segmentAngle = 360 / allSegments.length;
  const segmentCount = allSegments.length;
  const fontScale = segmentCount >= 16 ? 0.03 : segmentCount >= 12 ? 0.035 : 0.04;

  return (
    <div className={`flex flex-col items-center space-y-2 sm:space-y-3 md:space-y-4 w-full max-w-4xl mx-auto px-1 sm:px-2 ${isShaking ? 'animate-screen-shake' : ''}`}>
      {/* Wheel Container */}
      <div className="relative mx-auto" style={{ 
        width: wheelSize, 
        height: wheelSize,
        maxWidth: '90vw',
        maxHeight: '50vh'
      }}>
        {/* Outer Glow Effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400/30 via-yellow-500/20 to-yellow-400/30 blur-2xl animate-pulse"></div>
        
        {/* Wheel with 3D effects and bounce */}
        <div 
          ref={wheelRef}
          className={`relative w-full h-full rounded-full border-8 border-yellow-400 shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 wheel-3d wheel-3d-hover ${
            showBounce ? 'animate-wheel-bounce-stop' : ''
          }`}
          style={{ 
            background: `conic-gradient(${allSegments.map((prize, index) => 
              `${prize.color} ${index * segmentAngle}deg ${(index + 1) * segmentAngle}deg`
            ).join(', ')})`,
            boxShadow: '0 0 60px rgba(255, 215, 0, 0.5), 0 15px 50px -10px rgba(255, 215, 0, 0.4), inset 0 0 20px rgba(255, 215, 0, 0.2)'
          }}
        >
          {/* Prize Segments */}
          {allSegments.map((prize, index) => {
            const rotation = index * segmentAngle;
            const isAvailable = prize.won < prize.quota;
            const isWinningPrize = winningPrize?.id === prize.id;
            const isDummy = prize.id.startsWith('dummy-');
            
            
            return (
              <div
                key={prize.id}
                className="absolute w-full h-full flex items-center justify-center"
                style={{
                  transform: `rotate(${rotation + segmentAngle/2}deg)`,
                  transformOrigin: 'center'
                }}
              >
                <div 
                  className={`text-center transform flex flex-col items-center transition-all duration-300 ${
                    isAvailable ? 'opacity-100' : 'opacity-60 saturate-50'
                  } ${isSpinning ? 'animate-pulse' : ''}`}
                  style={{ 
                    // Jauhkan lagi ke tepi roda
                    marginTop: prize.image 
                      ? `calc(-50% + ${Math.max(wheelSize * 0.03, 8)}px)` 
                      : `calc(-50% + ${Math.max(wheelSize * 0.02, 6)}px)`,
                    transform: 'translateY(-50%) rotate(90deg)'
                  }}
                >
                  {/* Prize Label Row: image on the left, text on the right */}
                  {config.showLabels && (
                    <div className="flex items-center justify-start gap-1 w-full"
                      style={{
                        width: `${wheelSize * 0.32}px`,
                        transformOrigin: 'left center'
                      }}
                    >
                      {prize.image && config.showImages && (
                        <img 
                          src={prize.image} 
                          alt={prize.name}
                          className={`object-cover rounded-full border-2 shadow-lg ${isAvailable ? 'border-white' : 'border-border'}`}
                          style={{
                            width: `${Math.max(wheelSize * 0.10, 18)}px`,
                            height: `${Math.max(wheelSize * 0.10, 18)}px`
                          }}
                        />
                      )}
                      <div 
                        className={`font-bold drop-shadow-lg px-1 leading-tight text-left ${isAvailable ? 'text-white' : 'text-muted-foreground'}`}
                        style={{
                          fontSize: `${Math.max(wheelSize * fontScale, 10)}px`,
                          maxWidth: `${wheelSize * 0.30}px`,
                          lineHeight: '1',
                          minHeight: `${Math.max(wheelSize * 0.08, 20)}px`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          fontWeight: 800,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        title={prize.name}
                      >
                        {prize.name}
                      </div>
                    </div>
                  )}
                  
                  {/* Empty state styling: no icon/text to save space */}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Center Hub with enhanced design - Clickable Spin Button */}
        <button 
          onClick={spin}
          disabled={isSpinning || availablePrizes.length === 0}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full border-4 border-yellow-300 shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-4 focus:ring-yellow-400/50 group relative overflow-hidden animate-pulse z-30"
          style={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: `${Math.max(wheelSize * 0.20, 44)}px`,
            height: `${Math.max(wheelSize * 0.20, 44)}px`
          }}
        >
          {/* Animated background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          {/* Inner circle decoration */}
          <div 
            className="absolute border-2 border-yellow-200/50 rounded-full"
            style={{
              width: `${Math.max(wheelSize * 0.12, 22)}px`,
              height: `${Math.max(wheelSize * 0.12, 22)}px`,
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          ></div>
          
          {/* Center Text with animation */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <span 
              className="font-bold text-yellow-900 group-hover:text-yellow-800 transition-colors duration-300 drop-shadow-sm text-center whitespace-nowrap"
              style={{
                fontSize: `${Math.max(wheelSize * 0.05, 10)}px`,
                lineHeight: '1',
                maxWidth: `${wheelSize * 0.18}px`,
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {isSpinning ? (
                <div className="flex items-center justify-center gap-1">
                  <div 
                    className="bg-yellow-800 rounded-full animate-bounce"
                    style={{
                      width: `${Math.max(wheelSize * 0.012, 3)}px`,
                      height: `${Math.max(wheelSize * 0.012, 3)}px`
                    }}
                  ></div>
                  <div 
                    className="bg-yellow-800 rounded-full animate-bounce"
                    style={{
                      animationDelay: '0.1s',
                      width: `${Math.max(wheelSize * 0.012, 3)}px`,
                      height: `${Math.max(wheelSize * 0.012, 3)}px`
                    }}
                  ></div>
                  <div 
                    className="bg-yellow-800 rounded-full animate-bounce"
                    style={{
                      animationDelay: '0.2s',
                      width: `${Math.max(wheelSize * 0.012, 3)}px`,
                      height: `${Math.max(wheelSize * 0.012, 3)}px`
                    }}
                  ></div>
                </div>
              ) : (
                config.centerText
              )}
            </span>
          </div>
        </button>
        
        {/* Enhanced Pointer with glow, micro-bounce, and LED tip */}
        <div className="absolute -top-1 sm:-top-2 md:-top-3 left-1/2 -translate-x-1/2 z-10">
          <div className={`relative ${showBounce ? 'animate-bounce' : ''}`}>
            <div 
              className="w-0 h-0 border-l-transparent border-r-transparent border-b-yellow-400"
              style={{
                borderLeftWidth: `${Math.max(wheelSize * 0.02, 8)}px`,
                borderRightWidth: `${Math.max(wheelSize * 0.02, 8)}px`,
                borderBottomWidth: `${Math.max(wheelSize * 0.04, 16)}px`,
                filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.75)) drop-shadow(0 4px 6px rgba(0,0,0,0.25))'
              }}
            ></div>
            <div 
              className="absolute top-0.5 w-0 h-0 border-l-transparent border-r-transparent border-b-yellow-200"
              style={{
                borderLeftWidth: `${Math.max(wheelSize * 0.01, 4)}px`,
                borderRightWidth: `${Math.max(wheelSize * 0.01, 4)}px`,
                borderBottomWidth: `${Math.max(wheelSize * 0.02, 8)}px`,
                filter: 'drop-shadow(0 0 6px rgba(255, 255, 200, 0.7))'
              }}
            ></div>
            {/* LED tip */}
            <div
              className={`absolute rounded-full bg-yellow-300 ${isSpinning ? 'animate-pulse' : ''}`}
              style={{
                left: '50%',
                top: `${Math.max(wheelSize * 0.04, 16)}px`,
                transform: 'translateX(-50%)',
                width: `${Math.max(wheelSize * 0.02, 6)}px`,
                height: `${Math.max(wheelSize * 0.02, 6)}px`,
                boxShadow: '0 0 10px rgba(255, 223, 0, 0.9), 0 0 20px rgba(255, 223, 0, 0.6)'
              }}
            ></div>
          </div>
        </div>

      </div>


          {/* Enhanced Prize Status */}
          <Card className="p-3 sm:p-4 bg-card/90 backdrop-blur-sm border-border w-full max-w-4xl shadow-lg">
            <h3 className="text-base sm:text-lg font-bold mb-3 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              🎁 Available Prizes
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
              {prizes.map((prize) => (
                <div key={prize.id} className="text-center group">
                  <div className="relative">
                    <Badge
                      variant={prize.won < prize.quota ? "default" : "secondary"}
                      className={`${
                        prize.won < prize.quota
                          ? "bg-gradient-to-r from-accent to-accent/80 text-accent-foreground hover:from-accent/90 hover:to-accent/70 shadow-md"
                          : "bg-muted text-muted-foreground"
                      } transition-all duration-200 group-hover:scale-105 text-xs font-semibold w-full px-2 py-1.5 rounded-lg flex items-center justify-center text-center`}
                    >
                      {prize.name}
                    </Badge>
                    {prize.won < prize.quota && (
                      <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {prize.quota - prize.won}
                      </div>
                    )}
                  </div>
                  {prize.won > 0 && (
                    <div className="text-xs text-primary font-medium mt-1">
                      +{prize.won} won
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>


      {/* Popup Hadiah */}
      <PrizePopup prize={popupPrize} onClose={() => setPopupPrize(null)} />
    </div>
  );
};