import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Plus, Trash2, BarChart3, Settings, GripVertical, Eye, EyeOff, Image as ImageIcon, Sparkles, Edit3, Check, X } from 'lucide-react';
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

export const AdminPanel = ({ prizes, onPrizesUpdate, totalSpins, wheelConfig, onWheelConfigUpdate }: AdminPanelProps) => {
  const [newPrize, setNewPrize] = useState({
    name: '',
    quota: 1,
    color: predefinedColors[0],
    image: '',
    winPercentage: 10 // Default 10% kemungkinan menang
  });
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [editingPrize, setEditingPrize] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    quota: 1,
    winPercentage: 10
  });

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
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}`,
      name: newPrize.name,
      color: newPrize.color,
      quota: newPrize.quota,
      won: 0,
      image: newPrize.image || undefined,
      winPercentage: newPrize.winPercentage
    };
    onPrizesUpdate([...prizes, prize]);
    setNewPrize({
      name: '',
      quota: 1,
      color: predefinedColors[Math.floor(Math.random() * predefinedColors.length)],
      image: '',
      winPercentage: 10
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

  const updatePrizeWinPercentage = (id: string, winPercentage: number) => {
    // Clamp between 0 and 100
    const clampedPercentage = Math.max(0, Math.min(100, winPercentage));
    
    onPrizesUpdate(prizes.map(p => 
      p.id === id ? { ...p, winPercentage: clampedPercentage } : p
    ));
    
    // Show warning if total percentage exceeds 100%
    const totalPercentage = prizes.reduce((sum, prize) => 
      sum + (prize.id === id ? clampedPercentage : prize.winPercentage), 0
    );
    
    if (totalPercentage > 100) {
      console.warn(`⚠️ Total win percentage is ${totalPercentage}%, which exceeds 100%`);
    }
  };

  const startEditPrize = (prize: Prize) => {
    setEditingPrize(prize.id);
    setEditForm({
      name: prize.name,
      quota: prize.quota,
      winPercentage: prize.winPercentage
    });
  };

  const saveEditPrize = () => {
    if (!editingPrize || !editForm.name.trim()) return;
    
    onPrizesUpdate(prizes.map(p => 
      p.id === editingPrize ? { 
        ...p, 
        name: editForm.name.trim(),
        quota: Math.max(0, editForm.quota),
        winPercentage: Math.max(0, Math.min(100, editForm.winPercentage))
      } : p
    ));
    
    setEditingPrize(null);
    setEditForm({ name: '', quota: 1, winPercentage: 10 });
  };

  const cancelEditPrize = () => {
    setEditingPrize(null);
    setEditForm({ name: '', quota: 1, winPercentage: 10 });
  };

  // Audio upload handler
  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'spin' | 'win' | 'bgm') => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('audio/')) {
        alert('Please select an audio file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Create object URL for immediate use
      const audioUrl = URL.createObjectURL(file);
      
      // Update audio source based on type
      const audioElement = new Audio(audioUrl);
      audioElement.volume = 0.7;
      
      // Store the new audio URL (in real app, you'd upload to server)
      console.log(`New ${type} audio uploaded:`, file.name);
      
      // Test the audio
      audioElement.play().catch(console.error);
      
      // In a real application, you would:
      // 1. Upload file to server
      // 2. Get new URL from server
      // 3. Update audio sources in components
      // 4. Save to database
      
      alert(`${type} audio uploaded successfully! File: ${file.name}`);
    }
  };

  // Test audio function
  const testAudio = (type: 'spin' | 'win' | 'bgm') => {
    try {
      const audio = new Audio(`/sounds/${type}.mp3`);
      audio.volume = 0.7;
      audio.play().catch(console.error);
    } catch (error) {
      console.warn(`${type} audio test failed:`, error);
    }
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
  const totalWinPercentage = prizes.reduce((sum, prize) => sum + prize.winPercentage, 0);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-wheel bg-clip-text text-transparent">
          Admin Control Panel
        </h2>
        <p className="text-muted-foreground mt-2">
          Manage your prize wheel configuration and view statistics
        </p>
        
        {/* Total Win Percentage Indicator */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Win Percentage:</span>
            <span className={`text-lg font-bold ${
              totalWinPercentage > 100 ? 'text-red-500' : 
              totalWinPercentage === 100 ? 'text-green-500' : 
              'text-yellow-500'
            }`}>
              {totalWinPercentage}%
            </span>
          </div>
          {totalWinPercentage > 100 && (
            <p className="text-xs text-red-500 mt-1">
              ⚠️ Total exceeds 100% - some prizes may not be selectable
            </p>
          )}
          {totalWinPercentage < 100 && (
            <p className="text-xs text-yellow-500 mt-1">
              ℹ️ Total less than 100% - remaining chance goes to random selection
            </p>
          )}
          {totalWinPercentage === 100 && (
            <p className="text-xs text-green-500 mt-1">
              ✅ Perfect! All percentages add up to 100%
            </p>
          )}
        </div>

        {/* Quick Setup Buttons */}
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onPrizesUpdate(prizes.map(p => ({ ...p, winPercentage: 0 })));
            }}
            className="text-xs"
          >
            Reset All to 0%
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const equalPercentage = Math.floor(100 / prizes.length);
              const remainder = 100 - (equalPercentage * prizes.length);
              onPrizesUpdate(prizes.map((p, index) => ({ 
                ...p, 
                winPercentage: equalPercentage + (index < remainder ? 1 : 0)
              })));
            }}
            className="text-xs"
          >
            Equal Distribution
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onPrizesUpdate(prizes.map(p => ({ 
                ...p, 
                winPercentage: p.name === 'Try Again' ? 50 : 
                             p.name === 'Free Coffee' ? 20 :
                             p.name === '10% Discount' ? 15 :
                             p.name === 'Gift Card $25' ? 10 :
                             p.name === 'VIP Access' ? 5 : 0
              })));
            }}
            className="text-xs"
          >
          </Button>
        </div>
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
          <TabsTrigger value="audio" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Audio
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
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
                  title="Quota"
                />
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Win %:</Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={newPrize.winPercentage}
                    onChange={e => setNewPrize({ ...newPrize, winPercentage: Number(e.target.value) })}
                    className="w-16"
                    title="Win Percentage (0-100)"
                  />
                </div>
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
                    className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={e => { e.preventDefault(); handleDragOver(idx); }}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="flex items-center gap-4">
                      <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab flex-shrink-0" />
                      
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-white flex-shrink-0"
                          style={{ backgroundColor: prize.color }}
                        />
                        
                        {/* Prize Image Display */}
                        {prize.image && (
                          <img 
                            src={prize.image} 
                            alt={prize.name} 
                            className="w-12 h-12 object-cover rounded-lg border-2 border-white shadow-sm flex-shrink-0"
                          />
                        )}
                        
                        <div className="flex-1 min-w-0">
                          {editingPrize === prize.id ? (
                            <div className="space-y-2">
                              <Input
                                value={editForm.name}
                                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                className="text-sm font-medium"
                                placeholder="Prize name"
                              />
                              <div className="flex gap-2">
                                <Input
                                  type="number"
                                  min={0}
                                  value={editForm.quota}
                                  onChange={e => setEditForm({ ...editForm, quota: Number(e.target.value) })}
                                  className="w-20 text-xs"
                                  placeholder="Stock"
                                />
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={editForm.winPercentage}
                                  onChange={e => setEditForm({ ...editForm, winPercentage: Number(e.target.value) })}
                                  className="w-16 text-xs"
                                  placeholder="Win%"
                                />
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="font-medium text-foreground truncate">{prize.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Won: {prize.won} / {prize.quota}
                              </div>
                              <div className="text-xs text-blue-500 font-medium">
                                Win: {prize.winPercentage}%
                              </div>
                            </>
                          )}
                        </div>
                        
                        <Badge variant={prize.won < prize.quota ? "default" : "secondary"} className="flex-shrink-0">
                          {prize.won < prize.quota ? `${prize.quota - prize.won} left` : 'Sold Out'}
                        </Badge>
                      </div>
                    
                      {/* Controls */}
                      <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                        {editingPrize === prize.id ? (
                          // Edit Mode Controls
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={saveEditPrize}
                              className="h-9 px-3 bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700 transition-all duration-200"
                              title="Save Changes"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEditPrize}
                              className="h-9 px-3 text-muted-foreground hover:text-foreground border-border hover:border-muted-foreground transition-all duration-200"
                              title="Cancel Edit"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          // Normal Mode Controls
                          <>
                            {/* Win Percentage Control */}
                            <div className="flex items-center gap-2">
                              <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Win%:</Label>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                value={prize.winPercentage}
                                onChange={e => updatePrizeWinPercentage(prize.id, Number(e.target.value))}
                                className="w-16 h-9 text-sm text-center font-medium"
                                title="Win Percentage (0-100)"
                              />
                            </div>
                            
                            {/* Stock Control */}
                            <div className="flex items-center gap-2">
                              <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Stock:</Label>
                              <Input
                                type="number"
                                min={0}
                                value={prize.quota}
                                onChange={e => updatePrizeQuota(prize.id, Number(e.target.value))}
                                className="w-16 h-9 text-sm text-center font-medium"
                                title="Stock Quantity"
                              />
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
                                <Button
                                  size="sm"
                                  variant="outline"
                                  asChild
                                  className="h-9 px-3 text-muted-foreground hover:text-foreground hover:bg-accent/50 border-border hover:border-accent transition-all duration-200"
                                >
                                  <Label 
                                    htmlFor={`image-upload-${prize.id}`}
                                    className="cursor-pointer flex items-center gap-2"
                                    title="Upload/Change Image"
                                  >
                                    <ImageIcon className="w-4 h-4" />
                                    <span className="text-xs font-medium">Image</span>
                                  </Label>
                                </Button>
                              </div>
                              
                              {prize.image && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => removeImage(prize.id)}
                                  className="h-9 px-3 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/40 transition-all duration-200"
                                  title="Remove Image"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                            
                            {/* Edit Button */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEditPrize(prize)}
                              className="h-9 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 hover:border-blue-300 transition-all duration-200"
                              title="Edit Prize"
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            
                            {/* Delete Button */}
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => removePrize(prize.id)} 
                              className="h-9 px-3 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 hover:border-destructive/40 transition-all duration-200"
                              title="Delete Prize"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AUDIO TAB */}
        <TabsContent value="audio">
          <div className="space-y-6">
            {/* Audio Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Upload Audio Files
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload file audio baru untuk mengganti suara spin wheel
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Spin Sound Upload */}
                <div className="space-y-2">
                  <Label htmlFor="spin-audio" className="text-sm font-medium">
                    Spin Sound (saat wheel berputar)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      id="spin-audio"
                      accept="audio/*"
                      onChange={(e) => handleAudioUpload(e, 'spin')}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testAudio('spin')}
                    >
                      Test
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Format: MP3, WAV, OGG. Durasi: 1-3 detik
                  </p>
                </div>

                {/* Win Sound Upload */}
                <div className="space-y-2">
                  <Label htmlFor="win-audio" className="text-sm font-medium">
                    Win Sound (saat menang hadiah)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      id="win-audio"
                      accept="audio/*"
                      onChange={(e) => handleAudioUpload(e, 'win')}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testAudio('win')}
                    >
                      Test
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Format: MP3, WAV, OGG. Durasi: 1-3 detik
                  </p>
                </div>

                {/* BGM Upload */}
                <div className="space-y-2">
                  <Label htmlFor="bgm-audio" className="text-sm font-medium">
                    Background Music
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      id="bgm-audio"
                      accept="audio/*"
                      onChange={(e) => handleAudioUpload(e, 'bgm')}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testAudio('bgm')}
                    >
                      Test
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Format: MP3, WAV, OGG. Durasi: 30 detik - 5 menit
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Audio Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Audio Settings
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Kelola pengaturan audio untuk spin wheel
                </p>
              </CardHeader>
              <CardContent>
                <AudioManager />
              </CardContent>
            </Card>
          </div>
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
                  onChange={e => onWheelConfigUpdate({ ...wheelConfig, spinAnimation: e.target.value as 'smooth' | 'bounce' | 'natural' })}
                  className="block mt-1 w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="smooth" className="text-foreground bg-background">Smooth</option>
                  <option value="bounce" className="text-foreground bg-background">Bounce</option>
                  <option value="natural" className="text-foreground bg-background">Natural</option>
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
                  className="block mt-1 w-12 h-10 border border-border rounded-md cursor-pointer bg-background hover:border-primary transition-colors"
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


      </Tabs>
    </div>
  );
};