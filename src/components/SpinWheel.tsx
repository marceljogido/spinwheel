import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AudioManager } from './AudioManager';

interface Prize {
  id: string;
  name: string;
  color: string;
  quota: number;
  won: number;
  image?: string;
}

interface WheelConfig {
  centerText: string;
  spinAnimation: 'smooth' | 'bounce' | 'natural';
  defaultColor: string;
  showLabels: boolean;
  showImages: boolean;
  wheelSize: number;
  showConfetti: boolean;
  showShake: boolean;
  showGlow: boolean;
  dummySegments: number;
}

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

  // Responsive wheel size
  useEffect(() => {
    const updateWheelSize = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 480) {
        setWheelSize(250);
      } else if (screenWidth < 640) {
        setWheelSize(280);
      } else if (screenWidth < 768) {
        setWheelSize(320);
      } else {
        setWheelSize(config.wheelSize);
      }
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
    const spinAudio = new Audio();
    spinAudio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
    spinAudio.volume = 0.5;
    spinAudio.play().catch(console.error);
    
    // Random spin duration between 4-6 seconds for more excitement
    const spinDuration = 4 + Math.random() * 2;
    
    // Calculate random rotation (10-15 full spins for more drama)
    const spins = 10 + Math.random() * 5;
    const finalRotation = currentRotation + (spins * 360);
    
    // Select winning prize
    const winningPrize = availablePrizes[Math.floor(Math.random() * availablePrizes.length)];
    
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
      onPrizeWon(winningPrize);
      
      // Show bounce effect
      if (config.spinAnimation === 'bounce') {
        setShowBounce(true);
        setTimeout(() => setShowBounce(false), 800);
      }
      
      createEnhancedConfetti();
      setPopupPrize(winningPrize);
      
      // Play win sound
      const winAudio = new Audio();
      winAudio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
      winAudio.volume = 0.7;
      winAudio.play().catch(console.error);
    }, spinDuration * 1000);
  };

  const segmentAngle = 360 / allSegments.length;

  return (
    <div className={`flex flex-col items-center space-y-6 md:space-y-8 w-full max-w-4xl mx-auto px-4 ${isShaking ? 'animate-screen-shake' : ''}`}>
      {/* Wheel Container */}
      <div className="relative wheel-responsive" style={{ 
        width: wheelSize, 
        height: wheelSize
      }}>
        {/* Outer Glow Effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 blur-xl animate-pulse"></div>
        
        {/* Wheel with 3D effects and bounce */}
        <div 
          ref={wheelRef}
          className={`relative w-full h-full rounded-full border-8 border-primary shadow-carnival overflow-hidden transform transition-all duration-300 hover:scale-105 wheel-3d wheel-3d-hover ${
            showBounce ? 'animate-wheel-bounce-stop' : ''
          }`}
          style={{ 
            background: `conic-gradient(${allSegments.map((prize, index) => 
              `${prize.color} ${index * segmentAngle}deg ${(index + 1) * segmentAngle}deg`
            ).join(', ')})`,
            boxShadow: '0 0 50px rgba(255, 215, 0, 0.3), 0 10px 40px -10px rgba(255, 215, 0, 0.3)'
          }}
        >
          {/* Prize Segments */}
          {allSegments.map((prize, index) => {
            const rotation = index * segmentAngle;
            const isAvailable = prize.won < prize.quota;
            const isWinningPrize = winningPrize?.id === prize.id;
            const isDummy = prize.id.startsWith('dummy-');
            
            // Get appropriate icon for each prize
            const getPrizeIcon = (prizeName: string) => {
              const name = prizeName.toLowerCase();
              if (name.includes('coffee')) return '☕';
              if (name.includes('discount') || name.includes('%')) return '💰';
              if (name.includes('shirt') || name.includes('t-shirt')) return '👕';
              if (name.includes('gift') || name.includes('card')) return '🎁';
              if (name.includes('vip') || name.includes('access')) return '👑';
              if (name.includes('try again') || name.includes('zonk')) return '🔄';
              return '🎯'; // default icon
            };
            
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
                  className={`text-center transform -rotate-90 flex flex-col items-center transition-all duration-300 ${
                    isAvailable ? 'opacity-100' : 'opacity-50'
                  } ${isSpinning ? 'animate-pulse' : ''} ${
                    isWinningPrize && config.showGlow ? 'animate-prize-glow' : ''
                  } ${isWinningPrize ? 'animate-prize-float' : ''}`}
                  style={{ 
                    marginTop: prize.image ? 'calc(-50% + 60px)' : 'calc(-50% + 40px)',
                    transform: 'translateY(-50%)'
                  }}
                >
                  {/* Prize Image or Icon */}
                  {prize.image && config.showImages ? (
                    <div className="mb-2 transform hover:scale-110 transition-transform duration-200">
                      <img 
                        src={prize.image} 
                        alt={prize.name}
                        className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 object-cover rounded-full border-2 border-white shadow-lg"
                      />
                    </div>
                  ) : (
                    <div className="mb-2 w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-full border-2 border-white/30 shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-200">
                      <span className="text-lg sm:text-2xl md:text-3xl drop-shadow-lg">
                        {getPrizeIcon(prize.name)}
                      </span>
                    </div>
                  )}
                  
                  {/* Prize Text */}
                  {config.showLabels && (
                    <div className="text-white font-bold text-xs sm:text-sm md:text-base drop-shadow-lg px-1 sm:px-2 text-center max-w-[60px] sm:max-w-[80px] leading-tight">
                      {prize.name}
                    </div>
                  )}
                  
                  {!isAvailable && !isDummy && (
                    <div className="text-xs text-red-200 font-semibold mt-1 bg-red-600/20 px-2 py-1 rounded-full backdrop-blur-sm">
                      SOLD OUT
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Center Hub with enhanced design */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-wheel rounded-full border-2 sm:border-4 border-primary-foreground shadow-lg flex items-center justify-center animate-pulse">
          <div className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 bg-primary-foreground rounded-full shadow-inner"></div>
          <div className="absolute w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 border-2 border-primary-foreground/30 rounded-full"></div>
          {/* Center Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs sm:text-xs md:text-sm font-bold text-primary-foreground">
              {config.centerText}
            </span>
          </div>
        </div>
        
        {/* Enhanced Pointer */}
        <div className="absolute -top-1 sm:-top-2 md:-top-4 left-1/2 transform -translate-x-1/2 z-10">
          <div className="relative">
            <div className="w-0 h-0 border-l-3 border-r-3 border-b-6 sm:border-l-4 sm:border-r-4 sm:border-b-8 md:border-l-6 md:border-r-6 md:border-b-12 border-l-transparent border-r-transparent border-b-primary shadow-lg"></div>
            <div className="absolute top-1 w-0 h-0 border-l-1.5 border-r-1.5 border-b-3 sm:border-l-2 sm:border-r-2 sm:border-b-4 md:border-l-3 md:border-r-3 md:border-b-6 border-l-transparent border-r-transparent border-b-white"></div>
          </div>
        </div>

        {/* Spin Count Display */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
            Spins: {spinCount}
          </Badge>
        </div>
      </div>

      {/* Enhanced Spin Button */}
      <Button 
        onClick={spin}
        disabled={isSpinning || availablePrizes.length === 0}
        size="lg"
        className="bg-gradient-wheel hover:bg-gradient-win text-primary-foreground font-bold text-base sm:text-lg md:text-xl px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-6 rounded-full shadow-glow-primary transition-all duration-300 hover:shadow-glow-win hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group w-full max-w-sm sm:max-w-md"
      >
        {/* Button background animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        
        <div className="relative flex items-center justify-center">
          {isSpinning ? (
            <>
              <div className="animate-spin w-6 h-6 border-2 border-primary-foreground border-t-transparent rounded-full mr-3"></div>
              <span className="animate-pulse">Spinning...</span>
            </>
          ) : availablePrizes.length === 0 ? (
            'All Prizes Won! 🎉'
          ) : (
            <>
              <span className="mr-2">🎯</span>
              SPIN THE WHEEL!
              <span className="ml-2">🎯</span>
            </>
          )}
        </div>
      </Button>

      {/* Enhanced Prize Status */}
      <Card className="p-3 sm:p-4 md:p-6 bg-card/80 backdrop-blur-sm border-border w-full max-w-2xl">
        <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Available Prizes
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
          {prizes.map((prize) => (
            <div key={prize.id} className="text-center group">
              <Badge 
                variant={prize.won < prize.quota ? "default" : "secondary"}
                className={`${
                  prize.won < prize.quota 
                    ? "bg-accent text-accent-foreground hover:bg-accent/80" 
                    : "bg-muted text-muted-foreground"
                } transition-all duration-200 group-hover:scale-105 text-xs sm:text-sm`}
              >
                {prize.name}
              </Badge>
              <div className="text-xs text-muted-foreground mt-1 font-medium">
                {prize.quota - prize.won} left
              </div>
              {prize.won > 0 && (
                <div className="text-xs text-primary mt-1">
                  {prize.won} won
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Audio Manager */}
      <AudioManager />

      {/* Popup Hadiah */}
      <PrizePopup prize={popupPrize} onClose={() => setPopupPrize(null)} />
    </div>
  );
};