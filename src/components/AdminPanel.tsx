import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Plus, Trash2, BarChart3, Settings, GripVertical, Eye, EyeOff, Image as ImageIcon, Sparkles, Network } from 'lucide-react';
import { RemoteAdminPanel } from './RemoteAdminPanel';

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
  wheelSize: number; // px
  showConfetti: boolean;
  showShake: boolean;
  showGlow: boolean;
  dummySegments: number;
}

interface NetworkInfo {
  localIP: string;
  publicIP: string;
  port: number;
  isRemoteEnabled: boolean;
  allowExternalAccess: boolean;
  requirePassword: boolean;
  adminPassword: string;
}

interface AdminPanelProps {
  prizes: Prize[];
  onPrizesUpdate: (prizes: Prize[]) => void;
  totalSpins: number;
  wheelConfig: WheelConfig;
  onWheelConfigUpdate: (config: WheelConfig) => void;
  networkConfig?: NetworkInfo;
  onNetworkConfigUpdate?: (config: NetworkInfo) => void;
}

const predefinedColors = [
  '#8B4513', // Brown - Coffee
  '#FFD700', // Gold - Discount
  '#4169E1', // Royal Blue - Clothing
  '#32CD32', // Lime Green - Money
  '#FF6347', // Tomato Red - Try Again
  '#9370DB', // Medium Purple - VIP
  '#FF8C00', // Dark Orange - Energy
  '#20B2AA'  // Light Sea Green - Fresh
];

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

