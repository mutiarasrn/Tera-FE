import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { BrowserWallet } from '@meshsdk/core';

interface TokenBalance {
  tokenName: string;
  policyId: string;
  balance: string;
}

interface WalletContextType {
  wallet: BrowserWallet | null;
  connected: boolean;
  connecting: boolean;
  balance: string;
  tokenBalances: TokenBalance[];
  address: string;
  connectWallet: (walletName: string) => Promise<void>;
  disconnectWallet: () => void;
  refreshBalance: () => Promise<void>;
  sendTransaction: (recipientAddress: string, amount: string) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

interface WalletProviderProps {
  children: ReactNode;
}

// Mock tokens from deployment-info.json
const MOCK_TOKENS = [
  { name: 'mockADA', policyId: '1c05bdd719318cef47811522e134bfeba87fce3f73b4892c62561c93' },
  { name: 'mockUSDC', policyId: '4cbb15ff52c7459cd734c79c1a9fae87cab77b2a49f9a83907c8125d' },
  { name: 'mockIDRX', policyId: '5c9a67cc3c085c4ad001492d1e460f5aea9cc2b8847c23e1683c26d9' },
  { name: 'mockEUROC', policyId: 'f766f151787a989166869375f4c57cfa36c533241033c8000a5481c1' },
  { name: 'mockJPYC', policyId: '7725300e8d414e0fccad0a562e3a9c585970e84e7e92d422111e1e29' },
  { name: 'mockCNHT', policyId: 'c7bdad55621e968c6ccb0967493808c9ab50601b3b9aec77b2ba6888' },
  { name: 'mockMXNT', policyId: 'c73682653bd1ff615e54a3d79c00068e1f4977a7a9628f39add50dc3' },
];

export function WalletProvider({ children }: WalletProviderProps) {
  const [wallet, setWallet] = useState<BrowserWallet | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [balance, setBalance] = useState('0');
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [address, setAddress] = useState('');

  const refreshBalance = useCallback(async () => {
    if (!wallet) return;

    try {
      const utxos = await wallet.getUtxos();
      let totalBalance = 0;
      const mockTokenBalances: { [key: string]: number } = {};

      // Initialize all mock token balances to 0
      MOCK_TOKENS.forEach(token => {
        mockTokenBalances[token.policyId + token.name] = 0;
      });

      // Helper function to convert string to hex
      const stringToHex = (str: string): string => {
        let hex = '';
        for (let i = 0; i < str.length; i++) {
          hex += str.charCodeAt(i).toString(16).padStart(2, '0');
        }
        return hex;
      };

      utxos.forEach((utxo) => {
        utxo.output.amount.forEach((asset) => {
          if (asset.unit === 'lovelace') {
            totalBalance += parseInt(asset.quantity);
          } else {
            // Check if this is one of our mock tokens
            // Asset unit format: policyId + assetName (assetName might be hex or plain text)
            console.log('Found asset in wallet:', asset.unit, 'quantity:', asset.quantity);

            const matchingToken = MOCK_TOKENS.find(token => {
              // Try both hex-encoded and plain text formats
              const hexAssetName = stringToHex(token.name);
              const expectedUnitHex = token.policyId + hexAssetName;
              const expectedUnitPlain = token.policyId + token.name;

              // Also check if asset.unit starts with the policyId
              const matchesHex = asset.unit === expectedUnitHex;
              const matchesPlain = asset.unit === expectedUnitPlain;
              const startsWithPolicy = asset.unit.startsWith(token.policyId);

              if (startsWithPolicy) {
                console.log(`Asset starts with policy ${token.name}:`, {
                  assetUnit: asset.unit,
                  expectedHex: expectedUnitHex,
                  expectedPlain: expectedUnitPlain,
                  matchesHex,
                  matchesPlain
                });
              }

              return matchesHex || matchesPlain;
            });

            if (matchingToken) {
              console.log('✅ Matched token:', matchingToken.name, 'Quantity:', asset.quantity);
              const key = matchingToken.policyId + matchingToken.name;
              mockTokenBalances[key] =
                (mockTokenBalances[key] || 0) + parseInt(asset.quantity);
            }
          }
        });
      });

      const adaBalance = (totalBalance / 1000000).toFixed(2);
      setBalance(adaBalance);

      // Convert mock token balances to array (show raw units, no decimal conversion)
      const tokenBalanceArray: TokenBalance[] = MOCK_TOKENS.map(token => ({
        tokenName: token.name,
        policyId: token.policyId,
        balance: mockTokenBalances[token.policyId + token.name].toString(),
      }));

      setTokenBalances(tokenBalanceArray);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  }, [wallet]);

  const connectWallet = useCallback(async (walletName: string) => {
    try {
      setConnecting(true);
      const browserWallet = await BrowserWallet.enable(walletName);
      setWallet(browserWallet);
      setConnected(true);

      const walletAddress = await browserWallet.getChangeAddress();
      setAddress(walletAddress);

      await refreshBalance();
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    } finally {
      setConnecting(false);
    }
  }, [refreshBalance]);

  const disconnectWallet = () => {
    setWallet(null);
    setConnected(false);
    setBalance('0');
    setTokenBalances([]);
    setAddress('');
  };

  const sendTransaction = useCallback(async (recipientAddress: string, amount: string): Promise<string> => {
    if (!wallet) throw new Error('Wallet not connected');

    try {
      const { Transaction } = await import('@meshsdk/core');
      const tx = new Transaction({ initiator: wallet });
      tx.sendLovelace(recipientAddress, (parseFloat(amount) * 1000000).toString());
      
      const unsignedTx = await tx.build();
      const signedTx = await wallet.signTx(unsignedTx);
      const txHash = await wallet.submitTx(signedTx);
      
      await refreshBalance();
      return txHash;
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    }
  }, [wallet, refreshBalance]);

  useEffect(() => {
    const checkConnection = async () => {
      const savedWallet = localStorage.getItem('connectedWallet');
      if (savedWallet) {
        try {
          await connectWallet(savedWallet);
        } catch {
          localStorage.removeItem('connectedWallet');
        }
      }
    };
    
    checkConnection();
  }, [connectWallet]);

  useEffect(() => {
    if (connected && wallet) {
      localStorage.setItem('connectedWallet', 'eternl');
      const interval = setInterval(refreshBalance, 30000);
      return () => clearInterval(interval);
    } else {
      localStorage.removeItem('connectedWallet');
    }
  }, [connected, wallet, refreshBalance]);

  const value: WalletContextType = {
    wallet,
    connected,
    connecting,
    balance,
    tokenBalances,
    address,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    sendTransaction,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}