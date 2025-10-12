import Head from "next/head";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Wallet,
  ArrowLeft,
  Send as SendIcon,
  Calculator,
  User,
  Building,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  MessageCircle,
  Globe,
  ArrowRight,
  Coins
} from "lucide-react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { Transaction } from "@meshsdk/core";

// Mock tokens available for sending
const MOCK_TOKENS = [
  { name: 'mockADA', policyId: '1c05bdd719318cef47811522e134bfeba87fce3f73b4892c62561c93', symbol: 'mockADA', flag: '₳' },
  { name: 'mockUSDC', policyId: '4cbb15ff52c7459cd734c79c1a9fae87cab77b2a49f9a83907c8125d', symbol: 'mockUSDC', flag: '$' },
  { name: 'mockIDRX', policyId: '5c9a67cc3c085c4ad001492d1e460f5aea9cc2b8847c23e1683c26d9', symbol: 'mockIDRX', flag: 'Rp' },
  { name: 'mockEUROC', policyId: 'f766f151787a989166869375f4c57cfa36c533241033c8000a5481c1', symbol: 'mockEUROC', flag: '€' },
  { name: 'mockJPYC', policyId: '7725300e8d414e0fccad0a562e3a9c585970e84e7e92d422111e1e29', symbol: 'mockJPYC', flag: '¥' },
  { name: 'mockCNHT', policyId: 'c7bdad55621e968c6ccb0967493808c9ab50601b3b9aec77b2ba6888', symbol: 'mockCNHT', flag: '¥' },
  { name: 'mockMXNT', policyId: 'c73682653bd1ff615e54a3d79c00068e1f4977a7a9628f39add50dc3', symbol: 'mockMXNT', flag: '$' },
];

// Recipient currencies with mock token mapping
const RECIPIENT_CURRENCIES = [
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩', mockToken: 'mockIDRX' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', mockToken: 'mockUSDC' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', mockToken: 'mockEUROC' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', mockToken: 'mockJPYC' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳', mockToken: 'mockCNHT' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽', mockToken: 'mockMXNT' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭', mockToken: null },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', flag: '🇻🇳', mockToken: null },
];

interface CalculationResult {
  senderAmount: number;
  recipientAmount: number;
  exchangeRate: number;
  adaAmount: number;
  fee: {
    percentage: number;
    amount: number;
  };
  totalAmount: number;
  mockToken?: string;
}

interface TransferResult {
  transferId: string;
  status: string;
  txHash?: string;
  blockchainTxUrl?: string;
}

