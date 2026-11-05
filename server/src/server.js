import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { PORT, GAME_NAME, NODE_ENV } from './config/gameConfig.js';
import { connectDB, getDBStatus } from './config/db.js';
import apiRoutes from './routes/api.js';

const app = express();

// Security: Rate limiting for API defense against brute-force / spam
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // 200 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please slow down.' }
});

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use('/api', limiter);

// Dynamic Health & Environment Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    gameName: GAME_NAME,
    environment: NODE_ENV,
    database: getDBStatus(),
    timestamp: new Date().toISOString()
  });
});

// Mount Central API Routes
app.use('/api', apiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Start Server only when not in automated testing
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  ${GAME_NAME} - Authoritative Backend`);
    console.log(`  Server running at: http://localhost:${PORT}`);
    console.log(`  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
