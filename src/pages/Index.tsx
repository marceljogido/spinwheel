import { useEffect, useState } from 'react';
import { Sparkles, Users, Trophy, RefreshCw, Pause, Play, Volume2, VolumeX, Music } from 'lucide-react';
import { SpinWheel } from '@/components/SpinWheel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Prize } from '@/types/prize';
import { useAudio } from '@/contexts/AudioContext';
import { listPrizes, recordPrizeWin } from '@/lib/api/prizes';
import { PRIZES_STORAGE_KEY, WHEEL_CONFIG_STORAGE_KEY, TOTAL_SPINS_STORAGE_KEY } from '@/lib/storageKeys';
import { fallbackPrizes, defaultWheelConfig, type WheelConfig } from '@/lib/wheelDefaults';

const Index = () => {
  const { isBgmPlaying, isMuted, toggleBGM, toggleMute } = useAudio();
  const [prizes, setPrizes] = useState<Prize[]>(fallbackPrizes);
  const [wheelConfig, setWheelConfig] = useState<WheelConfig>(defaultWheelConfig);
  const [totalSpins, setTotalSpins] = useState(0);
  const [isLoadingPrizes, setIsLoadingPrizes] = useState(false);
  const [prizeSyncError, setPrizeSyncError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedPrizes = window.localStorage.getItem(PRIZES_STORAGE_KEY);
    if (storedPrizes) {
      try {
        const parsed = JSON.parse(storedPrizes) as Prize[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPrizes(parsed);
        }
      } catch (error) {
        console.warn('Failed to parse stored prizes from localStorage.', error);
        window.localStorage.removeItem(PRIZES_STORAGE_KEY);
      }
    }

    const storedConfig = window.localStorage.getItem(WHEEL_CONFIG_STORAGE_KEY);
    if (storedConfig) {
      try {
        const parsed = JSON.parse(storedConfig) as WheelConfig;
        setWheelConfig({ ...defaultWheelConfig, ...parsed });
      } catch (error) {
        console.warn('Failed to parse stored wheel config from localStorage.', error);
        window.localStorage.removeItem(WHEEL_CONFIG_STORAGE_KEY);
      }
    }

    const storedSpins = window.localStorage.getItem(TOTAL_SPINS_STORAGE_KEY);
    if (storedSpins) {
      const parsed = Number.parseInt(storedSpins, 10);
      if (!Number.isNaN(parsed)) {
        setTotalSpins(parsed);
      }
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadPrizes = async () => {
      setIsLoadingPrizes(true);
      try {
        const remotePrizes = await listPrizes();
        if (!ignore && remotePrizes.length > 0) {
          setPrizes(remotePrizes);
          setPrizeSyncError(null);
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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(PRIZES_STORAGE_KEY, JSON.stringify(prizes));
  }, [prizes]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(WHEEL_CONFIG_STORAGE_KEY, JSON.stringify(wheelConfig));
  }, [wheelConfig]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(TOTAL_SPINS_STORAGE_KEY, totalSpins.toString());
  }, [totalSpins]);

  const handlePrizeWon = async (prize: Prize) => {
    setPrizes(prev => prev.map(p =>
      p.id === prize.id ? { ...p, won: p.won + 1 } : p
    ));
    setTotalSpins(prev => {
      const updated = prev + 1;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(TOTAL_SPINS_STORAGE_KEY, updated.toString());
      }
      return updated;
    });

    try {
      const updated = await recordPrizeWin(prize.id);
      setPrizes(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    } catch (error) {
      console.error('Failed to persist prize win', error);
      setPrizeSyncError('Gagal menyimpan hasil spin ke server.');
    }
  };

  const availablePrizes = prizes.filter(prize => prize.won < prize.quota);
  const totalPrizesWon = prizes.reduce((sum, prize) => sum + prize.won, 0);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden animate-slide-in-right">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.1),transparent_50%)]" />

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
                  Putar roda dan raih hadiah terbaik!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
              <Button
                variant="outline"
                onClick={toggleMute}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                size="sm"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-3 h-3 sm:w-4 sm:h-4" /> : <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />}
                <span className="hidden sm:inline">{isMuted ? 'Unmute' : 'Mute'}</span>
              </Button>

              <Button
                variant="outline"
                onClick={toggleBGM}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
                size="sm"
                title={isBgmPlaying ? 'Stop BGM' : 'Play BGM'}
              >
                {isBgmPlaying ? <Pause className="w-3 h-3 sm:w-4 sm:h-4" /> : <Play className="w-3 h-3 sm:w-4 sm:h-4" />}
                <span className="hidden sm:inline">{isBgmPlaying ? 'Stop BGM' : 'Play BGM'}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 relative z-10">
        <div className="max-w-5xl mx-auto grid gap-6 lg:grid-cols-[1fr_minmax(280px,320px)]">
          <section className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <SpinWheel prizes={availablePrizes.length > 0 ? availablePrizes : prizes} onPrizeWon={handlePrizeWon} wheelConfig={wheelConfig} />

              {(isLoadingPrizes || prizeSyncError) && (
                <div className="w-full rounded-xl border border-border bg-background/70 backdrop-blur p-4 flex flex-col gap-2">
                  {isLoadingPrizes && (
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" /> Menyinkronkan hadiah terbaru…
                    </span>
                  )}
                  {prizeSyncError && (
                    <span className="text-sm text-destructive">
                      {prizeSyncError} — menggunakan data bawaan sementara.
                    </span>
                  )}
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card/70 backdrop-blur p-4 sm:p-6 shadow-md">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-primary" /> Statistik Hadiah
              </h2>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs sm:text-sm">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  {totalSpins} total spin
                </Badge>
                <Badge variant="outline" className="text-xs sm:text-sm">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  {totalPrizesWon} hadiah dimenangkan
                </Badge>
                <Badge variant="outline" className="text-xs sm:text-sm">
                  <Music className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  {isBgmPlaying ? 'BGM aktif' : 'BGM nonaktif'}
                </Badge>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-border/70 bg-background/40 backdrop-blur p-4 sm:p-6 text-sm text-muted-foreground">
              <p className="leading-relaxed">
                Hadiah dikurasi khusus untuk acara ini. Putar roda untuk mendapatkan kesempatan memenangkan hadiah istimewa. Jika stok hadiah habis, roda akan otomatis menyesuaikan pilihan berikutnya.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Index;
