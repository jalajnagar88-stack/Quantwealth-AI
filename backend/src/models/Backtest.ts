import mongoose, { Schema, Document } from 'mongoose';

export interface ITrade {
  date: Date;
  type: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
}

export interface IBacktest extends Document {
  userId: string;
  symbol: string;
  stockName: string;
  strategy: string;
  years: number;
  initialCapital: number;
  finalCapital: number;
  netProfit: number;
  roi: number;
  winRate: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalProfit: number;
  totalLoss: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  avgProfitPerTrade: number;
  equityCurve: number[];
  trades: ITrade[];
  createdAt: Date;
  updatedAt: Date;
}

const TradeSchema: Schema = new Schema({
  date: { type: Date, required: true },
  type: { type: String, enum: ['BUY', 'SELL'], required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  pnl: { type: Number, required: true },
  pnlPercent: { type: Number, required: true }
});

const BacktestSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  stockName: {
    type: String,
    required: true
  },
  strategy: {
    type: String,
    required: true,
    enum: ['RSI', 'MACD', 'MOVING_AVG', 'BREAKOUT', 'CUSTOM']
  },
  years: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  },
  initialCapital: {
    type: Number,
    required: true,
    min: 10000
  },
  finalCapital: {
    type: Number,
    required: true
  },
  netProfit: {
    type: Number,
    required: true
  },
  roi: {
    type: Number,
    required: true
  },
  winRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  totalTrades: {
    type: Number,
    required: true,
    default: 0
  },
  winningTrades: {
    type: Number,
    default: 0
  },
  losingTrades: {
    type: Number,
    default: 0
  },
  totalProfit: {
    type: Number,
    default: 0
  },
  totalLoss: {
    type: Number,
    default: 0
  },
  profitFactor: {
    type: Number,
    default: 0
  },
  sharpeRatio: {
    type: Number,
    default: 0
  },
  maxDrawdown: {
    type: Number,
    default: 0
  },
  avgProfitPerTrade: {
    type: Number,
    default: 0
  },
  equityCurve: [{
    type: Number
  }],
  trades: [TradeSchema]
}, {
  timestamps: true
});

// Indexes for efficient queries
BacktestSchema.index({ userId: 1, createdAt: -1 });
BacktestSchema.index({ userId: 1, symbol: 1 });
BacktestSchema.index({ strategy: 1 });

export default mongoose.model<IBacktest>('Backtest', BacktestSchema);
