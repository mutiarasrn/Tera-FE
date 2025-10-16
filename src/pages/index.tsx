import Head from "next/head";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Send,
  Wallet,
  Globe,
  Zap,
  Shield,
  MessageCircle,
  ArrowUpRight,
  DollarSign,
  Clock,
  CheckCircle,
  Eye,
  EyeOff,
  Menu,
  X,
  TrendingUp,
  Users,
  Lock,
  Smartphone
} from "lucide-react";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";

interface User {
  id: string;
  whatsappNumber: string;
  status: string;
}

interface WalletBalance {
  ada: number;
  lovelace: string;
  assets: Array<{ unit: string; quantity: string }>;
}

interface Transfer {
  transferId: string;
  status: string;
  paymentMethod: string;
  sender: {
    currency: string;
    amount: number;
  };
  recipient: {
    name: string;
    currency: string;
    amount: number;
  };
  createdAt: string;
}

interface CalculationResult {
  senderAmount: number;
  senderCurrency: string;
  recipientAmount: number;
  recipientCurrency: string;
  exchangeRate: number;
  fee: {
    percentage: number;
    amount: number;
  };
  totalAmount: number;
}

const SENDER_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'ETH', name: 'Ethereum', symbol: 'Ξ', flag: '⚡' },
  { code: 'ADA', name: 'Cardano', symbol: '₳', flag: '⚡' },
];

const RECIPIENT_CURRENCIES = [
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
];

