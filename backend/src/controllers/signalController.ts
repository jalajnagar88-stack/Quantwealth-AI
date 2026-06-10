import { SignalGenerator } from '../services/SignalGenerator';
import Signal from '../models/Signal';

const signalGenerator = new SignalGenerator();

export const generateSignal = async (
  symbol: string,
  currentPrice: number,
  technicalData: any,
  sentimentScore: number,
  recentHistory: Array<{ close: number; volume: number }>
) => {
  try {
    // Generate signal using Claude
    const { signal, confidence, reasoning } = await signalGenerator.generateSignal(
      symbol,
      currentPrice,
      technicalData,
      sentimentScore,
      recentHistory
    );

    // Save signal to database
    const signalDoc = new Signal({
      symbol,
      currentPrice,
      signal,
      confidence,
      reasoning,
      technicalFactors: technicalData,
      sentimentScore,
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes expiry
    });

    await signalDoc.save();

    return {
      symbol,
      currentPrice,
      signal,
      confidence,
      reasoning,
      technicalFactors: technicalData,
      sentimentScore,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating signal:', error);
    throw error;
  }
};

export const getSignalHistory = async (symbol: string, limit: number = 10) => {
  try {
    const signals = await Signal.find({ symbol })
      .sort({ generatedAt: -1 })
      .limit(limit)
      .lean();

    return signals;
  } catch (error) {
    console.error('Error fetching signal history:', error);
    throw error;
  }
};
