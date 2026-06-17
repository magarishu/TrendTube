import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { clerkMiddleware } from '@clerk/express';
import { connectDB, closeDB } from './utils/database.js';
import { initializeCronJobs, stopCronJobs } from './services/cronJobs.js';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import logger from './utils/logger.js';

// Route Imports
import authRoutes from './routes/auth.js';
import videoRoutes from './routes/videos.js';
import creatorRoutes from './routes/creators.js';
import categoryRoutes from './routes/categories.js';
import analyticsRoutes from './routes/analytics.js';
import youtubeRoutes from './routes/youtube.js';
import trendsRoutes from './routes/trends.js';
import geminiRoutes from './routes/gemini.js';
import collectRoutes from './routes/collect.js';
import videoAnalyzerRoutes from './routes/video.js';
import savedIdeasRoutes from './routes/savedIdeas.js';
// Load environment variables FIRST
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('Environment Check:');
console.log('YOUTUBE_API_KEY:', process.env.YOUTUBE_API_KEY ? 'SET' : 'NOT SET');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');

// Setup the app
const app = express();
const PORT = process.env.PORT || 5000;

// Security & Logging Middleware
app.use(helmet());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 5000 : 200, // High limit in dev
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for localhost during development
    const isLocalhost = req.ip === '::1' || req.ip === '127.0.0.1' || req.ip?.includes('::ffff:127.0.0.1');
    return process.env.NODE_ENV === 'development' && isLocalhost;
  },
  message: { error: 'Too many requests, please try again later.' }
});

// Middleware
app.use('/api', apiLimiter); // Apply rate limiter to all API routes

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      callback(null, true);
    } else if (origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(clerkMiddleware());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running' });
});

// Startup status endpoint
app.get('/api/startup-status', (req, res) => {
  res.json({
    status: 'Backend is operational',
    environment: {
      nodeEnv: process.env.NODE_ENV,
      port: PORT,
      youtubeApiKey: process.env.YOUTUBE_API_KEY ? 'configured' : 'NOT SET',
      geminiApiKey: process.env.GEMINI_API_KEY ? 'configured' : 'NOT SET',
      mongodbUri: process.env.MONGODB_URI ? 'configured' : 'NOT SET',
    },
    endpoints: {
      videoAnalyzer: '/api/video/analyze',
      videoDebug: '/api/video/debug',
      videoTest: '/api/video/test',
      health: '/api/health',
    },
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

// Connect to MongoDB immediately (Mongoose buffers queries until connected)
console.log('\n[Startup] Attempting MongoDB connection...');
connectDB().catch(err => console.error('[Startup Error]', err));

// Register Routes synchronously
console.log('[Startup] Registering routes...');
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/creators', creatorRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/trends', trendsRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/collect', collectRoutes);
app.use('/api/video', videoAnalyzerRoutes);
app.use('/api/saved-ideas', savedIdeasRoutes);
console.log('[Startup] ✓ All routes registered successfully');

// Start server only if not running on Vercel
if (!process.env.VERCEL) {
  const server = app.listen(PORT, () => {
    console.log(`\n✓ Server started successfully`);
    console.log(`  📍 Backend: http://localhost:${PORT}`);
    console.log(`  📍 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
    console.log(`  📊 Video Analyzer endpoint: http://localhost:${PORT}/api/video/analyze`);
    console.log(`  🔍 Debug endpoint: http://localhost:${PORT}/api/video/debug`);
    
    // Initialize cron jobs after server starts
    initializeCronJobs();
  });

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    stopCronJobs();
    server.close(async () => {
      await closeDB();
      process.exit(0);
    });
  });
}

export default app;
