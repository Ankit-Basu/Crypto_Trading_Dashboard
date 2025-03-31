"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CryptoAsset } from '../types/market';
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, TrendingDownIcon, BarChart3Icon, LineChartIcon, CalendarIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface PricePredictionProps {
  asset: CryptoAsset;
}

interface PredictionData {
  direction: 'up' | 'down';
  confidence: number;
  predictedPrice: number;
  timeframes: {
    '24h': { price: number; change: number };
    '7d': { price: number; change: number };
    '30d': { price: number; change: number };
  };
  factors: {
    technical: number;
    sentiment: number;
    fundamental: number;
    market: number;
  };
}

export default function PricePrediction({ asset }: PricePredictionProps) {
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    const makePrediction = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, this would call an API endpoint
        // that runs the prediction model on the server
        
        // Mock prediction data for demonstration
        const direction = Math.random() > 0.5 ? 'up' : 'down';
        const confidence = 50 + Math.random() * 40; // 50-90% confidence
        const currentPrice = asset.current_price;
        
        // Generate random changes for different timeframes
        const change24h = direction === 'up' ? 
          Math.random() * 8 + 2 : // 2-10% up
          -(Math.random() * 8 + 2); // 2-10% down
          
        const change7d = direction === 'up' ? 
          Math.random() * 15 + 5 : // 5-20% up
          -(Math.random() * 15 + 5); // 5-20% down
          
        const change30d = direction === 'up' ? 
          Math.random() * 25 + 10 : // 10-35% up
          -(Math.random() * 25 + 10); // 10-35% down
        
        // Calculate predicted prices based on changes
        const price24h = currentPrice * (1 + change24h/100);
        const price7d = currentPrice * (1 + change7d/100);
        const price30d = currentPrice * (1 + change30d/100);
        
        // Generate random factor scores (0-100)
        const technicalScore = Math.random() * 100;
        const sentimentScore = Math.random() * 100;
        const fundamentalScore = Math.random() * 100;
        const marketScore = Math.random() * 100;
        
        const mockPrediction: PredictionData = {
          direction,
          confidence,
          predictedPrice: price24h, // Default to 24h prediction
          timeframes: {
            '24h': { price: price24h, change: change24h },
            '7d': { price: price7d, change: change7d },
            '30d': { price: price30d, change: change30d }
          },
          factors: {
            technical: technicalScore,
            sentiment: sentimentScore,
            fundamental: fundamentalScore,
            market: marketScore
          }
        };
        
        setPrediction(mockPrediction);
      } catch (error) {
        console.error('Error making prediction:', error);
      } finally {
        setLoading(false);
      }
    };

    makePrediction();
  }, [asset]);

  // Helper to format price with appropriate precision
  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    if (price < 100) return price.toFixed(2);
    return price.toFixed(0);
  };

  // Calculate overall sentiment based on factor scores
  const getOverallSentiment = (factors: PredictionData['factors']) => {
    const average = (factors.technical + factors.sentiment + factors.fundamental + factors.market) / 4;
    if (average > 70) return { label: 'Very Bullish', color: 'bg-green-500' };
    if (average > 55) return { label: 'Bullish', color: 'bg-green-400' };
    if (average > 45) return { label: 'Neutral', color: 'bg-blue-400' };
    if (average > 30) return { label: 'Bearish', color: 'bg-red-400' };
    return { label: 'Very Bearish', color: 'bg-red-500' };
  };

  // Get color class based on value (0-100)
  const getScoreColor = (score: number) => {
    if (score > 70) return 'bg-green-500';
    if (score > 55) return 'bg-green-400';
    if (score > 45) return 'bg-blue-400';
    if (score > 30) return 'bg-red-400';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center">
        <LineChartIcon className="h-16 w-16 text-muted-foreground/60 mb-4" />
        <h3 className="text-xl font-semibold">Unable to Generate Prediction</h3>
        <p className="text-muted-foreground mt-2 max-w-md">
          We couldn't generate a price prediction for {asset.name} at this time. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[400px] overflow-auto">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-8">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="timeframes" className="text-xs">Timeframes</TabsTrigger>
          <TabsTrigger value="factors" className="text-xs">Analysis Factors</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Prediction</span>
              <div className="flex items-center mt-1">
                <Badge className={`${prediction.direction === 'up' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white`}>
                  {prediction.direction === 'up' ? (
                    <ArrowUpIcon className="h-3.5 w-3.5 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-3.5 w-3.5 mr-1" />
                  )}
                  {prediction.direction === 'up' ? 'Bullish' : 'Bearish'}
                </Badge>
                <span className="ml-2 text-sm">
                  Confidence: <span className="font-medium">{prediction.confidence.toFixed(1)}%</span>
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <span className="text-sm text-muted-foreground">Current Price</span>
              <div className="font-semibold">${asset.current_price.toLocaleString()}</div>
            </div>
          </div>
          
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1 text-primary" />
                24h Price Prediction
              </h3>
              {prediction.timeframes['24h'].change > 0 ? (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                  +{prediction.timeframes['24h'].change.toFixed(2)}%
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                  {prediction.timeframes['24h'].change.toFixed(2)}%
                </Badge>
              )}
            </div>
            
            <div className="flex items-end gap-2">
              <div className="text-3xl font-bold">
                ${formatPrice(prediction.timeframes['24h'].price)}
              </div>
              <div className={`text-sm ${prediction.timeframes['24h'].change > 0 ? 'text-green-500' : 'text-red-500'} pb-1`}>
                {prediction.timeframes['24h'].change > 0 ? (
                  <TrendingUpIcon className="h-4 w-4 inline mr-1" />
                ) : (
                  <TrendingDownIcon className="h-4 w-4 inline mr-1" />
                )}
                {Math.abs(prediction.timeframes['24h'].change).toFixed(2)}%
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-0 shadow-sm bg-card/50">
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-xs font-medium">Market Sentiment</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                {(() => {
                  const sentiment = getOverallSentiment(prediction.factors);
                  return (
                    <div className="flex flex-col items-center">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${sentiment.color} text-white mb-2`}>
                        {prediction.direction === 'up' ? (
                          <TrendingUpIcon className="h-8 w-8" />
                        ) : (
                          <TrendingDownIcon className="h-8 w-8" />
                        )}
                      </div>
                      <span className="font-medium">{sentiment.label}</span>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm bg-card/50">
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-xs font-medium">Key Factors</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-2">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs">Technical</span>
                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getScoreColor(prediction.factors.technical)}`} 
                        style={{ width: `${prediction.factors.technical}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs">Sentiment</span>
                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getScoreColor(prediction.factors.sentiment)}`} 
                        style={{ width: `${prediction.factors.sentiment}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs">Fundamental</span>
                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getScoreColor(prediction.factors.fundamental)}`} 
                        style={{ width: `${prediction.factors.fundamental}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="timeframes" className="mt-4">
          <div className="flex justify-center mb-4">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                onClick={() => setSelectedTimeframe('24h')}
                className={`px-3 py-1.5 text-xs font-medium rounded-l-md border ${
                  selectedTimeframe === '24h' 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-background border-border'
                }`}
              >
                24 Hours
              </button>
              <button
                onClick={() => setSelectedTimeframe('7d')}
                className={`px-3 py-1.5 text-xs font-medium border-y border-r ${
                  selectedTimeframe === '7d' 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-background border-border'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setSelectedTimeframe('30d')}
                className={`px-3 py-1.5 text-xs font-medium rounded-r-md border-y border-r ${
                  selectedTimeframe === '30d' 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-background border-border'
                }`}
              >
                30 Days
              </button>
            </div>
          </div>
          
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">
                {selectedTimeframe === '24h' ? '24 Hour' : 
                 selectedTimeframe === '7d' ? '7 Day' : '30 Day'} Prediction
              </h3>
              {prediction.timeframes[selectedTimeframe].change > 0 ? (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                  +{prediction.timeframes[selectedTimeframe].change.toFixed(2)}%
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
                  {prediction.timeframes[selectedTimeframe].change.toFixed(2)}%
                </Badge>
              )}
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold mb-2">
                ${formatPrice(prediction.timeframes[selectedTimeframe].price)}
              </div>
              
              <div className="flex items-center gap-1 text-sm">
                <span>From current:</span>
                <span className={prediction.timeframes[selectedTimeframe].change > 0 ? 'text-green-500' : 'text-red-500'}>
                  {prediction.timeframes[selectedTimeframe].change > 0 ? '+' : ''}
                  {prediction.timeframes[selectedTimeframe].change.toFixed(2)}%
                </span>
              </div>
              
              <div className="w-full mt-6 mb-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Current</span>
                  <span>Predicted</span>
                </div>
                <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-full">
                  <div 
                    className={`absolute h-4 w-4 rounded-full -top-1 border-2 border-background ${
                      prediction.timeframes[selectedTimeframe].change > 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ 
                      left: prediction.timeframes[selectedTimeframe].change > 0 ? '0%' : '100%',
                      transform: 'translateX(-50%)'
                    }}
                  ></div>
                  <div 
                    className={`absolute h-4 w-4 rounded-full -top-1 border-2 border-background ${
                      prediction.timeframes[selectedTimeframe].change > 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ 
                      left: prediction.timeframes[selectedTimeframe].change > 0 ? '100%' : '0%',
                      transform: 'translateX(-50%)'
                    }}
                  ></div>
                  <div 
                    className={`h-2 rounded-full ${
                      prediction.timeframes[selectedTimeframe].change > 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ 
                      width: '100%',
                      marginLeft: prediction.timeframes[selectedTimeframe].change > 0 ? '0' : 'auto',
                      marginRight: prediction.timeframes[selectedTimeframe].change > 0 ? 'auto' : '0'
                    }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="font-medium">${asset.current_price.toLocaleString()}</span>
                  <span className="font-medium">${formatPrice(prediction.timeframes[selectedTimeframe].price)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <h4 className="text-xs font-medium mb-2">Prediction Methodology</h4>
            <p className="text-xs text-muted-foreground">
              Our AI model analyzes historical price data, market trends, trading volume, and on-chain metrics 
              to generate these predictions. Remember that cryptocurrency markets are highly volatile and 
              predictions should be used as one of many tools in your trading strategy.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="factors" className="mt-4">
          <div className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-sm font-medium">Technical Analysis</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Score</span>
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mr-2">
                      <div 
                        className={`h-full ${getScoreColor(prediction.factors.technical)}`} 
                        style={{ width: `${prediction.factors.technical}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium">{prediction.factors.technical.toFixed(0)}/100</span>
                  </div>
                </div>
                <div className="text-xs space-y-1 mt-3">
                  <div className="flex justify-between">
                    <span>RSI (14)</span>
                    <span className={Math.random() > 0.5 ? "text-green-500" : "text-red-500"}>
                      {(Math.random() * 100).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>MACD</span>
                    <span className={Math.random() > 0.5 ? "text-green-500" : "text-red-500"}>
                      {(Math.random() * 2 - 1).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bollinger Bands</span>
                    <span className={Math.random() > 0.5 ? "text-green-500" : "text-red-500"}>
                      {Math.random() > 0.5 ? "Upper" : "Lower"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm">
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-sm font-medium">Market Sentiment</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Score</span>
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mr-2">
                      <div 
                        className={`h-full ${getScoreColor(prediction.factors.sentiment)}`} 
                        style={{ width: `${prediction.factors.sentiment}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium">{prediction.factors.sentiment.toFixed(0)}/100</span>
                  </div>
                </div>
                <div className="text-xs space-y-1 mt-3">
                  <div className="flex justify-between">
                    <span>Social Media</span>
                    <span className={Math.random() > 0.5 ? "text-green-500" : "text-red-500"}>
                      {Math.random() > 0.5 ? "Positive" : "Negative"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>News Sentiment</span>
                    <span className={Math.random() > 0.5 ? "text-green-500" : "text-red-500"}>
                      {Math.random() > 0.7 ? "Very Positive" : Math.random() > 0.4 ? "Positive" : "Neutral"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fear & Greed Index</span>
                    <span className={Math.random() > 0.5 ? "text-green-500" : "text-red-500"}>
                      {(Math.random() * 100).toFixed(0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm">
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-sm font-medium">Fundamental Analysis</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Score</span>
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mr-2">
                      <div 
                        className={`h-full ${getScoreColor(prediction.factors.fundamental)}`} 
                        style={{ width: `${prediction.factors.fundamental}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium">{prediction.factors.fundamental.toFixed(0)}/100</span>
                  </div>
                </div>
                <div className="text-xs space-y-1 mt-3">
                  <div className="flex justify-between">
                    <span>Network Activity</span>
                    <span className={Math.random() > 0.5 ? "text-green-500" : "text-red-500"}>
                      {Math.random() > 0.5 ? "Increasing" : "Decreasing"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Development Activity</span>
                    <span className={Math.random() > 0.5 ? "text-green-500" : "text-red-500"}>
                      {Math.random() > 0.7 ? "Very High" : Math.random() > 0.4 ? "High" : "Moderate"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Adoption Metrics</span>
                    <span className={Math.random() > 0.5 ? "text-green-500" : "text-red-500"}>
                      {Math.random() > 0.6 ? "Strong" : "Moderate"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}