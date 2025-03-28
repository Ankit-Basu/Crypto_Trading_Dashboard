import { RSI, MACD, BollingerBands } from 'technicalindicators';

export function calculateRSI(prices: number[], period: number = 14): number[] {
  if (!Array.isArray(prices) || prices.length < period) {
    throw new Error(`RSI calculation requires at least ${period} data points`);
  }

  const validPrices = prices.map(p => typeof p === 'number' ? p : parseFloat(p));
  if (validPrices.some(p => isNaN(p))) {
    throw new Error('Invalid price data for RSI calculation');
  }

  const input = {
    values: validPrices,
    period: period
  };
  return RSI.calculate(input);
}

export function calculateMACD(prices: number[]): {
  MACD: number[];
  signal: number[];
  histogram: number[];
} {
  if (!Array.isArray(prices) || prices.length < 26) {
    throw new Error('MACD calculation requires at least 26 data points');
  }

  const validPrices = prices.map(p => typeof p === 'number' ? p : parseFloat(p));
  if (validPrices.some(p => isNaN(p))) {
    throw new Error('Invalid price data for MACD calculation');
  }

  const input = {
    values: validPrices,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false
  };

  const results = MACD.calculate(input);
  if (!Array.isArray(results) || results.length === 0) {
    throw new Error('Failed to calculate MACD');
  }

  const macdValues: number[] = [];
  const signalValues: number[] = [];
  const histogramValues: number[] = [];

  for (const result of results) {
    if (typeof result.MACD === 'number' && 
        typeof result.signal === 'number' && 
        typeof result.histogram === 'number') {
      macdValues.push(result.MACD);
      signalValues.push(result.signal);
      histogramValues.push(result.histogram);
    }
  }

  return {
    MACD: macdValues,
    signal: signalValues,
    histogram: histogramValues
  };
}

export function calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2): {
  upper: number[];
  middle: number[];
  lower: number[];
} {
  if (!Array.isArray(prices) || prices.length < period) {
    throw new Error(`Bollinger Bands calculation requires at least ${period} data points`);
  }

  const validPrices = prices.map(p => typeof p === 'number' ? p : parseFloat(p));
  if (validPrices.some(p => isNaN(p))) {
    throw new Error('Invalid price data for Bollinger Bands calculation');
  }

  const input = {
    values: validPrices,
    period: period,
    stdDev: stdDev
  };

  const results = BollingerBands.calculate(input);
  if (!Array.isArray(results) || results.length === 0) {
    throw new Error('Failed to calculate Bollinger Bands');
  }

  const upperValues: number[] = [];
  const middleValues: number[] = [];
  const lowerValues: number[] = [];

  for (const result of results) {
    if (typeof result.upper === 'number' && 
        typeof result.middle === 'number' && 
        typeof result.lower === 'number') {
      upperValues.push(result.upper);
      middleValues.push(result.middle);
      lowerValues.push(result.lower);
    }
  }

  return {
    upper: upperValues,
    middle: middleValues,
    lower: lowerValues
  };
}

export function calculateMovingAverages(prices: number[]): { ma20: number; ma50: number; ma200: number } {
  const calculateMA = (period: number): number => {
    if (prices.length < period) {
      return 0;
    }
    const slice = prices.slice(-period);
    const sum = slice.reduce((a, b) => a + b, 0);
    return sum / period;
  };

  return {
    ma20: calculateMA(20),
    ma50: calculateMA(50),
    ma200: calculateMA(200)
  };
}