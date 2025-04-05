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
          'x-cg-api-key': apiKey,
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
    // Add delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const response = await createApiRequest(
      `${COINGECKO_API_BASE}/coins/${id}/market_chart?vs_currency=usd&days=${days}&interval=${interval}`,
      {
        headers: {
          'x-cg-api-key': apiKey,
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

const NEWS_API_KEY = process.env.NEXT_PUBLIC_NEWSDATA_API_KEY || process.env.NEWSDATA_API_KEY;
const NEWS_API_BASE_URL = 'https://newsdata.io/api/1/news';

export interface NewsApiResult {
  title: string;
  description: string;
  source_id: string;
  pubDate: string;
  link: string;
  image_url?: string;
}

export interface NewsApiResponse {
  status: string;
  totalResults: number;
  results: NewsApiResult[];
}

export async function getCryptoNews(): Promise<NewsApiResponse> {
  // Check if API key exists before making the request
  if (!NEWS_API_KEY) {
    console.error('NewsData API key is not configured');
    
    // Return mock data in development mode
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using mock news data in development mode');
      return getMockNewsData();
    }
    
    throw new Error('NewsData API key is not configured');
  }
  
  const params = new URLSearchParams({
    apikey: NEWS_API_KEY,
    q: 'crypto OR cryptocurrency OR bitcoin OR ethereum',
    language: 'en',
    category: 'business,technology',
  });

  try {
    const response = await fetch(`${NEWS_API_BASE_URL}?${params.toString()}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('News API error:', response.status, errorText);
      
      // If we're in development mode, fall back to mock data
      if (process.env.NODE_ENV === 'development') {
        console.warn('API request failed, using mock news data');
        return getMockNewsData();
      }
      
      throw new Error(`Failed to fetch news: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching news:', error);
    
    // If we're in development mode, fall back to mock data
    if (process.env.NODE_ENV === 'development') {
      console.warn('API request failed, using mock news data');
      return getMockNewsData();
    }
    
    throw error;
  }
}

// Mock data function for development mode
function getMockNewsData(): NewsApiResponse {
  return {
    status: "success",
    totalResults: 5,
    results: [
      {
        title: "Bitcoin Surges Past $60,000 as Institutional Adoption Grows",
        description: "Bitcoin has reached a new all-time high as major financial institutions continue to invest in cryptocurrency. Analysts predict further growth as mainstream adoption increases.",
        source_id: "CryptoNews",
        pubDate: new Date().toISOString(),
        link: "https://example.com/bitcoin-surge",
        image_url: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
      },
      {
        title: "Ethereum 2.0 Upgrade Promises Lower Fees and Higher Throughput",
        description: "The long-awaited Ethereum 2.0 upgrade is set to address scalability issues and reduce gas fees. Developers are optimistic about the network's future performance.",
        source_id: "BlockchainDaily",
        pubDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        link: "https://example.com/ethereum-upgrade",
        image_url: "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
      },
      {
        title: "Crypto Market Faces Correction as Regulatory Concerns Mount",
        description: "Cryptocurrency markets experienced a sharp decline today as regulators in several countries announced plans to increase oversight. Traders remain cautious about short-term price action.",
        source_id: "FinanceToday",
        pubDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        link: "https://example.com/crypto-correction",
        image_url: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
      },
      {
        title: "DeFi Protocols Reach $100 Billion in Total Value Locked",
        description: "Decentralized finance continues its explosive growth, with the total value locked in DeFi protocols surpassing $100 billion. Yield farming and liquidity mining remain popular strategies.",
        source_id: "DeFiInsider",
        pubDate: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        link: "https://example.com/defi-growth",
        image_url: "https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
      },
      {
        title: "NFT Market Shows Signs of Recovery After Summer Slump",
        description: "The market for non-fungible tokens is showing renewed strength after a period of declining sales. Several high-profile collections have seen record-breaking transactions in recent weeks.",
        source_id: "NFTWorld",
        pubDate: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
        link: "https://example.com/nft-recovery",
        image_url: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
      }
    ]
  };
}