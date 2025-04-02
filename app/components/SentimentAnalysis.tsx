"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CryptoAsset } from '../types/market';
import { BarChart3, TrendingUp, TrendingDown, AlertCircle, MessageCircle, Share2 } from 'lucide-react';

interface SentimentAnalysisProps {
  selectedAsset?: CryptoAsset | null;
}

export default function SentimentAnalysis({ selectedAsset }: SentimentAnalysisProps) {
  const [sentiment, setSentiment] = useState<{
    overall: number;
    social: number;
    news: number;
    technical: number;
    sources: {
      twitter: number;
      reddit: number;
      news: number;
      tradingView: number;
    };
    keywords: {
      word: string;
      sentiment: 'positive' | 'negative' | 'neutral';
      count: number;
    }[];
    recentMentions: {
      source: string;
      text: string;
      sentiment: 'positive' | 'negative' | 'neutral';
      time: string;
    }[];
  } | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading sentiment data
    setLoading(true);
    
    // In a real app, you would fetch this data from an API
    setTimeout(() => {
      if (selectedAsset) {
        // Generate mock sentiment data based on the asset
        const mockSentiment = generateMockSentimentData(selectedAsset);
        setSentiment(mockSentiment);
      } else {
        setSentiment(null);
      }
      setLoading(false);
    }, 1500);
  }, [selectedAsset]);

  const generateMockSentimentData = (asset: CryptoAsset) => {
    // Generate random sentiment scores between 0-100
    const overallSentiment = Math.floor(Math.random() * 100);
    const socialSentiment = Math.floor(Math.random() * 100);
    const newsSentiment = Math.floor(Math.random() * 100);
    const technicalSentiment = Math.floor(Math.random() * 100);
    
    // Generate random source scores
    const twitterScore = Math.floor(Math.random() * 100);
    const redditScore = Math.floor(Math.random() * 100);
    const newsScore = Math.floor(Math.random() * 100);
    const tradingViewScore = Math.floor(Math.random() * 100);
    
    // Common crypto keywords with sentiment
    const keywordOptions = [
      { word: 'bull run', sentiment: 'positive' as const },
      { word: 'bearish', sentiment: 'negative' as const },
      { word: 'moon', sentiment: 'positive' as const },
      { word: 'dump', sentiment: 'negative' as const },
      { word: 'hodl', sentiment: 'positive' as const },
      { word: 'crash', sentiment: 'negative' as const },
      { word: 'rally', sentiment: 'positive' as const },
      { word: 'correction', sentiment: 'negative' as const },
      { word: 'adoption', sentiment: 'positive' as const },
      { word: 'regulation', sentiment: 'neutral' as const },
      { word: 'innovation', sentiment: 'positive' as const },
      { word: 'scam', sentiment: 'negative' as const },
      { word: asset.name.toLowerCase(), sentiment: 'neutral' as const },
    ];
    
    // Select random keywords and assign counts
    const selectedKeywords = [];
    const usedIndices = new Set();
    
    for (let i = 0; i < 5; i++) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * keywordOptions.length);
      } while (usedIndices.has(randomIndex));
      
      usedIndices.add(randomIndex);
      selectedKeywords.push({
        ...keywordOptions[randomIndex],
        count: Math.floor(Math.random() * 100) + 10
      });
    }
    
    // Generate mock recent mentions
    const sources = ['Twitter', 'Reddit', 'News', 'TradingView'];
    const positivePhrases = [
      `${asset.name} looking bullish today!`,
      `Just bought more ${asset.name}, feeling optimistic.`,
      `${asset.name} technical indicators suggest upward movement.`,
      `New partnership announcement for ${asset.name} is huge!`,
    ];
    
    const negativePhrases = [
      `${asset.name} showing bearish patterns.`,
      `Sold my ${asset.name}, expecting a dip.`,
      `Concerning news about ${asset.name}'s development.`,
      `${asset.name} might face regulatory challenges soon.`,
    ];
    
    const neutralPhrases = [
      `What's everyone thinking about ${asset.name} today?`,
      `${asset.name} trading sideways for now.`,
      `Interesting volume patterns for ${asset.name}.`,
      `New update from ${asset.name} team, still analyzing.`,
    ];
    
    const recentMentions = [];
    for (let i = 0; i < 5; i++) {
      const source = sources[Math.floor(Math.random() * sources.length)];
      const sentimentType = ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)] as 'positive' | 'negative' | 'neutral';
      
      let text;
      if (sentimentType === 'positive') {
        text = positivePhrases[Math.floor(Math.random() * positivePhrases.length)];
      } else if (sentimentType === 'negative') {
        text = negativePhrases[Math.floor(Math.random() * negativePhrases.length)];
      } else {
        text = neutralPhrases[Math.floor(Math.random() * neutralPhrases.length)];
      }
      
      // Generate a random time in the last 24 hours
      const hours = Math.floor(Math.random() * 24);
      const minutes = Math.floor(Math.random() * 60);
      const time = hours === 0 
        ? `${minutes}m ago` 
        : hours < 1 
          ? `${minutes}m ago` 
          : `${hours}h ${minutes}m ago`;
      
      recentMentions.push({
        source,
        text,
        sentiment: sentimentType,
        time
      });
    }
    
    return {
      overall: overallSentiment,
      social: socialSentiment,
      news: newsSentiment,
      technical: technicalSentiment,
      sources: {
        twitter: twitterScore,
        reddit: redditScore,
        news: newsScore,
        tradingView: tradingViewScore
      },
      keywords: selectedKeywords,
      recentMentions
    };
  };

  const getSentimentColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSentimentLabel = (score: number) => {
    if (score >= 70) return 'Bullish';
    if (score >= 50) return 'Neutral';
    return 'Bearish';
  };

  const getSentimentBadgeColor = (sentiment: 'positive' | 'negative' | 'neutral') => {
    if (sentiment === 'positive') return 'bg-green-500/20 text-green-500';
    if (sentiment === 'negative') return 'bg-red-500/20 text-red-500';
    return 'bg-yellow-500/20 text-yellow-500';
  };

  if (loading) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent>
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Loading sentiment analysis...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!selectedAsset || !sentiment) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/60" />
          <h3 className="text-lg font-medium mb-2">No Asset Selected</h3>
          <p className="text-sm text-muted-foreground">
            Select a cryptocurrency to view sentiment analysis
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <span>Sentiment Analysis: {selectedAsset.name}</span>
          <Badge 
            className={`ml-auto ${getSentimentBadgeColor(
              sentiment.overall >= 70 ? 'positive' : 
              sentiment.overall >= 50 ? 'neutral' : 'negative'
            )}`}
          >
            {getSentimentLabel(sentiment.overall)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Sentiment */}
        <div>
          <div className="flex justify-between mb-1">
            <h3 className="text-sm font-medium">Overall Market Sentiment</h3>
            <span className="text-sm">{sentiment.overall}%</span>
          </div>
          <Progress value={sentiment.overall} className={`h-2 ${getSentimentColor(sentiment.overall)}`} />
        </div>

        {/* Sentiment Sources */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between mb-1">
              <h3 className="text-sm font-medium">Social Media</h3>
              <span className="text-sm">{sentiment.social}%</span>
            </div>
            <Progress value={sentiment.social} className={`h-2 ${getSentimentColor(sentiment.social)}`} />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <h3 className="text-sm font-medium">News Articles</h3>
              <span className="text-sm">{sentiment.news}%</span>
            </div>
            <Progress value={sentiment.news} className={`h-2 ${getSentimentColor(sentiment.news)}`} />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <h3 className="text-sm font-medium">Technical Indicators</h3>
              <span className="text-sm">{sentiment.technical}%</span>
            </div>
            <Progress value={sentiment.technical} className={`h-2 ${getSentimentColor(sentiment.technical)}`} />
          </div>
        </div>

        {/* Trending Keywords */}
        <div>
          <h3 className="text-sm font-medium mb-3">Trending Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {sentiment.keywords.map((keyword, index) => (
              <Badge 
                key={index} 
                className={`${getSentimentBadgeColor(keyword.sentiment)}`}
              >
                {keyword.word} ({keyword.count})
              </Badge>
            ))}
          </div>
        </div>

        {/* Recent Mentions */}
        <div>
          <h3 className="text-sm font-medium mb-3">Recent Mentions</h3>
          <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
            {sentiment.recentMentions.map((mention, index) => (
              <div key={index} className="bg-background/50 p-3 rounded-lg border border-border">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium">{mention.source}</span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getSentimentBadgeColor(mention.sentiment)}`}
                  >
                    {mention.sentiment}
                  </Badge>
                </div>
                <p className="text-sm mb-1">{mention.text}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{mention.time}</span>
                  <div className="flex gap-1">
                    <button className="text-muted-foreground hover:text-foreground">
                      <MessageCircle className="h-3 w-3" />
                    </button>
                    <button className="text-muted-foreground hover:text-foreground">
                      <Share2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
