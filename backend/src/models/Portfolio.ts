import mongoose, { Schema, Document } from 'mongoose';

export interface IHolding {
  symbol: string;
  qty: number;
  avgPrice: number;
  addedAt: Date;
}

export interface IPortfolio extends Document {
  userId: mongoose.Types.ObjectId;
  holdings: IHolding[];
}

const PortfolioSchema = new Schema<IPortfolio>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  holdings: [{
    symbol:   { type: String, required: true, uppercase: true, trim: true },
    qty:      { type: Number, required: true, min: 0 },
    avgPrice: { type: Number, required: true, min: 0 },
    addedAt:  { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model<IPortfolio>('Portfolio', PortfolioSchema);
