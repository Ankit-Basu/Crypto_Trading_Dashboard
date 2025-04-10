"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getCryptoNews, NewsApiResult } from '../lib/api';
import { Skeleton } from "@/components/ui/skeleton";
import { NewspaperIcon, ExternalLinkIcon, ChevronRightIcon, ImageIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { CryptoAsset } from '../types/market';

interface NewsItem extends NewsApiResult {
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
}

interface NewsAnalysisProps {
  asset?: CryptoAsset | null;
}

export default function NewsAnalysis({ asset }: NewsAnalysisProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

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
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'bearish':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const toggleExpand = (index: number) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleImageError = (index: number) => {
    setImageErrors(prev => ({
      ...prev,
      [index]: true
    }));
  };

  // Placeholder images based on sentiment
  const getPlaceholderImage = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'bullish':
        return '/images/bullish-placeholder.svg';
      case 'bearish':
        return '/images/bearish-placeholder.svg';
      default:
        return '/images/neutral-placeholder.svg';
    }
  };

  return (
    <Card className="w-full h-full shadow-md border-primary/10">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-base flex items-center gap-1">
          <NewspaperIcon className="h-4 w-4 text-primary" />
          <span>News & Sentiment</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="space-y-3 p-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3 p-3">
                  <Skeleton className="h-16 w-16 rounded-md flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center text-muted-foreground py-6">
              <p>{error}</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {news.map((item, index) => (
                <div
                  key={index}
                  className="p-3 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex gap-3">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                      {item.image_url && !imageErrors[index] ? (
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          fill
                          className="object-cover"
                          onError={() => handleImageError(index)}
                        />
                      ) : (
                        <Image
                          src={getPlaceholderImage(item.sentiment)}
                          alt={`${item.sentiment} news`}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium line-clamp-2">
                            {item.title}
                          </h3>
                          <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                            <span className="font-medium">{item.source_id}</span>
                            <span className="mx-1">•</span>
                            <span>{formatDate(item.pubDate)}</span>
                          </div>
                        </div>
                        <Badge className={`${getSentimentColor(item.sentiment)} text-xs border`}>
                          {item.sentiment}
                        </Badge>
                      </div>
                      
                      {expandedItems[index] && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {item.description}
                        </p>
                      )}
                      
                      <div className="flex justify-between items-center mt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => toggleExpand(index)}
                        >
                          {expandedItems[index] ? 'Show Less' : 'Read More'}
                        </Button>
                        
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary flex items-center hover:underline"
                        >
                          Source
                          <ExternalLinkIcon className="h-3 w-3 ml-0.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}