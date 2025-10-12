import Head from "next/head";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, ArrowLeft, MessageCircle, Phone, Globe } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

// Country codes for WhatsApp
const COUNTRY_CODES = [
  { code: "+1", country: "US/CA", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+62", country: "Indonesia", flag: "🇮🇩" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+55", country: "Brazil", flag: "🇧🇷" },
  { code: "+52", country: "Mexico", flag: "🇲🇽" },
];

export default function Login() {
  const router = useRouter();
  const [selectedCountryCode, setSelectedCountryCode] = useState("+1");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!whatsappNumber.trim()) {
      setError("Please enter your WhatsApp number");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          whatsappNumber: whatsappNumber,
          countryCode: selectedCountryCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store tokens
        localStorage.setItem('accessToken', data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.tokens.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>Login - TrustBridge</title>
        <meta name="description" content="Connect your WhatsApp to start sending money globally" />
      </Head>

      {/* Navigation */}
      <nav className="glass border-0 border-b border-blue-500/20 rounded-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center glow-blue">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-glow">TrustBridge</span>
            </div>
            <div className="flex items-center">
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 glass border-blue-400/30 text-blue-300 hover:text-white hover:border-blue-300/50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Login Form */}
      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-md">
          <Card className="glass-dark border-blue-400/30 glow-blue">
            <CardHeader className="text-center pb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 glow-cyan">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                Connect WhatsApp
              </CardTitle>
              <CardDescription className="text-blue-200 mt-2">
                Enter your WhatsApp number to get started with TrustBridge
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Country Code Selector */}
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Country Code
                  </label>
                  <select
                    value={selectedCountryCode}
                    onChange={(e) => setSelectedCountryCode(e.target.value)}
                    className="w-full px-3 py-2 glass border-blue-400/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400 text-white bg-transparent"
                  >
                    {COUNTRY_CODES.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.code} ({country.country})
                      </option>
                    ))}
                  </select>
                </div>

                {/* WhatsApp Number */}
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    WhatsApp Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                    <Input
                      type="tel"
                      placeholder="Enter your WhatsApp number"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="pl-12 py-3 text-lg glass border-blue-400/30 text-white placeholder:text-blue-300/60 focus:border-blue-400 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-sm text-blue-300 mt-2">
                    Enter your number without the country code (e.g., 1234567890)
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="glass border-red-400/30 rounded-lg p-3 bg-red-900/20">
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-space py-3 text-lg rounded-lg glow-effect"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Connecting...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Connect WhatsApp
                    </div>
                  )}
                </Button>
              </form>

              {/* Security Notice */}
              <div className="mt-8 p-4 glass rounded-lg border-blue-400/20">
                <div className="flex items-start space-x-3">
                  <Globe className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-white">Secure & Private</h4>
                    <p className="text-sm text-blue-200 mt-1">
                      We only use your WhatsApp number for authentication and payment notifications.
                      Your conversations remain private.
                    </p>
                  </div>
                </div>
              </div>

              {/* Features Preview */}
              <div className="mt-6 text-center">
                <p className="text-sm text-blue-300 mb-4">After connecting, you can:</p>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="text-blue-200">
                    💸 Send money globally
                  </div>
                  <div className="text-blue-200">
                    📱 Track via WhatsApp
                  </div>
                  <div className="text-blue-200">
                    🔒 Bank-grade security
                  </div>
                  <div className="text-blue-200">
                    ⚡ 2-5 minute transfers
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}