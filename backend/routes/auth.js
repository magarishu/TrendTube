import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      username: username || email.split('@')[0],
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Verify token
router.post('/verify', (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({
      message: 'Token is valid',
      user: {
        userId: decoded.userId,
        email: decoded.email,
      },
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token is required' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Add video to favorites
router.post('/favorites/add', verifyToken, async (req, res) => {
  try {
    const { videoId, title, channel, thumbnail, views, duration, publishedAt } = req.body;

    if (!videoId || !title) {
      return res.status(400).json({ error: 'videoId and title are required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if video is already in favorites
    const isAlreadyFavorite = user.favoriteVideos.some(id => id.toString() === videoId);
    if (isAlreadyFavorite) {
      return res.status(400).json({ error: 'Video is already in favorites' });
    }

    // Store the favorite with metadata
    if (!user.favoriteVideosMetadata) {
      user.favoriteVideosMetadata = [];
    }

    user.favoriteVideosMetadata.push({
      videoId,
      title,
      channel,
      thumbnail,
      views,
      duration,
      publishedAt,
      addedAt: new Date(),
    });

    await user.save();

    res.json({
      message: 'Video added to favorites',
      data: { videoId },
    });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ error: 'Failed to add video to favorites' });
  }
});

// Remove video from favorites
router.post('/favorites/remove', verifyToken, async (req, res) => {
  try {
    const { videoId } = req.body;

    if (!videoId) {
      return res.status(400).json({ error: 'videoId is required' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove from metadata
    if (user.favoriteVideosMetadata) {
      user.favoriteVideosMetadata = user.favoriteVideosMetadata.filter(
        fav => fav.videoId !== videoId
      );
    }

    await user.save();

    res.json({
      message: 'Video removed from favorites',
      data: { videoId },
    });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({ error: 'Failed to remove video from favorites' });
  }
});

// Get user's favorite videos
router.get('/favorites', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const favorites = user.favoriteVideosMetadata || [];

    res.json({
      message: 'Favorite videos retrieved',
      data: {
        favorites,
        total: favorites.length,
      },
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorite videos' });
  }
});

// Check if video is in favorites
router.get('/favorites/check/:videoId', verifyToken, async (req, res) => {
  try {
    const { videoId } = req.params;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isFavorite = user.favoriteVideosMetadata?.some(fav => fav.videoId === videoId) || false;

    res.json({
      data: { isFavorite, videoId },
    });
  } catch (error) {
    console.error('Error checking favorite:', error);
    res.status(500).json({ error: 'Failed to check favorite status' });
  }
});

export default router;
