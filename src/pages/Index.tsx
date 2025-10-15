import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { SpinWheel } from '@/components/SpinWheel';
import { AdminPanel } from '@/components/AdminPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAudio } from '@/contexts/AudioContext';
import { Settings, Users, Crown, Sparkles, Gamepad2, Shield, Volume2, VolumeX, Music, Play, Pause } from 'lucide-react';
import type { Prize } from '@/types/prize';
import { listPrizes, recordPrizeWin } from '@/lib/api/prizes';
import { login, logout, fetchProfile } from '@/lib/api/auth';
import type { AuthSession } from '@/types/auth';

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

const fallbackPrizes: Prize[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Free Coffee',
    color: '#8B4513',
    quota: 5,
    won: 0,
    winPercentage: 15
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    name: '10% Discount',
    color: '#FFD700',
    quota: 10,
    won: 0,
    winPercentage: 20
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    name: 'Free T-Shirt',
    color: '#4169E1',
    quota: 3,
    won: 0,
    winPercentage: 8
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    name: 'Gift Card $25',
    color: '#32CD32',
    quota: 2,
    won: 0,
    winPercentage: 5
  },
  {
    id: '55555555-5555-4555-8555-555555555555',
    name: 'Try Again',
    color: '#FF6347',
    quota: 20,
    won: 0,
    winPercentage: 45
  },
  {
    id: '66666666-6666-4666-8666-666666666666',
    name: 'VIP Access',
    color: '#9370DB',
    quota: 1,
    won: 0,
    winPercentage: 2
  }
];

const AUTH_STORAGE_KEY = 'spinwheel-admin-session';

