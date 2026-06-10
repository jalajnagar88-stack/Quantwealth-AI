import mongoose, { Schema, Document } from 'mongoose';

interface IMarketData extends Document {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  volume: number;
  timestamp: Date;
  open24h: number;
  high24h: number;
  low24h: number;
  change24h: number;
  changePercent24h: number;
}

const MarketDataSchema: Schema = new Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    index: true
  },
  price: {
    type: Number,
    required: true
  },
  bid: {
    type: Number,
    required: true
  },
  ask: {
    type: Number,
    required: true
  },
  volume: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  open24h: Number,
  high24h: Number,
  low24h: Number,
  change24h: Number,
  changePercent24h: Number
});

// TTL index: keep last 24 hours of data
MarketDataSchema.index({ timestamp: 1 }, { expireAfterSeconds: 86400 });

const MarketData = mongoose.model<IMarketData>('MarketData', MarketDataSchema);

export default MarketData;
