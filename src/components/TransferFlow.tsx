import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, Send } from 'lucide-react';
import TransferCalculator from './TransferCalculator';
import TransferForm from './TransferForm';
import TransferStatusTracker from './TransferStatusTracker';
import { TransferCalculation, TransferInitiation } from '@/lib/types/api';

interface TransferFlowProps {
  onClose?: () => void;
}

type FlowStep = 'calculate' | 'form' | 'status';

export default function TransferFlow({ onClose }: TransferFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('calculate');
  const [calculation, setCalculation] = useState<TransferCalculation | null>(null);
  const [transferId, setTransferId] = useState<string | null>(null);

  const handleCalculationComplete = (calc: TransferCalculation) => {
    setCalculation(calc);
  };

  const handleProceedToTransfer = () => {
    setCurrentStep('form');
  };

  const handleTransferInitiated = (initiation: TransferInitiation) => {
    setTransferId(initiation.transferId);
    setCurrentStep('status');
  };

  const handleBack = () => {
    if (currentStep === 'form') {
      setCurrentStep('calculate');
    } else if (currentStep === 'status') {
      setCurrentStep('form');
    }
  };

  const handleNewTransfer = () => {
    setCurrentStep('calculate');
    setCalculation(null);
    setTransferId(null);
  };

  const steps = [
    { key: 'calculate', label: 'Calculate', completed: currentStep !== 'calculate' },
    { key: 'form', label: 'Details', completed: currentStep === 'status' },
    { key: 'status', label: 'Status', completed: false },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with progress */}
      <Card className="glass-effect">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {(currentStep !== 'calculate' || onClose) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={currentStep === 'calculate' ? onClose : handleBack}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {currentStep === 'calculate' ? 'Close' : 'Back'}
                </Button>
              )}
              <div>
                <CardTitle className="text-glow">
                  {currentStep === 'calculate' && 'Calculate Transfer'}
                  {currentStep === 'form' && 'Transfer Details'}
                  {currentStep === 'status' && 'Transfer Status'}
                </CardTitle>
              </div>
            </div>

            {currentStep === 'status' && (
              <Button variant="outline" onClick={handleNewTransfer}>
                <Send className="w-4 h-4 mr-2" />
                New Transfer
              </Button>
            )}
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 mt-4">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center gap-2">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                  step.key === currentStep
                    ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                    : step.completed
                    ? 'border-green-500 bg-green-500/20 text-green-400'
                    : 'border-muted-foreground/30 text-muted-foreground'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  step.key === currentStep
                    ? 'text-blue-400'
                    : step.completed
                    ? 'text-green-400'
                    : 'text-muted-foreground'
                }`}>
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    step.completed ? 'bg-green-500' : 'bg-muted-foreground/30'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 'calculate' && (
            <TransferCalculator
              onCalculationComplete={handleCalculationComplete}
              onProceedToTransfer={handleProceedToTransfer}
            />
          )}

          {currentStep === 'form' && calculation && (
            <TransferForm
              calculation={calculation}
              onTransferInitiated={handleTransferInitiated}
              onBack={handleBack}
            />
          )}

          {currentStep === 'status' && transferId && (
            <TransferStatusTracker
              transferId={transferId}
              onClose={onClose}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Help Section */}
      {currentStep === 'calculate' && (
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="text-sm">💡 How it works</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="text-xs">1</Badge>
              <span>Enter the amount and currencies for your transfer</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="text-xs">2</Badge>
              <span>Review exchange rates and fees</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="text-xs">3</Badge>
              <span>Provide recipient details</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="text-xs">4</Badge>
              <span>Track your transfer on the Cardano blockchain</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}