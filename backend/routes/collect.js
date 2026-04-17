import express from 'express';
import { collectTrendingVideos, collectVideosByKeyword } from '../services/dataCollector.js';

const router = express.Router();

// Manually trigger trending videos collection
router.post('/trending', async (req, res) => {
  try {
    const { regionCode = 'US', maxResults = 50 } = req.body;

    console.log(`[Manual] Collecting trending videos from ${regionCode}...`);
    const count = await collectTrendingVideos(regionCode, maxResults);

    res.json({
      message: `✓ Successfully collected ${count} trending videos`,
      regionCode,
      count,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Manually trigger keyword collection
router.post('/keyword', async (req, res) => {
  try {
    const { keyword, maxResults = 50 } = req.body;

    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    console.log(`[Manual] Collecting videos for keyword: ${keyword}`);
    const count = await collectVideosByKeyword(keyword, maxResults);

    res.json({
      message: `✓ Successfully collected ${count} videos for keyword: ${keyword}`,
      keyword,
      count,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Collect multiple keywords at once
router.post('/keywords', async (req, res) => {
  try {
    const { keywords = [], maxResults = 30 } = req.body;

    if (!keywords || keywords.length === 0) {
      return res.status(400).json({ error: 'Keywords array is required' });
    }

    console.log(`[Manual] Collecting videos for ${keywords.length} keywords...`);
    const results = {};
    let totalCount = 0;

    for (const keyword of keywords) {
      try {
        const count = await collectVideosByKeyword(keyword, maxResults);
        results[keyword] = count;
        totalCount += count;
      } catch (error) {
        results[keyword] = `Error: ${error.message}`;
      }
    }

    res.json({
      message: `✓ Completed keyword collection`,
      totalVideos: totalCount,
      results,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
