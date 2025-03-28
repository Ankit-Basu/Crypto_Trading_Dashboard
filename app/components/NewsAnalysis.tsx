"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getCryptoNews, NewsApiResult } from '../lib/api';
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLinkIcon } from 'lucide-react';

interface NewsItem extends NewsApiResult {
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
}

export default function NewsAnalysis() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getCryptoNews();
        if (!data.results) {
          throw new Error('No news data available');
        }

        // Add sentiment analysis to each news item
        const newsWithSentiment: NewsItem[] = data.results.map(item => ({
          ...item,
          sentiment: analyzeSentiment(item.description || item.title)
        }));

        setNews(newsWithSentiment);
        setError(null);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Failed to load news. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Simple sentiment analysis mock - replace with actual sentiment analysis
  const analyzeSentiment = (text: string): 'Bullish' | 'Bearish' | 'Neutral' => {
    const bullishWords = ['surge', 'gain', 'rise', 'up', 'bull', 'high', 'growth', 'positive'];
    const bearishWords = ['drop', 'fall', 'down', 'bear', 'low', 'crash', 'negative', 'loss'];
    
    const lowerText = text.toLowerCase();
    const bullishCount = bullishWords.filter(word => lowerText.includes(word)).length;
    const bearishCount = bearishWords.filter(word => lowerText.includes(word)).length;
    
    if (bullishCount > bearishCount) return 'Bullish';
    if (bearishCount > bullishCount) return 'Bearish';
    return 'Neutral';
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'bullish':
        return 'bg-green-500/10 text-green-500';
      case 'bearish':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
          </svg>
          Market News & Sentiment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center text-muted-foreground py-8">
              <p>{error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {news.map((item, index) => (
                <a
                  key={index}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-lg border bg-card p-4 transition-all hover:shadow-md hover:bg-accent/5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-grow">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold leading-tight hover:underline">
                          {item.title}
                          <ExternalLinkIcon className="inline-block ml-1 h-3 w-3" />
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium">{item.source_id}</span>
                        <span>•</span>
                        <span>{formatDate(item.pubDate)}</span>
                      </div>
                    </div>
                    <Badge className={`${getSentimentColor(item.sentiment)} whitespace-nowrap`}>
                      {item.sentiment}
                    </Badge>
                  </div>
                </a>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}