import express from 'express';
import axios from 'axios';
import cacheMiddleware from '../utils/cacheMiddleware.js';

const router = express.Router();
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

// Search videos on YouTube (Cached for 15 minutes)
router.get('/search', cacheMiddleware(900), async (req, res) => {
  try {
    const { query, maxResults = 50, pageToken } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const params = {
      part: 'snippet',
      q: query,
      maxResults: Math.min(parseInt(maxResults), 50), // Max 50 per request
      type: 'video',
      key: YOUTUBE_API_KEY,
    };

    if (pageToken) {
      params.pageToken = pageToken;
    }

    const response = await axios.get(`${YOUTUBE_API_BASE}/search`, { params });

    res.json({
      message: 'YouTube search results',
      data: response.data.items,
      total: response.data.pageInfo.totalResults,
      nextPageToken: response.data.pageInfo.nextPageToken,
      prevPageToken: response.data.pageInfo.prevPageToken,
    });
  } catch (error) {
    console.error('YouTube API Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to search YouTube',
      message: error.message 
    });
  }
});

// Search for YouTube Channels
router.get('/search-channel', async (req, res) => {
  try {
    const { q, maxResults = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Query parameter (q) is required' });
    }

    if (!YOUTUBE_API_KEY) {
      return res.status(500).json({ error: 'YouTube API key not configured' });
    }

    const params = {
      part: 'snippet',
      type: 'channel',
      q: q,
      maxResults: Math.min(parseInt(maxResults), 50),
      key: YOUTUBE_API_KEY,
    };

    const response = await axios.get(`${YOUTUBE_API_BASE}/search`, { params });

    if (!response.data.items || response.data.items.length === 0) {
      return res.json({
        message: 'No channels found',
        data: [],
        total: 0,
      });
    }

    // Extract channel IDs and fetch full channel info for better data
    const channelIds = response.data.items.map(item => item.id.channelId).join(',');

    const channelResponse = await axios.get(`${YOUTUBE_API_BASE}/channels`, {
      params: {
        part: 'snippet,statistics',
        id: channelIds,
        key: YOUTUBE_API_KEY,
      },
    });

    res.json({
      message: 'YouTube channel search results',
      data: channelResponse.data.items.map(channel => ({
        channelId: channel.id,
        title: channel.snippet.title,
        description: channel.snippet.description,
        thumbnail: channel.snippet.thumbnails.medium?.url || channel.snippet.thumbnails.default?.url,
        subscriberCount: channel.statistics.subscriberCount,
        viewCount: channel.statistics.viewCount,
        videoCount: channel.statistics.videoCount,
        customUrl: channel.snippet.customUrl,
      })),
      total: response.data.pageInfo.totalResults,
      nextPageToken: response.data.pageInfo.nextPageToken,
    });
  } catch (error) {
    console.error('YouTube Channel Search Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to search YouTube channels',
      message: error.message 
    });
  }
});

// Get video statistics (Cached for 1 hour)
router.get('/video/:videoId', cacheMiddleware(3600), async (req, res) => {
  try {
    const { videoId } = req.params;

    const response = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
      params: {
        part: 'snippet,statistics,contentDetails',
        id: videoId,
        key: YOUTUBE_API_KEY,
      },
    });

    if (response.data.items.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json({
      message: 'Video details',
      data: response.data.items[0],
    });
  } catch (error) {
    console.error('YouTube API Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch video',
      message: error.message 
    });
  }
});

// Get channel information (Cached for 1 hour)
router.get('/channel/:channelId', cacheMiddleware(3600), async (req, res) => {
  try {
    const { channelId } = req.params;

    const response = await axios.get(`${YOUTUBE_API_BASE}/channels`, {
      params: {
        part: 'snippet,statistics,contentDetails',
        id: channelId,
        key: YOUTUBE_API_KEY,
      },
    });

    if (response.data.items.length === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    res.json({
      message: 'Channel details',
      data: response.data.items[0],
    });
  } catch (error) {
    console.error('YouTube API Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch channel',
      message: error.message 
    });
  }
});

