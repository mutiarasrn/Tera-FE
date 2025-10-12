import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Loader2, CheckCircle, Rocket, Zap, Star, Orbit } from 'lucide-react';
import { apiUrl } from '@/lib/config';

const countryCodes = [
  { code: '+1', country: 'US', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+62', country: 'ID', flag: '🇮🇩' },
  { code: '+91', country: 'IN', flag: '🇮🇳' },
  { code: '+81', country: 'JP', flag: '🇯🇵' },
  { code: '+65', country: 'SG', flag: '🇸🇬' },
  { code: '+60', country: 'MY', flag: '🇲🇾' },
  { code: '+66', country: 'TH', flag: '🇹🇭' },
  { code: '+84', country: 'VN', flag: '🇻🇳' },
  { code: '+63', country: 'PH', flag: '🇵🇭' },
];

interface WhatsAppAuthProps {
  onAuth?: (user: any) => void;
}

export function WhatsAppAuth({ onAuth }: WhatsAppAuthProps) {
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  const handleAuth = async () => {
    if (!phoneNumber) return;

    setIsLoading(true);
    try {
      const response = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          whatsappNumber: phoneNumber,
          countryCode: countryCode,
        }),
      });

      const data = await response.json();

      if (data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        onAuth?.(data.user);

        // Store tokens
        if (data.tokens) {
          localStorage.setItem('accessToken', data.tokens.accessToken);
          localStorage.setItem('refreshToken', data.tokens.refreshToken);
        }
      }
    } catch (error) {
      console.error('Authentication failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  if (isAuthenticated && user) {
    return (
      <Card className="max-w-sm mx-auto card-space hover:glow-effect">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center glow-effect pulse-glow">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-xl text-white gradient-text-cosmic">Cosmic Link Active</CardTitle>
          <CardDescription className="text-gray-300 flex items-center justify-center gap-2">
            <Orbit className="w-4 h-4" />
            {countryCode} {phoneNumber}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full glass border-white/20 text-white hover:bg-white/10 backdrop-blur-xl"
          >
            <Zap className="w-4 h-4 mr-2" />
            Disconnect
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-sm mx-auto card-space hover:glow-effect">
      <CardHeader className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full flex items-center justify-center glow-effect pulse-glow">
          <MessageCircle className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-xl text-white gradient-text-cosmic">Initialize Cosmic Communicator</CardTitle>
        <CardDescription className="text-gray-300">
          Link your quantum communication device to begin
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Select value={countryCode} onValueChange={setCountryCode}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {countryCodes.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  <div className="flex items-center gap-2">
                    <span>{country.flag}</span>
                    <span>{country.code}</span>
                    <span className="text-gray-500">{country.country}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="1234567890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
          />
        </div>

        <Button
          onClick={handleAuth}
          disabled={isLoading || !phoneNumber}
          className="w-full btn-space text-lg py-3 rounded-xl glow-effect group"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Establishing Link...
            </>
          ) : (
            <>
              <Rocket className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              Activate Communicator
              <Star className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}