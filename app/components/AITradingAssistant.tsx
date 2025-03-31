"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CryptoAsset, TechnicalIndicators } from '../types/market';
import { ArrowUpIcon, ArrowDownIcon, BrainIcon, AlertCircleIcon, BellIcon, TrendingUpIcon, TrendingDownIcon, BarChart3Icon, CandlestickChartIcon, LineChartIcon, TimerIcon, CheckIcon, XIcon } from 'lucide-react';
import { calculateRSI, calculateMACD, calculateBollingerBands } from '../lib/indicators';
import { getCryptoHistory } from '../lib/api';
import { Progress } from "@/components/ui/progress";

interface AITradingAssistantProps {
  asset: CryptoAsset;
}

interface TradingSignal {
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  reason: string;
  timeframe: string;
}

interface TradingStrategy {
  name: string;
  entryRules: string[];
  exitRules: string[];
  timeframe: string;
  performance: {
    winRate: number;
    profitFactor: number;
    averageReturn: number;
  };
}

export default function AITradingAssistant({ asset }: AITradingAssistantProps) {
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStrategy, setSelectedStrategy] = useState<string>("trend");
  const [activeTab, setActiveTab] = useState<string>("signals");
  const [backtestResults, setBacktestResults] = useState<{
    returns: number;
    trades: number;
    winRate: number;
    profitFactor: number;
  }>({
    returns: 0,
    trades: 0,
    winRate: 0,
    profitFactor: 0
  });
  
  // Define trading strategies
  const strategies: TradingStrategy[] = [
    {
      name: "trend",
      entryRules: [
        "Enter LONG when price crosses above 20-day MA",
        "Enter SHORT when price crosses below 20-day MA",
        "Confirm with RSI direction"
      ],
      exitRules: [
        "Exit LONG when price crosses below 20-day MA",
        "Exit SHORT when price crosses above 20-day MA",
        "Use 5% trailing stop loss"
      ],
      timeframe: "Medium-term",
      performance: {
        winRate: 62,
        profitFactor: 1.8,
        averageReturn: 4.2
      }
    },
    {
      name: "momentum",
      entryRules: [
        "Enter LONG when RSI crosses above 30",
        "Enter SHORT when RSI crosses below 70",
        "Confirm with MACD histogram direction"
      ],
      exitRules: [
        "Exit LONG when RSI crosses above 70",
        "Exit SHORT when RSI crosses below 30",
        "Take profit at 10% gain"
      ],
      timeframe: "Short-term",
      performance: {
        winRate: 58,
        profitFactor: 1.5,
        averageReturn: 3.7
      }
    },
    {
      name: "breakout",
      entryRules: [
        "Enter LONG when price breaks above upper Bollinger Band",
        "Enter SHORT when price breaks below lower Bollinger Band",
        "Confirm with increased volume"
      ],
      exitRules: [
        "Exit LONG when price touches middle Bollinger Band",
        "Exit SHORT when price touches middle Bollinger Band",
        "Use 7% fixed stop loss"
      ],
      timeframe: "Short-term",
      performance: {
        winRate: 45,
        profitFactor: 2.2,
        averageReturn: 6.5
      }
    }
  ];
  
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
            action: 'sell',
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
            action: 'sell',
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
            action: 'sell',
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
        
        // Generate mock backtest results
        const currentStrategy = strategies.find(s => s.name === selectedStrategy) || strategies[0];
        setBacktestResults({
          returns: currentStrategy.performance.averageReturn * (1 + Math.random() * 0.5 - 0.25),
          trades: 15 + Math.floor(Math.random() * 10),
          winRate: currentStrategy.performance.winRate * (1 + Math.random() * 0.1 - 0.05),
          profitFactor: currentStrategy.performance.profitFactor * (1 + Math.random() * 0.2 - 0.1)
        });
      } catch (error) {
        console.error('Error analyzing market:', error);
      } finally {
        setLoading(false);
      }
    };
    
    analyzeMarket();
  }, [asset, selectedStrategy]);
  
  const getActionColor = (action: string) => {
    switch (action) {
      case 'buy':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'sell':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };
  
  const getActionBgColor = (action: string) => {
    switch (action) {
      case 'buy':
        return 'bg-green-500';
      case 'sell':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };
  
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return 'text-green-500';
    if (confidence >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  const currentStrategy = strategies.find(s => s.name === selectedStrategy) || strategies[0];
  
  // Get the highest confidence signal
  const topSignal = signals.length > 0 
    ? signals.reduce((prev, current) => (prev.confidence > current.confidence) ? prev : current)
    : null;
  
  return (
    <div className="h-[400px] overflow-auto">
      <Tabs 
        defaultValue="signals" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 h-8">
          <TabsTrigger value="signals" className="text-xs">
            <BrainIcon className="h-3 w-3 mr-1" />
            AI Signals
          </TabsTrigger>
          <TabsTrigger value="strategies" className="text-xs">
            <CandlestickChartIcon className="h-3 w-3 mr-1" />
            Strategies
          </TabsTrigger>
          <TabsTrigger value="backtest" className="text-xs">
            <BarChart3Icon className="h-3 w-3 mr-1" />
            Backtest
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="signals" className="space-y-4 pt-2">
          {loading ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Top Signal Card */}
              {topSignal && (
                <Card className="border-0 shadow-sm overflow-hidden">
                  <div className={`h-1 ${getActionBgColor(topSignal.action)}`}></div>
                  <CardHeader className="p-3 pb-0">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      <div className="flex items-center">
                        <BrainIcon className="h-4 w-4 mr-1.5 text-primary" />
                        AI Recommendation
                      </div>
                      <Badge className={`${getActionColor(topSignal.action)} border uppercase`}>
                        {topSignal.action}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {topSignal.action === 'buy' ? (
                          <TrendingUpIcon className="h-6 w-6 text-green-500" />
                        ) : topSignal.action === 'sell' ? (
                          <TrendingDownIcon className="h-6 w-6 text-red-500" />
                        ) : (
                          <LineChartIcon className="h-6 w-6 text-yellow-500" />
                        )}
                        <div>
                          <div className="font-medium">
                            {topSignal.action === 'buy' ? 'Buy ' : 
                             topSignal.action === 'sell' ? 'Sell ' : 
                             'Hold '} 
                            {asset.symbol.toUpperCase()}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center">
                            <TimerIcon className="h-3 w-3 mr-1" />
                            {topSignal.timeframe} outlook
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Confidence</div>
                        <div className={`text-lg font-bold ${getConfidenceColor(topSignal.confidence)}`}>
                          {topSignal.confidence}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-muted/30 p-2 rounded-md text-sm">
                      {topSignal.reason}
                    </div>
                    
                    <div className="flex justify-between items-center mt-3">
                      <Button size="sm" variant="outline" className="text-xs">
                        <BellIcon className="h-3 w-3 mr-1" />
                        Set Alert
                      </Button>
                      <Button size="sm" className="text-xs">
                        Simulated Trade
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Other Signals */}
              {signals.length > 1 && (
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground mb-2">Additional Signals</h3>
                  <div className="space-y-2">
                    {signals
                      .filter((s, i) => i !== signals.indexOf(topSignal))
                      .map((signal, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded-lg bg-card/50">
                          <div className="flex items-center gap-2">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${getActionBgColor(signal.action)} text-white`}>
                              {signal.action === 'buy' ? (
                                <ArrowUpIcon className="h-4 w-4" />
                              ) : signal.action === 'sell' ? (
                                <ArrowDownIcon className="h-4 w-4" />
                              ) : (
                                <LineChartIcon className="h-4 w-4" />
                              )}
                            </div>
                            <div>
                              <div className="text-xs font-medium flex items-center">
                                <Badge className={`${getActionColor(signal.action)} border mr-1 uppercase text-[10px]`}>
                                  {signal.action}
                                </Badge>
                                <span>{signal.timeframe}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">{signal.reason}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-bold ${getConfidenceColor(signal.confidence)}`}>
                              {signal.confidence}%
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="strategies" className="space-y-4 pt-2">
          <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
            {strategies.map((strategy) => (
              <Button 
                key={strategy.name}
                variant={selectedStrategy === strategy.name ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStrategy(strategy.name)}
                className="text-xs capitalize whitespace-nowrap"
              >
                {strategy.name} Strategy
              </Button>
            ))}
          </div>
          
          <Card className="border-0 shadow-sm">
            <CardHeader className="p-3 pb-0">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span className="capitalize">{currentStrategy.name} Strategy</span>
                <Badge variant="outline" className="text-xs">
                  {currentStrategy.timeframe}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center p-2 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Win Rate</div>
                  <div className="text-sm font-medium">{currentStrategy.performance.winRate}%</div>
                </div>
                <div className="text-center p-2 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Profit Factor</div>
                  <div className="text-sm font-medium">{currentStrategy.performance.profitFactor.toFixed(1)}</div>
                </div>
                <div className="text-center p-2 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Avg Return</div>
                  <div className="text-sm font-medium">{currentStrategy.performance.averageReturn.toFixed(1)}%</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <h4 className="text-xs font-medium flex items-center">
                    <CheckIcon className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                    Entry Rules
                  </h4>
                  <ul className="text-xs space-y-1 list-disc pl-4">
                    {currentStrategy.entryRules.map((rule, index) => (
                      <li key={index}>{rule}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-xs font-medium flex items-center">
                    <XIcon className="h-3.5 w-3.5 mr-1.5 text-red-500" />
                    Exit Rules
                  </h4>
                  <ul className="text-xs space-y-1 list-disc pl-4">
                    {currentStrategy.exitRules.map((rule, index) => (
                      <li key={index}>{rule}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-border">
                <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => setActiveTab("backtest")}>
                  <BarChart3Icon className="h-3.5 w-3.5 mr-1.5" />
                  View Backtest Results
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="backtest" className="space-y-4 pt-2">
          {loading ? (
            <div className="flex items-center justify-center h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <Card className="border-0 shadow-sm">
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <BarChart3Icon className="h-4 w-4 mr-1.5 text-primary" />
                    Backtest Results: <span className="capitalize ml-1">{currentStrategy.name} Strategy</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Total Return</div>
                      <div className="text-2xl font-bold text-green-500">+{backtestResults.returns.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Number of Trades</div>
                      <div className="text-2xl font-bold">{backtestResults.trades}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Win Rate</span>
                        <span className="font-medium">{backtestResults.winRate.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500" 
                          style={{ width: `${backtestResults.winRate}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Profit Factor</span>
                        <span className="font-medium">{backtestResults.profitFactor.toFixed(2)}</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500" 
                          style={{ width: `${Math.min(backtestResults.profitFactor * 33, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                    <h4 className="text-xs font-medium mb-1">Performance Analysis</h4>
                    <p className="text-xs text-muted-foreground">
                      This strategy {backtestResults.returns > 5 ? 'outperformed' : 'underperformed'} the market 
                      by {Math.abs(backtestResults.returns - 4.5).toFixed(1)}% over the test period. 
                      The {backtestResults.winRate > 60 ? 'high' : 'moderate'} win rate and 
                      {backtestResults.profitFactor > 2 ? ' excellent' : ' good'} profit factor indicate 
                      {backtestResults.profitFactor > 2 && backtestResults.winRate > 60 ? ' strong' : ' reasonable'} 
                      risk-adjusted returns.
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3">
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => setActiveTab("strategies")}>
                      Back to Strategy
                    </Button>
                    <Button size="sm" className="text-xs">
                      Apply to Portfolio
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm">
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-xs font-medium">Monthly Returns (%)</CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="flex items-end h-[100px] gap-1">
                    {Array.from({ length: 12 }).map((_, i) => {
                      const value = (Math.random() * 10 - 3);
                      const height = `${Math.abs(value) * 8}px`;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center">
                          <div className="text-[9px] text-muted-foreground mb-1">
                            {['J','F','M','A','M','J','J','A','S','O','N','D'][i]}
                          </div>
                          <div 
                            className={`w-full ${value >= 0 ? 'bg-green-500' : 'bg-red-500'}`} 
                            style={{ height }}
                          ></div>
                          <div className="text-[8px] mt-1">{value.toFixed(1)}</div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}