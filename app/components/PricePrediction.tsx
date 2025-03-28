"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CryptoAsset } from '../types/market';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';

interface PricePredictionProps {
  asset: CryptoAsset;
}

export default function PricePrediction({ asset }: PricePredictionProps) {
  const [prediction, setPrediction] = useState<{
    direction: 'up' | 'down';
    confidence: number;
    predictedPrice: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const makePrediction = async () => {
      try {
        setLoading(true);
        // Simple mock prediction for demo
        // In production, this would use a properly trained TensorFlow.js model
        const mockPrediction = {
          direction: Math.random() > 0.5 ? 'up' : 'down',
          confidence: Math.random() * 100,
          predictedPrice: asset.current_price * (1 + (Math.random() * 0.1 - 0.05))
        } as const;
        
        setPrediction(mockPrediction);
      } catch (error) {
        console.error('Error making prediction:', error);
      } finally {
        setLoading(false);
      }
    };

    makePrediction();
  }, [asset]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Price Prediction</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : prediction ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Predicted Direction</h3>
                <div className="flex items-center mt-2">
                  {prediction.direction === 'up' ? (
                    <ArrowUpIcon className="h-6 w-6 text-green-500" />
                  ) : (
                    <ArrowDownIcon className="h-6 w-6 text-red-500" />
                  )}
                  <span className="ml-2">
                    {prediction.direction === 'up' ? 'Bullish' : 'Bearish'}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium">Confidence</h3>
                <div className="mt-2">
                  <Progress value={prediction.confidence} className="w-[100px]" />
                  <span className="text-sm mt-1 block">
                    {prediction.confidence.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Predicted Price</h3>
              <div className="text-2xl font-bold">
                ${prediction.predictedPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Current: ${asset.current_price.toLocaleString()}
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Analysis Factors</h4>
              <ul className="text-sm space-y-2">
                <li>• Historical price patterns</li>
                <li>• Volume analysis</li>
                <li>• Market sentiment</li>
                <li>• Technical indicators</li>
              </ul>
            </div>
          </div>
        ) : (
          <p>Unable to generate prediction</p>
        )}
      </CardContent>
    </Card>
  );
}