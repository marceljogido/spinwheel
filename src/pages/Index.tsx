import { useEffect, useState, useCallback } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { io } from 'socket.io-client';
import { SpinWheel } from '@/components/SpinWheel';
import type { Prize } from '@/types/prize';
import { listPrizes, recordPrizeWin } from '@/lib/api/prizes';
import {
  PRIZES_STORAGE_KEY,
  WHEEL_CONFIG_STORAGE_KEY,
  TOTAL_SPINS_STORAGE_KEY,
  LAST_PRIZE_STORAGE_KEY,
} from '@/lib/storageKeys';
import { fallbackPrizes, defaultWheelConfig, type WheelConfig } from '@/lib/wheelDefaults';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

const Index = () => {
  const [prizes, setPrizes] = useState<Prize[]>(fallbackPrizes);
  const [wheelConfig, setWheelConfig] = useState<WheelConfig>(defaultWheelConfig);
  const [totalSpins, setTotalSpins] = useState(0);
  const [isLoadingPrizes, setIsLoadingPrizes] = useState(false);
  const [prizeSyncError, setPrizeSyncError] = useState<string | null>(null);
  const [fetchedRemotePrizes, setFetchedRemotePrizes] = useState(false);
  const [lastPrizeName, setLastPrizeName] = useState<string | null>(null);
  const [activePrizeName, setActivePrizeName] = useState<string | null>(null);

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

  const refreshPrizes = useCallback(async () => {
    setIsLoadingPrizes(true);
    try {
      const remotePrizes = await listPrizes();
      if (remotePrizes.length > 0) {
        setPrizes(remotePrizes);
        setPrizeSyncError(null);
        setFetchedRemotePrizes(true);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Tidak dapat memuat hadiah dari server';
      setPrizeSyncError(message);
      setFetchedRemotePrizes(false);
      console.warn('Failed to load prizes from API, using local fallback.', error);
    } finally {
      setIsLoadingPrizes(false);
    }
  }, []);

  useEffect(() => {
    void refreshPrizes();
  }, [refreshPrizes]);

  useEffect(() => {
    const socket = io(SOCKET_URL, { withCredentials: true });
    socket.on('prizes_updated', () => {
      void refreshPrizes();
    });
    return () => {
      socket.disconnect();
    };
  }, [refreshPrizes]);

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
    setActivePrizeName(null);

    if (!fetchedRemotePrizes) {
      return;
    }

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

  const showStatusBanner = Boolean(prizeSyncError) || (isLoadingPrizes && !fetchedRemotePrizes);

  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-[#f6f7fb] text-[#0f3a64]">
      <img
        src="/assets/background.jpg"
        alt="Latar belakang Bank Mandiri Taspen"
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
      />

      <div className="relative z-10 flex min-h-[100svh] flex-col items-center px-4 pb-10 pt-10 text-[#0f3a64] sm:px-6 md:pb-12 md:pt-12">

        <main className="-mb-36 flex w-full flex-1 flex-col items-center justify-center gap-10 sm:gap-12">
          <SpinWheel
            prizes={activePrizes}
            onPrizeWon={handlePrizeWon}
            wheelConfig={wheelConfig}
            onActivePrizeChange={prize => setActivePrizeName(prize ? prize.name : null)}
          />

          {/* <div className="w-full max-w-xl text-center -mt-8">
            <div className="mx-auto flex min-w-[260px] max-w-md items-center justify-center gap-3 overflow-hidden rounded-[32px] bg-gradient-to-r from-[#0d6c39] via-[#11a84f] to-[#74f29a] px-6 py-4 text-center shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur">
              <span className="text-base font-semibold uppercase tracking-[0.6em] text-white/80">[</span>
              <span className="max-w-full px-3 text-lg font-black uppercase tracking-[0.24em] text-white whitespace-nowrap sm:text-xl">
                {activePrizeName ?? lastPrizeName ?? 'Putar roda untuk melihat hadiahmu'}
              </span>
              <span className="text-base font-semibold uppercase tracking-[0.6em] text-white/80">]</span>
            </div>
          </div> */}

          {showStatusBanner && (
            <div className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-[#0f3a64] backdrop-blur">
              {prizeSyncError ? <AlertTriangle className="h-4 w-4" /> : <RefreshCw className="h-4 w-4 animate-spin" />}
              {prizeSyncError ?? 'Menyinkronkan hadiah terbaru…'}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
