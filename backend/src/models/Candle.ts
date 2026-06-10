import mongoose, { Schema, Document } from 'mongoose';

interface ICandle extends Document {
  symbol: string;
  timeframe: '5m' | '15m' | '30m' | '1h' | '1d';
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  openTime: Date;
  closeTime: Date;
  complete: boolean;
}

const CandleSchema: Schema = new Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    index: true
  },
  timeframe: {
    type: String,
    enum: ['5m', '15m', '30m', '1h', '1d'],
    required: true,
    index: true
  },
  open: {
    type: Number,
    required: true
  },
  high: {
    type: Number,
    required: true
  },
  low: {
    type: Number,
    required: true
  },
  close: {
    type: Number,
    required: true
  },
  volume: {
    type: Number,
    required: true,
    default: 0
  },
  openTime: {
    type: Date,
    required: true,
    index: true
  },
  closeTime: {
    type: Date,
    required: true
  },
  complete: {
    type: Boolean,
    default: false
  }
});

// Composite index for efficient queries
CandleSchema.index({ symbol: 1, timeframe: 1, openTime: -1 });

// TTL: Keep data for 1 year
CandleSchema.index({ closeTime: 1 }, { expireAfterSeconds: 31536000 });

const Candle = mongoose.model<ICandle>('Candle', CandleSchema);

export default Candle;
