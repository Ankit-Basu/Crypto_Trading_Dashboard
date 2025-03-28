import { CryptoAsset } from '../types/market';
import { handleApiResponse, createApiRequest, ApiError } from './utils';

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

export async function getTopCryptos(limit: number = 20): Promise<CryptoAsset[]> {
  const apiKey = process.env.NEXT_PUBLIC_COINGECKO_API_KEY;
  if (!apiKey) {
    throw new Error('CoinGecko API key is not configured');
  }
  try {
    // Using the demo API key format for CoinGecko API
    const response = await createApiRequest(
      `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`,
      {
        headers: {
          'x-cg-demo-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );
    return handleApiResponse<CryptoAsset[]>(response);
  } catch (error) {
    console.error('Error fetching top cryptos:', error);
    if (error instanceof Error && 'status' in error) {
      const apiError = error as ApiError;
      if (apiError.status === 429) {
        console.warn('Rate limit reached. Implementing backoff...');
        // Wait for 2 seconds and try again
        await new Promise(resolve => setTimeout(resolve, 2000));
        return getTopCryptos(limit);
      }
      if (apiError.status === 401 || apiError.status === 403) {
        console.error('CoinGecko API authentication failed. Please check your API key.');
        throw new Error('CoinGecko API authentication failed. Please check your API key.');
      }
    }
    throw error;
  }
}

export async function getCryptoHistory(
  id: string,
  days: number = 90,
  interval: string = 'daily',
  retryCount: number = 0
): Promise<{ prices: [number, number][] }> {
  const apiKey = process.env.NEXT_PUBLIC_COINGECKO_API_KEY;
  if (!apiKey) {
    throw new Error('CoinGecko API key is not configured');
  }
  
  try {
    // Using the demo API key format for CoinGecko API
    const response = await createApiRequest(
      `${COINGECKO_API_BASE}/coins/${id}/market_chart?vs_currency=usd&days=${days}&interval=${interval}`,
      {
        headers: {
          'x-cg-demo-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );
    const data = await handleApiResponse<{ prices: [number, number][] }>(response);
    
    // Validate the response data
    if (!data || !Array.isArray(data.prices) || data.prices.length === 0) {
      throw new Error('Invalid price data received from API');
    }
    
    return {
      prices: data.prices.map(([timestamp, price]) => [
        timestamp,
        typeof price === 'number' ? price : parseFloat(price)
      ])
    };
  } catch (error) {
    console.error(`Error fetching crypto history for ${id}:`, error);
    
    if (error instanceof Error && 'status' in error) {
      const apiError = error as ApiError;
      
      // Handle rate limiting with exponential backoff
      if (apiError.status === 429 && retryCount < 3) {
        const backoffTime = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
        console.warn(`Rate limit reached. Retrying in ${backoffTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        return getCryptoHistory(id, days, interval, retryCount + 1);
      }
      
      // Handle specific API errors
      if (apiError.status === 401 || apiError.status === 403) {
        if (apiError.data?.status?.error_message?.includes('interval=hourly')) {
          console.warn('Hourly data not available, falling back to daily data');
          if (interval === 'hourly') {
            return getCryptoHistory(id, days, 'daily', retryCount);
          }
        }
        throw new Error('CoinGecko API authentication failed. Please check your API key.');
      }
    }
    
    throw error;
  }
}

const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWSDATA_API_KEY;
const NEWS_API_BASE_URL = 'https://newsdata.io/api/1/news';

export interface NewsApiResult {
  title: string;
  description: string;
  source_id: string;
  pubDate: string;
  link: string;
}

export interface NewsApiResponse {
  status: string;
  totalResults: number;
  results: NewsApiResult[];
}

export async function getCryptoNews(): Promise<NewsApiResponse> {
  const params = new URLSearchParams({
    apikey: NEWS_API_KEY || '',
    q: 'crypto OR cryptocurrency OR bitcoin OR ethereum',
    language: 'en',
    category: 'business,technology',
  });

  try {
    const response = await fetch(`${NEWS_API_BASE_URL}?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch news');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
}