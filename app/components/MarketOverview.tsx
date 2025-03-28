"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTopCryptos } from '../lib/api';
import { CryptoAsset } from '../types/market';
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon } from 'lucide-react';

interface MarketOverviewProps {
  onAssetSelect?: (asset: CryptoAsset) => void;
}

export default function MarketOverview({ onAssetSelect }: MarketOverviewProps) {
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUpIcon className="h-6 w-6" />
          Market Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="gainers">Top Gainers</TabsTrigger>
            <TabsTrigger value="losers">Top Losers</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assets.map((asset) => (
                <Card 
                  key={asset.id} 
                  className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onAssetSelect && onAssetSelect(asset)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={asset.image}
                        alt={asset.name}
                        className="w-8 h-8"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{asset.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {asset.symbol.toUpperCase()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${asset.current_price.toLocaleString()}</p>
                        <p
                          className={`text-sm flex items-center ${
                            asset.price_change_percentage_24h >= 0
                              ? 'text-green-500'
                              : 'text-red-500'
                          }`}
                        >
                          {asset.price_change_percentage_24h >= 0 ? (
                            <ArrowUpIcon className="h-4 w-4" />
                          ) : (
                            <ArrowDownIcon className="h-4 w-4" />
                          )}
                          {Math.abs(asset.price_change_percentage_24h).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="gainers" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assets
                .filter(asset => asset.price_change_percentage_24h > 0)
                .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
                .map((asset) => (
                  <Card 
                    key={asset.id} 
                    className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onAssetSelect && onAssetSelect(asset)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <img
                          src={asset.image}
                          alt={asset.name}
                          className="w-8 h-8"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold">{asset.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {asset.symbol.toUpperCase()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${asset.current_price.toLocaleString()}</p>
                          <p className="text-sm flex items-center text-green-500">
                            <ArrowUpIcon className="h-4 w-4" />
                            {Math.abs(asset.price_change_percentage_24h).toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
          <TabsContent value="losers" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assets
                .filter(asset => asset.price_change_percentage_24h < 0)
                .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
                .map((asset) => (
                  <Card 
                    key={asset.id} 
                    className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onAssetSelect && onAssetSelect(asset)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <img
                          src={asset.image}
                          alt={asset.name}
                          className="w-8 h-8"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold">{asset.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {asset.symbol.toUpperCase()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${asset.current_price.toLocaleString()}</p>
                          <p className="text-sm flex items-center text-red-500">
                            <ArrowDownIcon className="h-4 w-4" />
                            {Math.abs(asset.price_change_percentage_24h).toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
        )}
      </CardContent>
    </Card>
  );
}