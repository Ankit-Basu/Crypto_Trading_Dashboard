"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CryptoAsset } from '../types/market';
import { AlertTriangleIcon, TrendingUpIcon, BarChart3Icon, ShieldIcon, CoinsIcon, ArrowDownRightIcon, ArrowUpRightIcon, DollarSignIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface RiskAnalysisProps {
  asset: CryptoAsset;
}

export default function RiskAnalysis({ asset }: RiskAnalysisProps) {
  const [riskTolerance, setRiskTolerance] = useState<'low' | 'medium' | 'high'>('medium');
  
  // Mock risk calculations
  const volatilityRisk = Math.abs(asset.price_change_percentage_24h) * 2;
  const trendStrength = Math.min(Math.abs(asset.price_change_percentage_7d) * 3, 100);
  const marketSentiment = 50 + (asset.price_change_percentage_24h * 2);
  const liquidityRisk = Math.min(70 + Math.random() * 30, 100);
  const correlationRisk = Math.min(40 + Math.random() * 40, 100);
  
  // Calculate overall risk score (weighted average)
  const overallRiskScore = Math.round(
    (volatilityRisk * 0.3) + 
    (liquidityRisk * 0.2) + 
    (correlationRisk * 0.15) + 
    (Math.abs(100 - trendStrength) * 0.2) + 
    (Math.abs(100 - marketSentiment) * 0.15)
  );

  const getRiskLevel = (score: number) => {
    if (score < 30) return { level: 'Low', color: 'text-green-500', bgColor: 'bg-green-500' };
    if (score < 70) return { level: 'Moderate', color: 'text-yellow-500', bgColor: 'bg-yellow-500' };
    return { level: 'High', color: 'text-red-500', bgColor: 'bg-red-500' };
  };

  // Calculate position sizing based on risk tolerance
  const calculatePositionSize = (capital: number, riskTolerance: string) => {
    const riskPercentageMap = {
      'low': 0.01, // 1% of capital
      'medium': 0.03, // 3% of capital
      'high': 0.05 // 5% of capital
    };
    
    const riskPercentage = riskPercentageMap[riskTolerance as keyof typeof riskPercentageMap];
    return capital * riskPercentage;
  };

  // Calculate stop loss and take profit based on risk tolerance and volatility
  const calculateRiskParameters = (currentPrice: number, riskTolerance: string, volatility: number) => {
    // Normalize volatility to a percentage between 2% and 15%
    const normalizedVolatility = 2 + (volatility / 100) * 13;
    
    const stopLossMultiplierMap = {
      'low': 0.8, // 80% of normalized volatility
      'medium': 1.0, // 100% of normalized volatility
      'high': 1.5 // 150% of normalized volatility
    };
    
    const takeProfitMultiplierMap = {
      'low': 2.0, // 2x stop loss distance
      'medium': 2.5, // 2.5x stop loss distance
      'high': 3.0 // 3x stop loss distance
    };
    
    const stopLossMultiplier = stopLossMultiplierMap[riskTolerance as keyof typeof stopLossMultiplierMap];
    const takeProfitMultiplier = takeProfitMultiplierMap[riskTolerance as keyof typeof takeProfitMultiplierMap];
    
    const stopLossPercentage = normalizedVolatility * stopLossMultiplier;
    const takeProfitPercentage = stopLossPercentage * takeProfitMultiplier;
    
    return {
      stopLoss: currentPrice * (1 - stopLossPercentage / 100),
      takeProfit: currentPrice * (1 + takeProfitPercentage / 100),
      stopLossPercentage,
      takeProfitPercentage
    };
  };

  const riskParams = calculateRiskParameters(asset.current_price, riskTolerance, volatilityRisk);
  
  // Calculate max drawdown and expected return
  const maxDrawdown = riskParams.stopLossPercentage;
  const expectedReturn = riskParams.takeProfitPercentage;
  const riskRewardRatio = expectedReturn / maxDrawdown;

  // Calculate position size examples
  const positionSizes = {
    small: calculatePositionSize(1000, riskTolerance),
    medium: calculatePositionSize(10000, riskTolerance),
    large: calculatePositionSize(100000, riskTolerance)
  };

  return (
    <div className="h-[400px] overflow-auto">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-8">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="position" className="text-xs">Position Sizing</TabsTrigger>
          <TabsTrigger value="strategy" className="text-xs">Risk Strategy</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium">Overall Risk Score</h3>
              <div className="flex items-center mt-1">
                <span className={`text-lg font-bold ${getRiskLevel(overallRiskScore).color}`}>
                  {overallRiskScore}/100
                </span>
                <Badge 
                  variant="outline" 
                  className={`ml-2 ${
                    getRiskLevel(overallRiskScore).color
                  } border-current`}
                >
                  {getRiskLevel(overallRiskScore).level} Risk
                </Badge>
              </div>
            </div>
            <div className="w-16 h-16 rounded-full flex items-center justify-center border-4 border-background relative">
              <div 
                className="absolute inset-0 rounded-full overflow-hidden"
                style={{
                  background: `conic-gradient(${getRiskLevel(overallRiskScore).bgColor} ${overallRiskScore}%, transparent 0)`
                }}
              ></div>
              <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center z-10">
                <AlertTriangleIcon className={`h-6 w-6 ${getRiskLevel(overallRiskScore).color}`} />
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center">
                  <BarChart3Icon className="h-3.5 w-3.5 mr-1.5 text-primary" />
                  <label className="text-xs font-medium">Volatility Risk</label>
                </div>
                <span className={`text-xs ${getRiskLevel(volatilityRisk).color}`}>
                  {getRiskLevel(volatilityRisk).level}
                </span>
              </div>
              <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getRiskLevel(volatilityRisk).bgColor}`} 
                  style={{ width: `${volatilityRisk}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center">
                  <TrendingUpIcon className="h-3.5 w-3.5 mr-1.5 text-primary" />
                  <label className="text-xs font-medium">Trend Strength</label>
                </div>
                <span className={`text-xs ${getRiskLevel(trendStrength).color}`}>
                  {getRiskLevel(trendStrength).level}
                </span>
              </div>
              <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getRiskLevel(trendStrength).bgColor}`} 
                  style={{ width: `${trendStrength}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center">
                  <CoinsIcon className="h-3.5 w-3.5 mr-1.5 text-primary" />
                  <label className="text-xs font-medium">Liquidity Risk</label>
                </div>
                <span className={`text-xs ${getRiskLevel(liquidityRisk).color}`}>
                  {getRiskLevel(liquidityRisk).level}
                </span>
              </div>
              <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getRiskLevel(liquidityRisk).bgColor}`} 
                  style={{ width: `${liquidityRisk}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center">
                  <ShieldIcon className="h-3.5 w-3.5 mr-1.5 text-primary" />
                  <label className="text-xs font-medium">Correlation Risk</label>
                </div>
                <span className={`text-xs ${getRiskLevel(correlationRisk).color}`}>
                  {getRiskLevel(correlationRisk).level}
                </span>
              </div>
              <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getRiskLevel(correlationRisk).bgColor}`} 
                  style={{ width: `${correlationRisk}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Card className="border-0 shadow-sm bg-card/50">
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-xs font-medium flex items-center">
                  <ArrowDownRightIcon className="h-3.5 w-3.5 mr-1.5 text-red-500" />
                  Stop Loss
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <p className="text-base font-bold">${riskParams.stopLoss.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  {riskParams.stopLossPercentage.toFixed(1)}% below current price
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-card/50">
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-xs font-medium flex items-center">
                  <ArrowUpRightIcon className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                  Take Profit
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <p className="text-base font-bold">${riskParams.takeProfit.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">
                  {riskParams.takeProfitPercentage.toFixed(1)}% above current price
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="position" className="mt-4 space-y-4">
          <div className="flex justify-center mb-4">
            <div className="inline-flex rounded-md shadow-sm">
              <button
                onClick={() => setRiskTolerance('low')}
                className={`px-3 py-1.5 text-xs font-medium rounded-l-md border ${
                  riskTolerance === 'low' 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-background border-border'
                }`}
              >
                Conservative
              </button>
              <button
                onClick={() => setRiskTolerance('medium')}
                className={`px-3 py-1.5 text-xs font-medium border-y border-r ${
                  riskTolerance === 'medium' 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-background border-border'
                }`}
              >
                Moderate
              </button>
              <button
                onClick={() => setRiskTolerance('high')}
                className={`px-3 py-1.5 text-xs font-medium rounded-r-md border-y border-r ${
                  riskTolerance === 'high' 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-background border-border'
                }`}
              >
                Aggressive
              </button>
            </div>
          </div>
          
          <Card className="border-0 shadow-sm">
            <CardHeader className="p-3 pb-0">
              <CardTitle className="text-sm font-medium">Recommended Position Size</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs">$1,000 Portfolio</span>
                  <div className="text-right">
                    <span className="text-xs font-medium">${positionSizes.small.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({(positionSizes.small / 1000 * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">$10,000 Portfolio</span>
                  <div className="text-right">
                    <span className="text-xs font-medium">${positionSizes.medium.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({(positionSizes.medium / 10000 * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">$100,000 Portfolio</span>
                  <div className="text-right">
                    <span className="text-xs font-medium">${positionSizes.large.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({(positionSizes.large / 100000 * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <h4 className="text-xs font-medium mb-1">Risk Management Strategy</h4>
                <p className="text-xs text-muted-foreground">
                  Based on your {riskTolerance} risk tolerance, we recommend risking 
                  {riskTolerance === 'low' ? ' 1%' : riskTolerance === 'medium' ? ' 3%' : ' 5%'} 
                  of your portfolio per trade with a {riskParams.stopLossPercentage.toFixed(1)}% stop loss.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardHeader className="p-3 pb-0">
              <CardTitle className="text-sm font-medium">Risk/Reward Metrics</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Max Drawdown</div>
                  <div className="text-sm font-medium text-red-500">-{maxDrawdown.toFixed(1)}%</div>
                </div>
                <div className="text-center p-2 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Expected Return</div>
                  <div className="text-sm font-medium text-green-500">+{expectedReturn.toFixed(1)}%</div>
                </div>
                <div className="text-center p-2 bg-muted/30 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Risk/Reward</div>
                  <div className="text-sm font-medium">{riskRewardRatio.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="strategy" className="mt-4 space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="p-3 pb-0">
              <CardTitle className="text-sm font-medium">Risk Mitigation Strategies</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 p-1 rounded-full bg-primary/10">
                    <ShieldIcon className="h-3 w-3 text-primary" />
                  </div>
                  <div>
                    <h5 className="text-xs font-medium">Use Stop Loss Orders</h5>
                    <p className="text-xs text-muted-foreground">
                      Set a stop loss at ${riskParams.stopLoss.toFixed(2)} to limit potential losses.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 p-1 rounded-full bg-primary/10">
                    <DollarSignIcon className="h-3 w-3 text-primary" />
                  </div>
                  <div>
                    <h5 className="text-xs font-medium">Position Sizing</h5>
                    <p className="text-xs text-muted-foreground">
                      Limit position size to {riskTolerance === 'low' ? '1%' : riskTolerance === 'medium' ? '3%' : '5%'} of your portfolio.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 p-1 rounded-full bg-primary/10">
                    <BarChart3Icon className="h-3 w-3 text-primary" />
                  </div>
                  <div>
                    <h5 className="text-xs font-medium">Diversification</h5>
                    <p className="text-xs text-muted-foreground">
                      {correlationRisk > 70 ? 
                        `${asset.name} has high correlation with the market. Consider diversifying with uncorrelated assets.` : 
                        `${asset.name} has moderate correlation with the market, providing some diversification benefits.`}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardHeader className="p-3 pb-0">
              <CardTitle className="text-sm font-medium">Volatility Analysis</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs">Daily Volatility</span>
                  <span className="text-xs font-medium">{(volatilityRisk / 10).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Weekly Range (Est.)</span>
                  <span className="text-xs font-medium">±{(volatilityRisk / 10 * 2.5).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">Monthly Range (Est.)</span>
                  <span className="text-xs font-medium">±{(volatilityRisk / 10 * 5).toFixed(1)}%</span>
                </div>
                
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="text-xs text-muted-foreground mb-1">Volatility Comparison</div>
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span className="text-xs inline-block py-0.5 px-1 rounded-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          {asset.symbol.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold">{(volatilityRisk / 10).toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span className="text-xs inline-block py-0.5 px-1 rounded-sm bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                          BTC
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold">{(3 + Math.random() * 2).toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span className="text-xs inline-block py-0.5 px-1 rounded-sm bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                          S&P 500
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold">{(0.5 + Math.random() * 0.5).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}