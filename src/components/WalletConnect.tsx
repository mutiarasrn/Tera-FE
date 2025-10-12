import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Wallet,
  Copy,
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';

const supportedWallets = [
  {
    name: 'eternl',
    displayName: 'Eternl Wallet',
    icon: '🦾',
    description: 'Secure and feature-rich Cardano wallet'
  },
  {
    name: 'nami',
    displayName: 'Nami Wallet',
    icon: '🌊',
    description: 'Simple and intuitive Cardano wallet'
  },
  {
    name: 'flint',
    displayName: 'Flint Wallet',
    icon: '🔥',
    description: 'Fast and lightweight wallet'
  },
  {
    name: 'yoroi',
    displayName: 'Yoroi Wallet',
    icon: '⛩️',
    description: 'Official EMURGO wallet'
  }
];

export function WalletConnect() {
  const { wallet, connected, connecting, balance, address, connectWallet, disconnectWallet } = useWallet();
  const [showDialog, setShowDialog] = useState(false);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleConnect = async (walletName: string) => {
    try {
      setConnectingWallet(walletName);
      await connectWallet(walletName);
      setShowDialog(false);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setConnectingWallet(null);
    }
  };

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
  };

  if (connected && wallet) {
    return (
      <Card className="glass-effect hover:glow-effect transition-all duration-300 max-w-sm mx-auto w-full">
        <CardHeader className="pb-3 md:pb-4 p-4 md:p-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
              <Avatar className="border-2 border-green-500/50 w-8 h-8 md:w-10 md:h-10 flex-shrink-0">
                <AvatarFallback className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                  <Wallet className="w-3 h-3 md:w-4 md:h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <CardTitle className="text-base md:text-lg text-glow">Connected</CardTitle>
                <CardDescription className="text-sm">
                  Balance: {balance} ADA
                </CardDescription>
              </div>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 flex-shrink-0 text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Active</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-4 md:p-6 pt-0">
          <div className="flex items-center gap-2">
            <code className="text-xs bg-muted/50 px-2 py-1 rounded flex-1 font-mono truncate">
              {truncateAddress(address)}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={copyAddress}
              className="h-8 w-8 p-0 hover:glow-effect flex-shrink-0"
            >
              {copied ? (
                <CheckCircle className="w-3 h-3 text-green-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 hover:glow-effect"
              onClick={() => window.open(`https://cardanoscan.io/address/${address}`, '_blank')}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Explorer</span>
              <span className="sm:hidden">View</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={disconnectWallet}
              className="text-red-400 hover:text-red-300 hover:border-red-500/50 text-xs md:text-sm"
            >
              <span className="hidden sm:inline">Disconnect</span>
              <span className="sm:hidden">✕</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 glow-effect text-sm md:text-lg px-6 md:px-8 py-3 group transition-all duration-300 w-full sm:w-auto"
          disabled={connecting}
        >
          {connecting ? (
            <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
          ) : (
            <Wallet className="w-4 h-4 md:w-5 md:h-5 mr-2 group-hover:animate-glow" />
          )}
          Connect Wallet
        </Button>
      </DialogTrigger>

      <DialogContent className="glass-effect max-w-md mx-4 md:mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-glow">
            <Sparkles className="w-5 h-5" />
            Connect Your Wallet
          </DialogTitle>
          <DialogDescription>
            Choose a Cardano wallet to connect and start sending payments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-6">
          {supportedWallets.map((walletInfo) => (
            <Button
              key={walletInfo.name}
              variant="outline"
              className="w-full justify-start h-auto p-3 md:p-4 hover:glow-effect transition-all duration-300 group"
              onClick={() => handleConnect(walletInfo.name)}
              disabled={connectingWallet !== null}
            >
              <div className="flex items-center gap-3 md:gap-4 w-full">
                <div className="text-xl md:text-2xl flex-shrink-0">{walletInfo.icon}</div>
                <div className="flex-1 text-left min-w-0">
                  <div className="font-medium group-hover:text-primary transition-colors text-sm md:text-base">
                    {walletInfo.displayName}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground truncate">
                    {walletInfo.description}
                  </div>
                </div>
                {connectingWallet === walletInfo.name && (
                  <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                )}
              </div>
            </Button>
          ))}
        </div>

        <div className="mt-4 md:mt-6 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs md:text-sm text-blue-400">
              Make sure you have a Cardano wallet extension installed in your browser before connecting.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}