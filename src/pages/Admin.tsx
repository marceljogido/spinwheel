import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Sparkles, Settings, RefreshCw } from 'lucide-react';
import { AdminPanel } from '@/components/AdminPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fallbackPrizes, defaultWheelConfig, type WheelConfig } from '@/lib/wheelDefaults';
import type { Prize } from '@/types/prize';
import { listPrizes } from '@/lib/api/prizes';
import { login, logout, fetchProfile } from '@/lib/api/auth';
import type { AuthSession } from '@/types/auth';
import { AUTH_STORAGE_KEY, PRIZES_STORAGE_KEY, WHEEL_CONFIG_STORAGE_KEY, TOTAL_SPINS_STORAGE_KEY } from '@/lib/storageKeys';

const Admin = () => {
  const [prizes, setPrizes] = useState<Prize[]>(fallbackPrizes);
  const [wheelConfig, setWheelConfig] = useState<WheelConfig>(defaultWheelConfig);
  const [totalSpins, setTotalSpins] = useState(0);
  const [isLoadingPrizes, setIsLoadingPrizes] = useState(false);
  const [prizeSyncError, setPrizeSyncError] = useState<string | null>(null);

  const [authSession, setAuthSession] = useState<AuthSession | null>(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isVerifyingSession, setIsVerifyingSession] = useState(false);
  const [hasLoadedSession, setHasLoadedSession] = useState(false);

  const lastVerifiedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (rawSession) {
      try {
        const parsed = JSON.parse(rawSession) as AuthSession;
        setAuthSession(parsed);
      } catch (error) {
        console.warn('Failed to parse stored admin session', error);
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      }
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

    setHasLoadedSession(true);
  }, []);

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
  }, [authSession?.token, clearAuthSession, hasLoadedSession, persistSession]);

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
          console.warn('Failed to load prizes from API, using local data.', error);
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
  };

  const handlePrizesUpdate = (newPrizes: Prize[]) => {
    setPrizes(newPrizes);
  };

  const handleWheelConfigUpdate = (newConfig: WheelConfig) => {
    setWheelConfig(newConfig);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.1),transparent_50%)]" />

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
                  Prize Wheel Admin
                </h1>
                <p className="text-muted-foreground text-xs md:text-sm">
                  Kelola hadiah dan konfigurasi roda secara aman.
                </p>
              </div>
            </div>

            {authSession ? (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs md:text-sm">{authSession.username}</Badge>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Keluar
                </Button>
              </div>
            ) : (
              <Badge variant="outline" className="text-xs md:text-sm text-muted-foreground">
                Admin belum login
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-10 relative z-10">
        {authSession ? (
          <div className="space-y-4">
            {(isLoadingPrizes || prizeSyncError) && (
              <div className="rounded-xl border border-border bg-card/70 backdrop-blur p-4 flex flex-col gap-2">
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

            <AdminPanel
              prizes={prizes}
              onPrizesUpdate={handlePrizesUpdate}
              totalSpins={totalSpins}
              wheelConfig={wheelConfig}
              onWheelConfigUpdate={handleWheelConfigUpdate}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <Card className="w-full max-w-md shadow-xl border-border/80 bg-card/90 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold flex items-center gap-2">
                  <Settings className="w-5 h-5" /> Masuk ke Admin Panel
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Gunakan kredensial yang dikonfigurasi di environment backend.
                </p>
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
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
