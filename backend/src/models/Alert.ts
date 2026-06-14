import mongoose, { Schema, Document } from 'mongoose';

export interface IAlert extends Document {
  userId: mongoose.Types.ObjectId;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  note?: string;
  triggered: boolean;
  triggeredAt?: Date;
  createdAt: Date;
}

const AlertSchema = new Schema<IAlert>({
  userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  symbol:       { type: String, required: true, uppercase: true, trim: true },
  targetPrice:  { type: Number, required: true },
  condition:    { type: String, enum: ['above', 'below'], required: true },
  note:         { type: String },
  triggered:    { type: Boolean, default: false },
  triggeredAt:  { type: Date }
}, { timestamps: true });

export default mongoose.model<IAlert>('Alert', AlertSchema);
