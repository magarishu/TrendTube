import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, closeDB } from './utils/database.js';
import { initializeCronJobs, stopCronJobs } from './services/cronJobs.js';

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

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests from localhost with any port during development
    if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
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

// Dynamically import routes after env is loaded
async function loadRoutes() {
  try {
    // Connect to MongoDB first (but don't fail if it's unavailable)
    console.log('\n[Startup] Attempting MongoDB connection...');
    const dbConnection = await connectDB();

    console.log('[Startup] Importing route modules...');
    const authRoutes = (await import('./routes/auth.js')).default;
    const videoRoutes = (await import('./routes/videos.js')).default;
    const creatorRoutes = (await import('./routes/creators.js')).default;
    const categoryRoutes = (await import('./routes/categories.js')).default;
    const analyticsRoutes = (await import('./routes/analytics.js')).default;
    const youtubeRoutes = (await import('./routes/youtube.js')).default;
    const trendsRoutes = (await import('./routes/trends.js')).default;
    const geminiRoutes = (await import('./routes/gemini.js')).default;
    const collectRoutes = (await import('./routes/collect.js')).default;
    const videoAnalyzerRoutes = (await import('./routes/video.js')).default;

    // Routes
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
    console.log('[Startup] ✓ All routes registered successfully');

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`\n✓ Server started successfully`);
      console.log(`  📍 Backend: http://localhost:${PORT}`);
      console.log(`  📍 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
      console.log(`  📊 Video Analyzer endpoint: http://localhost:${PORT}/api/video/analyze`);
      console.log(`  🔍 Debug endpoint: http://localhost:${PORT}/api/video/debug`);
      if (!dbConnection) {
        console.log(`  ⚠️  Database unavailable - some features may not work\n`);
      } else {
        console.log(`  ✓ Database connected\n`);
      }
      
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
  } catch (error) {
    console.error('[Startup Error]', error);
    process.exit(1);
  }
}

loadRoutes();