export const AdminPanel = ({ prizes, onPrizesUpdate, totalSpins, wheelConfig, onWheelConfigUpdate }: AdminPanelProps) => {
  const [newPrize, setNewPrize] = useState({
    name: '',
    quota: 1,
    color: predefinedColors[0],
    image: ''
  });
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // Drag & drop urutan hadiah
  const handleDragStart = (index: number) => setDragIndex(index);
  const handleDragOver = (index: number) => {
    if (dragIndex === null || dragIndex === index) return;
    const updated = [...prizes];
    const [removed] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, removed);
    onPrizesUpdate(updated);
    setDragIndex(index);
  };
  const handleDragEnd = () => setDragIndex(null);

  const addPrize = () => {
    if (!newPrize.name.trim()) return;
    const prize: Prize = {
      id: Date.now().toString(),
      name: newPrize.name,
      color: newPrize.color,
      quota: newPrize.quota,
      won: 0,
      image: newPrize.image || undefined
    };
    onPrizesUpdate([...prizes, prize]);
    setNewPrize({
      name: '',
      quota: 1,
      color: predefinedColors[Math.floor(Math.random() * predefinedColors.length)],
      image: ''
    });
  };

  const removePrize = (id: string) => {
    onPrizesUpdate(prizes.filter(p => p.id !== id));
  };

  const updatePrizeQuota = (id: string, quota: number) => {
    onPrizesUpdate(prizes.map(p => 
      p.id === id ? { ...p, quota: Math.max(0, quota) } : p
    ));
  };

  const handleImageUpload = (prizeId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        onPrizesUpdate(prizes.map(prize =>
          prize.id === prizeId ? { ...prize, image: imageUrl } : prize
        ));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (prizeId: string) => {
    onPrizesUpdate(prizes.map(prize =>
      prize.id === prizeId ? { ...prize, image: undefined } : prize
    ));
  };

  const resetStatistics = () => {
    onPrizesUpdate(prizes.map(p => ({ ...p, won: 0 })));
  };

  // Dummy/zonk segment
  const addDummySegment = () => onWheelConfigUpdate({ ...wheelConfig, dummySegments: wheelConfig.dummySegments + 1 });
  const removeDummySegment = () => onWheelConfigUpdate({ ...wheelConfig, dummySegments: Math.max(0, wheelConfig.dummySegments - 1) });

  const totalPrizesAvailable = prizes.reduce((sum, prize) => sum + (prize.quota - prize.won), 0);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-wheel bg-clip-text text-transparent">
          Admin Control Panel
        </h2>
        <p className="text-muted-foreground mt-2">
          Manage your prize wheel configuration and view statistics
        </p>
      </div>

      <Tabs defaultValue="prizes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="prizes" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Prizes
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="remote" className="flex items-center gap-2">
            <Network className="w-4 h-4" />
            Remote
          </TabsTrigger>
        </TabsList>

        {/* PRIZES TAB */}
        <TabsContent value="prizes">
          <Card>
            <CardHeader>
              <CardTitle>Add New Prize</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <Input
                  placeholder="Prize name"
                  value={newPrize.name}
                  onChange={e => setNewPrize({ ...newPrize, name: e.target.value })}
                  className="max-w-xs"
                />
                <Input
                  type="number"
                  min={1}
                  value={newPrize.quota}
                  onChange={e => setNewPrize({ ...newPrize, quota: Number(e.target.value) })}
                  className="w-20"
                />
                <input
                  type="color"
                  value={newPrize.color}
                  onChange={e => setNewPrize({ ...newPrize, color: e.target.value })}
                  className="w-10 h-10 p-0 border-none bg-transparent"
                  title="Pick color"
                />
              </div>
              
              {/* Image Upload Section */}
              <div className="space-y-3">
                <Label htmlFor="prize-image" className="text-sm font-medium">
                  Prize Image (Optional)
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="prize-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          const imageUrl = e.target?.result as string;
                          setNewPrize({ ...newPrize, image: imageUrl });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="max-w-xs"
                  />
                  {newPrize.image && (
                    <div className="flex items-center gap-2">
                      <img 
                        src={newPrize.image} 
                        alt="Preview" 
                        className="w-12 h-12 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setNewPrize({ ...newPrize, image: '' })}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <Button onClick={addPrize} className="bg-gradient-wheel hover:bg-gradient-win">
                <Plus className="w-4 h-4 mr-2" />
                Add Prize
              </Button>
            </CardContent>
          </Card>

          {/* Current Prizes (Drag & Drop) */}
          <Card>
            <CardHeader>
              <CardTitle>Current Prizes ({prizes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {prizes.map((prize, idx) => (
                  <div
                    key={prize.id}
                    className="space-y-3 p-4 bg-muted rounded-lg flex items-center gap-3 cursor-move"
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={e => { e.preventDefault(); handleDragOver(idx); }}
                    onDragEnd={handleDragEnd}
                  >
                    <GripVertical className="w-5 h-5 text-muted-foreground mr-2" />
                    <div className="flex items-center gap-3 flex-1">
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-white"
                        style={{ backgroundColor: prize.color }}
                      />
                      <div className="flex items-center gap-3">
                        {/* Prize Image Display */}
                        {prize.image && (
                          <img 
                            src={prize.image} 
                            alt={prize.name} 
                            className="w-12 h-12 object-cover rounded-lg border-2 border-white shadow-sm"
                          />
                        )}
                        <div>
                          <span className="font-medium">{prize.name}</span>
                          <div className="text-sm text-muted-foreground">
                            Won: {prize.won} / {prize.quota}
                          </div>
                        </div>
                      </div>
                      <Badge variant={prize.won < prize.quota ? "default" : "secondary"}>
                        {prize.won < prize.quota ? `${prize.quota - prize.won} left` : 'Sold Out'}
                      </Badge>
                    </div>
                    
                    {/* Image Upload/Edit Controls */}
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(prize.id, e)}
                          className="w-0 h-0 opacity-0 absolute"
                          id={`image-upload-${prize.id}`}
                        />
                        <Label 
                          htmlFor={`image-upload-${prize.id}`}
                          className="cursor-pointer p-2 hover:bg-accent rounded-md transition-colors"
                          title="Upload/Change Image"
                        >
                          <ImageIcon className="w-4 h-4 text-muted-foreground" />
                        </Label>
                      </div>
                      
                      {prize.image && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeImage(prize.id)}
                          className="text-destructive hover:text-destructive p-2"
                          title="Remove Image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    
                    <Button size="icon" variant="ghost" onClick={() => removePrize(prize.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* STATISTICS TAB */}
        <TabsContent value="statistics">
          <Card>
            <CardHeader>
              <CardTitle>Prize Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {prizes.map((prize) => (
                  <div key={prize.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{prize.name}</span>
                      <span>{prize.won} / {prize.quota}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(prize.won / prize.quota) * 100}%`,
                          backgroundColor: prize.color
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <div className="text-center mt-4">
            <Button 
              variant="outline" 
              onClick={resetStatistics}
              className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
            >
              Reset All Statistics
            </Button>
          </div>
        </TabsContent>

        {/* SETTINGS TAB - WHEEL CONFIGURATION */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Wheel Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Center Text */}
              <div>
                <Label htmlFor="centerText">Teks Tengah Roda</Label>
                                 <Input
                   id="centerText"
                   value={wheelConfig.centerText}
                   onChange={e => onWheelConfigUpdate({ ...wheelConfig, centerText: e.target.value })}
                   className="max-w-xs"
                 />
              </div>
              {/* Spin Animation */}
              <div>
                <Label htmlFor="spinAnimation">Tipe Animasi Spin</Label>
                                 <select
                   id="spinAnimation"
                   value={wheelConfig.spinAnimation}
                   onChange={e => onWheelConfigUpdate({ ...wheelConfig, spinAnimation: e.target.value as any })}
                   className="block mt-1 border rounded px-2 py-1"
                 >
                  <option value="smooth">Smooth</option>
                  <option value="bounce">Bounce</option>
                  <option value="natural">Natural</option>
                </select>
              </div>
              {/* Default Color */}
              <div>
                <Label htmlFor="defaultColor">Warna Default Segmen</Label>
                                 <input
                   id="defaultColor"
                   type="color"
                   value={wheelConfig.defaultColor}
                   onChange={e => onWheelConfigUpdate({ ...wheelConfig, defaultColor: e.target.value })}
                   className="w-10 h-10 p-0 border-none bg-transparent"
                   title="Pilih warna default"
                 />
              </div>
              {/* Show/Hide Labels */}
              <div className="flex items-center gap-3">
                                 <Switch
                   checked={wheelConfig.showLabels}
                   onCheckedChange={val => onWheelConfigUpdate({ ...wheelConfig, showLabels: val })}
                   id="showLabels"
                 />
                <Label htmlFor="showLabels">Tampilkan Label Hadiah</Label>
              </div>
              {/* Show/Hide Images */}
              <div className="flex items-center gap-3">
                                 <Switch
                   checked={wheelConfig.showImages}
                   onCheckedChange={val => onWheelConfigUpdate({ ...wheelConfig, showImages: val })}
                   id="showImages"
                 />
                <Label htmlFor="showImages">Tampilkan Gambar Hadiah</Label>
              </div>
              {/* Wheel Size */}
              <div>
                <Label htmlFor="wheelSize">Ukuran Roda (px)</Label>
                                 <Slider
                   id="wheelSize"
                   min={200}
                   max={600}
                   step={10}
                   value={[wheelConfig.wheelSize]}
                   onValueChange={([val]) => onWheelConfigUpdate({ ...wheelConfig, wheelSize: val })}
                   className="max-w-xs"
                 />
                <div className="text-xs text-muted-foreground mt-1">{wheelConfig.wheelSize}px</div>
              </div>
              {/* Dummy Segments */}
              <div className="flex items-center gap-3">
                <Button size="icon" variant="outline" onClick={removeDummySegment} disabled={wheelConfig.dummySegments === 0}>-</Button>
                <span>Dummy/Zonk Segmen: {wheelConfig.dummySegments}</span>
                <Button size="icon" variant="outline" onClick={addDummySegment}>+</Button>
              </div>
              {/* Visual Effects */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                                     <Switch
                     checked={wheelConfig.showConfetti}
                     onCheckedChange={val => onWheelConfigUpdate({ ...wheelConfig, showConfetti: val })}
                     id="showConfetti"
                   />
                  <Label htmlFor="showConfetti" className="flex items-center gap-1"><Sparkles className="w-4 h-4" />Confetti</Label>
                </div>
                <div className="flex items-center gap-2">
                                     <Switch
                     checked={wheelConfig.showShake}
                     onCheckedChange={val => onWheelConfigUpdate({ ...wheelConfig, showShake: val })}
                     id="showShake"
                   />
                  <Label htmlFor="showShake">Screen Shake</Label>
                </div>
                <div className="flex items-center gap-2">
                                     <Switch
                     checked={wheelConfig.showGlow}
                     onCheckedChange={val => onWheelConfigUpdate({ ...wheelConfig, showGlow: val })}
                     id="showGlow"
                   />
                  <Label htmlFor="showGlow">Prize Glow</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* REMOTE ACCESS TAB */}
        <TabsContent value="remote">
          {networkConfig && onNetworkConfigUpdate ? (
            <RemoteAdminPanel 
              networkConfig={networkConfig}
              onNetworkConfigUpdate={onNetworkConfigUpdate}
            />
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Network className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Remote Access Not Configured</h3>
                <p className="text-muted-foreground mb-4">
                  Remote access functionality requires network configuration to be set up in the main application.
                </p>
                <Button variant="outline" disabled>
                  Configure in Main App
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};