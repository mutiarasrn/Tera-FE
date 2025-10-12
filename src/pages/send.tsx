import Head from "next/head";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  ArrowLeft,
  Send as SendIcon,
  Calculator,
  User,
  Building,
  Wallet,
  DollarSign,
  Clock,
  Shield
} from "lucide-react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

// Currency data from backend
const SENDER_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'ADA', name: 'Cardano', symbol: '₳', flag: '⚡' },
];

const RECIPIENT_CURRENCIES = [
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽' },
];

const PAYMENT_METHODS = [
  { id: 'WALLET', name: 'Crypto Wallet', icon: Wallet, fee: '1.0%', description: 'Pay with ADA or supported tokens' },
  { id: 'MASTERCARD', name: 'Mastercard', icon: CreditCard, fee: '1.5%', description: 'Pay with credit/debit card' },
];

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

export default function Send() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [calculation, setCalculation] = useState<CalculationResult | null>(null);

  // Form data
  const [senderCurrency, setSenderCurrency] = useState('USD');
  const [recipientCurrency, setRecipientCurrency] = useState('IDR');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('WALLET');

  // Recipient data
  const [recipientName, setRecipientName] = useState('');
  const [recipientBank, setRecipientBank] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');

  // Card details (for Mastercard)
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  const calculateTransfer = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/transfer/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          senderCurrency,
          recipientCurrency,
          amount: parseFloat(amount),
          paymentMethod,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCalculation(data.data);
      }
    } catch (error) {
      console.error('Calculation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      const timeoutId = setTimeout(calculateTransfer, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [amount, senderCurrency, recipientCurrency, paymentMethod]);

  const initiateTransfer = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/transfer/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentMethod,
          senderCurrency,
          senderAmount: amount,
          recipientName,
          recipientCurrency,
          recipientBank,
          recipientAccount,
          ...(paymentMethod === 'MASTERCARD' && {
            cardDetails: {
              number: cardNumber,
              expiry: cardExpiry,
              cvv: cardCvv,
            },
          }),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/transfer/${data.data.id}`);
      }
    } catch (error) {
      console.error('Transfer initiation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPaymentMethod = PAYMENT_METHODS.find(m => m.id === paymentMethod);

  return (
    <div className="min-h-screen">
      <Head>
        <title>Send Money - TrustBridge</title>
        <meta name="description" content="Send money across borders instantly" />
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
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2 glass border-blue-400/30 text-blue-300 hover:text-white hover:border-blue-300/50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Progress Steps */}
      <div className="glass border-b border-blue-500/20">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Amount & Currency', active: step >= 1 },
              { num: 2, label: 'Recipient Details', active: step >= 2 },
              { num: 3, label: 'Payment & Review', active: step >= 3 },
            ].map((s, index) => (
              <div key={s.num} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    s.active
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white glow-blue'
                      : 'bg-gray-600 text-gray-300'
                  }`}
                >
                  {s.num}
                </div>
                <span className={`ml-2 text-sm ${s.active ? 'text-white' : 'text-blue-300'}`}>
                  {s.label}
                </span>
                {index < 2 && (
                  <div className={`mx-4 h-px w-16 ${s.active ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-600'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {step === 1 && (
          <Card className="glass-dark border-blue-400/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="w-5 h-5" />
                <span>Transfer Amount</span>
              </CardTitle>
              <CardDescription>Enter the amount and select currencies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Amount to Send
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-12 text-2xl py-6 glass border-blue-400/30 text-white placeholder:text-blue-300/60 focus:border-blue-400 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Currency Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    You Send
                  </label>
                  <select
                    value={senderCurrency}
                    onChange={(e) => setSenderCurrency(e.target.value)}
                    className="w-full px-3 py-3 glass border-blue-400/30 rounded-lg focus:ring-2 focus:ring-blue-500 text-white bg-transparent"
                  >
                    {SENDER_CURRENCIES.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.flag} {currency.code} - {currency.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">
                    Recipient Gets
                  </label>
                  <select
                    value={recipientCurrency}
                    onChange={(e) => setRecipientCurrency(e.target.value)}
                    className="w-full px-3 py-3 glass border-blue-400/30 rounded-lg focus:ring-2 focus:ring-blue-500 text-white bg-transparent"
                  >
                    {RECIPIENT_CURRENCIES.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.flag} {currency.code} - {currency.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-3">
                  Payment Method
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PAYMENT_METHODS.map((method) => (
                    <div
                      key={method.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        paymentMethod === method.id
                          ? 'border-blue-400 bg-blue-500/20 glass'
                          : 'glass border-blue-400/30 hover:border-blue-400/50'
                      }`}
                      onClick={() => setPaymentMethod(method.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <method.icon className="w-6 h-6 text-blue-400" />
                        <div>
                          <div className="font-medium text-white">{method.name}</div>
                          <div className="text-sm text-blue-200">{method.description}</div>
                          <Badge className="mt-1 text-xs bg-blue-500/20 text-blue-300 border-blue-400/30">{method.fee} fee</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculation Preview */}
              {calculation && (
                <div className="glass rounded-lg p-6 border border-blue-400/30">
                  <h3 className="font-medium text-white mb-4">Transfer Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-blue-200">Amount to send:</span>
                      <span className="font-medium text-white">
                        {calculation.senderAmount} {calculation.senderCurrency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-200">Fee ({calculation.fee.percentage}%):</span>
                      <span className="font-medium text-white">
                        {calculation.fee.amount.toFixed(2)} {calculation.senderCurrency}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-blue-400/30 pt-3">
                      <span className="text-blue-200">Total cost:</span>
                      <span className="font-bold text-lg text-white">
                        {calculation.totalAmount.toFixed(2)} {calculation.senderCurrency}
                      </span>
                    </div>
                    <div className="flex justify-between bg-green-500/20 p-3 rounded border border-green-400/30">
                      <span className="text-green-300">Recipient receives:</span>
                      <span className="font-bold text-green-300 text-lg">
                        {calculation.recipientAmount.toFixed(2)} {calculation.recipientCurrency}
                      </span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-sm text-blue-300">
                      <Clock className="w-4 h-4" />
                      <span>Estimated delivery: 2-5 minutes</span>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={() => setStep(2)}
                disabled={!amount || !calculation}
                className="w-full btn-space py-3 glow-effect"
              >
                Continue to Recipient Details
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="glass-dark border-blue-400/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <User className="w-5 h-5" />
                <span>Recipient Details</span>
              </CardTitle>
              <CardDescription className="text-blue-200">Enter who will receive the money</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Recipient Name
                </label>
                <Input
                  placeholder="Full name as on bank account"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="py-3 glass border-blue-400/30 text-white placeholder:text-blue-300/60 focus:border-blue-400 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Bank Name
                </label>
                <Input
                  placeholder="e.g., Bank Mandiri, BCA, etc."
                  value={recipientBank}
                  onChange={(e) => setRecipientBank(e.target.value)}
                  className="py-3 glass border-blue-400/30 text-white placeholder:text-blue-300/60 focus:border-blue-400 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">
                  Account Number
                </label>
                <Input
                  placeholder="Bank account number"
                  value={recipientAccount}
                  onChange={(e) => setRecipientAccount(e.target.value)}
                  className="py-3 glass border-blue-400/30 text-white placeholder:text-blue-300/60 focus:border-blue-400 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 glass border-blue-400/30 text-blue-300 hover:text-white hover:border-blue-300/50"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!recipientName || !recipientBank || !recipientAccount}
                  className="flex-1 btn-space glow-effect"
                >
                  Continue to Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="glass-dark border-blue-400/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Shield className="w-5 h-5" />
                <span>Review & Pay</span>
              </CardTitle>
              <CardDescription className="text-blue-200">Review your transfer and complete payment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Transfer Summary */}
              <div className="glass rounded-lg p-6 border border-blue-400/30">
                <h3 className="font-medium text-white mb-4">Transfer Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-blue-200">Sending:</span>
                    <span className="font-medium text-white">{amount} {senderCurrency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">To:</span>
                    <span className="font-medium text-white">{recipientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Bank:</span>
                    <span className="font-medium text-white">{recipientBank}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">Payment method:</span>
                    <span className="font-medium text-white">{selectedPaymentMethod?.name}</span>
                  </div>
                  {calculation && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-blue-200">Fee:</span>
                        <span className="font-medium text-white">
                          {calculation.fee.amount.toFixed(2)} {calculation.senderCurrency}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-blue-400/30 pt-3">
                        <span className="text-blue-200">Total:</span>
                        <span className="font-bold text-lg text-white">
                          {calculation.totalAmount.toFixed(2)} {calculation.senderCurrency}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Payment Details for Mastercard */}
              {paymentMethod === 'MASTERCARD' && (
                <div className="space-y-4">
                  <h3 className="font-medium text-white">Card Details</h3>
                  <div>
                    <Input
                      placeholder="Card Number"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="py-3 glass border-blue-400/30 text-white placeholder:text-blue-300/60 focus:border-blue-400 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="py-3 glass border-blue-400/30 text-white placeholder:text-blue-300/60 focus:border-blue-400 focus:ring-blue-500"
                    />
                    <Input
                      placeholder="CVV"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="py-3 glass border-blue-400/30 text-white placeholder:text-blue-300/60 focus:border-blue-400 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1 glass border-blue-400/30 text-blue-300 hover:text-white hover:border-blue-300/50"
                >
                  Back
                </Button>
                <Button
                  onClick={initiateTransfer}
                  disabled={isLoading || (paymentMethod === 'MASTERCARD' && (!cardNumber || !cardExpiry || !cardCvv))}
                  className="flex-1 btn-space glow-effect"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <SendIcon className="w-4 h-4 mr-2" />
                      Send Money
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}