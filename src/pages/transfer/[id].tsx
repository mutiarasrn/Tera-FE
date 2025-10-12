import Head from "next/head";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  Copy,
  MessageCircle,
  RefreshCw
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
    totalCharged: number;
  };
  recipient: {
    name: string;
    currency: string;
    amount: number;
    bank: string;
    account: string;
  };
  blockchain: {
    path: string[];
    mockADAAmount: number;
    hubToken: string;
    recipientToken: string;
    policyId: string;
    txHash: string;
    cardanoScanUrl: string;
  };
  fees: {
    percentage: number;
    amount: number;
  };
  timeline: Array<{
    status: string;
    timestamp: string;
  }>;
  createdAt: string;
  completedAt?: string;
}

export default function TransferStatus() {
  const router = useRouter();
  const { id } = router.query;
  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadTransferDetails();
      // Poll for updates every 10 seconds for pending/processing transfers
      const interval = setInterval(() => {
        if (transfer && ['pending', 'processing'].includes(transfer.status)) {
          loadTransferDetails();
        }
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [id, transfer?.status]);

  const loadTransferDetails = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/transfer/details/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTransfer(data.data);
      } else {
        setError('Transfer not found');
      }
    } catch (error) {
      setError('Failed to load transfer details');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusMap = {
      'pending': {
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
        title: 'Payment Pending',
        description: 'Waiting for payment confirmation'
      },
      'paid': {
        color: 'bg-blue-100 text-blue-800',
        icon: RefreshCw,
        title: 'Payment Confirmed',
        description: 'Processing blockchain transaction'
      },
      'processing': {
        color: 'bg-purple-100 text-purple-800',
        icon: RefreshCw,
        title: 'Processing',
        description: 'Transaction is being processed on the blockchain'
      },
      'completed': {
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        title: 'Transfer Completed',
        description: 'Money has been delivered to recipient'
      },
      'failed': {
        color: 'bg-red-100 text-red-800',
        icon: XCircle,
        title: 'Transfer Failed',
        description: 'Transfer could not be completed'
      },
      'cancelled': {
        color: 'bg-gray-100 text-gray-800',
        icon: XCircle,
        title: 'Transfer Cancelled',
        description: 'Transfer was cancelled'
      }
    };

    return statusMap[status as keyof typeof statusMap] || statusMap.pending;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transfer details...</p>
        </div>
      </div>
    );
  }

  if (error || !transfer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Transfer Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => router.push('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(transfer.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Transfer {transfer.transferId} - TrustBridge</title>
        <meta name="description" content="Track your cross-border payment status" />
      </Head>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-indigo-600">TrustBridge</span>
            </div>
            <div className="flex items-center">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Status Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            {(() => {
              const IconComponent = statusInfo.icon;
              return <IconComponent className="w-8 h-8 text-indigo-600" />;
            })()}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{statusInfo.title}</h1>
          <p className="text-gray-600">{statusInfo.description}</p>
          <Badge className={`${statusInfo.color} border-0 mt-4`}>
            {transfer.status.toUpperCase()}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Transfer Details */}
          <Card>
            <CardHeader>
              <CardTitle>Transfer Details</CardTitle>
              <CardDescription>Transfer ID: {transfer.transferId}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Sent:</span>
                <span className="font-medium">
                  {transfer.sender.amount} {transfer.sender.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fee:</span>
                <span className="font-medium">
                  {(transfer.fees?.amount ? Number(transfer.fees.amount).toFixed(2) : '0.00')} {transfer.sender.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Charged:</span>
                <span className="font-medium">
                  {transfer.sender.totalCharged.toFixed(2)} {transfer.sender.currency}
                </span>
              </div>
              <div className="flex justify-between border-t pt-4">
                <span className="text-gray-600">Recipient Gets:</span>
                <span className="font-bold text-green-600">
                  {transfer.recipient.amount.toFixed(2)} {transfer.recipient.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium">{transfer.paymentMethod}</span>
              </div>
            </CardContent>
          </Card>

          {/* Recipient Information */}
          <Card>
            <CardHeader>
              <CardTitle>Recipient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{transfer.recipient.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bank:</span>
                <span className="font-medium">{transfer.recipient.bank}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account:</span>
                <span className="font-medium">****{transfer.recipient.account.slice(-4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Currency:</span>
                <span className="font-medium">{transfer.recipient.currency}</span>
              </div>
            </CardContent>
          </Card>

          {/* Blockchain Information */}
          {transfer.blockchain.txHash && (
            <Card>
              <CardHeader>
                <CardTitle>Blockchain Transaction</CardTitle>
                <CardDescription>Cardano blockchain details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-gray-600 block mb-1">Transaction Hash:</span>
                  <div className="flex items-center space-x-2">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded flex-1 truncate">
                      {transfer.blockchain.txHash}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(transfer.blockchain.txHash)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {transfer.blockchain.cardanoScanUrl && (
                  <div>
                    <Button
                      variant="outline"
                      onClick={() => window.open(transfer.blockchain.cardanoScanUrl, '_blank')}
                      className="w-full"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on CardanoScan
                    </Button>
                  </div>
                )}

                {transfer.blockchain.policyId && (
                  <div>
                    <span className="text-gray-600 block mb-1">Policy ID:</span>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded block truncate">
                      {transfer.blockchain.policyId}
                    </code>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Transfer Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transfer.timeline.map((event, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {event.status.replace('_', ' ').toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(event.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <Button
            variant="outline"
            onClick={() => router.push('/send')}
          >
            Send Another Transfer
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/history')}
          >
            View All Transfers
          </Button>
          {transfer.status === 'completed' && (
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                // Share via WhatsApp or copy link
                const message = `Transfer completed! Sent ${transfer.sender.amount} ${transfer.sender.currency} to ${transfer.recipient.name}. Transaction ID: ${transfer.transferId}`;
                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
              }}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Share Receipt
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}