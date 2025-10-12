import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Copy,
  RefreshCw,
  ArrowRight,
  Wallet,
  Building,
  Rocket,
  Star,
  Zap,
  Globe,
  Orbit
} from 'lucide-react';
import { apiUrl } from '@/lib/config';

interface TransferStatusTrackerProps {
  transferId: string;
  onClose?: () => void;
}

const statusSteps = [
  { key: 'INITIATED', label: 'Mission Initiated', description: 'Cosmic transfer sequence launched' },
  { key: 'PAYMENT_CONFIRMED', label: 'Fuel Confirmed', description: 'Payment received and verified across the network' },
  { key: 'MINTED_MOCKADA', label: 'Cosmic Tokens Minted', description: 'Intermediate tokens materialized on blockchain' },
  { key: 'SWAPPED_TO_RECIPIENT_TOKEN', label: 'Quantum Exchange', description: 'Tokens transformed to destination currency' },
  { key: 'BANK_PAYOUT_INITIATED', label: 'Planet-Side Transfer', description: 'Funds traveling to recipient galaxy' },
  { key: 'COMPLETED', label: 'Mission Complete', description: 'Assets successfully delivered to target' },
];

export default function TransferStatusTracker({ transferId, onClose }: TransferStatusTrackerProps) {
  const [transferDetails, setTransferDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTransferDetails();
    const interval = setInterval(fetchTransferDetails, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [transferId]);

  const fetchTransferDetails = async () => {
    try {
      setRefreshing(true);
      setError(null);

      const response = await fetch(apiUrl(`/api/transfer/details/${transferId}`));

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTransferDetails(data.data);
        } else {
          setError(data.error || 'Failed to fetch transfer details');
        }
      } else {
        setError('Failed to fetch transfer details');
      }
    } catch (err) {
      setError('Failed to fetch transfer details');
      console.error('Transfer details fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusIcon = (stepStatus: string, currentStatus: string) => {
    const stepIndex = statusSteps.findIndex(step => step.key === stepStatus);
    const currentIndex = statusSteps.findIndex(step => step.key === currentStatus);

    if (stepIndex < currentIndex || currentStatus === 'COMPLETED') {
      return <CheckCircle className="w-5 h-5 text-green-400" />;
    } else if (stepIndex === currentIndex) {
      return <Clock className="w-5 h-5 text-blue-400 animate-pulse" />;
    } else {
      return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getProgressPercentage = (currentStatus: string) => {
    const currentIndex = statusSteps.findIndex(step => step.key === currentStatus);
    return Math.round(((currentIndex + 1) / statusSteps.length) * 100);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <Card className="card-space hover:glow-effect">
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center glow-effect">
              <RefreshCw className="w-6 h-6 animate-spin text-white" />
            </div>
            <p className="text-gray-300">Scanning cosmic network...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !transferDetails) {
    return (
      <Card className="card-space hover:glow-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            Communication Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={fetchTransferDetails} className="glass border-white/20 text-white hover:bg-white/10">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Scan
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Transfer Overview */}
      <Card className="card-space hover:glow-effect">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center glow-effect">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-white gradient-text-cosmic">Mission Status</CardTitle>
                <CardDescription className="text-gray-300 flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Mission ID: {transferId}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchTransferDetails}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              {onClose && (
                <Button variant="outline" size="sm" onClick={onClose} className="glass border-white/20 text-white hover:bg-white/10">
                  <Zap className="w-4 h-4 mr-1" />
                  Close
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className={
                transferDetails.status === 'COMPLETED'
                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                  : transferDetails.status === 'FAILED'
                  ? 'bg-red-500/10 text-red-400 border-red-500/20'
                  : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              }
            >
              {transferDetails.status.replace('_', ' ')}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {getProgressPercentage(transferDetails.status)}% Complete
            </span>
          </div>

          <Progress value={getProgressPercentage(transferDetails.status)} className="w-full" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Rocket className="w-4 h-4 text-cyan-400" />
                <span className="text-gray-300">Launching:</span>
                <span className="font-medium text-white">
                  {transferDetails.sender.amount.toFixed(2)} {transferDetails.sender.currency}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">Target:</span>
                <span className="font-medium text-white">{transferDetails.recipient.name}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Star className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Delivering:</span>
                <span className="font-medium text-green-400">
                  {transferDetails.recipient.amount.toFixed(2)} {transferDetails.recipient.currency}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300">Destination:</span>
                <span className="font-medium text-white">{transferDetails.recipient.bank}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Timeline */}
      <Card className="card-space hover:glow-effect">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Orbit className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-white">Mission Progress</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statusSteps.map((step, index) => (
              <div key={step.key} className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(step.key, transferDetails.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${
                      statusSteps.findIndex(s => s.key === transferDetails.status) >= index
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    }`}>
                      {step.label}
                    </span>
                    {index < statusSteps.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Blockchain Transactions */}
      {transferDetails.blockchain.transactions.length > 0 && (
        <Card className="card-space hover:glow-effect">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-white">Cosmic Blockchain Trail</CardTitle>
                <CardDescription className="text-gray-300">
                  Quantum path: {transferDetails.blockchain.path.join(' → ')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transferDetails.blockchain.transactions.map((tx: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Step {tx.step}: {tx.action}</span>
                      {tx.amount && (
                        <Badge variant="outline" className="text-xs">
                          {tx.amount}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(tx.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(tx.txHash)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(tx.cardanoScanUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fee Breakdown */}
      <Card className="card-space hover:glow-effect">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-white">Cosmic Fee Analysis</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Cosmic Fee:
              </span>
              <span className="font-medium text-white">
                {(transferDetails.fees?.amount ? Number(transferDetails.fees.amount).toFixed(2) : '0.00')} {transferDetails.sender.currency} ({transferDetails.fees?.percentage || '0'}%)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300 flex items-center gap-2">
                <Star className="w-4 h-4 text-cyan-400" />
                Quantum ADA:
              </span>
              <span className="font-medium text-cyan-400">
                {transferDetails.blockchain.mockADAAmount.toFixed(2)} ADA
              </span>
            </div>
            <div className="border-t border-white/20 pt-3 flex justify-between items-center">
              <span className="font-medium text-white flex items-center gap-2">
                <Rocket className="w-4 h-4 text-purple-400" />
                Total Energy Consumed:
              </span>
              <span className="font-bold text-white text-lg">
                {transferDetails.sender.totalCharged.toFixed(2)} {transferDetails.sender.currency}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}