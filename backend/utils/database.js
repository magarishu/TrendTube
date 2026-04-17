import mongoose from 'mongoose';

// Database utilities
export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.warn('⚠ MONGODB_URI is not defined in .env file');
      console.log('  → Server will start without database functionality');
      return null;
    }

    await mongoose.connect(mongoURI);

    console.log('✓ MongoDB Connected Successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('✗ MongoDB Connection Failed:', error.message);
    console.log('  → Server will start without database functionality');
    console.log('  → API endpoints that require MongoDB will return 503 Service Unavailable');
    return null;
  }
};

export const closeDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('✓ MongoDB Disconnected');
  } catch (error) {
    console.error('✗ Failed to disconnect from MongoDB:', error.message);
  }
};