export default function WalletTransfer() {
  const router = useRouter();
  const { wallet, connected, connecting, balance, tokenBalances, address, connectWallet, refreshBalance } = useWallet();

  const [step, setStep] = useState<'connect' | 'form' | 'review' | 'sending' | 'success'>('connect');
  const [isLoading, setIsLoading] = useState(false);
  const [calculation, setCalculation] = useState<CalculationResult | null>(null);
  const [transferResult, setTransferResult] = useState<TransferResult | null>(null);
  const [error, setError] = useState('');

  // Form data
  const [senderToken, setSenderToken] = useState('mockADA');
  const [senderAmount, setSenderAmount] = useState('');
  const [recipientCurrency, setRecipientCurrency] = useState('IDR');
  const [recipientName, setRecipientName] = useState('');
  const [recipientBank, setRecipientBank] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [recipientWhatsApp, setRecipientWhatsApp] = useState('');

  // Delivery method: 'whatsapp' or 'website'
  const [deliveryMethod, setDeliveryMethod] = useState<'whatsapp' | 'website'>('whatsapp');

  // Transfer ID from URL parameters (for pre-filled flow)
  const [transferId, setTransferId] = useState<string>('');
  const [isPreFilled, setIsPreFilled] = useState(false);

  // Get balance for selected token
  const getTokenBalance = (tokenName: string): string => {
    const tokenBalance = tokenBalances.find(tb => tb.tokenName === tokenName);
    return tokenBalance?.balance || '0.00';
  };

  // Parse URL parameters and pre-fill form
  useEffect(() => {
    if (router.isReady) {
      const { query } = router;

      if (query.transferId && typeof query.transferId === 'string') {
        setTransferId(query.transferId);
        setIsPreFilled(true);

        // Pre-fill form data from URL parameters
        if (query.recipientName && typeof query.recipientName === 'string') {
          setRecipientName(query.recipientName);
        }
        if (query.recipientCurrency && typeof query.recipientCurrency === 'string') {
          setRecipientCurrency(query.recipientCurrency);
        }
        if (query.recipientBank && typeof query.recipientBank === 'string') {
          setRecipientBank(query.recipientBank);
        }
        if (query.recipientAccount && typeof query.recipientAccount === 'string') {
          setRecipientAccount(query.recipientAccount);
        }
        if (query.senderCurrency && typeof query.senderCurrency === 'string') {
          setSenderToken(query.senderCurrency);
        }
        if (query.amount && typeof query.amount === 'string') {
          setSenderAmount(query.amount);
        }
      }
    }
  }, [router.isReady, router.query]);

  useEffect(() => {
    if (connected && step === 'connect') {
      // Always go to form step (no auto-calculate)
      setStep('form');
    }
  }, [connected, step]);

  useEffect(() => {
    if (connected) {
      refreshBalance();
    }
  }, [connected, refreshBalance]);

  const handleConnectWallet = async (walletName: string) => {
    try {
      setError('');
      await connectWallet(walletName);
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    }
  };

  const calculateTransfer = async () => {
    if (!senderAmount || parseFloat(senderAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/transfer/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderCurrency: senderToken,
          recipientCurrency,
          amount: parseFloat(senderAmount),
          paymentMethod: 'WALLET',
        }),
      });

      const data = await response.json();

      if (data.success) {
        const selectedCurrency = RECIPIENT_CURRENCIES.find(c => c.code === recipientCurrency);
        setCalculation({
          ...data.data,
          mockToken: selectedCurrency?.mockToken || undefined,
        });
        setStep('review');
      } else {
        setError(data.error || 'Failed to calculate transfer');
      }
    } catch (err: any) {
      setError('Failed to calculate transfer. Please try again.');
      console.error('Calculate error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTransaction = async () => {
    if (!wallet) {
      setError('Wallet not connected');
      return;
    }

    if (!senderAmount || parseFloat(senderAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    // Validate recipient data exists (should come from URL params)
    if (!recipientName || !recipientCurrency || !recipientBank || !recipientAccount) {
      setError('Missing recipient details. Please use the payment link from WhatsApp.');
      return;
    }

    setIsLoading(true);
    setError('');
    setStep('sending');

    try {
      // Step 1: Send mock token from user's wallet to backend
      const backendAddress = process.env.NEXT_PUBLIC_BACKEND_CARDANO_ADDRESS ||
        'addr_test1qpa0rd55emex859ggm83ukpxv5wvzlg7cx0w2c9lw2szkpeh3lvdgekjev6eyn7rr7px8e7kkc72zewmvnvkr4zxl7zqx46s82';

      const tx = new Transaction({ initiator: wallet });

      // Get selected token info
      const selectedToken = MOCK_TOKENS.find(t => t.name === senderToken);
      if (!selectedToken) {
        throw new Error('Invalid token selected');
      }

      // Helper function to convert string to hex
      const stringToHex = (str: string): string => {
        let hex = '';
        for (let i = 0; i < str.length; i++) {
          hex += str.charCodeAt(i).toString(16).padStart(2, '0');
        }
        return hex;
      };

      // Send mock token amount to backend (raw units, no decimal conversion)
      const tokenAmount = parseInt(senderAmount);
      const hexAssetName = stringToHex(selectedToken.name);

      tx.sendAssets(backendAddress, [
        {
          unit: selectedToken.policyId + hexAssetName,
          quantity: tokenAmount.toString(),
        },
      ]);

      // Build and sign transaction
      const unsignedTx = await tx.build();
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);

      console.log('Transaction submitted:', txHash);

      // Step 2: Notify backend to process the swap (via API proxy to avoid CSP issues)
      const response = await fetch('/api/transfer-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethod: 'WALLET',
          senderCurrency: senderToken,
          senderAmount: parseFloat(senderAmount),
          recipientName,
          recipientCurrency,
          recipientBank,
          recipientAccount,
          whatsappNumber: deliveryMethod === 'whatsapp' ? recipientWhatsApp : undefined,
          deliveryMethod,
          walletTxHash: txHash,
          walletAddress: address,
          transferId: transferId || undefined, // Include transferId if pre-filled
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTransferResult({
          transferId: data.data.id,
          status: data.data.status,
          txHash,
        });
        setStep('success');

        // Refresh wallet balance
        await refreshBalance();
      } else {
        throw new Error(data.error || 'Failed to process transfer');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send transaction');
      setStep('review');
      console.error('Transaction error:', err);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      <Head>
        <title>Wallet Transfer - TrustBridge</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="mb-4 text-white hover:text-purple-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>

            <h1 className="text-4xl font-bold text-white mb-2">
              Wallet Transfer
            </h1>
            <p className="text-purple-200">
              Send mock tokens from your Cardano wallet
            </p>
          </div>

          {/* Connect Wallet Step */}
          {step === 'connect' && (
            <Card className="glass-effect border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Wallet className="h-6 w-6 text-purple-400" />
                  Connect Your Wallet
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Choose your Cardano wallet to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['eternl', 'nami', 'flint'].map((walletName) => (
                    <Button
                      key={walletName}
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2 glass-effect hover:border-purple-400"
                      onClick={() => handleConnectWallet(walletName)}
                      disabled={connecting}
                    >
                      {connecting ? (
                        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
                      ) : (
                        <>
                          <Wallet className="h-8 w-8 text-purple-400" />
                          <span className="text-white capitalize">{walletName}</span>
                        </>
                      )}
                    </Button>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-purple-900/20 rounded-lg border border-purple-500/20">
                  <h3 className="text-white font-medium mb-2">What you'll need:</h3>
                  <ul className="text-purple-200 text-sm space-y-1">
                    <li>• A Cardano wallet extension (Eternl, Nami, or Flint)</li>
                    <li>• Mock tokens (mockADA, mockUSDC, mockIDRX, etc.) in your wallet</li>
                    <li>• Recipient's bank details</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Step */}
          {step === 'form' && connected && (
            <Card className="glass-effect border-purple-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <SendIcon className="h-6 w-6 text-purple-400" />
                      Send Mock Tokens
                    </CardTitle>
                    <CardDescription className="text-purple-200">
                      Enter transfer details
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-purple-200">Your Balance</p>
                    <p className="text-2xl font-bold text-white">
                      {getTokenBalance(senderToken)} <span className="text-purple-400">{senderToken}</span>
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Pre-filled transfer info (if from WhatsApp) */}
                {isPreFilled && (
                  <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/20">
                    <h3 className="text-white font-medium mb-3">📋 Transfer Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-purple-200">Recipient:</span>
                        <span className="text-white">{recipientName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-200">Bank:</span>
                        <span className="text-white">{recipientBank}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-200">Account:</span>
                        <span className="text-white">{recipientAccount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-200">Currency:</span>
                        <span className="text-white">{recipientCurrency}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sender Token Selection */}
                <div className="space-y-2">
                  <Label htmlFor="senderToken" className="text-white">
                    Send Token
                  </Label>
                  <Select value={senderToken} onValueChange={setSenderToken}>
                    <SelectTrigger className="bg-white/5 border-purple-500/20 text-white">
                      <SelectValue placeholder="Select token" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_TOKENS.map((token) => (
                        <SelectItem key={token.name} value={token.name}>
                          <div className="flex items-center justify-between gap-4 w-full">
                            <div className="flex items-center gap-2">
                              <span>{token.flag}</span>
                              <span>{token.symbol}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              Balance: {getTokenBalance(token.name)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-white">
                    Amount
                  </Label>
                  <div className="relative">
                    <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-400" />
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={senderAmount}
                      onChange={(e) => setSenderAmount(e.target.value)}
                      className="pl-10 bg-white/5 border-purple-500/20 text-white"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <p className="text-sm text-purple-200">
                    Available: {getTokenBalance(senderToken)} {senderToken}
                  </p>
                </div>

                {/* Total Amount Display */}
                {senderAmount && parseFloat(senderAmount) > 0 && (
                  <div className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/20">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-200">Total to Send:</span>
                      <span className="text-2xl font-bold text-white">
                        {senderAmount} {senderToken}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep('connect')}
                    className="flex-1"
                  >
                    Change Wallet
                  </Button>
                  <Button
                    onClick={handleSendTransaction}
                    disabled={isLoading || !senderAmount || parseFloat(senderAmount) <= 0}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <SendIcon className="mr-2 h-4 w-4" />
                        Send to Backend Wallet
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Review Step */}
          {step === 'review' && calculation && (
            <Card className="glass-effect border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white">Review Transfer</CardTitle>
                <CardDescription className="text-purple-200">
                  Please confirm the details before sending
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-purple-900/20 rounded-lg p-6 border border-purple-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-purple-200">You Send</p>
                      <p className="text-3xl font-bold text-white">
                        {senderAmount} <span className="text-purple-400">{senderToken}</span>
                      </p>
                    </div>
                    <ArrowRight className="h-8 w-8 text-purple-400" />
                    <div className="text-right">
                      <p className="text-sm text-purple-200">Recipient Gets</p>
                      <p className="text-3xl font-bold text-white">
                        {calculation.recipientAmount.toLocaleString()}{' '}
                        <span className="text-purple-400">{recipientCurrency}</span>
                      </p>
                    </div>
                  </div>

                  {calculation.mockToken && (
                    <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-500/20 rounded">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <p className="text-sm text-green-200">
                        Will be swapped to <strong>{calculation.mockToken}</strong> on blockchain
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-purple-200">
                    <span>Exchange Rate</span>
                    <span className="text-white font-medium">
                      1 {senderToken} = {calculation.exchangeRate.toFixed(4)} {recipientCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between text-purple-200">
                    <span>Fee ({calculation.fee.percentage}%)</span>
                    <span className="text-white font-medium">
                      {calculation.fee.amount.toFixed(2)} {senderToken}
                    </span>
                  </div>
                  <div className="flex justify-between text-purple-200 pt-3 border-t border-purple-500/20">
                    <span className="font-medium">Total Cost</span>
                    <span className="text-white font-bold text-lg">
                      {calculation.totalAmount.toFixed(2)} {senderToken}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-purple-500/20">
                  <h4 className="text-white font-medium mb-3">Recipient Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-purple-200">Name</p>
                      <p className="text-white font-medium">{recipientName}</p>
                    </div>
                    <div>
                      <p className="text-purple-200">Bank</p>
                      <p className="text-white font-medium">{recipientBank}</p>
                    </div>
                    <div>
                      <p className="text-purple-200">Account</p>
                      <p className="text-white font-medium">{recipientAccount}</p>
                    </div>
                    <div>
                      <p className="text-purple-200">Delivery</p>
                      <p className="text-white font-medium capitalize">
                        {deliveryMethod === 'whatsapp' ? `WhatsApp (${recipientWhatsApp})` : 'Website Only'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep('form')}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSendTransaction}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <SendIcon className="mr-2 h-4 w-4" />
                        Send Now
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sending Step */}
          {step === 'sending' && (
            <Card className="glass-effect border-purple-500/20">
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="h-16 w-16 animate-spin text-purple-400 mx-auto" />
                  <h3 className="text-2xl font-bold text-white">Processing Transaction</h3>
                  <p className="text-purple-200">
                    Please wait while we process your transfer...
                  </p>
                  <div className="space-y-2 pt-4">
                    <p className="text-sm text-purple-300">✓ Sending {senderToken} from wallet</p>
                    <p className="text-sm text-purple-300">⏳ Swapping to {calculation?.mockToken || 'recipient token'}</p>
                    <p className="text-sm text-purple-300">⏳ Generating invoice</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success Step */}
          {step === 'success' && transferResult && (
            <Card className="glass-effect border-green-500/20">
              <CardContent className="py-12">
                <div className="text-center space-y-6">
                  <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-400" />
                  </div>

                  <div>
                    <h3 className="text-3xl font-bold text-white mb-2">
                      Transfer Submitted!
                    </h3>
                    <p className="text-purple-200 text-lg">
                      Your transaction has been sent to the blockchain
                    </p>
                  </div>

                  <div className="bg-purple-900/20 rounded-lg p-6 border border-purple-500/20 max-w-md mx-auto">
                    <p className="text-sm text-purple-200 mb-2">Transaction ID</p>
                    <p className="text-white font-mono text-sm break-all">
                      {transferResult.transferId}
                    </p>
                  </div>

                  <div className="bg-green-900/20 rounded-lg p-6 border border-green-500/20 max-w-md mx-auto">
                    <p className="text-green-200 text-lg font-medium">
                      📱 Please check your WhatsApp for transfer status updates
                    </p>
                    <p className="text-green-300 text-sm mt-2">
                      You will receive notifications when your transfer is complete, including your invoice PDF
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 max-w-md mx-auto">
                    <Button
                      variant="outline"
                      onClick={() => router.push('/dashboard')}
                      className="mt-4"
                    >
                      Back to Dashboard
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
