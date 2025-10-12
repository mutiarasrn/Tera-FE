import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, User, Building, CreditCard } from 'lucide-react';
import { transferService } from '@/lib/api/transferService';
import { TransferCalculation, TransferInitiation, TransferRequest } from '@/lib/types/api';

interface TransferFormProps {
  calculation: TransferCalculation;
  onTransferInitiated?: (initiation: TransferInitiation) => void;
  onBack?: () => void;
}

export default function TransferForm({
  calculation,
  onTransferInitiated,
  onBack
}: TransferFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    recipientName: '',
    recipientBank: '',
    recipientAccount: '',
    purpose: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.recipientName.trim()) {
      setError('Recipient name is required');
      return false;
    }
    if (!formData.recipientBank.trim()) {
      setError('Recipient bank is required');
      return false;
    }
    if (!formData.recipientAccount.trim()) {
      setError('Recipient account is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      const transferRequest: TransferRequest = {
        paymentMethod: 'wallet',
        senderCurrency: calculation.senderCurrency,
        senderAmount: calculation.senderAmount,
        recipientName: formData.recipientName,
        recipientCurrency: calculation.recipientCurrency,
        recipientBank: formData.recipientBank,
        recipientAccount: formData.recipientAccount
      };

      const response = await transferService.initiateTransfer(transferRequest);

      if (response.success) {
        onTransferInitiated?.(response.data);
      } else {
        setError(response.error || 'Failed to initiate transfer');
      }
    } catch (err) {
      setError('Failed to initiate transfer');
      console.error('Transfer initiation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Transfer Summary */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="text-glow">Transfer Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sending:</span>
            <span className="font-medium">
              {calculation.senderAmount.toFixed(2)} {calculation.senderCurrency}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Recipient receives:</span>
            <span className="font-medium text-green-400">
              {calculation.recipientAmount.toFixed(2)} {calculation.recipientCurrency}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Exchange rate:</span>
            <span className="font-medium">
              1 {calculation.senderCurrency} = {calculation.exchangeRate.toFixed(4)} {calculation.recipientCurrency}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fee:</span>
            <span className="font-medium">
              {calculation.fee.amount.toFixed(2)} {calculation.senderCurrency} ({calculation.fee.percentage}%)
            </span>
          </div>
          <div className="border-t border-border pt-3 flex justify-between">
            <span className="font-medium">Total to pay:</span>
            <span className="font-bold text-lg">
              {calculation.totalAmount.toFixed(2)} {calculation.senderCurrency}
            </span>
          </div>

          {calculation.blockchain.usesMockToken && (
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
              Blockchain Path: {calculation.blockchain.path.join(' → ')}
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Recipient Details Form */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-glow">
            <User className="w-5 h-5" />
            Recipient Details
          </CardTitle>
          <CardDescription>
            Enter the recipient&apos;s information for the transfer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipientName">Recipient Name *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="recipientName"
                placeholder="John Doe"
                value={formData.recipientName}
                onChange={(e) => handleInputChange('recipientName', e.target.value)}
                className="pl-10 glass-effect"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipientBank">Recipient Bank *</Label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="recipientBank"
                placeholder="Chase Bank, Wells Fargo, etc."
                value={formData.recipientBank}
                onChange={(e) => handleInputChange('recipientBank', e.target.value)}
                className="pl-10 glass-effect"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipientAccount">Account Number *</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="recipientAccount"
                placeholder="Account number or IBAN"
                value={formData.recipientAccount}
                onChange={(e) => handleInputChange('recipientAccount', e.target.value)}
                className="pl-10 glass-effect"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Transfer Purpose (Optional)</Label>
            <Textarea
              id="purpose"
              placeholder="Family support, business payment, etc."
              value={formData.purpose}
              onChange={(e) => handleInputChange('purpose', e.target.value)}
              className="glass-effect resize-none"
              rows={3}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            {onBack && (
              <Button
                variant="outline"
                onClick={onBack}
                disabled={loading}
                className="flex-1"
              >
                Back
              </Button>
            )}

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Initiating Transfer...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Initiate Transfer
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}