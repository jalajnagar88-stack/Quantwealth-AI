import mongoose from 'mongoose';

export const connectDB = async () => {
  // 1 = connected, 2 = connecting
  if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) return;
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quantwealth';
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 20000,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    // Don't process.exit in serverless — let the request fail gracefully
  }
};
