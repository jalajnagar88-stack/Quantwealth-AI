import mongoose, { Schema, Document } from 'mongoose';

export interface IPaperTransaction extends Document {
  userId: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total: number;
  timestamp: Date;
  pnl?: number; // For SELL transactions
}

export interface IPaperHolding extends Document {
  userId: string;
  symbol: string;
  quantity: number;
  avgPrice: number;
  totalInvested: number;
  lastUpdated: Date;
}

export interface IPaperPortfolio extends Document {
  userId: string;
  cash: number;
  initialCapital: number;
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  tradeCount: number;
  winCount: number;
  lossCount: number;
  winRate: number;
  bestTrade?: { symbol: string; pnl: number; percent: number };
  worstTrade?: { symbol: string; pnl: number; percent: number };
  lastUpdated: Date;
  createdAt: Date;
}

const PaperTransactionSchema = new Schema<IPaperTransaction>({
  userId: { type: String, required: true, index: true },
  symbol: { type: String, required: true, uppercase: true },
  type: { type: String, enum: ['BUY', 'SELL'], required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  total: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  pnl: { type: Number },
});

const PaperHoldingSchema = new Schema<IPaperHolding>({
  userId: { type: String, required: true, index: true },
  symbol: { type: String, required: true, uppercase: true },
  quantity: { type: Number, required: true, min: 0 },
  avgPrice: { type: Number, required: true },
  totalInvested: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now },
});

PaperHoldingSchema.index({ userId: 1, symbol: 1 }, { unique: true });

const PaperPortfolioSchema = new Schema<IPaperPortfolio>({
  userId: { type: String, required: true, unique: true },
  cash: { type: Number, default: 100000 },
  initialCapital: { type: Number, default: 100000 },
  totalValue: { type: Number, default: 100000 },
  totalPnL: { type: Number, default: 0 },
  totalPnLPercent: { type: Number, default: 0 },
  tradeCount: { type: Number, default: 0 },
  winCount: { type: Number, default: 0 },
  lossCount: { type: Number, default: 0 },
  winRate: { type: Number, default: 0 },
  bestTrade: {
    symbol: String,
    pnl: Number,
    percent: Number,
  },
  worstTrade: {
    symbol: String,
    pnl: Number,
    percent: Number,
  },
  lastUpdated: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

export const PaperTransaction = mongoose.model<IPaperTransaction>('PaperTransaction', PaperTransactionSchema);
export const PaperHolding = mongoose.model<IPaperHolding>('PaperHolding', PaperHoldingSchema);
export const PaperPortfolio = mongoose.model<IPaperPortfolio>('PaperPortfolio', PaperPortfolioSchema);
