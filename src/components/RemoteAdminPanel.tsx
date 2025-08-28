import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Network, 
  Globe, 
  Shield, 
  Monitor, 
  Smartphone, 
  Laptop, 
  Wifi, 
  Copy,
  Check,
  AlertTriangle,
  Info,
  EyeOff,
  Eye
} from 'lucide-react';

interface NetworkInfo {
  localIP: string;
  publicIP: string;
  port: number;
  isRemoteEnabled: boolean;
  allowExternalAccess: boolean;
  requirePassword: boolean;
  adminPassword: string;
}

interface RemoteAdminPanelProps {
  onNetworkConfigUpdate: (config: NetworkInfo) => void;
  networkConfig: NetworkInfo;
}

export const RemoteAdminPanel = ({ onNetworkConfigUpdate, networkConfig }: RemoteAdminPanelProps) => {
  const [config, setConfig] = useState<NetworkInfo>(networkConfig);
  const [copied, setCopied] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  // Get local IP address
  useEffect(() => {
    const getLocalIP = async () => {
      try {
        // Try to get local IP from network interface
        const response = await fetch('/api/network/local-ip');
        const data = await response.json();
        if (data.localIP) {
          setConfig(prev => ({ ...prev, localIP: data.localIP }));
        }
      } catch (error) {
        // Fallback to common local IPs
        setConfig(prev => ({ ...prev, localIP: '192.168.1.100' }));
      }
    };

    getLocalIP();
  }, []);

  // Get public IP address
  useEffect(() => {
    const getPublicIP = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setConfig(prev => ({ ...prev, publicIP: data.ip }));
      } catch (error) {
        setConfig(prev => ({ ...prev, publicIP: 'Unable to detect' }));
      }
    };

    getPublicIP();
  }, []);

  const handleConfigUpdate = (updates: Partial<NetworkInfo>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onNetworkConfigUpdate(newConfig);
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const generateAccessURLs = () => {
    const localURL = `http://${config.localIP}:${config.port}/admin`;
    const publicURL = config.publicIP !== 'Unable to detect' 
      ? `http://${config.publicIP}:${config.port}/admin`
      : 'Not available';
    
    return { localURL, publicURL };
  };

  const { localURL, publicURL } = generateAccessURLs();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-wheel bg-clip-text text-transparent">
          Remote Admin Access
        </h2>
        <p className="text-muted-foreground mt-2">
          Configure remote access to your admin panel from other devices
        </p>
      </div>

      <Tabs defaultValue="network" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="network" className="flex items-center gap-2">
            <Network className="w-4 h-4" />
            Network
          </TabsTrigger>
          <TabsTrigger value="access" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Access URLs
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* NETWORK CONFIGURATION TAB */}
        <TabsContent value="network">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="w-5 h-5" />
                Network Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Enable Remote Access */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-primary" />
                  <div>
                    <Label className="text-base font-medium">Enable Remote Access</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow admin panel access from other devices on the network
                    </p>
                  </div>
                </div>
                <Switch
                  checked={config.isRemoteEnabled}
                  onCheckedChange={(checked) => handleConfigUpdate({ isRemoteEnabled: checked })}
                />
              </div>

              {/* Local Network Access */}
              <div className="space-y-3">
                <Label htmlFor="localIP">Local IP Address</Label>
                <div className="flex gap-2">
                  <Input
                    id="localIP"
                    value={config.localIP}
                    onChange={(e) => handleConfigUpdate({ localIP: e.target.value })}
                    placeholder="192.168.1.100"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(config.localIP, 'localIP')}
                  >
                    {copied === 'localIP' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your device's IP address on the local network
                </p>
              </div>

              {/* Port Configuration */}
              <div className="space-y-3">
                <Label htmlFor="port">Port Number</Label>
                <Input
                  id="port"
                  type="number"
                  min={1024}
                  max={65535}
                  value={config.port}
                  onChange={(e) => handleConfigUpdate({ port: parseInt(e.target.value) })}
                  placeholder="3000"
                  className="max-w-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Port for remote access (1024-65535, avoid 80, 443, 3000)
                </p>
              </div>

              {/* External Access */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-accent" />
                  <div>
                    <Label className="text-base font-medium">Allow External Access</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow access from internet (requires port forwarding)
                    </p>
                  </div>
                </div>
                <Switch
                  checked={config.allowExternalAccess}
                  onCheckedChange={(checked) => handleConfigUpdate({ allowExternalAccess: checked })}
                  disabled={!config.isRemoteEnabled}
                />
              </div>

              {/* Network Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Wifi className="w-4 h-4 text-green-500" />
                    <span className="font-medium">Local Network</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Accessible from devices on same WiFi/LAN
                  </p>
                  <Badge variant={config.isRemoteEnabled ? "default" : "secondary"} className="mt-2">
                    {config.isRemoteEnabled ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">Internet</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Accessible from anywhere (with port forwarding)
                  </p>
                  <Badge variant={config.allowExternalAccess ? "default" : "secondary"} className="mt-2">
                    {config.allowExternalAccess ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ACCESS URLS TAB */}
        <TabsContent value="access">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Access URLs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Local Network Access */}
              <div className="space-y-3">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Wifi className="w-4 h-4" />
                  Local Network Access
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={localURL}
                    readOnly
                    className="flex-1 font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(localURL, 'localURL')}
                  >
                    {copied === 'localURL' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use this URL from devices on the same WiFi/LAN network
                </p>
              </div>

              {/* Internet Access */}
              <div className="space-y-3">
                <Label className="text-base font-medium flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Internet Access
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={publicURL}
                    readOnly
                    className="flex-1 font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(publicURL, 'publicURL')}
                    disabled={publicURL === 'Not available'}
                  >
                    {copied === 'publicURL' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use this URL from anywhere (requires router port forwarding)
                </p>
              </div>

              {/* Quick Access Instructions */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">How to Access Remotely:</h4>
                    <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                      <li>Ensure "Enable Remote Access" is turned on</li>
                      <li>Copy the Local Network URL above</li>
                      <li>Open the URL on any device connected to the same WiFi</li>
                      <li>For internet access, configure port forwarding on your router</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Device Compatibility */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Laptop className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-medium">Laptop/Desktop</h4>
                  <p className="text-xs text-muted-foreground">Full admin panel access</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Smartphone className="w-8 h-8 mx-auto mb-2 text-accent" />
                  <h4 className="font-medium">Mobile/Tablet</h4>
                  <p className="text-xs text-muted-foreground">Responsive admin interface</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Monitor className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <h4 className="font-medium">Any Browser</h4>
                  <p className="text-xs text-muted-foreground">Cross-platform compatibility</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECURITY TAB */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Password Protection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Require Admin Password</Label>
                  <Switch
                    checked={config.requirePassword}
                    onCheckedChange={(checked) => handleConfigUpdate({ requirePassword: checked })}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Protect admin panel with password authentication
                </p>
              </div>

              {/* Admin Password */}
              {config.requirePassword && (
                <div className="space-y-3">
                  <Label htmlFor="adminPassword">Admin Password</Label>
                  <div className="flex gap-2">
                    <Input
                      id="adminPassword"
                      type={showPassword ? "text" : "password"}
                      value={config.adminPassword}
                      onChange={(e) => handleConfigUpdate({ adminPassword: e.target.value })}
                      placeholder="Enter strong password"
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Minimum 8 characters, include numbers and symbols
                  </p>
                </div>
              )}

              {/* Security Warnings */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Security Notice:</strong> Remote access exposes your admin panel to the network. 
                  Use strong passwords and only enable external access when necessary.
                </AlertDescription>
              </Alert>

              {/* Network Security Tips */}
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">Security Best Practices:</h4>
                <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1 list-disc list-inside">
                  <li>Use a strong, unique password</li>
                  <li>Only enable external access when needed</li>
                  <li>Monitor access logs regularly</li>
                  <li>Keep your network devices updated</li>
                  <li>Consider using a VPN for additional security</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
