"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getTopCryptos } from '../lib/api';
import { CryptoAsset } from '../types/market';
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MarketOverviewProps {
  onAssetSelect?: (asset: CryptoAsset) => void;
}

export default function MarketOverview({ onAssetSelect }: MarketOverviewProps) {
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid'); 
  const [showAll, setShowAll] = useState(true); 
  
  // Define major cryptocurrencies to prioritize
  const majorCryptos = ['bitcoin', 'ethereum', 'binancecoin', 'solana', 'ripple', 'cardano', 'polkadot', 'dogecoin', 'avalanche-2', 'tron'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getTopCryptos();
        setAssets(data);
      } catch (error) {
        console.error('Error fetching market data:', error);
        // Show a user-friendly error message
        alert('Failed to load market data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Sort assets to prioritize major cryptocurrencies
  const sortedAssets = [...assets].sort((a, b) => {
    const aIsMajor = majorCryptos.includes(a.id);
    const bIsMajor = majorCryptos.includes(b.id);
    
    if (aIsMajor && !bIsMajor) return -1;
    if (!aIsMajor && bIsMajor) return 1;
    return 0;
  });

  // Display only major cryptos or all based on showAll state
  const displayAssets = showAll ? sortedAssets : sortedAssets.filter(asset => 
    majorCryptos.includes(asset.id)
  );

  // Render loading spinner
  if (loading) {
    return (
      <Card className="w-full h-full shadow-md border-primary/10">
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-base flex items-center">
            <TrendingUpIcon className="h-4 w-4 text-primary mr-1" />
            Market Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full shadow-md border-primary/10">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-1">
            <TrendingUpIcon className="h-4 w-4 text-primary" />
            <span>Market Overview</span>
          </div>
          <div className="flex items-center gap-2">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'grid')} className="w-[180px]">
              <TabsList className="h-8 w-full">
                <TabsTrigger value="grid" className="h-6 text-xs">Grid View</TabsTrigger>
                <TabsTrigger value="list" className="h-6 text-xs">List View</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowAll(!showAll)}
              className="h-6 px-2 text-xs"
            >
              {showAll ? 'Show Less' : 'Show More'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {viewMode === 'grid' ? (
          <ScrollArea className="h-[500px]">
            <div className="grid grid-cols-2 p-3 gap-3">
              {displayAssets.map((asset) => (
                <div 
                  key={asset.id} 
                  className="rounded-lg border bg-card p-3 hover:border-primary/50 cursor-pointer transition-all shadow-sm hover:shadow-md"
                  onClick={() => onAssetSelect && onAssetSelect(asset)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={asset.image}
                        alt={asset.name}
                        className="w-8 h-8"
                      />
                      <div>
                        <h3 className="font-medium">{asset.symbol.toUpperCase()}</h3>
                        <p className="text-xs text-muted-foreground truncate max-w-[100px]">
                          {asset.name}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        asset.price_change_percentage_24h >= 0
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {asset.price_change_percentage_24h >= 0 ? '+' : ''}
                      {asset.price_change_percentage_24h.toFixed(2)}%
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="font-semibold text-lg">${asset.current_price.toLocaleString()}</p>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">24h Vol</span>
                        <span className="text-xs">${(asset.total_volume / 1000000).toFixed(1)}M</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-muted-foreground">Market Cap</span>
                        <span className="text-xs">${(asset.market_cap / 1000000000).toFixed(1)}B</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="divide-y divide-border">
              {displayAssets.map((asset) => (
                <div 
                  key={asset.id} 
                  className="p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => onAssetSelect && onAssetSelect(asset)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={asset.image}
                        alt={asset.name}
                        className="w-6 h-6"
                      />
                      <div>
                        <h3 className="font-medium text-sm">{asset.symbol.toUpperCase()}</h3>
                        <p className="text-xs text-muted-foreground">
                          {asset.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">${asset.current_price.toLocaleString()}</p>
                      <p
                        className={`text-xs flex items-center justify-end ${
                          asset.price_change_percentage_24h >= 0
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}
                      >
                        {asset.price_change_percentage_24h >= 0 ? (
                          <ArrowUpIcon className="h-3 w-3 mr-0.5" />
                        ) : (
                          <ArrowDownIcon className="h-3 w-3 mr-0.5" />
                        )}
                        {Math.abs(asset.price_change_percentage_24h).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}