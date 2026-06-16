import express from 'express';
import { requireAuth } from '@clerk/express';
import User from '../models/User.js';

const router = express.Router();

// Helper to sync Clerk user with MongoDB
const getOrCreateUser = async (clerkId) => {
  let user = await User.findOne({ clerkId });
  if (!user) {
    user = new User({ clerkId });
    await user.save();
  }
  return user;
};

// TEST ENDPOINT to figure out why 500 error happens
router.post('/test-favorite', async (req, res) => {
  try {
    const videoId = "test12345";
    const title = "Test title";
    const clerkId = "test_clerk_id_123";
    
    const user = await getOrCreateUser(clerkId);
    if (!user.favoriteVideosMetadata) user.favoriteVideosMetadata = [];
    user.favoriteVideosMetadata.push({
      videoId, title, channel: "Test", thumbnail: "Test", views: "10", duration: "10", publishedAt: "2023"
    });
    await user.save();
    res.json({ message: "Success", user });
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ error: error.message, stack: error.stack, name: error.name });
  }
});

// Add video to favorites
router.post('/favorites/add', requireAuth(), async (req, res) => {
  try {
    const { videoId, title, channel, thumbnail, views, duration, publishedAt } = req.body;

    if (!videoId || !title) {
      return res.status(400).json({ error: 'videoId and title are required' });
    }

    const user = await getOrCreateUser(req.auth.userId);

    // Check if video is already in favorites
    const isAlreadyFavorite = user.favoriteVideosMetadata?.some(fav => fav.videoId === videoId);
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
    res.status(500).json({ error: 'Failed to add video to favorites', details: error.message, stack: error.stack });
  }
});

// Remove video from favorites
router.post('/favorites/remove', requireAuth(), async (req, res) => {
  try {
    const { videoId } = req.body;

    if (!videoId) {
      return res.status(400).json({ error: 'videoId is required' });
    }

    const user = await getOrCreateUser(req.auth.userId);

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
    res.status(500).json({ error: 'Failed to remove video from favorites', details: error.message });
  }
});

// Get user's favorite videos
router.get('/favorites', requireAuth(), async (req, res) => {
  try {
    const user = await getOrCreateUser(req.auth.userId);
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
router.get('/favorites/check/:videoId', requireAuth(), async (req, res) => {
  try {
    const { videoId } = req.params;
    const user = await getOrCreateUser(req.auth.userId);

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
