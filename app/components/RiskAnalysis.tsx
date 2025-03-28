"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CryptoAsset } from '../types/market';
import { AlertTriangleIcon, TrendingUpIcon, BarChart3Icon } from 'lucide-react';

interface RiskAnalysisProps {
  asset: CryptoAsset;
}

export default function RiskAnalysis({ asset }: RiskAnalysisProps) {
  // Mock risk calculations
  const volatilityRisk = Math.abs(asset.price_change_percentage_24h) * 2;
  const trendStrength = Math.min(Math.abs(asset.price_change_percentage_7d) * 3, 100);
  const marketSentiment = 50 + (asset.price_change_percentage_24h * 2);

  const getRiskLevel = (score: number) => {
    if (score < 30) return { level: 'Low', color: 'text-green-500' };
    if (score < 70) return { level: 'Moderate', color: 'text-yellow-500' };
    return { level: 'High', color: 'text-red-500' };
  };

  const suggestedStopLoss = asset.current_price * 0.95; // 5% below current price
  const suggestedTakeProfit = asset.current_price * 1.15; // 15% above current price

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangleIcon className="h-5 w-5" />
          Risk Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Volatility Risk</label>
                <span className={getRiskLevel(volatilityRisk).color}>
                  {getRiskLevel(volatilityRisk).level}
                </span>
              </div>
              <Progress value={volatilityRisk} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Trend Strength</label>
                <span className={getRiskLevel(trendStrength).color}>
                  {getRiskLevel(trendStrength).level}
                </span>
              </div>
              <Progress value={trendStrength} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Market Sentiment</label>
                <span className={getRiskLevel(marketSentiment).color}>
                  {getRiskLevel(marketSentiment).level}
                </span>
              </div>
              <Progress value={marketSentiment} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm">Suggested Stop Loss</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-xl font-bold">${suggestedStopLoss.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">5% below current price</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm">Suggested Take Profit</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-xl font-bold">${suggestedTakeProfit.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">15% above current price</p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-muted">
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Risk Assessment Summary</h4>
              <ul className="text-sm space-y-2">
                <li className="flex items-center gap-2">
                  <AlertTriangleIcon className="h-4 w-4" />
                  Volatility is {getRiskLevel(volatilityRisk).level.toLowerCase()}
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUpIcon className="h-4 w-4" />
                  Trend strength is {getRiskLevel(trendStrength).level.toLowerCase()}
                </li>
                <li className="flex items-center gap-2">
                  <BarChart3Icon className="h-4 w-4" />
                  Market sentiment is {getRiskLevel(marketSentiment).level.toLowerCase()}
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}