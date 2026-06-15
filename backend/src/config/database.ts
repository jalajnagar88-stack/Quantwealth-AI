import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quantwealth';
    await mongoose.connect(mongoURI);
    isConnected = true;
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    // Don't process.exit in serverless — let the request fail gracefully
  }
};
