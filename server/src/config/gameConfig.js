import dotenv from 'dotenv';
dotenv.config();

export const GAME_NAME = process.env.GAME_NAME || "SPACE SHOOTER ODYSSEY";
export const PORT = process.env.PORT || 5000;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const JWT_SECRET = process.env.JWT_SECRET || 'space_shooter_jwt_dev_secret_2026';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/space_shooter_odyssey';