const Index = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('menu');
  const [totalSpins, setTotalSpins] = useState(0);
  const [wheelConfig, setWheelConfig] = useState<WheelConfig>(defaultWheelConfig);
  const { isBgmPlaying, isMuted, toggleBGM, toggleMute } = useAudio();

  const [prizes, setPrizes] = useState<Prize[]>(fallbackPrizes);
  const [isLoadingPrizes, setIsLoadingPrizes] = useState(false);
  const [prizeSyncError, setPrizeSyncError] = useState<string | null>(null);
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isVerifyingSession, setIsVerifyingSession] = useState(false);
  const [hasLoadedSession, setHasLoadedSession] = useState(false);

  const lastVerifiedTokenRef = useRef<string | null>(null);

  const persistSession = useCallback((session: AuthSession) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    }
    lastVerifiedTokenRef.current = session.token;
    setAuthSession(session);
  }, []);

  const clearAuthSession = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    lastVerifiedTokenRef.current = null;
    setAuthSession(null);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as AuthSession;
        setAuthSession(parsed);
      } catch (error) {
        console.warn('Failed to parse stored admin session', error);
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setHasLoadedSession(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedSession || !authSession?.token) {
      return;
    }
    if (lastVerifiedTokenRef.current === authSession.token) {
      return;
    }

    let cancelled = false;

    const verifySession = async () => {
      setIsVerifyingSession(true);
      try {
        const profile = await fetchProfile(authSession.token);
        if (cancelled) {
          return;
        }
        persistSession({
          token: authSession.token,
          username: profile.username,
          expiresAt: profile.expiresAt
        });
        setAuthError(null);
      } catch (error) {
        if (cancelled) {
          return;
        }
        console.warn('Failed to validate admin session', error);
        clearAuthSession();
      } finally {
        if (!cancelled) {
          setIsVerifyingSession(false);
        }
      }
    };

    verifySession();

    return () => {
      cancelled = true;
    };
  }, [authSession?.token, hasLoadedSession, clearAuthSession, persistSession]);

  useEffect(() => {
    let ignore = false;
    const loadPrizes = async () => {
      setIsLoadingPrizes(true);
      try {
        const remotePrizes = await listPrizes();
        if (!ignore && remotePrizes.length > 0) {
          setPrizes(remotePrizes);
        }
      } catch (error) {
        if (!ignore) {
          const message = error instanceof Error ? error.message : 'Tidak dapat memuat hadiah dari server';
          setPrizeSyncError(message);
          console.warn('Failed to load prizes from API, using local fallback.', error);
        }
      } finally {
        if (!ignore) {
          setIsLoadingPrizes(false);
        }
      }
    };

    loadPrizes();

    return () => {
      ignore = true;
    };
  }, []);

  const handlePrizeWon = async (prize: Prize) => {
    setPrizes(prev => prev.map(p =>
      p.id === prize.id ? { ...p, won: p.won + 1 } : p
    ));
    setTotalSpins(prev => prev + 1);

    try {
      const updated = await recordPrizeWin(prize.id);
      setPrizes(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    } catch (error) {
      console.error('Failed to persist prize win', error);
      setPrizeSyncError('Gagal menyimpan hasil spin ke server.');
    }
  };

  const handlePrizesUpdate = (newPrizes: Prize[]) => {
    setPrizes(newPrizes);
  };

  const handleWheelConfigUpdate = (newConfig: WheelConfig) => {
    setWheelConfig(newConfig);
  };

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!loginForm.username.trim() || !loginForm.password.trim()) {
      setAuthError('Masukkan username dan password admin.');
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const credentials = {
        username: loginForm.username.trim(),
        password: loginForm.password
      };

      const result = await login(credentials.username, credentials.password);
      const profile = await fetchProfile(result.token);

      const session: AuthSession = {
        token: result.token,
        username: profile.username,
        expiresAt: profile.expiresAt
      };

      persistSession(session);
      setLoginForm({ username: '', password: '' });

      try {
        const remotePrizes = await listPrizes();
        if (remotePrizes.length > 0) {
          setPrizes(remotePrizes);
        }
      } catch (error) {
        console.warn('Logged in but failed to refresh prizes from API', error);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal masuk ke server.';
      setAuthError(message);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    if (authSession?.token) {
      try {
        await logout(authSession.token);
      } catch (error) {
        console.warn('Failed to logout cleanly', error);
      }
    }
    clearAuthSession();
    setAuthError(null);
    setViewMode('menu');
  };


  const availablePrizes = prizes.filter(prize => prize.won < prize.quota);
  const totalPrizesWon = prizes.reduce((sum, prize) => sum + prize.won, 0);

  const navigateTo = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const isAuthenticated = Boolean(authSession);

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
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <Badge variant="outline" className="text-xs sm:text-sm">
                  Masuk sebagai {authSession?.username}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs sm:text-sm text-muted-foreground">
                  Admin belum login
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Menu Content */}
      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-16 relative z-10">
        <div className="max-w-4xl mx-auto space-y-4">
          {(isLoadingPrizes || prizeSyncError) && (
            <div className="rounded-xl border border-border bg-card/70 backdrop-blur p-4 flex flex-col gap-2">
              {isLoadingPrizes && (
                <span className="text-sm text-muted-foreground">Menyinkronkan hadiah dari server…</span>
              )}
              {prizeSyncError && (
                <span className="text-sm text-destructive">
                  {prizeSyncError} — menggunakan data bawaan sementara.
                </span>
              )}
            </div>
          )}
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
              {/* Audio Controls */}
              <Button
                variant="outline"
                onClick={toggleMute}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                size="sm"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="w-3 h-3 sm:w-4 sm:h-4" /> : <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />}
                <span className="hidden sm:inline">{isMuted ? "Unmute" : "Mute"}</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={toggleBGM}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                size="sm"
                title={isBgmPlaying ? "Stop BGM" : "Play BGM"}
              >
                {isBgmPlaying ? <Pause className="w-3 h-3 sm:w-4 sm:h-4" /> : <Play className="w-3 h-3 sm:w-4 sm:h-4" />}
                <span className="hidden sm:inline">{isBgmPlaying ? "Stop BGM" : "Play BGM"}</span>
              </Button>
              
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
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <Badge variant="outline" className="text-xs sm:text-sm">
                  Masuk sebagai {authSession?.username}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs sm:text-sm text-muted-foreground">
                  Admin belum login
                </Badge>
              )}
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

  const renderAdminPanel = () => {
    if (!isAuthenticated) {
      return (
        <div className="min-h-screen bg-background relative overflow-hidden animate-slide-in-left">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.1),transparent_50%)]"></div>

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
                      Login Admin Diperlukan
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

          <main className="container mx-auto px-4 py-8 relative z-10 flex items-center justify-center">
            <Card className="w-full max-w-md shadow-xl border-border/80 bg-card/90 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">Masuk ke Admin Panel</CardTitle>
                <p className="text-sm text-muted-foreground">Gunakan kredensial yang dikonfigurasi di environment backend.</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-username">Username</Label>
                    <Input
                      id="admin-username"
                      value={loginForm.username}
                      onChange={event => {
                        setLoginForm(prev => ({ ...prev, username: event.target.value }));
                        setAuthError(null);
                      }}
                      autoComplete="username"
                      placeholder="admin"
                      disabled={isAuthenticating}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      value={loginForm.password}
                      onChange={event => {
                        setLoginForm(prev => ({ ...prev, password: event.target.value }));
                        setAuthError(null);
                      }}
                      autoComplete="current-password"
                      placeholder="********"
                      disabled={isAuthenticating}
                    />
                  </div>
                  {authError && (
                    <p className="text-sm text-destructive">{authError}</p>
                  )}
                  {isVerifyingSession && !authError && (
                    <p className="text-xs text-muted-foreground">Memeriksa sesi tersimpan…</p>
                  )}
                  <Button type="submit" className="w-full" disabled={isAuthenticating}>
                    {isAuthenticating ? 'Memproses…' : 'Masuk'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </main>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background relative overflow-hidden animate-slide-in-left">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.1),transparent_50%)]"></div>

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

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs md:text-sm">{authSession?.username}</Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                >
                  Keluar
                </Button>
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
          </div>
        </header>

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
  };

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