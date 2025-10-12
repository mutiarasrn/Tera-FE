import { ApiResponse, Currency, ExchangeRate, ConversionPath } from '@/lib/types/api';

const API_BASE_URL = 'https://api-trustbridge.izcy.tech';

class ExchangeService {
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

  async getCurrencies(): Promise<ApiResponse<Currency[]>> {
    return this.makeRequest<Currency[]>('/api/exchange/currencies');
  }

  async getExchangeRate(from: string, to: string): Promise<ApiResponse<ExchangeRate>> {
    return this.makeRequest<ExchangeRate>(`/api/exchange/rate?from=${from}&to=${to}`);
  }

  async getConversionPath(from: string, to: string): Promise<ApiResponse<ConversionPath>> {
    return this.makeRequest<ConversionPath>(`/api/exchange/path?from=${from}&to=${to}`);
  }
}

export const exchangeService = new ExchangeService();