"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CryptoAsset, TechnicalIndicators } from '../types/market';
import { ArrowUpIcon, ArrowDownIcon, BrainIcon, AlertCircleIcon } from 'lucide-react';
import { calculateRSI, calculateMACD, calculateBollingerBands } from '../lib/indicators';
import { getCryptoHistory } from '../lib/api';

interface AITradingAssistantProps {
  asset: CryptoAsset;
}

interface TradingSignal {
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  reason: string;
  timeframe: string;
}

export default function AITradingAssistant({ asset }: AITradingAssistantProps) {
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const analyzeMarket = async () => {
      try {
        setLoading(true);
        
        // Fetch historical data
        let history;
        try {
          history = await getCryptoHistory(asset.id, 30, 'daily');
        } catch (apiError) {
          console.error('Error fetching crypto history:', apiError);
          setSignals([{
            action: 'hold',
            confidence: 50,
            reason: 'Unable to fetch market data. Please try again later.',
            timeframe: 'Short-term'
          }]);
          setLoading(false);
          return;
        }
        
        const prices = history.prices.map(([timestamp, price]: [number, number]) => price);
        
        // Calculate technical indicators
        const rsi = calculateRSI(prices);
        const macd = calculateMACD(prices);
        const bb = calculateBollingerBands(prices);
        
        // Store indicators for reference
        setIndicators({
          rsi: rsi[rsi.length - 1],
          macd: {
            macdLine: macd.MACD[macd.MACD.length - 1],
            signalLine: macd.signal[macd.signal.length - 1],
            histogram: macd.histogram[macd.histogram.length - 1]
          },
          movingAverages: {
            ma20: bb.middle[bb.middle.length - 1],
            ma50: 0,
            ma200: 0
          },
          bollingerBands: {
            upper: bb.upper[bb.upper.length - 1],
            middle: bb.middle[bb.middle.length - 1],
            lower: bb.lower[bb.lower.length - 1]
          }
        });
        
        // Generate trading signals based on indicators
        const newSignals: TradingSignal[] = [];
        
        // RSI Signal
        if (rsi[rsi.length - 1] < 30) {
          newSignals.push({
            action: 'buy',
            confidence: 80,
            reason: 'RSI indicates oversold conditions',
            timeframe: 'Short-term'
          });
        } else if (rsi[rsi.length - 1] > 70) {
          newSignals.push({
            action: 'sell' as 'buy' | 'sell' | 'hold',
            confidence: 75,
            reason: 'RSI indicates overbought conditions',
            timeframe: 'Short-term'
          });
        }
        
        // MACD Signal
        if (macd.histogram[macd.histogram.length - 1] > 0 && 
            macd.histogram[macd.histogram.length - 2] <= 0) {
          newSignals.push({
            action: 'buy',
            confidence: 70,
            reason: 'MACD histogram crossed above zero',
            timeframe: 'Medium-term'
          });
        } else if (macd.histogram[macd.histogram.length - 1] < 0 && 
                  macd.histogram[macd.histogram.length - 2] >= 0) {
          newSignals.push({
            action: 'sell' as 'buy' | 'sell' | 'hold',
            confidence: 65,
            reason: 'MACD histogram crossed below zero',
            timeframe: 'Medium-term'
          });
        }
        
        // Bollinger Bands Signal
        const lastPrice = prices[prices.length - 1];
        if (lastPrice < bb.lower[bb.lower.length - 1]) {
          newSignals.push({
            action: 'buy',
            confidence: 60,
            reason: 'Price below lower Bollinger Band',
            timeframe: 'Short-term'
          });
        } else if (lastPrice > bb.upper[bb.upper.length - 1]) {
          newSignals.push({
            action: 'sell' as 'buy' | 'sell' | 'hold',
            confidence: 55,
            reason: 'Price above upper Bollinger Band',
            timeframe: 'Short-term'
          });
        }
        
        // If no signals, add a hold recommendation
        if (newSignals.length === 0) {
          newSignals.push({
            action: 'hold',
            confidence: 50,
            reason: 'No clear signals from indicators',
            timeframe: 'Short-term'
          });
        }
        
        setSignals(newSignals);
      } catch (error) {
        console.error('Error analyzing market:', error);
      } finally {
        setLoading(false);
      }
    };
    
    analyzeMarket();
  }, [asset]);
  
  const getActionColor = (action: string) => {
    switch (action) {
      case 'buy':
        return 'bg-green-500/10 text-green-500';
      case 'sell':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-yellow-500/10 text-yellow-500';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainIcon className="h-5 w-5" />
          AI Trading Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Trading Signals</h3>
              {signals.map((signal, index) => (
                <Card key={index} className="bg-card/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className={getActionColor(signal.action)}>
                            {signal.action.toUpperCase()}
                          </Badge>
                          <span className="text-sm font-medium">{signal.timeframe}</span>
                        </div>
                        <p className="text-sm">{signal.reason}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">Confidence</div>
                        <div className="text-lg font-bold">{signal.confidence}%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Automated Strategy</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-card/50">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Entry Strategy</h4>
                    <ul className="text-sm space-y-2">
                      <li>• Buy when RSI crosses below 30</li>
                      <li>• Buy when price touches lower Bollinger Band</li>
                      <li>• Buy when MACD histogram crosses above zero</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="bg-card/50">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Exit Strategy</h4>
                    <ul className="text-sm space-y-2">
                      <li>• Sell when RSI crosses above 70</li>
                      <li>• Sell when price touches upper Bollinger Band</li>
                      <li>• Sell when MACD histogram crosses below zero</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircleIcon className="h-5 w-5 text-yellow-500" />
                <span className="text-sm font-medium">Trading involves risk. Use signals as guidance only.</span>
              </div>
              <Button size="sm" variant="outline">
                Customize Strategy
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}