import express from 'express';
import { requireAuth } from '@clerk/express';
import SavedIdea from '../models/SavedIdea.js';

const router = express.Router();

// Save an idea (title or thumbnail)
router.post('/save-idea', requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const {
      type,
      videoId,
      title,
      thumbnailUrl,
      views,
      ctrScore,
      engagementRate,
      channelTitle,
      channelId,
      description,
      tags,
      notes,
    } = req.body;

    console.log('[Save Idea] Saving idea:', { type, title, userId });

    if (!type || !title) {
      return res.status(400).json({
        error: 'type and title are required',
      });
    }

    if (!['title', 'thumbnail'].includes(type)) {
      return res.status(400).json({
        error: 'type must be either "title" or "thumbnail"',
      });
    }

    // Create new saved idea
    const savedIdea = new SavedIdea({
      userId,
      type,
      videoId,
      title,
      thumbnailUrl,
      views,
      ctrScore,
      engagementRate,
      channelTitle,
      channelId,
      description,
      tags,
      notes,
    });

    await savedIdea.save();

    console.log('[Save Idea] Idea saved successfully:', savedIdea._id);

    res.json({
      message: 'Idea saved successfully',
      data: {
        id: savedIdea._id,
        ...savedIdea.toObject(),
      },
    });
  } catch (error) {
    console.error('[Save Idea] Error:', error.message);
    res.status(500).json({
      error: 'Failed to save idea',
      message: error.message,
    });
  }
});

// Get all saved ideas for a user
router.get('/saved-ideas', requireAuth(), async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { type } = req.query;

    console.log('[Get Saved Ideas] Fetching ideas for user:', userId, 'type:', type);

    const query = { userId };
    if (type && ['title', 'thumbnail'].includes(type)) {
      query.type = type;
    }

    const savedIdeas = await SavedIdea.find(query).sort({ createdAt: -1 });

    console.log('[Get Saved Ideas] Found', savedIdeas.length, 'ideas');

    res.json({
      message: 'Saved ideas retrieved',
      data: {
        ideas: savedIdeas,
        total: savedIdeas.length,
        titles: savedIdeas.filter(i => i.type === 'title'),
        thumbnails: savedIdeas.filter(i => i.type === 'thumbnail'),
      },
    });
  } catch (error) {
    console.error('[Get Saved Ideas] Error:', error.message);
    res.status(500).json({
      error: 'Failed to retrieve saved ideas',
      message: error.message,
    });
  }
});

// Delete a saved idea
router.delete('/saved-idea/:id', requireAuth(), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.auth.userId;

    console.log('[Delete Saved Idea] Deleting idea:', id, 'for user:', userId);

    const deletedIdea = await SavedIdea.findOneAndDelete({
      _id: id,
      userId: userId,
    });

    if (!deletedIdea) {
      return res.status(404).json({
        error: 'Idea not found or you do not have permission to delete it',
      });
    }

    console.log('[Delete Saved Idea] Idea deleted successfully');

    res.json({
      message: 'Idea deleted successfully',
      data: {
        id: deletedIdea._id,
      },
    });
  } catch (error) {
    console.error('[Delete Saved Idea] Error:', error.message);
    res.status(500).json({
      error: 'Failed to delete idea',
      message: error.message,
    });
  }
});

export default router;
