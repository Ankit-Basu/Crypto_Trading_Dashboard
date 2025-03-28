"use client";

import { useState, useRef, useEffect } from "react";
import MarketOverview from './MarketOverview';
import TechnicalAnalysis from './TechnicalAnalysis';
import PricePrediction from './PricePrediction';
import NewsAnalysis from './NewsAnalysis';
import RiskAnalysis from './RiskAnalysis';
import AITradingAssistant from './AITradingAssistant';
import TradingSimulator from './TradingSimulator';
import ChatbotAssistant from './ChatbotAssistant';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CryptoAsset } from '../types/market';

export default function Dashboard() {
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset | null>(null);
  const analysisRef = useRef<HTMLDivElement>(null);
  
  // Scroll to analysis section when an asset is selected
  useEffect(() => {
    if (selectedAsset && analysisRef.current) {
      analysisRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedAsset]);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold">Crypto Trading Assistant</h1>
        <p className="text-muted-foreground mt-2">AI-powered insights and analysis</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <MarketOverview onAssetSelect={setSelectedAsset} />
          
          {selectedAsset && (
            <div className="mt-8" ref={analysisRef}>
              <Tabs defaultValue="technical" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="technical">Technical Analysis</TabsTrigger>
                  <TabsTrigger value="prediction">AI Prediction</TabsTrigger>
                  <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
                  <TabsTrigger value="trading">AI Trading</TabsTrigger>
                  <TabsTrigger value="simulator">Trading Simulator</TabsTrigger>
                </TabsList>
                <TabsContent value="technical">
                  <TechnicalAnalysis asset={selectedAsset} />
                </TabsContent>
                <TabsContent value="prediction">
                  <PricePrediction asset={selectedAsset} />
                </TabsContent>
                <TabsContent value="risk">
                  <RiskAnalysis asset={selectedAsset} />
                </TabsContent>
                <TabsContent value="trading">
                  <AITradingAssistant asset={selectedAsset} />
                </TabsContent>
                <TabsContent value="simulator">
                  <TradingSimulator asset={selectedAsset} />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <NewsAnalysis />
          <ChatbotAssistant />
        </div>
      </div>
    </div>
  );
}