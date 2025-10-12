import Head from "next/head";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  CreditCard,
  ArrowLeft,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Eye
} from "lucide-react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

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
    bank: string;
    account: string;
  };
  blockchain: {
    txHash?: string;
    cardanoScanUrl?: string;
  };
  createdAt: string;
  completedAt?: string;
}

interface TransferHistoryData {
  transfers: Transfer[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export default function History() {
  const router = useRouter();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [limit] = useState(20);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    loadTransferHistory();
  }, [router, statusFilter, paymentMethodFilter]);

  const loadTransferHistory = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      const params = new URLSearchParams({
        userId: user.id,
        limit: limit.toString(),
        offset: '0',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(paymentMethodFilter !== 'all' && { paymentMethod: paymentMethodFilter }),
      });

      const response = await fetch(`/api/transfer/history?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: { success: boolean; data: TransferHistoryData } = await response.json();
        setTransfers(data.data.transfers);
        setHasMore(data.data.hasMore);
      }
    } catch (error) {
      console.error('Error loading transfer history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30', icon: Clock, text: 'Pending' },
      'paid': { color: 'bg-blue-500/20 text-blue-300 border-blue-400/30', icon: Clock, text: 'Paid' },
      'processing': { color: 'bg-purple-500/20 text-purple-300 border-purple-400/30', icon: Clock, text: 'Processing' },
      'completed': { color: 'bg-green-500/20 text-green-300 border-green-400/30', icon: CheckCircle, text: 'Completed' },
      'failed': { color: 'bg-red-500/20 text-red-300 border-red-400/30', icon: XCircle, text: 'Failed' },
      'cancelled': { color: 'bg-gray-500/20 text-gray-300 border-gray-400/30', icon: XCircle, text: 'Cancelled' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge className={`${config.color} border flex items-center space-x-1`}>
        <config.icon className="w-3 h-3" />
        <span>{config.text}</span>
      </Badge>
    );
  };

  const filteredTransfers = transfers.filter(transfer => {
    const matchesSearch = transfer.recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.transferId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-300">Loading transfer history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Head>
        <title>Transfer History - TrustBridge</title>
        <meta name="description" content="View all your cross-border payment transactions" />
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
              <Button
                onClick={() => router.push('/send')}
                className="btn-space glow-effect"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Money
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2 glass border-blue-400/30 text-blue-300 hover:text-white hover:border-blue-300/50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Dashboard</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Transfer History</h1>
          <p className="text-blue-200">View and track all your cross-border payments</p>
        </div>

        {/* Filters and Search */}
        <Card className="mb-8 glass-dark border-blue-400/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
                <Input
                  placeholder="Search by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 glass border-blue-400/30 text-white placeholder:text-blue-300/60 focus:border-blue-400 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 glass border-blue-400/30 rounded-lg focus:ring-2 focus:ring-blue-500 text-white bg-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Payment Method Filter */}
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="px-3 py-2 glass border-blue-400/30 rounded-lg focus:ring-2 focus:ring-blue-500 text-white bg-transparent"
              >
                <option value="all">All Methods</option>
                <option value="WALLET">Crypto Wallet</option>
                <option value="MASTERCARD">Mastercard</option>
              </select>

              {/* Refresh Button */}
              <Button
                variant="outline"
                onClick={loadTransferHistory}
                className="flex items-center space-x-2"
              >
                <span>Refresh</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transfer List */}
        <Card className="glass-dark border-blue-400/30">
          <CardHeader>
            <CardTitle>Transfers ({filteredTransfers.length})</CardTitle>
            <CardDescription>
              {filteredTransfers.length === 0 && transfers.length > 0
                ? 'No transfers match your search criteria'
                : `Showing ${filteredTransfers.length} transfers`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTransfers.length === 0 ? (
              <div className="text-center py-12">
                <Send className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">
                  {transfers.length === 0 ? 'No transfers yet' : 'No matching transfers'}
                </h3>
                <p className="text-blue-200 mb-6">
                  {transfers.length === 0
                    ? 'Start your first transfer to see it here'
                    : 'Try adjusting your search or filter criteria'}
                </p>
                <Button
                  onClick={() => router.push('/send')}
                  className="btn-space glow-effect"
                >
                  Send Money Now
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransfers.map((transfer) => (
                  <div
                    key={transfer.transferId}
                    className="flex items-center justify-between p-6 glass rounded-lg hover:bg-blue-500/10 transition-colors cursor-pointer border border-blue-400/20"
                    onClick={() => router.push(`/transfer/${transfer.transferId}`)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center glow-blue">
                        <ArrowUpRight className="w-6 h-6 text-white" />
                      </div>

                      <div>
                        <div className="font-semibold text-white mb-1">
                          {transfer.sender.amount} {transfer.sender.currency} → {transfer.recipient.currency}
                        </div>
                        <div className="text-sm text-blue-200 mb-1">
                          To: {transfer.recipient.name}
                        </div>
                        <div className="text-sm text-blue-200">
                          {transfer.recipient.bank} • ****{transfer.recipient.account.slice(-4)}
                        </div>
                        <div className="text-xs text-blue-300 mt-2">
                          ID: {transfer.transferId}
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-2">
                      {getStatusBadge(transfer.status)}

                      <div className="text-sm font-medium text-white">
                        {transfer.recipient.amount.toFixed(2)} {transfer.recipient.currency}
                      </div>

                      <div className="text-xs text-blue-300">
                        {new Date(transfer.createdAt).toLocaleDateString()}
                      </div>

                      <div className="text-xs text-blue-300">
                        via {transfer.paymentMethod}
                      </div>

                      {transfer.blockchain.txHash && (
                        <div className="text-xs text-blue-400">
                          Blockchain verified
                        </div>
                      )}
                    </div>

                    <div className="ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/transfer/${transfer.transferId}`);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Load More */}
            {hasMore && (
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Implementation for loading more transfers
                    console.log('Load more transfers');
                  }}
                  className="glass border-blue-400/30 text-blue-300 hover:text-white hover:border-blue-300/50"
                >
                  Load More Transfers
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Stats */}
        {transfers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {transfers.length}
                  </div>
                  <div className="text-gray-600 text-sm">Total Transfers</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {transfers.filter(t => t.status === 'completed').length}
                  </div>
                  <div className="text-gray-600 text-sm">Completed</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {transfers.filter(t => ['pending', 'processing', 'paid'].includes(t.status)).length}
                  </div>
                  <div className="text-gray-600 text-sm">In Progress</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {transfers.filter(t => ['failed', 'cancelled'].includes(t.status)).length}
                  </div>
                  <div className="text-gray-600 text-sm">Failed/Cancelled</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}