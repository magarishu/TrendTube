import express from 'express';
import Video from '../models/Video.js';
import Channel from '../models/Channel.js';
import VideoMetrics from '../models/VideoMetrics.js';
import {
  getTrendingVideos,
  getTopChannels,
  getCategoryStats,
  getKeywordAnalysis,
  getVideoPerformanceTimeline,
  getDashboardStats,
  findOutlierVideos,
  generateRetentionCurve,
  getAverageViewDuration,
  estimateEarnings,
  findSimilarVideos,
  detectOutlierVideos,
  getEngagementTrends,
  getVideoVelocity,
  getVideoGrowthRate,
  calculateOutlierScore,
} from '../services/analytics.js';

const router = express.Router();

// Get dashboard with all analytics
router.get('/dashboard', async (req, res) => {
  try {
    const stats = await getDashboardStats();
    res.json({
      message: 'Dashboard analytics',
      data: stats,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get trending videos from database
router.get('/trending', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const trendingVideos = await getTrendingVideos(limit);

    res.json({
      message: 'Trending videos from database',
      data: trendingVideos,
      count: trendingVideos.length,
    });
  } catch (error) {
    console.error('Trending videos error:', error);
    res.status(500).json({ error: 'Failed to fetch trending videos' });
  }
});

// Get top channels
router.get('/top-channels', async (req, res) => {
  try {
    const metric = req.query.metric || 'subscribers';
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    const channels = await getTopChannels(metric, limit);

    res.json({
      message: `Top channels by ${metric}`,
      data: channels,
      count: channels.length,
    });
  } catch (error) {
    console.error('Top channels error:', error);
    res.status(500).json({ error: 'Failed to fetch top channels' });
  }
});

// Get category statistics
router.get('/categories', async (req, res) => {
  try {
    const stats = await getCategoryStats();

    res.json({
      message: 'Category statistics',
      data: stats,
      count: stats.length,
    });
  } catch (error) {
    console.error('Category stats error:', error);
    res.status(500).json({ error: 'Failed to fetch category statistics' });
  }
});

// Get keyword analysis
router.get('/keywords', async (req, res) => {
  try {
    const keywords = await getKeywordAnalysis();

    res.json({
      message: 'Keyword analysis',
      data: keywords,
      count: keywords.length,
    });
  } catch (error) {
    console.error('Keyword analysis error:', error);
    res.status(500).json({ error: 'Failed to fetch keyword analysis' });
  }
});

// Get outlier videos
router.get('/outliers', async (req, res) => {
  try {
    const threshold = parseFloat(req.query.threshold) || 5;
    const outliers = await findOutlierVideos(threshold);

    res.json({
      message: 'Outlier videos (performing above average)',
      data: outliers.map((o) => ({
        ...o.video.toObject(),
        outlierScore: o.outlierScore,
      })),
      count: outliers.length,
      threshold,
    });
  } catch (error) {
    console.error('Outliers error:', error);
    res.status(500).json({ error: 'Failed to fetch outlier videos' });
  }
});

// Get video performance over time
router.get('/video/:videoId/timeline', async (req, res) => {
  try {
    const { videoId } = req.params;
    const days = parseInt(req.query.days) || 30;

    const timeline = await getVideoPerformanceTimeline(videoId, days);
    const video = await Video.findOne({ videoId }).lean();

    res.json({
      message: 'Video performance timeline',
      video: video,
      timeline: timeline,
      days: days,
    });
  } catch (error) {
    console.error('Video timeline error:', error);
    res.status(500).json({ error: 'Failed to fetch video timeline' });
  }
});

// Search videos in database
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const videos = await Video.find({
      $or: [{ title: new RegExp(query, 'i') }, { tags: new RegExp(query, 'i') }],
    })
      .limit(limit)
      .lean();

    res.json({
      message: `Search results for "${query}"`,
      data: videos,
      count: videos.length,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search videos' });
  }
});

// Get video details
router.get('/video/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findOne({ videoId }).lean();

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const monthOfMetrics = await VideoMetrics.find({ videoId })
      .sort({ timestamp: -1 })
      .limit(30)
      .lean();

    res.json({
      message: 'Video details',
      data: {
        ...video,
        recentMetrics: monthOfMetrics,
      },
    });
  } catch (error) {
    console.error('Video details error:', error);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
});

// Get videos by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    const videos = await Video.find({ category })
      .sort({ views: -1 })
      .limit(limit)
      .lean();

    res.json({
      message: `Videos in category: ${category}`,
      data: videos,
      count: videos.length,
    });
  } catch (error) {
    console.error('Category videos error:', error);
    res.status(500).json({ error: 'Failed to fetch category videos' });
  }
});

