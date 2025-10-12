import Head from "next/head";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  Wallet,
  Send,
  History,
  LogOut,
  MessageCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

interface User {
  id: string;
  whatsappNumber: string;
  status: string;
}

interface WalletBalance {
  ada: number;
  lovelace: string;
  assets: any[];
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

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [recentTransfers, setRecentTransfers] = useState<Transfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(false);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('accessToken');

      // Load wallet balance
      const balanceResponse = await fetch('/api/cardano/backend-info', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        setBalance(balanceData.data.balance);
      }

      // Load recent transfers
      const transferResponse = await fetch(`/api/transfer/history?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (transferResponse.ok) {
        const transferData = await transferResponse.json();
        setRecentTransfers(transferData.data.transfers || []);
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30', text: 'Pending' },
      'paid': { color: 'bg-blue-500/20 text-blue-300 border-blue-400/30', text: 'Paid' },
      'processing': { color: 'bg-purple-500/20 text-purple-300 border-purple-400/30', text: 'Processing' },
      'completed': { color: 'bg-green-500/20 text-green-300 border-green-400/30', text: 'Completed' },
      'failed': { color: 'bg-red-500/20 text-red-300 border-red-400/30', text: 'Failed' },
      'cancelled': { color: 'bg-gray-500/20 text-gray-300 border-gray-400/30', text: 'Cancelled' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={`${config.color} border`}>{config.text}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Head>
        <title>Dashboard - TrustBridge</title>
        <meta name="description" content="Manage your cross-border payments and view transaction history" />
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
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-blue-300">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">{user?.whatsappNumber}</span>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center space-x-2 glass border-blue-400/30 text-blue-300 hover:text-white hover:border-blue-300/50"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Welcome back!</h1>
          <p className="text-blue-200 mt-2">Manage your cross-border payments and track transfers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Wallet Balance */}
          <Card className="lg:col-span-1 glass-dark border-blue-400/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Wallet className="w-5 h-5" />
                  <span>Wallet Balance</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBalance(!showBalance)}
                >
                  {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-2">
                {showBalance ? `${balance?.ada.toFixed(2) || '0.00'} ADA` : '••••••'}
              </div>
              <p className="text-blue-200 text-sm mb-4">
                {balance?.lovelace || '0'} Lovelace
              </p>

              {balance?.assets && balance.assets.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-200">Assets:</p>
                  {balance.assets.slice(0, 3).map((asset, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-blue-300">{asset.unit.slice(0, 8)}...</span>
                      <span className="font-medium">{asset.quantity}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="lg:col-span-2 glass-dark border-blue-400/30">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Start a new transfer or view your transaction history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  onClick={() => router.push('/send')}
                  className="btn-space p-6 h-auto flex flex-col items-center space-y-2 glow-effect"
                >
                  <Send className="w-8 h-8" />
                  <div className="text-center">
                    <div className="font-semibold">Send Money</div>
                    <div className="text-sm opacity-90">Start a new transfer</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push('/history')}
                  className="p-6 h-auto flex flex-col items-center space-y-2 glass border-blue-400/30 text-blue-300 hover:text-white"
                >
                  <History className="w-8 h-8" />
                  <div className="text-center">
                    <div className="font-semibold">View History</div>
                    <div className="text-sm text-blue-300">See all transfers</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transfers */}
        <Card className="mt-8 glass-dark border-blue-400/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Transfers</CardTitle>
              <Button
                variant="outline"
                onClick={() => router.push('/history')}
                className="text-sm glass border-blue-400/30 text-blue-300 hover:text-white"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentTransfers.length === 0 ? (
              <div className="text-center py-12">
                <Send className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No transfers yet</h3>
                <p className="text-blue-200 mb-6">Start your first transfer to see it here</p>
                <Button
                  onClick={() => router.push('/send')}
                  className="btn-space glow-effect"
                >
                  Send Money Now
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransfers.map((transfer) => (
                  <div
                    key={transfer.transferId}
                    className="flex items-center justify-between p-4 glass rounded-lg cursor-pointer hover:bg-blue-500/10 transition-colors border border-blue-400/20"
                    onClick={() => router.push(`/transfer/${transfer.transferId}`)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center glow-blue">
                        <ArrowUpRight className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          {transfer.sender.amount} {transfer.sender.currency} → {transfer.recipient.currency}
                        </div>
                        <div className="text-sm text-blue-200">
                          To: {transfer.recipient.name}
                        </div>
                        <div className="text-xs text-blue-300">
                          {new Date(transfer.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(transfer.status)}
                      <div className="text-sm text-blue-200 mt-1">
                        {transfer.recipient.amount} {transfer.recipient.currency}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="glass-dark border-blue-400/30">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center glow-cyan">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {recentTransfers.filter(t => t.status === 'completed').length}
                  </p>
                  <p className="text-blue-200 text-sm">Completed Transfers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-dark border-blue-400/30">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center glow-effect">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {recentTransfers.filter(t => ['pending', 'processing'].includes(t.status)).length}
                  </p>
                  <p className="text-blue-200 text-sm">Pending Transfers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-dark border-blue-400/30">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center glow-blue">
                  <ArrowUpRight className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{recentTransfers.length}</p>
                  <p className="text-blue-200 text-sm">Total Transfers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}