// Get channel videos (Cached for 15 minutes)
router.get('/channel/:channelId/videos', cacheMiddleware(900), async (req, res) => {
  try {
    const { channelId } = req.params;
    const { maxResults = 50, pageToken } = req.query;

    // First get the channel's upload playlist
    const channelResponse = await axios.get(`${YOUTUBE_API_BASE}/channels`, {
      params: {
        part: 'contentDetails',
        id: channelId,
        key: YOUTUBE_API_KEY,
      },
    });

    const uploadsPlaylistId = channelResponse.data.items[0].contentDetails.relatedPlaylists.uploads;

    // Then get videos from that playlist
    const params = {
      part: 'snippet',
      playlistId: uploadsPlaylistId,
      maxResults: Math.min(parseInt(maxResults), 50), // Max 50 per request
      key: YOUTUBE_API_KEY,
    };

    if (pageToken) {
      params.pageToken = pageToken;
    }

    const videosResponse = await axios.get(`${YOUTUBE_API_BASE}/playlistItems`, { params });

    res.json({
      message: 'Channel videos',
      data: videosResponse.data.items,
      total: videosResponse.data.pageInfo.totalResults,
      nextPageToken: videosResponse.data.pageInfo.nextPageToken,
      prevPageToken: videosResponse.data.pageInfo.prevPageToken,
    });
  } catch (error) {
    console.error('YouTube API Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch channel videos',
      message: error.message 
    });
  }
});

// Get trending videos (Cached for 30 minutes)
router.get('/trending', cacheMiddleware(1800), async (req, res) => {
  try {
    const { regionCode = 'US', maxResults = 50, pageToken } = req.query;

    const params = {
      part: 'snippet,statistics',
      chart: 'mostPopular',
      regionCode: regionCode,
      maxResults: Math.min(parseInt(maxResults), 50), // Max 50 per request
      key: YOUTUBE_API_KEY,
    };

    if (pageToken) {
      params.pageToken = pageToken;
    }

    const response = await axios.get(`${YOUTUBE_API_BASE}/videos`, { params });

    res.json({
      message: 'Trending videos',
      data: response.data.items,
      total: response.data.pageInfo.totalResults,
      nextPageToken: response.data.pageInfo.nextPageToken,
      prevPageToken: response.data.pageInfo.prevPageToken,
    });
  } catch (error) {
    console.error('YouTube API Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch trending videos',
      message: error.message 
    });
  }
});

