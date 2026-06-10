import mongoose, { Schema, Document } from 'mongoose';

interface ISignal extends Document {
  symbol: string;
  currentPrice: number;
  signal: 'BUY' | 'SELL' | 'SKIP';
  confidence: number;
  reasoning: string;
  technicalFactors: {
    rsi?: number;
    macd?: number;
    bollingerBands?: {
      upper: number;
      middle: number;
      lower: number;
    };
    volumeAnomalyScore?: number;
  };
  sentimentScore: number;
  generatedAt: Date;
  expiresAt: Date;
  executedAt?: Date;
  executionPrice?: number;
  executionStatus?: 'pending' | 'executed' | 'expired' | 'rejected';
  pnl?: number;
  notes?: string;
}

const SignalSchema: Schema = new Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true
  },
  currentPrice: {
    type: Number,
    required: true
  },
  signal: {
    type: String,
    enum: ['BUY', 'SELL', 'SKIP'],
    required: true
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  reasoning: {
    type: String,
    required: true
  },
  technicalFactors: {
    rsi: Number,
    macd: Number,
    bollingerBands: {
      upper: Number,
      middle: Number,
      lower: Number
    },
    volumeAnomalyScore: Number
  },
  sentimentScore: {
    type: Number,
    default: 0
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  executedAt: Date,
  executionPrice: Number,
  executionStatus: {
    type: String,
    enum: ['pending', 'executed', 'expired', 'rejected'],
    default: 'pending'
  },
  pnl: Number,
  notes: String
});

// TTL index: automatically delete expired signals after 5 minutes
SignalSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Signal = mongoose.model<ISignal>('Signal', SignalSchema);

export default Signal;
