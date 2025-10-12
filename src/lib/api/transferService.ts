import {
  ApiResponse,
  TransferCalculation,
  TransferRequest,
  TransferInitiation,
  TransferStatus,
  TransferDetails,
  TransferHistory
} from '@/lib/types/api';

const API_BASE_URL = 'https://api-trustbridge.izcy.tech';

class TransferService {
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

  async calculateTransfer(
    paymentMethod: string,
    senderCurrency: string,
    senderAmount: number,
    recipientCurrency: string
  ): Promise<ApiResponse<TransferCalculation>> {
    return this.makeRequest<TransferCalculation>('/api/transfer/calculate', {
      method: 'POST',
      body: JSON.stringify({
        paymentMethod,
        senderCurrency,
        senderAmount,
        recipientCurrency,
      }),
    });
  }

  async initiateTransfer(transferData: TransferRequest): Promise<ApiResponse<TransferInitiation>> {
    return this.makeRequest<TransferInitiation>('/api/transfer/initiate', {
      method: 'POST',
      body: JSON.stringify(transferData),
    });
  }

  async confirmPayment(transferId: string, txHash: string): Promise<ApiResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>('/api/transfer/confirm', {
      method: 'POST',
      body: JSON.stringify({
        transferId,
        txHash,
      }),
    });
  }

  async getTransferStatus(transferId: string): Promise<ApiResponse<TransferStatus>> {
    return this.makeRequest<TransferStatus>(`/api/transfer/status/${transferId}`);
  }

  async getTransferDetails(transferId: string): Promise<ApiResponse<TransferDetails>> {
    return this.makeRequest<TransferDetails>(`/api/transfer/details/${transferId}`);
  }

  async getTransferHistory(limit?: number, offset?: number): Promise<ApiResponse<TransferHistory>> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/api/transfer/history?${queryString}` : '/api/transfer/history';

    return this.makeRequest<TransferHistory>(endpoint);
  }
}

export const transferService = new TransferService();