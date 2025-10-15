import { useEffect, useState } from 'react';
import { RefreshCw, Pause, Play, Volume2, VolumeX, Music } from 'lucide-react';
import { SpinWheel } from '@/components/SpinWheel';
import { Button } from '@/components/ui/button';
import type { Prize } from '@/types/prize';
import { useAudio } from '@/contexts/AudioContext';
import { listPrizes, recordPrizeWin } from '@/lib/api/prizes';
import {
  PRIZES_STORAGE_KEY,
  WHEEL_CONFIG_STORAGE_KEY,
  TOTAL_SPINS_STORAGE_KEY,
  LAST_PRIZE_STORAGE_KEY,
} from '@/lib/storageKeys';
import { fallbackPrizes, defaultWheelConfig, type WheelConfig } from '@/lib/wheelDefaults';

const Index = () => {
  const { isBgmPlaying, isMuted, toggleBGM, toggleMute } = useAudio();
  const [prizes, setPrizes] = useState<Prize[]>(fallbackPrizes);
  const [wheelConfig, setWheelConfig] = useState<WheelConfig>(defaultWheelConfig);
  const [totalSpins, setTotalSpins] = useState(0);
  const [isLoadingPrizes, setIsLoadingPrizes] = useState(false);
  const [prizeSyncError, setPrizeSyncError] = useState<string | null>(null);
  const [fetchedRemotePrizes, setFetchedRemotePrizes] = useState(false);
  const [lastPrizeName, setLastPrizeName] = useState<string | null>(null);

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

    const storedLastPrize = window.localStorage.getItem(LAST_PRIZE_STORAGE_KEY);
    if (storedLastPrize) {
      setLastPrizeName(storedLastPrize);
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
          setFetchedRemotePrizes(true);
        }
      } catch (error) {
        if (!ignore) {
          const message = error instanceof Error ? error.message : 'Tidak dapat memuat hadiah dari server';
          setPrizeSyncError(message);
          setFetchedRemotePrizes(false);
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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (lastPrizeName) {
      window.localStorage.setItem(LAST_PRIZE_STORAGE_KEY, lastPrizeName);
    } else {
      window.localStorage.removeItem(LAST_PRIZE_STORAGE_KEY);
    }
  }, [lastPrizeName]);

  const handlePrizeWon = async (prize: Prize) => {
    setPrizes(prev => prev.map(p => (p.id === prize.id ? { ...p, won: p.won + 1 } : p)));
    setTotalSpins(prev => {
      const updated = prev + 1;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(TOTAL_SPINS_STORAGE_KEY, updated.toString());
      }
      return updated;
    });
    setLastPrizeName(prize.name);

    try {
      const updated = await recordPrizeWin(prize.id);
      setPrizes(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    } catch (error) {
      console.error('Failed to persist prize win', error);
      setPrizeSyncError('Gagal menyimpan hasil spin ke server.');
    }
  };

  const availablePrizes = prizes.filter(prize => prize.won < prize.quota);
  const activePrizes = availablePrizes.length > 0 ? availablePrizes : prizes;
  const usingFallback = !fetchedRemotePrizes && !isLoadingPrizes;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f7fb] text-[#0f3a64]">
      <img
        src="/assets/movin-background.svg"
        alt="Latar belakang Bank Mandiri Taspen"
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
      />

      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="flex justify-end gap-2 px-4 pt-6 sm:px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className="flex items-center gap-2 rounded-full border border-white/50 bg-white/70 px-4 text-[#0f3a64] backdrop-blur transition hover:bg-white"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            <span className="text-xs font-semibold uppercase tracking-[0.2em]">{isMuted ? 'Unmute' : 'Mute'}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleBGM}
            className="flex items-center gap-2 rounded-full border border-white/50 bg-white/70 px-4 text-[#0f3a64] backdrop-blur transition hover:bg-white"
          >
            {isBgmPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span className="text-xs font-semibold uppercase tracking-[0.2em]">BGM</span>
          </Button>
        </div>

        <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 pb-16 pt-10 sm:px-6 md:gap-10">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.6em] text-[#1f4f9b]/80">Yuk Kenalan Sama Movin!</p>
            <h1 className="mt-3 max-w-2xl text-balance text-3xl font-black leading-tight text-[#0f3a64] sm:text-4xl md:text-[2.75rem]">
              Mainkan games ini &amp; bawalah hadiah menariknya!
            </h1>
          </div>

          <SpinWheel
            prizes={activePrizes}
            onPrizeWon={handlePrizeWon}
            wheelConfig={wheelConfig}
          />

          <div className="w-full max-w-xl rounded-[32px] bg-white/90 px-6 py-6 text-center shadow-[0_20px_45px_rgba(15,58,100,0.18)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.5em] text-[#1f4f9b]/70">Hadiah Kamu</p>
            <p className="mt-3 text-2xl font-extrabold text-[#0f3a64] sm:text-3xl">
              {lastPrizeName ?? 'Putar roda untuk melihat hadiahmu'}
            </p>
          </div>

          {(isLoadingPrizes || prizeSyncError || usingFallback) && (
            <div className="flex w-full max-w-xl flex-col items-center gap-2 text-center">
              {isLoadingPrizes && (
                <span className="flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-[#0f3a64] backdrop-blur">
                  <RefreshCw className="h-4 w-4 animate-spin" /> Menyinkronkan hadiah terbaru…
                </span>
              )}
              {prizeSyncError && (
                <span className="flex items-center gap-2 rounded-[24px] bg-[#ffefef] px-4 py-2 text-sm font-medium text-[#b42318] shadow">
                  {prizeSyncError}
                </span>
              )}
              {usingFallback && !prizeSyncError && !isLoadingPrizes && (
                <span className="flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 text-sm font-medium text-[#0f3a64] backdrop-blur">
                  <Music className="h-4 w-4" /> Menggunakan data bawaan sementara.
                </span>
              )}
            </div>
          )}
        </main>

        <footer className="flex flex-wrap items-center justify-center gap-3 px-4 pb-8 text-xs text-[#0f3a64]/80 sm:px-6">
          <span className="rounded-full bg-white/70 px-4 py-2 font-semibold uppercase tracking-[0.3em] backdrop-blur">
            Total Spin: {totalSpins}
          </span>
          <span className="rounded-full bg-white/70 px-4 py-2 font-semibold uppercase tracking-[0.3em] backdrop-blur">
            Hadiah Aktif: {activePrizes.length}
          </span>
        </footer>
      </div>
    </div>
  );
};

export default Index;
