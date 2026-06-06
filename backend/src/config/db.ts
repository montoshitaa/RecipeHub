import mongoose from 'mongoose';

const connectDB = async (retries = 3): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    const err = error as Error;
    console.error(`MongoDB connection error: ${err.message}`);
    if (retries > 0) {
      console.log(`Retrying... attempts left: ${retries}`);
      setTimeout(() => connectDB(retries - 1), 5000);
    } else {
      process.exit(1);
    }
  }
};

export default connectDB;
