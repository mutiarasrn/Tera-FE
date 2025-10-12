import {
  ApiResponse,
  CardanoToken,
  TokenWithStats,
  MintRecord,
  SwapRecord,
  BackendWalletInfo,
  ScriptUtxo,
  TransactionStatus
} from '@/lib/types/api';

const API_BASE_URL = 'https://api-trustbridge.izcy.tech';

class CardanoService {
  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getTokens(): Promise<ApiResponse<CardanoToken[]>> {
    return this.makeRequest<CardanoToken[]>('/api/cardano/tokens');
  }

  async getTokenWithStats(tokenId: number): Promise<ApiResponse<TokenWithStats>> {
    return this.makeRequest<TokenWithStats>(`/api/cardano/tokens/${tokenId}/stats`);
  }

  async getMintRecords(tokenId: number): Promise<ApiResponse<MintRecord[]>> {
    return this.makeRequest<MintRecord[]>(`/api/cardano/tokens/${tokenId}/mints`);
  }

  async getSwapRecords(tokenId: number): Promise<ApiResponse<SwapRecord[]>> {
    return this.makeRequest<SwapRecord[]>(`/api/cardano/tokens/${tokenId}/swaps`);
  }

  async getBackendWallet(): Promise<ApiResponse<BackendWalletInfo>> {
    return this.makeRequest<BackendWalletInfo>('/api/cardano/wallet');
  }

  async getScriptUtxos(): Promise<ApiResponse<ScriptUtxo[]>> {
    return this.makeRequest<ScriptUtxo[]>('/api/cardano/script-utxos');
  }

  async mintToken(
    tokenId: number,
    amount: string,
    recipientAddress: string
  ): Promise<ApiResponse<{ txHash: string; cardanoScanUrl: string }>> {
    return this.makeRequest<{ txHash: string; cardanoScanUrl: string }>('/api/cardano/mint', {
      method: 'POST',
      body: JSON.stringify({
        tokenId,
        amount,
        recipientAddress,
      }),
    });
  }

  async swapTokens(
    fromTokenId: number,
    toTokenId: number,
    fromAmount: string,
    senderAddress: string,
    recipientAddress: string
  ): Promise<ApiResponse<{ txHash: string; cardanoScanUrl: string }>> {
    return this.makeRequest<{ txHash: string; cardanoScanUrl: string }>('/api/cardano/swap', {
      method: 'POST',
      body: JSON.stringify({
        fromTokenId,
        toTokenId,
        fromAmount,
        senderAddress,
        recipientAddress,
      }),
    });
  }

  async getTransactionStatus(txHash: string): Promise<ApiResponse<TransactionStatus>> {
    return this.makeRequest<TransactionStatus>(`/api/cardano/transaction/${txHash}/status`);
  }
}

export const cardanoService = new CardanoService();