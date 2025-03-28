import { NextRequest, NextResponse } from 'next/server';
import { getCryptoHistory } from '@/app/lib/api';
import { calculateRSI, calculateMACD, calculateBollingerBands, calculateMovingAverages } from '@/app/lib/indicators';

export function generateStaticParams() {
  // When using 'output: export', we need to pre-define all possible route parameters
  // Include the most common cryptocurrency IDs
  return [
    { id: 'bitcoin' },
    { id: 'ethereum' },
    { id: 'ripple' },
    { id: 'cardano' },
    { id: 'solana' },
    { id: 'dogecoin' },
    { id: 'polkadot' },
    { id: 'litecoin' },
    { id: 'binancecoin' },
    { id: 'tether' }
  ];
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id.toLowerCase(); // CoinGecko requires lowercase IDs
    console.log('Fetching data for:', id);

    // Use daily data for the last 90 days instead of hourly
    const history = await getCryptoHistory(id, 90, 'daily');
    console.log('History response:', history);

    if (!history?.prices?.length) {
      console.error('No price data available for:', id);
      return NextResponse.json(
        { error: 'No price data available' },
        { status: 404 }
      );
    }

    // Format and validate prices
    const prices = history.prices
      .filter(([timestamp, price]) => 
        timestamp && typeof price === 'number' && !isNaN(price) && price > 0
      )
      .map(([timestamp, price]) => ({
        time: Math.floor(timestamp / 1000),
        value: price
      }));

    // Ensure we have enough data points for calculations
    if (prices.length < 26) { // MACD requires at least 26 points
      console.error('Insufficient data points for:', id);
      return NextResponse.json(
        { error: 'Insufficient data for analysis' },
        { status: 400 }
      );
    }

    const closePrices = prices.map(p => p.value);

    // Calculate indicators with proper error handling
    let rsi, macd, bb, ma;
    try {
      rsi = calculateRSI(closePrices);
      macd = calculateMACD(closePrices);
      bb = calculateBollingerBands(closePrices);
      ma = calculateMovingAverages(closePrices);

      // Validate indicator results
      if (!rsi?.length || !macd?.MACD?.length || !bb?.upper?.length) {
        throw new Error('Invalid indicator results');
      }
    } catch (error) {
      console.error('Error calculating indicators for:', id, error);
      return NextResponse.json(
        { error: 'Failed to calculate indicators' },
        { status: 500 }
      );
    }

    const response = {
      prices,
      indicators: {
        rsi: rsi[rsi.length - 1],
        macd: {
          macdLine: macd.MACD[macd.MACD.length - 1],
          signalLine: macd.signal[macd.signal.length - 1],
          histogram: macd.histogram[macd.histogram.length - 1]
        },
        bollingerBands: {
          upper: bb.upper[bb.upper.length - 1],
          middle: bb.middle[bb.middle.length - 1],
          lower: bb.lower[bb.lower.length - 1]
        },
        movingAverages: ma
      }
    };

    // Log a summary of the response instead of the full object to avoid console truncation
    console.log('Sending response with:', {
      pricePoints: prices.length,
      indicators: {
        rsi: rsi[rsi.length - 1].toFixed(2),
        macd: {
          macdLine: macd.MACD[macd.MACD.length - 1].toFixed(2),
          signalLine: macd.signal[macd.signal.length - 1].toFixed(2),
          histogram: macd.histogram[macd.histogram.length - 1].toFixed(2)
        },
        bollingerBands: {
          upper: bb.upper[bb.upper.length - 1].toFixed(2),
          middle: bb.middle[bb.middle.length - 1].toFixed(2),
          lower: bb.lower[bb.lower.length - 1].toFixed(2)
        },
        movingAverages: {
          ma20: ma.ma20.toFixed(2),
          ma50: ma.ma50.toFixed(2),
          ma200: ma.ma200.toFixed(2)
        }
      }
    });
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in analysis endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to analyze crypto data' },
      { status: 500 }
    );
  }
}
