import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2, Image as ImageIcon, Settings, BarChart3, Sparkles, RefreshCw, Info } from 'lucide-react';
import { AudioManager } from './AudioManager';
import type { Prize } from '@/types/prize';
import type { WheelConfig } from '@/lib/wheelDefaults';

interface AdminPanelProps {
  prizes: Prize[];
  onPrizesUpdate: (prizes: Prize[]) => void;
  totalSpins: number;
  wheelConfig: WheelConfig;
  onWheelConfigUpdate: (config: WheelConfig) => void;
}

const COLOR_CHOICES = ['#1f4f9b', '#f5c33f', '#cfd3dc', '#2c6eb6', '#8b4513', '#ff6347', '#32cd32'];

const randomColor = () => COLOR_CHOICES[Math.floor(Math.random() * COLOR_CHOICES.length)];

export const AdminPanel = ({
  prizes,
  onPrizesUpdate,
  totalSpins,
  wheelConfig,
  onWheelConfigUpdate,
}: AdminPanelProps) => {
  const [newPrize, setNewPrize] = useState(() => ({
    name: '',
    quota: 1,
    winPercentage: 0,
    color: randomColor(),
    image: '',
  }));

  const totalWinPercentage = useMemo(
    () => Number(prizes.reduce((sum, prize) => sum + Number(prize.winPercentage ?? 0), 0).toFixed(2)),
    [prizes],
  );

  const totalRemainingPrize = useMemo(
    () => prizes.reduce((sum, prize) => sum + Math.max(prize.quota - prize.won, 0), 0),
    [prizes],
  );

  const clampPercentage = (value: number) => Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));

  const createEmptyPrize = (baseColor: string): Prize => ({
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}`,
    name: '',
    color: baseColor,
    quota: 1,
    won: 0,
    winPercentage: 0,
  });

  const updatePrize = (id: string, updates: Partial<Prize>) => {
    onPrizesUpdate(
      prizes.map(prize => (prize.id === id ? { ...prize, ...updates, winPercentage: clampPercentage(updates.winPercentage ?? prize.winPercentage) } : prize)),
    );
  };

  const addPrize = () => {
    if (!newPrize.name.trim()) return;
    const prize: Prize = {
      ...createEmptyPrize(newPrize.color),
      name: newPrize.name.trim(),
      quota: Math.max(0, newPrize.quota),
      winPercentage: clampPercentage(newPrize.winPercentage),
      image: newPrize.image ? newPrize.image : undefined,
    };
    onPrizesUpdate([...prizes, prize]);
    setNewPrize({
      name: '',
      quota: 1,
      winPercentage: 0,
      color: randomColor(),
      image: '',
    });
  };

  const removePrize = (id: string) => {
    onPrizesUpdate(prizes.filter(prize => prize.id !== id));
  };

  const handleImageUpload = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const imageUrl = e.target?.result as string;
      updatePrize(id, { image: imageUrl });
    };
    reader.readAsDataURL(file);
  };

  const handleNewPrizeImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const imageUrl = e.target?.result as string;
      setNewPrize(prev => ({ ...prev, image: imageUrl }));
    };
    reader.readAsDataURL(file);
  };

  const resetStatistics = () => {
    onPrizesUpdate(prizes.map(prize => ({ ...prize, won: 0 })));
  };

  const updateWheelConfigValue = <K extends keyof WheelConfig>(key: K, value: WheelConfig[K]) => {
    onWheelConfigUpdate({ ...wheelConfig, [key]: value });
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-wheel bg-clip-text text-transparent">Admin Control Panel</h2>
          <p className="text-muted-foreground mt-2">Kelola hadiah, konfigurasi roda, dan audio dalam satu tempat.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Total Win Percentage</CardTitle>
              <CardDescription>Pastikan totalnya tidak melebihi 100%.</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  totalWinPercentage > 100 ? 'text-red-500' : totalWinPercentage === 100 ? 'text-emerald-500' : 'text-amber-500'
                }`}
              >
                {totalWinPercentage}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Total Stok Hadiah</CardTitle>
              <CardDescription>Sisa hadiah yang belum dimenangkan.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{totalRemainingPrize}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Total Spin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{totalSpins}</div>
            </CardContent>
          </Card>
        </div>

        {totalWinPercentage !== 100 && (
          <div className="mx-auto flex max-w-xl items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-left text-sm text-amber-700">
            <Info className="h-4 w-4 flex-shrink-0" />
            <p>
              Total persentase saat ini {totalWinPercentage}%.{' '}
              {totalWinPercentage > 100 ? 'Turunkan persentase hadiah hingga total 100% agar peluang terbagi adil.' : 'Masih ada peluang tersisa, tambahkan ke hadiah lain atau sisakan sebagai random pick.'}
            </p>
          </div>
        )}
      </div>

      <Tabs defaultValue="prizes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="prizes" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Hadiah
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Statistik
          </TabsTrigger>
          <TabsTrigger value="audio" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Audio & Pengaturan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prizes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tambah Hadiah Baru</CardTitle>
              <CardDescription>Isi data hadiah, kemudian klik tambah. Semua field dapat diedit kembali.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="new-prize-name">Nama Hadiah</Label>
                  <Input id="new-prize-name" value={newPrize.name} onChange={event => setNewPrize(prev => ({ ...prev, name: event.target.value }))} placeholder="Contoh: Handuk Eksklusif" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-prize-percentage">Persentase Menang (%)</Label>
                  <Input
                    id="new-prize-percentage"
                    type="number"
                    min={0}
                    max={100}
                    value={newPrize.winPercentage}
                    onChange={event => setNewPrize(prev => ({ ...prev, winPercentage: clampPercentage(Number(event.target.value)) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-prize-quota">Stok Hadiah</Label>
                  <Input id="new-prize-quota" type="number" min={0} value={newPrize.quota} onChange={event => setNewPrize(prev => ({ ...prev, quota: Math.max(0, Number(event.target.value)) }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-prize-color">Warna Segmen</Label>
                  <Input id="new-prize-color" type="color" value={newPrize.color} onChange={event => setNewPrize(prev => ({ ...prev, color: event.target.value }))} className="h-10 w-20 p-1" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="new-prize-image">Gambar Hadiah (opsional)</Label>
                  <div className="flex flex-wrap items-center gap-3">
                    <Input id="new-prize-image" type="file" accept="image/*" onChange={handleNewPrizeImage} className="max-w-xs" />
                    {newPrize.image && (
                      <div className="flex items-center gap-3">
                        <img src={newPrize.image} alt="Preview hadiah baru" className="h-14 w-14 rounded-lg border object-cover" />
                        <Button variant="outline" size="sm" onClick={() => setNewPrize(prev => ({ ...prev, image: '' }))}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={addPrize} className="bg-gradient-wheel hover:bg-gradient-win">
                <Plus className="mr-2 h-4 w-4" />
                Tambah Hadiah
              </Button>
            </CardFooter>
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {prizes.length === 0 ? (
              <Card className="sm:col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-5">
                <CardContent className="py-12 text-center text-muted-foreground">Belum ada hadiah terdaftar. Tambahkan hadiah baru di atas.</CardContent>
              </Card>
            ) : (
              prizes.map((prize, index) => {
                const remaining = Math.max(prize.quota - prize.won, 0);
                const isLosingPrize = prize.name.toLowerCase().includes('coba lagi') || prize.name.toLowerCase().includes('belum beruntung');
                return (
                  <Card key={prize.id} className="flex h-full flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                      <div>
                        <CardTitle>Prize {index + 1}</CardTitle>
                        <CardDescription>ID: {prize.id.slice(0, 8)}…</CardDescription>
                      </div>
                      <Badge variant={remaining > 0 ? 'default' : 'secondary'}>{remaining > 0 ? `${remaining} tersisa` : 'Habis'}</Badge>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col space-y-5">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Nama Hadiah</Label>
                          <Input value={prize.name} onChange={event => updatePrize(prize.id, { name: event.target.value })} placeholder="Masukkan nama hadiah" />
                        </div>
                        <div className="space-y-2">
                          <Label>Persentase Menang (%)</Label>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={prize.winPercentage}
                            onChange={event => updatePrize(prize.id, { winPercentage: Number(event.target.value) })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Stok Hadiah</Label>
                          <Input type="number" min={0} value={prize.quota} onChange={event => updatePrize(prize.id, { quota: Math.max(0, Number(event.target.value)) })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Warna Segmen</Label>
                          <div className="flex items-center gap-3">
                            <Input type="color" value={prize.color} onChange={event => updatePrize(prize.id, { color: event.target.value })} className="h-10 w-20 p-1" />
                            <div className="flex flex-wrap gap-2">
                              {COLOR_CHOICES.map(color => (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={() => updatePrize(prize.id, { color })}
                                  className={`h-7 w-7 rounded-full border ${color === prize.color ? 'ring-2 ring-offset-2 ring-primary border-primary' : 'border-muted-foreground/20'}`}
                                  style={{ backgroundColor: color }}
                                  aria-label={`Pilih warna ${color}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Gambar Hadiah</Label>
                          <div className="flex flex-wrap items-center gap-3">
                            <Input type="file" accept="image/*" onChange={event => handleImageUpload(prize.id, event)} className="max-w-xs" />
                            {prize.image ? (
                              <div className="flex items-center gap-3">
                                <img src={prize.image} alt={prize.name} className="h-16 w-16 rounded-lg border object-cover" />
                                <Button variant="outline" size="sm" onClick={() => updatePrize(prize.id, { image: undefined })}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Hapus Gambar
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <ImageIcon className="h-4 w-4" />
                                Belum ada gambar diunggah.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {isLosingPrize && (
                        <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-700">
                          Prize ini terdeteksi sebagai hadiah zonk. Pertimbangkan untuk menjaga persentasenya wajar agar pengalaman pemain tetap seru.
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="mt-auto flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                      <div className="text-xs text-muted-foreground leading-tight">
                        Pernah dimenangkan: <strong>{prize.won}</strong> kali.
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => removePrize(prize.id)} className="w-full sm:w-auto">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Hapus Hadiah
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })
            )}
          </div>

          {prizes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Hadiah</CardTitle>
                <CardDescription>Daftar semua hadiah dalam format tabel seperti spreadsheet.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Persentase</TableHead>
                      <TableHead>Stok</TableHead>
                      <TableHead>Dimenangkan</TableHead>
                      <TableHead>Sisa</TableHead>
                      <TableHead>Gambar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prizes.map((prize, index) => {
                      const remaining = Math.max(prize.quota - prize.won, 0);
                      return (
                        <TableRow key={prize.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{prize.name || <span className="text-muted-foreground italic">Belum diisi</span>}</TableCell>
                          <TableCell>{prize.winPercentage}%</TableCell>
                          <TableCell>{prize.quota}</TableCell>
                          <TableCell>{prize.won}</TableCell>
                          <TableCell>{remaining}</TableCell>
                          <TableCell>
                            {prize.image ? <img src={prize.image} alt={prize.name} className="h-10 w-10 rounded-md border object-cover" /> : <span className="text-muted-foreground">-</span>}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <TableCaption>Total hadiah tersimpan: {prizes.length}</TableCaption>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="statistics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gambaran Statistik</CardTitle>
              <CardDescription>Ringkas statistik per hadiah untuk evaluasi performa.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {prizes.map(prize => {
                  const remaining = Math.max(prize.quota - prize.won, 0);
                  const hitRate = totalSpins > 0 ? ((prize.won / totalSpins) * 100).toFixed(2) : '0.00';
                  return (
                    <Card key={`stats-${prize.id}`} className="border-dashed">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold">{prize.name || 'Tanpa Nama'}</CardTitle>
                        <CardDescription>Target {prize.winPercentage}% • Realisasi {hitRate}%</CardDescription>
                      </CardHeader>
                      <CardContent className="flex items-center justify-between">
                        <div className="space-y-1 text-sm">
                          <p>
                            Dimenangkan <strong>{prize.won}</strong> kali
                          </p>
                          <p>
                            Sisa stok <strong>{remaining}</strong>
                          </p>
                        </div>
                        <div className="h-10 w-10 rounded-full border-4" style={{ borderColor: prize.color }} />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button variant="outline" onClick={resetStatistics}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset Statistik Menang
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="audio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Tampilan Roda</CardTitle>
              <CardDescription>Sesuaikan perilaku dan tampilan roda hadiah.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="center-text">Tulisan Tengah</Label>
                  <Input id="center-text" value={wheelConfig.centerText} onChange={event => updateWheelConfigValue('centerText', event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-color">Warna Default Segmen</Label>
                  <Input id="default-color" type="color" value={wheelConfig.defaultColor} onChange={event => updateWheelConfigValue('defaultColor', event.target.value)} className="h-10 w-20 p-1" />
                </div>
                <div className="space-y-2">
                  <Label>Animasi Spin</Label>
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={wheelConfig.spinAnimation}
                    onChange={event => updateWheelConfigValue('spinAnimation', event.target.value as WheelConfig['spinAnimation'])}
                  >
                    <option value="smooth">Smooth</option>
                    <option value="bounce">Bounce</option>
                    <option value="natural">Natural</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Ukuran Roda (px)</Label>
                  <Slider
                    value={[wheelConfig.wheelSize]}
                    min={280}
                    max={520}
                    step={10}
                    onValueChange={([value]) => updateWheelConfigValue('wheelSize', value)}
                  />
                  <div className="text-xs text-muted-foreground">Saat ini: {wheelConfig.wheelSize}px</div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <SwitchRow
                  label="Tampilkan Label Hadiah"
                  description="Matikan jika ingin menyembunyikan teks hadiah di roda."
                  checked={wheelConfig.showLabels}
                  onCheckedChange={value => updateWheelConfigValue('showLabels', value)}
                />
                <SwitchRow
                  label="Tampilkan Gambar Hadiah"
                  description="Jika dinyalakan, gambar pada kartu di atas akan muncul pada roda."
                  checked={wheelConfig.showImages}
                  onCheckedChange={value => updateWheelConfigValue('showImages', value)}
                />
                <SwitchRow
                  label="Aktifkan Confetti"
                  description="Confetti akan muncul ketika pemain memenangkan hadiah."
                  checked={wheelConfig.showConfetti}
                  onCheckedChange={value => updateWheelConfigValue('showConfetti', value)}
                />
                <SwitchRow
                  label="Efek Getar"
                  description="Guncang ringan saat roda mulai berputar."
                  checked={wheelConfig.showShake}
                  onCheckedChange={value => updateWheelConfigValue('showShake', value)}
                />
                <SwitchRow
                  label="Glow Efek"
                  description="Berikan efek glow ketika roda berhenti."
                  checked={wheelConfig.showGlow}
                  onCheckedChange={value => updateWheelConfigValue('showGlow', value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Dummy Segment (zonk tambahan)</Label>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" onClick={() => updateWheelConfigValue('dummySegments', Math.max(0, wheelConfig.dummySegments - 1))}>
                    -
                  </Button>
                  <div className="text-lg font-semibold">{wheelConfig.dummySegments}</div>
                  <Button variant="outline" size="sm" onClick={() => updateWheelConfigValue('dummySegments', wheelConfig.dummySegments + 1)}>
                    +
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pengelolaan Audio</CardTitle>
              <CardDescription>Atur musik latar dan efek suara spin melalui panel berikut.</CardDescription>
            </CardHeader>
            <CardContent>
              <AudioManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface SwitchRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}

const SwitchRow = ({ label, description, checked, onCheckedChange }: SwitchRowProps) => (
  <div className="flex items-start justify-between rounded-lg border border-border/60 bg-card px-4 py-3">
    <div>
      <p className="font-medium leading-none">{label}</p>
      {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
    </div>
    <Switch checked={checked} onCheckedChange={onCheckedChange} />
  </div>
);
