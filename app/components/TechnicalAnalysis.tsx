"use client";
import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi } from 'lightweight-charts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Indicators {
  rsi: number;
  macd: {
    macdLine: number;
    signalLine: number;
    histogram: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
  movingAverages: {
    ma20: number;
    ma50: number;
    ma200: number;
  };
}

interface TechnicalAnalysisProps {
  asset: {
    id: string;
    name: string;
  };
}

export default function TechnicalAnalysis({ asset }: TechnicalAnalysisProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [indicators, setIndicators] = useState<Indicators | null>(null);
  const [chartData, setChartData] = useState<{ time: number; value: number }[]>([]);
  const chartRef = useRef<IChartApi | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/crypto/analysis/${asset.id}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch analysis data');
        }
        
        const data = await response.json();
        if (!data.prices || !data.indicators) {
          throw new Error('Invalid data format received from server');
        }

        setChartData(data.prices);
        setIndicators(data.indicators);
      } catch (error) {
        console.error('Error fetching technical data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch analysis data');
        // Clear previous data on error
        setChartData([]);
        setIndicators(null);
      } finally {
        setLoading(false);
      }
    };

    if (asset?.id) {
      fetchData();
    }
  }, [asset]);

  useEffect(() => {
    if (!chartContainerRef.current || !chartData || chartData.length === 0) {
      // Clear chart if no data
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      return;
    }

    // Clear previous chart if any
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }
    chartContainerRef.current.innerHTML = '';

    try {
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: '#D9D9D9',
        },
        grid: {
          vertLines: { color: '#2B2B43' },
          horzLines: { color: '#2B2B43' },
        },
        width: chartContainerRef.current.clientWidth,
        height: 400,
        timeScale: {
          timeVisible: true,
          borderColor: '#2B2B43',
        },
      });

      chartRef.current = chart;

      const mainSeries = chart.addLineSeries({
        color: '#2962FF',
        lineWidth: 2
      });

      mainSeries.setData(chartData);

      // Add Bollinger Bands if available
      if (indicators?.bollingerBands) {
        const bbUpper = chart.addLineSeries({
          color: 'rgba(76, 175, 80, 0.5)',
          lineWidth: 1
        });

        const bbLower = chart.addLineSeries({
          color: 'rgba(255, 82, 82, 0.5)',
          lineWidth: 1
        });

        const bbData = chartData.map((item) => ({
          time: item.time,
          value: indicators.bollingerBands.upper
        }));

        const bbLowerData = chartData.map((item) => ({
          time: item.time,
          value: indicators.bollingerBands.lower
        }));

        bbUpper.setData(bbData);
        bbLower.setData(bbLowerData);
      }

      // Add Moving Averages if available
      if (indicators?.movingAverages) {
        const ma20 = chart.addLineSeries({
          color: 'rgba(255, 235, 59, 0.7)',
          lineWidth: 1
        });
        
        const ma50 = chart.addLineSeries({
          color: 'rgba(233, 30, 99, 0.7)',
          lineWidth: 1
        });
        
        const ma200 = chart.addLineSeries({
          color: 'rgba(0, 188, 212, 0.7)',
          lineWidth: 1
        });
        
        const ma20Data = chartData.map((item) => ({
          time: item.time,
          value: indicators.movingAverages.ma20
        }));
        
        const ma50Data = chartData.map((item) => ({
          time: item.time,
          value: indicators.movingAverages.ma50
        }));
        
        const ma200Data = chartData.map((item) => ({
          time: item.time,
          value: indicators.movingAverages.ma200
        }));
        
        ma20.setData(ma20Data);
        ma50.setData(ma50Data);
        ma200.setData(ma200Data);
      }

      // Handle window resize
      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth
          });
        }
      };

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        if (chartRef.current) {
          chartRef.current.remove();
          chartRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error creating chart:', error);
    }
  }, [chartData, indicators]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative h-[400px]" ref={chartContainerRef} />
      {loading ? (
        <div className="flex items-center justify-center h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-[200px] text-destructive">
          <div className="text-center">
            <p className="font-medium">Error loading technical analysis</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
        </div>
      ) : indicators ? (
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-800 rounded-lg">
          {/* RSI */}
          <div>
            <h4 className="text-sm font-medium mb-2">RSI</h4>
            <p className={`text-lg font-bold ${
              indicators.rsi > 70 ? 'text-red-500' : 
              indicators.rsi < 30 ? 'text-green-500' : 
              'text-gray-300'
            }`}>
              {indicators.rsi.toFixed(2)}
            </p>
          </div>

          {/* MACD */}
          <div>
            <h4 className="text-sm font-medium mb-2">MACD</h4>
            <div className="space-y-1">
              <p className="text-xs">Line: {indicators.macd.macdLine.toFixed(2)}</p>
              <p className="text-xs">Signal: {indicators.macd.signalLine.toFixed(2)}</p>
              <p className={`text-xs ${
                indicators.macd.histogram > 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                Histogram: {indicators.macd.histogram.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Bollinger Bands */}
          <div>
            <h4 className="text-sm font-medium mb-2">Bollinger Bands</h4>
            <div className="space-y-1">
              <p className="text-xs">Upper: {indicators.bollingerBands.upper.toFixed(2)}</p>
              <p className="text-xs">Middle: {indicators.bollingerBands.middle.toFixed(2)}</p>
              <p className="text-xs">Lower: {indicators.bollingerBands.lower.toFixed(2)}</p>
            </div>
          </div>

          {/* Moving Averages */}
          <div>
            <h4 className="text-sm font-medium mb-2">Moving Averages</h4>
            <div className="space-y-1">
              <p className="text-xs">MA20: {indicators.movingAverages.ma20.toFixed(2)}</p>
              <p className="text-xs">MA50: {indicators.movingAverages.ma50.toFixed(2)}</p>
              <p className="text-xs">MA200: {indicators.movingAverages.ma200.toFixed(2)}</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}