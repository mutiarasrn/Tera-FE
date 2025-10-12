import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowRight, DollarSign, CreditCard } from 'lucide-react';
import { transferService } from '@/lib/api/transferService';
import { exchangeService } from '@/lib/api/exchangeService';
import { Currency, TransferCalculation } from '@/lib/types/api';

interface TransferCalculatorProps {
  onCalculationComplete?: (calculation: TransferCalculation) => void;
  onProceedToTransfer?: (calculation: TransferCalculation, formData: {
    paymentMethod: string;
    senderCurrency: string;
    senderAmount: string;
    recipientCurrency: string;
  }) => void;
}

export default function TransferCalculator({
  onCalculationComplete,
  onProceedToTransfer
}: TransferCalculatorProps) {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [calculation, setCalculation] = useState<TransferCalculation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    paymentMethod: 'wallet',
    senderCurrency: 'USD',
    senderAmount: '',
    recipientCurrency: 'USD'
  });

  useEffect(() => {
    fetchCurrencies();
  }, []);

  useEffect(() => {
    if (formData.senderAmount && parseFloat(formData.senderAmount) > 0) {
      const timeoutId = setTimeout(calculateTransfer, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [formData.senderAmount, formData.senderCurrency, formData.recipientCurrency, formData.paymentMethod]);

  const fetchCurrencies = async () => {
    try {
      const response = await exchangeService.getCurrencies();
      if (response.success) {
        setCurrencies(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch currencies:', err);
    }
  };

  const calculateTransfer = async () => {
    if (!formData.senderAmount || parseFloat(formData.senderAmount) <= 0) return;

    try {
      setLoading(true);
      setError(null);

      const response = await transferService.calculateTransfer(
        formData.paymentMethod,
        formData.senderCurrency,
        parseFloat(formData.senderAmount),
        formData.recipientCurrency
      );

      if (response.success) {
        setCalculation(response.data);
        onCalculationComplete?.(response.data);
      } else {
        setError(response.error || 'Failed to calculate transfer');
      }
    } catch (err) {
      setError('Failed to calculate transfer');
      console.error('Transfer calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field !== 'senderAmount') {
      setCalculation(null);
    }
  };

  const handleProceed = () => {
    if (calculation) {
      onProceedToTransfer?.(calculation, formData);
    }
  };

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-glow">
          <DollarSign className="w-5 h-5" />
          Transfer Calculator
        </CardTitle>
        <CardDescription>
          Calculate fees and exchange rates for your transfer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value) => handleInputChange('paymentMethod', value)}
            >
              <SelectTrigger className="glass-effect">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-effect">
                <SelectItem value="wallet">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Wallet
                  </div>
                </SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
                <SelectItem value="card">Credit Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="senderAmount">Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="senderAmount"
                type="number"
                placeholder="0.00"
                value={formData.senderAmount}
                onChange={(e) => handleInputChange('senderAmount', e.target.value)}
                className="pl-10 glass-effect"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="senderCurrency">From Currency</Label>
            <Select
              value={formData.senderCurrency}
              onValueChange={(value) => handleInputChange('senderCurrency', value)}
            >
              <SelectTrigger className="glass-effect">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-effect">
                {currencies.length > 0 ? (
                  currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code} - {currency.name}
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipientCurrency">To Currency</Label>
            <Select
              value={formData.recipientCurrency}
              onValueChange={(value) => handleInputChange('recipientCurrency', value)}
            >
              <SelectTrigger className="glass-effect">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-effect">
                {currencies.length > 0 ? (
                  currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.code} - {currency.name}
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {calculation && (
          <div className="space-y-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Exchange Rate:</span>
              <span className="font-medium">
                1 {calculation.senderCurrency} = {calculation.exchangeRate.toFixed(4)} {calculation.recipientCurrency}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Recipient Amount:</span>
              <span className="font-medium text-green-400">
                {calculation.recipientAmount.toFixed(2)} {calculation.recipientCurrency}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Transfer Fee:</span>
              <span className="font-medium">
                {calculation.fee.percentage}% ({calculation.fee.amount.toFixed(2)} {calculation.senderCurrency})
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">ADA Amount:</span>
              <span className="font-medium text-blue-400">
                {calculation.adaAmount.toFixed(2)} ADA
              </span>
            </div>

            <div className="border-t border-border pt-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Amount:</span>
                <span className="font-bold text-lg">
                  {calculation.totalAmount.toFixed(2)} {calculation.senderCurrency}
                </span>
              </div>
            </div>

            {calculation.blockchain.usesMockToken && (
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                Uses Mock Token: {calculation.blockchain.hubToken}
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={calculateTransfer}
            disabled={!formData.senderAmount || parseFloat(formData.senderAmount) <= 0 || loading}
            className="flex-1"
            variant="outline"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Calculating...
              </>
            ) : (
              'Calculate'
            )}
          </Button>

          {calculation && (
            <Button
              onClick={handleProceed}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Proceed to Transfer
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}