// Get channel videos
router.get('/channel/:channelId/videos', async (req, res) => {
  try {
    const { channelId } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    const channel = await Channel.findOne({ channelId }).lean();
    const videos = await Video.find({ channelId })
      .sort({ views: -1 })
      .limit(limit)
      .lean();

    res.json({
      message: `Videos from channel: ${channel?.name || channelId}`,
      channel: channel,
      data: videos,
      count: videos.length,
    });
  } catch (error) {
    console.error('Channel videos error:', error);
    res.status(500).json({ error: 'Failed to fetch channel videos' });
  }
});

// Get database statistics
router.get('/stats', async (req, res) => {
  try {
    const totalVideos = await Video.countDocuments();
    const totalChannels = await Channel.countDocuments();
    const totalMetrics = await VideoMetrics.countDocuments();
    const oldestVideo = await Video.findOne().sort({ createdAt: 1 }).lean();
    const newestVideo = await Video.findOne().sort({ createdAt: -1 }).lean();

    res.json({
      message: 'Database statistics',
      data: {
        totalVideos,
        totalChannels,
        totalMetrics,
        oldestVideoDate: oldestVideo?.createdAt,
        newestVideoDate: newestVideo?.createdAt,
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// ===== NEW ANALYSIS ENDPOINTS =====

// Get audience retention analysis for a video
router.get('/video/:videoId/retention', async (req, res) => {
  try {
    const { videoId } = req.params;
    const video = await Video.findOne({ videoId }).lean();

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const retentionCurve = await generateRetentionCurve(videoId, video.duration || 600);
    const avgViewDuration = await getAverageViewDuration(videoId);

    res.json({
      message: 'Video audience retention analysis',
      videoId,
      title: video.title,
      retentionCurve,
      avgViewDuration,
      suggestions: {
        hookTime: '0-5 seconds - Hook viewers immediately',
        criticalDropoff: '20-40% - Reduce pacing drops',
        midpoint: '50% - Add pattern interrupt',
        engagement: 'Increase B-roll and graphics',
      },
    });
  } catch (error) {
    console.error('Retention analysis error:', error);
    res.status(500).json({ error: 'Failed to fetch retention data' });
  }
});

// Get earnings estimation for a video
router.get('/video/:videoId/earnings', async (req, res) => {
  try {
    const { videoId } = req.params;
    const video = await Video.findOne({ videoId }).lean();

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const views = parseInt(req.query.views) || video.views || 500000;
    const cpm = parseFloat(req.query.cpm) || null;
    const country = req.query.country || 'US';
    const niche = req.query.niche || 'tech';

    const earnings = estimateEarnings(views, cpm, country, niche);

    res.json({
      message: 'Video earnings estimation',
      videoId,
      title: video.title,
      views,
      country,
      niche,
      earnings,
    });
  } catch (error) {
    console.error('Earnings analysis error:', error);
    res.status(500).json({ error: 'Failed to calculate earnings' });
  }
});

// Get similar videos for a video
router.get('/video/:videoId/similar', async (req, res) => {
  try {
    const { videoId } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 6, 20);

    const video = await Video.findOne({ videoId }).lean();
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const similarVideos = await findSimilarVideos(videoId, limit);

    res.json({
      message: 'Similar videos',
      videoId,
      title: video.title,
      similarVideos,
      count: similarVideos.length,
    });
  } catch (error) {
    console.error('Similar videos error:', error);
    res.status(500).json({ error: 'Failed to find similar videos' });
  }
});

// Get outlier detection analysis
router.get('/video/:videoId/outlier-analysis', async (req, res) => {
  try {
    const { videoId } = req.params;
    const days = parseInt(req.query.days) || 7;

    const video = await Video.findOne({ videoId }).lean();
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const outlierScore = await calculateOutlierScore(video);
    const velocity = await getVideoVelocity(videoId, 24);
    const growthRate = await getVideoGrowthRate(videoId, days);
    const engagementTrends = await getEngagementTrends(days);

    res.json({
      message: 'Outlier detection analysis',
      videoId,
      title: video.title,
      analysis: {
        outlierScore: parseFloat(outlierScore.toFixed(2)),
        isOutlier: outlierScore > 1.5,
        velocity24h: velocity,
        growthRate: parseFloat(growthRate.toFixed(2)),
      },
      engagementTrends,
      timeframe: `${days} days`,
    });
  } catch (error) {
    console.error('Outlier analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze outliers' });
  }
});

// Get all outlier videos
router.get('/videos/outliers/list', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 6, 20);
    const outliers = await detectOutlierVideos(limit);

    const enriched = await Promise.all(
      outliers.map(async (video) => ({
        id: video.videoId,
        title: video.title,
        channel: video.channelName,
        views: video.views,
        engagement: parseFloat(video.engagementRate).toFixed(1),
        outlierScore: parseFloat(video.score.toFixed(2)),
        isOutlier: video.score > 1.5,
      }))
    );

    res.json({
      message: 'Outlier videos',
      outliers: enriched,
      count: enriched.length,
    });
  } catch (error) {
    console.error('Outliers list error:', error);
    res.status(500).json({ error: 'Failed to fetch outlier videos' });
  }
});

// Get engagement trends for multiple videos
router.get('/engagement-trends', async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days) || 7, 90);
    const trends = await getEngagementTrends(days);

    res.json({
      message: 'Engagement trends',
      trends,
      timeframe: `${days} days`,
      count: trends.length,
    });
  } catch (error) {
    console.error('Engagement trends error:', error);
    res.status(500).json({ error: 'Failed to fetch engagement trends' });
  }
});

