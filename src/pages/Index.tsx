import { useState } from 'react';
import { SpinWheel } from '@/components/SpinWheel';
import { AdminPanel } from '@/components/AdminPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Users, Crown, Sparkles, Gamepad2, Shield } from 'lucide-react';

interface Prize {
  id: string;
  name: string;
  color: string;
  quota: number;
  won: number;
  image?: string;
  winPercentage: number; // Persentase kemungkinan menang (0-100)
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



type ViewMode = 'menu' | 'spin-wheel' | 'admin';

const defaultWheelConfig: WheelConfig = {
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

const Index = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('menu');
  const [totalSpins, setTotalSpins] = useState(0);
  const [wheelConfig, setWheelConfig] = useState<WheelConfig>(defaultWheelConfig);


  const [prizes, setPrizes] = useState<Prize[]>([
    {
      id: '1',
      name: 'Free Coffee',
      color: '#8B4513', // Brown coffee color
      quota: 5,
      won: 0,
      winPercentage: 15 // 15% kemungkinan menang
    },
    {
      id: '2',
      name: '10% Discount',
      color: '#FFD700', // Gold for discount
      quota: 10,
      won: 0,
      winPercentage: 20 // 20% kemungkinan menang
    },
    {
      id: '3',
      name: 'Free T-Shirt',
      color: '#4169E1', // Royal blue for clothing
      quota: 3,
      won: 0,
      winPercentage: 8 // 8% kemungkinan menang
    },
    {
      id: '4',
      name: 'Gift Card $25',
      color: '#32CD32', // Lime green for money
      quota: 2,
      won: 0,
      winPercentage: 5 // 5% kemungkinan menang
    },
    {
      id: '5',
      name: 'Try Again',
      color: '#FF6347', // Tomato red for try again
      quota: 20,
      won: 0,
      winPercentage: 45 // 45% kemungkinan menang (paling sering)
    },
    {
      id: '6',
      name: 'VIP Access',
      color: '#9370DB', // Medium purple for VIP
      quota: 1,
      won: 0,
      winPercentage: 2 // 2% kemungkinan menang (sangat langka)
    }
  ]);

  const handlePrizeWon = (prize: Prize) => {
    setPrizes(prev => prev.map(p => 
      p.id === prize.id ? { ...p, won: p.won + 1 } : p
    ));
    setTotalSpins(prev => prev + 1);
  };

  const handlePrizesUpdate = (newPrizes: Prize[]) => {
    setPrizes(newPrizes);
  };

  const handleWheelConfigUpdate = (newConfig: WheelConfig) => {
    setWheelConfig(newConfig);
  };



  const availablePrizes = prizes.filter(prize => prize.won < prize.quota);
  const totalPrizesWon = prizes.reduce((sum, prize) => sum + prize.won, 0);

  const navigateTo = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const renderMenu = () => (
    <div className="min-h-screen bg-background relative overflow-hidden animate-fade-in">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.1),transparent_50%)]"></div>
      
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 group">
              <div className="relative">
                <img 
                  src="/digioh-logo.ico" 
                  alt="DigiOH Logo" 
                  className="w-6 h-6 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform duration-200"
                />
                <Sparkles className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 text-accent animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Prize Wheel Extravaganza
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Choose your experience
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Menu Content */}
      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center space-y-4 sm:space-y-6 mb-8 sm:mb-12 animate-fade-slide-up">
            <div className="inline-flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-lg shadow-lg">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
              <span className="hidden xs:inline">Welcome to the Prize Wheel!</span>
              <span className="xs:hidden">Prize Wheel!</span>
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
            </div>
          </div>

          {/* Menu Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
            {/* Spin Wheel Option */}
            <div className="animate-fade-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="group cursor-pointer" onClick={() => navigateTo('spin-wheel')}>
                <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 hover:bg-card/90 transition-all duration-300 hover:shadow-xl hover:scale-105 relative overflow-hidden">
                  {/* Background Shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <div className="relative z-10 text-center space-y-3 sm:space-y-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Gamepad2 className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
                    </div>
                    
                    <div>
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-2">Spin the Wheel</h3>
                      
                      <div className="flex justify-center gap-2 sm:gap-4 text-xs sm:text-sm flex-wrap">
                        <Badge variant="outline" className="bg-background/50 text-xs">
                          <Users className="w-3 h-3 mr-1" />
                          {totalSpins} Spins
                        </Badge>
                        <Badge variant="outline" className="bg-background/50 text-xs">
                          🏆 {totalPrizesWon} Won
                        </Badge>
                        <Badge variant="outline" className="bg-background/50 text-xs">
                          🎁 {availablePrizes.length} Available
                        </Badge>
                      </div>
                    </div>
                    
                    <Button className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold">
                      Start Spinning! 🎯
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Panel Option */}
            <div className="animate-fade-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="group cursor-pointer" onClick={() => navigateTo('admin')}>
                <div className="bg-card/80 backdrop-blur-sm border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 hover:bg-card/90 transition-all duration-300 hover:shadow-xl hover:scale-105 relative overflow-hidden">
                  {/* Background Shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  
                  <div className="relative z-10 text-center space-y-3 sm:space-y-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-accent-foreground" />
                    </div>
                    
                    <div>
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-2">Admin Panel</h3>
                      
                      <div className="flex justify-center gap-2 sm:gap-4 text-xs sm:text-sm flex-wrap">
                        <Badge variant="outline" className="bg-background/50 text-xs">
                          <Settings className="w-3 h-3 mr-1" />
                          Admin Access
                        </Badge>
                        <Badge variant="outline" className="bg-background/50 text-xs">
                          📊 Statistics
                        </Badge>
                        <Badge variant="outline" className="bg-background/50 text-xs">
                          ⚙️ Settings
                        </Badge>
                      </div>
                    </div>
                    
                    <Button className="w-full bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-accent-foreground font-semibold">
                      Access Admin Panel 🔧
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>


    </div>
  );

  const renderSpinWheel = () => (
    <div className="min-h-screen bg-background relative overflow-hidden animate-slide-in-right">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.1),transparent_50%)]"></div>
      
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 group">
              <div className="relative">
                <img 
                  src="/digioh-logo.ico" 
                  alt="DigiOH Logo" 
                  className="w-6 h-6 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform duration-200"
                />
                <Sparkles className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 text-accent animate-pulse" />
              </div>
            </div>
            
                 <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
                   <Button
                     variant="outline"
                     onClick={() => navigateTo('menu')}
                     className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                     size="sm"
                   >
                     <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                     <span className="hidden sm:inline">Menu</span>
                   </Button>
                 </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-2 sm:px-4 py-2 sm:py-4 md:py-6 relative z-10">
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          {/* Floating Logo */}
          <div className="flex justify-center mb-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-full blur-xl animate-pulse"></div>
              <div className="relative bg-card/80 backdrop-blur-sm border border-border rounded-full p-4 shadow-2xl hover:scale-110 transition-all duration-300">
                <img
                  src="/digioh-logo.ico"
                  alt="DigiOH Logo"
                  className="w-12 h-12 sm:w-16 sm:h-16 group-hover:rotate-12 transition-transform duration-300"
                />
                <Sparkles className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 text-accent animate-pulse" />
              </div>
            </div>
          </div>

          {/* Welcome Section */}
          <div className="text-center space-y-3 sm:space-y-4 animate-fade-in">
            <div className="inline-flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground px-3 sm:px-4 md:px-6 py-2 rounded-full font-semibold text-xs sm:text-sm md:text-base shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
              DigiOH Spin Wheel
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
            </div>
          </div>

            {/* Mobile Stats */}

            {/* Spin Wheel */}
          <div className="animate-fade-in-up">
            <SpinWheel 
              prizes={prizes} 
              onPrizeWon={handlePrizeWon}
              wheelConfig={wheelConfig}
            />
          </div>
        </div>
      </main>
    </div>
  );

  const renderAdminPanel = () => (
    <div className="min-h-screen bg-background relative overflow-hidden animate-slide-in-left">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.1),transparent_50%)]"></div>
      
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 group">
              <div className="relative">
                <img 
                  src="/digioh-logo.ico" 
                  alt="DigiOH Logo" 
                  className="w-8 h-8 group-hover:scale-110 transition-transform duration-200"
                />
                <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-accent animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Prize Wheel Extravaganza
                </h1>
                <p className="text-muted-foreground text-xs md:text-sm">
                  Admin Panel - Event Management
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={() => navigateTo('menu')}
              className="flex items-center gap-2 text-xs md:text-sm"
              size="sm"
            >
              <Settings className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Menu</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 md:py-8 relative z-10">
        <AdminPanel 
          prizes={prizes}
          onPrizesUpdate={handlePrizesUpdate}
          totalSpins={totalSpins}
          wheelConfig={wheelConfig}
          onWheelConfigUpdate={handleWheelConfigUpdate}
        />
      </main>
    </div>
  );

  // Render based on view mode
  switch (viewMode) {
    case 'spin-wheel':
      return renderSpinWheel();
    case 'admin':
      return renderAdminPanel();
    default:
      return renderMenu();
  }
};

export default Index;