export default function UnifiedApp() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);
  const [isFaucetClaiming, setIsFaucetClaiming] = useState(false);
  const [faucetAddress, setFaucetAddress] = useState('');
  const [faucetSuccess, setFaucetSuccess] = useState(false);

  // TEMPORARY: Set to true to view all features without backend
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [user, setUser] = useState<User | null>({
    id: 'demo-user-123',
    whatsappNumber: '+62 812-3456-7890',
    status: 'active'
  });
  const [balance, setBalance] = useState<WalletBalance | null>({
    ada: 1250.50,
    lovelace: '1250500000',
    assets: [
      { unit: 'c0de48e9f...a5b3c', quantity: '100' },
      { unit: 'd4f3a2b1c...e7f8d', quantity: '50' }
    ]
  });
  const [showBalance, setShowBalance] = useState(true);
  const [recentTransfers, setRecentTransfers] = useState<Transfer[]>([
    {
      transferId: 'TXN001',
      status: 'completed',
      paymentMethod: 'WALLET',
      sender: { currency: 'USD', amount: 100 },
      recipient: { name: 'John Doe', currency: 'IDR', amount: 1500000 },
      createdAt: new Date().toISOString()
    },
    {
      transferId: 'TXN002',
      status: 'processing',
      paymentMethod: 'WALLET',
      sender: { currency: 'EUR', amount: 50 },
      recipient: { name: 'Jane Smith', currency: 'PHP', amount: 2800 },
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      transferId: 'TXN003',
      status: 'completed',
      paymentMethod: 'WALLET',
      sender: { currency: 'ADA', amount: 200 },
      recipient: { name: 'Bob Wilson', currency: 'USD', amount: 80 },
      createdAt: new Date(Date.now() - 172800000).toISOString()
    }
  ]);

  // Transfer form state
  const [senderCurrency, setSenderCurrency] = useState('USD');
  const [recipientCurrency, setRecipientCurrency] = useState('IDR');
  const [amount, setAmount] = useState('');
  const [calculation, setCalculation] = useState<CalculationResult | null>(null);

  // Refs for smooth scrolling
  const heroRef = useRef<HTMLElement>(null);
  const walletRef = useRef<HTMLElement>(null);
  const sendRef = useRef<HTMLElement>(null);
  const historyRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const faucetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Check authentication (commented out for demo)
    // const token = localStorage.getItem('accessToken');
    // const userData = localStorage.getItem('user');

    // if (token && userData) {
    //   setIsAuthenticated(true);
    //   setUser(JSON.parse(userData));
    //   loadDashboardData();
    // }
  }, []);

  useEffect(() => {
    if (amount && parseFloat(amount) > 0 && isAuthenticated) {
      const timeoutId = setTimeout(calculateTransfer, 500);
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, senderCurrency, recipientCurrency, isAuthenticated]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('accessToken');

      // Load wallet balance
      const balanceResponse = await fetch('/api/cardano/backend-info', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        setBalance(balanceData.data.balance);
      }

      // Load recent transfers
      const transferResponse = await fetch(`/api/transfer/history?limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (transferResponse.ok) {
        const transferData = await transferResponse.json();
        setRecentTransfers(transferData.data.transfers || []);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const calculateTransfer = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    // TEMPORARY: Mock calculation for demo (no backend needed)
    const amountValue = parseFloat(amount);
    const exchangeRates: { [key: string]: { [key: string]: number } } = {
      'USD': { 'IDR': 15000, 'PHP': 56, 'EUR': 0.92, 'CNY': 7.2, 'ADA': 2.5 },
      'EUR': { 'IDR': 16300, 'PHP': 61, 'USD': 1.09, 'CNY': 7.8, 'ADA': 2.7 },
      'GBP': { 'IDR': 19000, 'PHP': 71, 'USD': 1.27, 'EUR': 1.17, 'ADA': 3.2 },
      'ADA': { 'USD': 0.4, 'EUR': 0.37, 'IDR': 6000, 'PHP': 22, 'CNY': 2.9 },
    };

    const rate = exchangeRates[senderCurrency]?.[recipientCurrency] || 1;
    const feePercentage = 1.5;
    const feeAmount = amountValue * (feePercentage / 100);
    const totalAmount = amountValue + feeAmount;
    const recipientAmount = amountValue * rate;

    setCalculation({
      senderAmount: amountValue,
      senderCurrency,
      recipientAmount,
      recipientCurrency,
      exchangeRate: rate,
      fee: {
        percentage: feePercentage,
        amount: feeAmount
      },
      totalAmount
    });

    // Original backend code (commented out for demo)
    // try {
    //   const token = localStorage.getItem('accessToken');
    //   const response = await fetch('/api/transfer/calculate', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${token}`,
    //     },
    //     body: JSON.stringify({
    //       senderCurrency,
    //       recipientCurrency,
    //       amount: parseFloat(amount),
    //       paymentMethod: 'WALLET',
    //     }),
    //   });

    //   if (response.ok) {
    //     const data = await response.json();
    //     setCalculation(data.data);
    //   }
    // } catch (error) {
    //   console.error('Calculation error:', error);
    // }
  };

  const scrollToSection = (ref: React.RefObject<HTMLElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleWalletConnect = () => {
    setIsWalletModalOpen(true);
  };

  const handleLogin = () => {
    // Open wallet modal instead of redirecting
    setIsWalletModalOpen(true);
    // router.push('/login'); // Old behavior
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setBalance(null);
    setRecentTransfers([]);
  };

  const handleFaucetClaim = async () => {
    if (!faucetAddress || faucetAddress.trim() === '') {
      alert('Please enter a valid ETH address');
      return;
    }

    setIsFaucetClaiming(true);
    setFaucetSuccess(false);

    // Simulate API call
    setTimeout(() => {
      setIsFaucetClaiming(false);
      setFaucetSuccess(true);
      
      // Reset after 5 seconds
      setTimeout(() => {
        setFaucetSuccess(false);
        setFaucetAddress('');
      }, 5000);
    }, 2000);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30', text: 'Pending' },
      'paid': { color: 'bg-purple-500/20 text-purple-300 border-purple-400/30', text: 'Paid' },
      'processing': { color: 'bg-purple-500/20 text-purple-300 border-purple-400/30', text: 'Processing' },
      'completed': { color: 'bg-green-500/20 text-green-300 border-green-400/30', text: 'Completed' },
      'failed': { color: 'bg-red-500/20 text-red-300 border-red-400/30', text: 'Failed' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={`${config.color} border`}>{config.text}</Badge>;
  };

  return (
    <div className="min-h-screen">
      <Head>
        <title>TrustBridge - Cross-Border Payments via WhatsApp</title>
        <meta name="description" content="Send money across borders instantly using WhatsApp" />
      </Head>

      {/* Floating Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-0 border-b border-blue-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => scrollToSection(heroRef)}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-500/50">
                <div className="w-6 h-6 rounded-full border-2 border-yellow-200/60"></div>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-glow">Tera Finance</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {isAuthenticated && (
                <>
                  <button
                    onClick={() => scrollToSection(walletRef)}
                    className="text-blue-200 hover:text-white transition-colors"
                  >
                    Wallet
                  </button>
                  <button
                    onClick={() => scrollToSection(sendRef)}
                    className="text-blue-200 hover:text-white transition-colors"
                  >
                    Send
                  </button>
                  <button
                    onClick={() => scrollToSection(historyRef)}
                    className="text-blue-200 hover:text-white transition-colors"
                  >
                    History
                  </button>
                </>
              )}
              <button
                onClick={() => scrollToSection(featuresRef)}
                className="text-blue-200 hover:text-white transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection(faucetRef)}
                className="text-blue-200 hover:text-white transition-colors"
              >
                Faucet
              </button>

              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-blue-300 text-sm">{user?.whatsappNumber}</span>
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="glass border-blue-400/30 text-blue-300 hover:bg-blue-900/30 hover:border-blue-400/50 hover:text-blue-200 transition-all"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleLogin}
                  className="btn-space glow-effect"
                >
                  Get Started
                </Button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden glass-dark border-t border-blue-500/20">
            <div className="px-4 py-4 space-y-3">
              {isAuthenticated && (
                <>
                  <button
                    onClick={() => { scrollToSection(walletRef); setIsMenuOpen(false); }}
                    className="block w-full text-left text-blue-200 hover:text-white transition-colors py-2"
                  >
                    Wallet
                  </button>
                  <button
                    onClick={() => { scrollToSection(sendRef); setIsMenuOpen(false); }}
                    className="block w-full text-left text-blue-200 hover:text-white transition-colors py-2"
                  >
                    Send
                  </button>
                  <button
                    onClick={() => { scrollToSection(historyRef); setIsMenuOpen(false); }}
                    className="block w-full text-left text-blue-200 hover:text-white transition-colors py-2"
                  >
                    History
                  </button>
                </>
              )}
              <button
                onClick={() => { scrollToSection(featuresRef); setIsMenuOpen(false); }}
                className="block w-full text-left text-blue-200 hover:text-white transition-colors py-2"
              >
                Features
              </button>
              <button
                onClick={() => { scrollToSection(faucetRef); setIsMenuOpen(false); }}
                className="block w-full text-left text-blue-200 hover:text-white transition-colors py-2"
              >
                Faucet
              </button>
              {isAuthenticated ? (
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full glass border-blue-400/30 text-blue-300 hover:bg-blue-900/30 hover:border-blue-400/50 hover:text-blue-200 transition-all"
                >
                  Logout
                </Button>
              ) : (
                <Button
                  onClick={handleLogin}
                  className="w-full btn-space"
                >
                  Get Started
                </Button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="min-h-screen flex items-center justify-center pt-16 px-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Main Heading with Background Coins */}
          <div className="relative inline-block mb-8">
            {/* 3D Coins Behind Text - Low Opacity */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ perspective: '1200px', zIndex: -1 }}>
              <div className="coin-orbit coin-orbit-1">
                <div className="coin-3d">
                  <span className="coin-symbol">₿</span>
                </div>
              </div>
              <div className="coin-orbit coin-orbit-2">
                <div className="coin-3d">
                  <span className="coin-symbol">Ξ</span>
                </div>
              </div>
              <div className="coin-orbit coin-orbit-3">
                <div className="coin-3d">
                  <span className="coin-symbol">€</span>
                </div>
              </div>
              <div className="coin-orbit coin-orbit-4">
                <div className="coin-3d">
                  <span className="coin-symbol">$</span>
                </div>
              </div>
            </div>
            
            {/* Text on Top */}
            <h1 className="relative z-10 text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-100 via-white to-blue-100 bg-clip-text text-transparent drop-shadow-2xl leading-tight animate-fade-in px-8 py-6">
              Tera Finance
            </h1>
          </div>

          <p className="text-lg sm:text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in">
            WhatsApp based crypto remittance for Indonesian workers abroad
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="glass-dark p-6 rounded-2xl border border-blue-400/30 animate-fade-in">
              <div className="text-4xl font-bold text-blue-300 mb-2">285+</div>
              <div className="text-gray-300 text-sm">Apps & Services</div>
            </div>
            <div className="glass-dark p-6 rounded-2xl border border-blue-400/30 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="text-4xl font-bold text-blue-300 mb-2">$65B+</div>
              <div className="text-gray-300 text-sm">Digital Assets</div>
            </div>
            <div className="glass-dark p-6 rounded-2xl border border-blue-400/30 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-4xl font-bold text-blue-300 mb-2">180+</div>
              <div className="text-gray-300 text-sm">Countries</div>
            </div>
            <div className="glass-dark p-6 rounded-2xl border border-blue-400/30 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="text-4xl font-bold text-blue-300 mb-2">1.5%</div>
              <div className="text-gray-300 text-sm">Low Fees</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Button
                size="lg"
                onClick={() => scrollToSection(sendRef)}
                className="bg-blue-700 hover:bg-blue-600 text-white text-lg px-10 py-6 rounded-xl group shadow-lg shadow-blue-500/50"
              >
                <Send className="mr-3 h-5 w-5" />
                Send Money Now
                <ArrowUpRight className="ml-3 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handleLogin}
                className="bg-blue-700 hover:bg-blue-600 text-white text-lg px-10 py-6 rounded-xl group shadow-lg shadow-blue-500/50"
              >
                <MessageCircle className="mr-3 h-5 w-5" />
                Get Started
                <ArrowUpRight className="ml-3 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Button>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-gray-400 text-sm">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-blue-400" />
              <span>2-5 min transfers</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-blue-400" />
              <span>Global reach</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Auto Horizontal Scroll */}
      <section ref={featuresRef} className="py-16 relative">
        {/* Fade Overlays - Positioned at absolute viewport edges */}
        <div className="absolute left-0 top-0 bottom-0 w-64 sm:w-80 lg:w-96 bg-gradient-to-r from-[#0A0E1A] from-20% via-[#0A0E1A]/80 via-40% to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-64 sm:w-80 lg:w-96 bg-gradient-to-l from-[#0A0E1A] from-20% via-[#0A0E1A]/80 via-40% to-transparent z-10 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 overflow-hidden">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-12 text-center">
            <span className="text-blue-300">Features</span>
          </h2>

          {/* Auto-scroll Container */}
          <div className="relative overflow-visible">
            <div className="flex gap-8 animate-auto-scroll group">
              {/* Quadruple duplicate for perfectly seamless infinite loop */}
              {[...Array(4)].map((_, duplicateIndex) => (
                <div key={duplicateIndex} className="flex gap-8 flex-shrink-0">
                  {[
                    { 
                      icon: MessageCircle, 
                      title: "WhatsApp Integration", 
                      description: "Send money directly through WhatsApp chat",
                      bg: "bg-gradient-to-br from-green-500 to-green-600",
                      glow: "shadow-lg shadow-green-500/50"
                    },
                    { 
                      icon: Zap, 
                      title: "Lightning Fast", 
                      description: "Transfers complete in just 2-5 minutes",
                      bg: "bg-gradient-to-br from-blue-500 to-blue-600",
                      glow: "shadow-lg shadow-blue-500/50"
                    },
                    { 
                      icon: Shield, 
                      title: "Bank-Grade Security", 
                      description: "Military-grade encryption protects your funds",
                      bg: "bg-gradient-to-br from-blue-600 to-blue-700",
                      glow: "shadow-lg shadow-blue-600/50"
                    },
                    { 
                      icon: Globe, 
                      title: "Global Coverage", 
                      description: "Send money to 180+ countries worldwide",
                      bg: "bg-gradient-to-br from-blue-500 to-cyan-600",
                      glow: "shadow-lg shadow-cyan-500/50"
                    },
                    { 
                      icon: DollarSign, 
                      title: "Ultra Low Fees", 
                      description: "Only 1.5% transaction fee, save more money",
                      bg: "bg-gradient-to-br from-green-500 to-emerald-600",
                      glow: "shadow-lg shadow-emerald-500/50"
                    },
                    { 
                      icon: Smartphone, 
                      title: "Mobile First", 
                      description: "Optimized for mobile devices and WhatsApp",
                      bg: "bg-gradient-to-br from-blue-600 to-indigo-600",
                      glow: "shadow-lg shadow-indigo-500/50"
                    },
                    { 
                      icon: Clock, 
                      title: "24/7 Support", 
                      description: "Round-the-clock customer service available",
                      bg: "bg-gradient-to-br from-blue-500 to-blue-600",
                      glow: "shadow-lg shadow-blue-500/50"
                    },
                    { 
                      icon: Users, 
                      title: "Multi-Language", 
                      description: "Support for Indonesian, English, and more",
                      bg: "bg-gradient-to-br from-blue-600 to-purple-600",
                      glow: "shadow-lg shadow-purple-500/50"
                    },
                    { 
                      icon: Lock, 
                      title: "Smart Escrow", 
                      description: "Automated escrow ensures safe transactions",
                      bg: "bg-gradient-to-br from-cyan-600 to-blue-700",
                      glow: "shadow-lg shadow-cyan-600/50"
                    }
                  ].map((feature, index) => (
                    <div key={`${duplicateIndex}-${index}`} className="flex-shrink-0 w-80">
                      <div className="glass-dark border-blue-400/30 hover:border-blue-400/70 hover:shadow-lg hover:shadow-blue-500/20 rounded-2xl p-8 h-full transition-all">
                        <div className={`w-16 h-16 mb-6 rounded-2xl ${feature.bg} ${feature.glow} flex items-center justify-center transition-all`}>
                          <feature.icon className="w-9 h-9 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">
                          {feature.title}
                        </h3>
                        <p className="text-blue-200 text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Wallet Section - Only show when authenticated */}
      {isAuthenticated && (
        <section ref={walletRef} className="py-16 px-4">
          <div className="max-w-6xl mx-auto w-full">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                <span className="text-blue-300">Your Wallet</span>
              </h2>
              <p className="text-lg text-blue-200">Manage your digital assets securely</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Balance Card */}
              <Card className="lg:col-span-2 glass-dark border-blue-400/30 glow-blue">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2 text-xl">
                      <Wallet className="w-6 h-6 text-blue-400" />
                      <span>Wallet Balance</span>
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBalance(!showBalance)}
                      className="text-blue-300 hover:text-white"
                    >
                      {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-white mb-2">
                      {showBalance ? `${balance?.ada.toFixed(2) || '0.00'} ADA` : '••••••'}
                    </div>
                    <p className="text-blue-200 text-base">
                      {balance?.lovelace || '0'} Lovelace
                    </p>
                  </div>

                  {balance?.assets && balance.assets.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-purple-200 mb-4">Your Assets:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {balance.assets.slice(0, 4).map((asset, index) => (
                          <div key={index} className="glass rounded-lg p-4 border border-purple-400/20">
                            <div className="flex justify-between items-center">
                              <span className="text-purple-300 text-sm">{asset.unit.slice(0, 12)}...</span>
                              <span className="font-medium text-white">{asset.quantity}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="space-y-4">
                <Card className="glass-dark border-blue-400/30">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center glow-cyan">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">
                          {recentTransfers.filter(t => t.status === 'completed').length}
                        </p>
                        <p className="text-blue-200 text-sm">Completed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-dark border-blue-400/30">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center glow-effect">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">
                          {recentTransfers.filter(t => ['pending', 'processing'].includes(t.status)).length}
                        </p>
                        <p className="text-blue-200 text-sm">Pending</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-dark border-blue-400/30">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center glow-blue">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{recentTransfers.length}</p>
                        <p className="text-blue-200 text-sm">Total Transfers</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Send Money Section - Only show when authenticated */}
      {isAuthenticated && (
        <section ref={sendRef} className="py-16 px-4">
          <div className="max-w-4xl mx-auto w-full">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                <span className="text-blue-300">Send Money</span>
              </h2>
              <p className="text-lg text-blue-200">Transfer funds globally in minutes</p>
            </div>

            <Card className="glass-dark border-blue-400/30 glow-blue">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <Send className="w-5 h-5" />
                  <span>New Transfer</span>
                </CardTitle>
                <CardDescription className="text-blue-200 text-sm">
                  Enter the amount and select currencies to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-0">
                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Amount to Send
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-12 text-2xl py-6 glass border-purple-400/30 text-white placeholder:text-purple-300/60 focus:border-purple-400 focus:ring-purple-500 rounded-xl"
                    />
                  </div>
                </div>

                {/* Currency Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      You Send
                    </label>
                    <select
                      value={senderCurrency}
                      onChange={(e) => setSenderCurrency(e.target.value)}
                      className="w-full px-4 py-3 glass border-purple-400/30 rounded-xl focus:ring-2 focus:ring-purple-500 text-white bg-transparent"
                    >
                      {SENDER_CURRENCIES.map((currency) => (
                        <option key={currency.code} value={currency.code} className="bg-slate-800">
                          {currency.code} - {currency.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">
                      Recipient Gets
                    </label>
                    <select
                      value={recipientCurrency}
                      onChange={(e) => setRecipientCurrency(e.target.value)}
                      className="w-full px-4 py-3 glass border-purple-400/30 rounded-xl focus:ring-2 focus:ring-purple-500 text-white bg-transparent"
                    >
                      {RECIPIENT_CURRENCIES.map((currency) => (
                        <option key={currency.code} value={currency.code} className="bg-slate-800">
                          {currency.code} - {currency.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Calculation Preview */}
                {calculation && (
                  <div className="glass rounded-xl p-5 border border-blue-400/30">
                    <h3 className="font-medium text-white mb-3 text-base">Transfer Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-200">Amount to send:</span>
                        <span className="font-medium text-white">
                          {calculation.senderAmount} {calculation.senderCurrency}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-200">Fee ({calculation.fee.percentage}%):</span>
                        <span className="font-medium text-white">
                          {calculation.fee.amount.toFixed(2)} {calculation.senderCurrency}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-blue-400/30 pt-2 text-sm">
                        <span className="text-blue-200">Total cost:</span>
                        <span className="font-bold text-base text-white">
                          {calculation.totalAmount.toFixed(2)} {calculation.senderCurrency}
                        </span>
                      </div>
                      <div className="flex justify-between bg-green-500/20 p-3 rounded-xl border border-green-400/30 mt-3">
                        <span className="text-green-300 font-medium text-sm">Recipient receives:</span>
                        <span className="font-bold text-green-300 text-base">
                          {calculation.recipientAmount.toFixed(2)} {calculation.recipientCurrency}
                        </span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-blue-300 mt-3 text-xs">
                        <Clock className="w-3 h-3" />
                        <span>Estimated delivery: 2-5 minutes</span>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => setIsProcessingModalOpen(true)}
                  disabled={!amount || !calculation}
                  className="w-full btn-space py-5 text-base rounded-xl glow-effect"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Continue to Send
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Transaction History Section - Only show when authenticated */}
      {isAuthenticated && (
        <section ref={historyRef} className="py-16 px-4">
          <div className="max-w-6xl mx-auto w-full">
            <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                <span className="text-blue-300">Transaction History</span>
              </h2>
              <p className="text-lg text-blue-200">Track all your cross-border payments</p>
            </div>

            <Card className="glass-dark border-blue-400/30">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Recent Transfers</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsHistoryModalOpen(true)}
                    className="glass border-blue-400/30 text-blue-300 hover:bg-blue-900/30 hover:border-blue-400/50 hover:text-blue-200 transition-all"
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {recentTransfers.length === 0 ? (
                  <div className="text-center py-12">
                    <Send className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-white mb-2">No transfers yet</h3>
                    <p className="text-blue-200 text-sm mb-5">Start your first transfer to see it here</p>
                    <Button
                      size="sm"
                      onClick={() => scrollToSection(sendRef)}
                      className="btn-space glow-effect"
                    >
                      Send Money Now
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentTransfers.map((transfer) => (
                      <div
                        key={transfer.transferId}
                        className="flex items-center justify-between p-4 glass rounded-xl cursor-pointer hover:bg-blue-500/10 transition-colors border border-blue-400/20"
                        onClick={() => router.push(`/transfer/${transfer.transferId}`)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-11 h-11 bg-blue-600 rounded-full flex items-center justify-center glow-blue">
                            <ArrowUpRight className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-white text-base mb-1">
                              {transfer.sender.amount} {transfer.sender.currency} → {transfer.recipient.currency}
                            </div>
                            <div className="text-xs text-blue-200">
                              To: {transfer.recipient.name}
                            </div>
                            <div className="text-xs text-blue-300 mt-0.5">
                              {new Date(transfer.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-1.5">
                          {getStatusBadge(transfer.status)}
                          <div className="text-base font-medium text-white">
                            {transfer.recipient.amount} {transfer.recipient.currency}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Faucet Section */}
      <section ref={faucetRef} className="py-16 px-4">
        <div className="max-w-3xl mx-auto w-full">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="text-blue-300">ETH Faucet</span>
            </h2>
            <p className="text-lg text-blue-200">Get free testnet ETH for development</p>
          </div>

          <Card className="glass-dark border-blue-400/30 glow-blue">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-xl">
                <Zap className="w-6 h-6 text-yellow-400" />
                <span>Claim Test ETH</span>
              </CardTitle>
              <CardDescription className="text-blue-200 text-sm">
                Enter your Ethereum address to receive 0.1 testnet ETH
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-0">
              {/* ETH Address Input */}
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Your ETH Address
                </label>
                <Input
                  type="text"
                  placeholder="0x..."
                  value={faucetAddress}
                  onChange={(e) => setFaucetAddress(e.target.value)}
                  disabled={isFaucetClaiming}
                  className="glass border-blue-400/30 text-white placeholder:text-blue-300/60 focus:border-blue-400 focus:ring-blue-500 rounded-xl py-6"
                />
              </div>

              {/* Success Message */}
              {faucetSuccess && (
                <div className="glass rounded-xl p-4 border border-green-400/30 bg-green-500/10">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <div>
                      <p className="text-green-300 font-medium">Success!</p>
                      <p className="text-green-200 text-sm">0.1 ETH has been sent to your address</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Claim Button */}
              <Button
                onClick={handleFaucetClaim}
                disabled={isFaucetClaiming || !faucetAddress || faucetSuccess}
                className="w-full btn-space py-6 text-base rounded-xl glow-effect disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFaucetClaiming ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Claiming...</span>
                  </div>
                ) : faucetSuccess ? (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>Claimed Successfully</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5" />
                    <span>Claim 0.1 ETH</span>
                  </div>
                )}
              </Button>

              {/* Info */}
              <div className="glass rounded-xl p-4 border border-blue-400/30">
                <h3 className="font-medium text-white mb-2 text-sm flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span>Faucet Information</span>
                </h3>
                <ul className="space-y-2 text-blue-200 text-xs">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>Testnet ETH only - no real value</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>Limit: 0.1 ETH per address per 24 hours</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>Funds will arrive within 1-2 minutes</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>For development and testing purposes only</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass border-t border-blue-500/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-500/50">
                  <div className="w-6 h-6 rounded-full border-2 border-yellow-200/60"></div>
                </div>
                <span className="text-xl font-bold text-glow">Tera Finance</span>
              </div>
              <p className="text-blue-300 text-sm">
                Revolutionary cross-border payments powered by blockchain technology.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <div className="space-y-2">
                <button onClick={() => scrollToSection(featuresRef)} className="block text-blue-300 hover:text-white text-sm">Features</button>
                <button onClick={() => scrollToSection(sendRef)} className="block text-blue-300 hover:text-white text-sm">Send Money</button>
                <button onClick={() => scrollToSection(historyRef)} className="block text-blue-300 hover:text-white text-sm">History</button>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <div className="space-y-2">
                <a href="#" className="block text-blue-300 hover:text-white text-sm">About Us</a>
                <a href="#" className="block text-blue-300 hover:text-white text-sm">Careers</a>
                <a href="#" className="block text-blue-300 hover:text-white text-sm">Blog</a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <div className="space-y-2">
                <a href="#" className="block text-blue-300 hover:text-white text-sm">Privacy Policy</a>
                <a href="#" className="block text-blue-300 hover:text-white text-sm">Terms of Service</a>
                <a href="#" className="block text-blue-300 hover:text-white text-sm">Security</a>
              </div>
            </div>
          </div>

          <div className="border-t border-blue-500/20 pt-8 text-center text-blue-300 text-sm">
            <p>&copy; 2025 Tera Finance</p>
          </div>
        </div>
      </footer>

      {/* Wallet Connect Modal */}
      {isWalletModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsWalletModalOpen(false)}
          ></div>

          {/* Modal */}
          <div className="relative glass-dark border-blue-400/30 rounded-3xl p-8 max-w-md w-full shadow-2xl glow-blue animate-fade-in">
            {/* Close button */}
            <button
              onClick={() => setIsWalletModalOpen(false)}
              className="absolute top-4 right-4 text-blue-300 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 glow-blue animate-pulse">
                <Wallet className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Connect Wallet</h2>
              <p className="text-blue-200">Connect your wallet or WhatsApp to get started</p>
            </div>

            {/* Wallet Options */}
            <div className="space-y-4">
              {/* Crypto Wallets */}
              <button className="w-full glass border-blue-400/30 hover:border-blue-400/50 rounded-xl p-4 transition-all hover:scale-105 group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-yellow-500 rounded-lg flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-white group-hover:text-blue-300 transition-colors">Eternl Wallet</div>
                    <div className="text-sm text-blue-200">Connect via browser extension</div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </button>

              <button className="w-full glass border-blue-400/30 hover:border-blue-400/50 rounded-xl p-4 transition-all hover:scale-105 group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-yellow-500 rounded-lg flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-white group-hover:text-blue-300 transition-colors">Nami Wallet</div>
                    <div className="text-sm text-blue-200">Connect via browser extension</div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </button>

              <button className="w-full glass border-blue-400/30 hover:border-blue-400/50 rounded-xl p-4 transition-all hover:scale-105 group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-white group-hover:text-green-300 transition-colors">WhatsApp</div>
                    <div className="text-sm text-blue-200">Connect via phone number</div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-green-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-blue-500/20">
              <div className="flex items-center justify-center space-x-2 text-blue-300 text-sm">
                <Shield className="w-4 h-4" />
                <span>Secured by Blockchain</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History Modal - View All */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-dark border-blue-400/30 rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-blue-400/30">
              <h2 className="text-2xl font-bold text-white">
                All <span className="text-blue-300">Transactions</span>
              </h2>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className="w-10 h-10 rounded-full glass border-blue-400/30 hover:bg-blue-900/30 hover:border-blue-400/50 flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5 text-blue-300" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {recentTransfers.length === 0 ? (
                <div className="text-center py-16">
                  <Send className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">No transfers yet</h3>
                  <p className="text-blue-200">Start your first transfer to see it here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentTransfers.map((transfer) => (
                    <div
                      key={transfer.transferId}
                      className="flex items-center justify-between p-6 glass rounded-xl border border-blue-400/20 hover:bg-blue-500/10 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center glow-blue flex-shrink-0">
                          <ArrowUpRight className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-white text-lg mb-1">
                            {transfer.sender.amount} {transfer.sender.currency} → {transfer.recipient.currency}
                          </div>
                          <div className="text-sm text-blue-200">
                            To: {transfer.recipient.name}
                          </div>
                          <div className="text-xs text-blue-300 mt-1">
                            {new Date(transfer.createdAt).toLocaleDateString()} at {new Date(transfer.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2 flex-shrink-0">
                        {getStatusBadge(transfer.status)}
                        <div className="text-lg font-medium text-white">
                          {transfer.recipient.amount} {transfer.recipient.currency}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Transaction Processing Modal */}
      {isProcessingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-dark border-blue-400/30 rounded-2xl max-w-md w-full p-8 text-center">
            {/* Success Icon with Animation */}
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-green-500/50">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white mb-3">
              Transaction Processing
            </h2>

            {/* Description */}
            <p className="text-blue-200 mb-6 leading-relaxed">
              Your transaction is being processed. You&apos;ll receive a WhatsApp notification once it&apos;s completed.
            </p>

            {/* Transaction Details */}
            {calculation && (
              <div className="glass rounded-xl p-4 mb-6 border border-blue-400/30 text-left">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-300">Amount:</span>
                    <span className="text-white font-medium">
                      {calculation.senderAmount} {calculation.senderCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-300">Recipient gets:</span>
                    <span className="text-green-300 font-medium">
                      {calculation.recipientAmount.toFixed(2)} {calculation.recipientCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-blue-400/30">
                    <span className="text-blue-300">Estimated time:</span>
                    <span className="text-white font-medium">2-5 minutes</span>
                  </div>
                </div>
              </div>
            )}

            {/* Close Button */}
            <Button
              onClick={() => {
                setIsProcessingModalOpen(false);
                setAmount('');
                setCalculation(null);
              }}
              className="w-full btn-space py-3 text-base rounded-xl"
            >
              Got it
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