// Get creators with filtering and sorting
router.get('/creators', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const sortBy = req.query.sortBy || 'subscribers'; // subscribers, views, videos
    const country = req.query.country || null; // Filter by country
    const category = req.query.category || null; // Filter by category

    // Build filter object
    const filter = {};
    if (country && country !== 'all') {
      filter.country = country;
    }
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Determine sort order
    const sortObj = {};
    switch (sortBy) {
      case 'views':
        sortObj.totalViews = -1;
        break;
      case 'videos':
        sortObj.videoCount = -1;
        break;
      case 'subscribers':
      default:
        sortObj.subscribers = -1;
        break;
    }

    // Fetch channels with filters and sorting
    const channels = await Channel.find(filter)
      .sort(sortObj)
      .limit(limit)
      .lean();

    // Enrich with video counts
    const enriched = await Promise.all(
      channels.map(async (channel) => {
        const videoCount = await Video.countDocuments({ channelId: channel.channelId });
        return {
          id: channel.channelId,
          channelId: channel.channelId,
          name: channel.name,
          description: channel.description || '',
          thumbnail: channel.thumbnail || '',
          subscribers: channel.subscribers || 0,
          totalViews: channel.totalViews || 0,
          videoCount: videoCount || channel.videoCount || 0,
          averageViews: channel.averageViews || 0,
          category: channel.category || 'General',
          country: channel.country || 'Unknown',
        };
      })
    );

    res.json({
      message: 'Creators/Channels',
      data: enriched,
      count: enriched.length,
      filters: {
        country,
        category,
        sortBy,
      },
    });
  } catch (error) {
    console.error('Creators error:', error);
    res.status(500).json({ error: 'Failed to fetch creators' });
  }
});

// Get available countries
router.get('/creators/filters/countries', async (req, res) => {
  try {
    const countries = await Channel.distinct('country', { country: { $ne: null } });
    res.json({
      message: 'Available countries',
      data: countries.filter(c => c).sort(),
    });
  } catch (error) {
    console.error('Countries error:', error);
    res.status(500).json({ error: 'Failed to fetch countries' });
  }
});

// Get available categories
router.get('/creators/filters/categories', async (req, res) => {
  try {
    const categories = await Channel.distinct('category', { category: { $ne: null } });
    res.json({
      message: 'Available categories',
      data: categories.filter(c => c).sort(),
    });
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;