// Get dashboard analytics with trending data
router.get('/dashboard', async (req, res) => {
  try {
    const { 
      regionCode = 'US', 
      categoryId = '',
      maxResults = 50
    } = req.query;

    console.log('[Dashboard] Fetching trending videos for dashboard');

    // Fetch trending videos
    const params = {
      part: 'snippet,statistics',
      chart: 'mostPopular',
      regionCode: regionCode,
      maxResults: Math.min(parseInt(maxResults), 50),
      key: YOUTUBE_API_KEY,
    };

    if (categoryId) {
      params.videoCategoryId = categoryId;
    }

    const response = await axios.get(`${YOUTUBE_API_BASE}/videos`, { params });
    const videos = response.data.items || [];

    console.log(`[Dashboard] Fetched ${videos.length} trending videos`);

    // Process videos to calculate metrics
    const processedVideos = videos.map(video => {
      const views = parseInt(video.statistics.viewCount) || 0;
      const likes = parseInt(video.statistics.likeCount) || 0;
      const comments = parseInt(video.statistics.commentCount) || 0;
      const engagementRate = views > 0 ? ((likes + comments) / views) : 0;

      return {
        videoId: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        channelTitle: video.snippet.channelTitle,
        channelId: video.snippet.channelId,
        publishedAt: video.snippet.publishedAt,
        thumbnail: video.snippet.thumbnails.medium?.url || '',
        categoryId: video.snippet.categoryId,
        views,
        likes,
        comments,
        engagementRate,
        engagementPercent: (engagementRate * 100).toFixed(2),
      };
    });

    // Group by category
    const categoryData = {};
    const categoryNames = {
      '1': 'Film',
      '2': 'Autos',
      '10': 'Music',
      '15': 'Pets',
      '17': 'Sports',
      '18': 'Short Movies',
      '19': 'Travel',
      '20': 'Gaming',
      '21': 'Videoblogging',
      '22': 'People',
      '23': 'Comedy',
      '24': 'Entertainment',
      '25': 'News',
      '26': 'Howto',
      '27': 'Education',
      '28': 'Science',
      '29': 'Technology',
      '30': 'Movies',
      '31': 'Anime',
      '32': 'Action',
      '33': 'Classics',
      '34': 'Comedy',
      '35': 'Documentary',
      '36': 'Drama',
      '37': 'Family',
      '38': 'Foreign',
      '39': 'Horror',
      '40': 'Sci-Fi',
      '41': 'Thriller',
      '42': 'Shorts',
      '43': 'Shows',
      '44': 'Trailers',
    };

    processedVideos.forEach(video => {
      const catId = video.categoryId;
      const catName = categoryNames[catId] || `Category ${catId}`;
      
      if (!categoryData[catName]) {
        categoryData[catName] = 0;
      }
      categoryData[catName]++;
    });

    // Extract keywords from titles and descriptions
    const allText = processedVideos
      .map(v => `${v.title} ${v.description}`)
      .join(' ')
      .toLowerCase();

    // Simple keyword extraction (remove common words)
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
      'is', 'was', 'are', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this',
      'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
    ]);

    const words = allText.match(/\b\w+\b/g) || [];
    const frequency = {};

    words.forEach(word => {
      if (word.length > 3 && !commonWords.has(word)) {
        frequency[word] = (frequency[word] || 0) + 1;
      }
    });

    const trendingKeywords = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([keyword, count]) => ({ keyword, count }));

    // Find fastest growing (highest views)
    const fastestGrowing = processedVideos
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // Find top channels
    const channelStats = {};
    processedVideos.forEach(video => {
      if (!channelStats[video.channelTitle]) {
        channelStats[video.channelTitle] = {
          channelTitle: video.channelTitle,
          channelId: video.channelId,
          count: 0,
          totalViews: 0,
          avgEngagement: 0,
        };
      }
      channelStats[video.channelTitle].count++;
      channelStats[video.channelTitle].totalViews += video.views;
    });

    const topChannels = Object.values(channelStats)
      .map(ch => ({
        ...ch,
        avgEngagement: (ch.totalViews / ch.count > 0) ? (ch.totalViews / ch.count).toFixed(0) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate overall stats
    const totalViews = processedVideos.reduce((sum, v) => sum + v.views, 0);
    const totalLikes = processedVideos.reduce((sum, v) => sum + v.likes, 0);
    const avgEngagement = processedVideos.length > 0
      ? (processedVideos.reduce((sum, v) => sum + v.engagementRate, 0) / processedVideos.length) * 100
      : 0;

    // Generate trend volume data (mock time series for chart)
    const categories = Object.keys(categoryData).slice(0, 5);
    const trendVolumeData = [
      { date: '6 days ago', ...Object.fromEntries(categories.map(cat => [cat.toLowerCase().replace(/\s+/g, ''), Math.floor(Math.random() * 30) + 10])) },
      { date: '5 days ago', ...Object.fromEntries(categories.map(cat => [cat.toLowerCase().replace(/\s+/g, ''), Math.floor(Math.random() * 35) + 12])) },
      { date: '4 days ago', ...Object.fromEntries(categories.map(cat => [cat.toLowerCase().replace(/\s+/g, ''), Math.floor(Math.random() * 40) + 15])) },
      { date: '3 days ago', ...Object.fromEntries(categories.map(cat => [cat.toLowerCase().replace(/\s+/g, ''), Math.floor(Math.random() * 45) + 18])) },
      { date: '2 days ago', ...Object.fromEntries(categories.map(cat => [cat.toLowerCase().replace(/\s+/g, ''), Math.floor(Math.random() * 50) + 20])) },
      { date: '1 day ago', ...Object.fromEntries(categories.map(cat => [cat.toLowerCase().replace(/\s+/g, ''), Math.floor(Math.random() * 55) + 22])) },
      { date: 'Today', ...categoryData },
    ];

    res.json({
      message: 'Dashboard analytics',
      data: {
        stats: {
          totalViews: formatNumber(totalViews),
          totalTrendingVideos: processedVideos.length,
          activeCreators: topChannels.length,
          avgEngagement: avgEngagement.toFixed(2),
        },
        categoryData,
        trendVolumeData,
        trendingKeywords,
        fastestGrowing,
        topChannels,
        allVideos: processedVideos,
      },
    });
  } catch (error) {
    console.error('Dashboard API Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard data',
      message: error.message 
    });
  }
});

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export default router;
