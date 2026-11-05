import mongoose from 'mongoose';
import { MONGODB_URI } from './gameConfig.js';

let isConnected = false;
let isInMemoryFallback = false;

export const connectDB = async () => {
  if (isConnected) return;

  try {
    mongoose.set('strictQuery', false);
    // Attempt standard MongoDB connection with quick failover
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000
    });
    isConnected = true;
    console.log(`[Database] Successfully connected to Authoritative MongoDB at: ${MONGODB_URI}`);
  } catch (err) {
    console.warn(`[Database] MongoDB service unavailable (${err.message}). Activating built-in Authoritative In-Memory Game Store.`);
    isInMemoryFallback = true;
    isConnected = true;
  }
};

export const getDBStatus = () => ({
  connected: isConnected,
  isInMemoryFallback,
  uri: isInMemoryFallback ? 'in-memory://space_shooter_odyssey' : MONGODB_URI
});

