import Video from '../models/Video.js';
import Channel from '../models/Channel.js';
import VideoMetrics from '../models/VideoMetrics.js';

// ===== Engagement & Interaction Metrics =====
export function calculateEngagementRate(likes, comments, shares, views) {
  if (views === 0) return 0;
  return (((likes + comments + shares) / views) * 100).toFixed(2);
}

export function calculateLikeRate(likes, views) {
  if (views === 0) return 0;
  return ((likes / views) * 100).toFixed(2);
}

export function calculateCommentRate(comments, views) {
  if (views === 0) return 0;
  return ((comments / views) * 100).toFixed(2);
}

export function calculateShareRate(shares, views) {
  if (views === 0) return 0;
  return ((shares / views) * 100).toFixed(2);
}

export function calculateCTR(clicks, impressions) {
  if (impressions === 0) return 0;
  return ((clicks / impressions) * 100).toFixed(2);
}

// ===== Outlier & Performance Metrics =====
export async function calculateOutlierScore(video) {
  try {
    const channel = await Channel.findOne({ channelId: video.channelId });
    if (!channel || !channel.averageViews || channel.averageViews === 0) {
      return 0;
    }

    const outlierScore = video.views / channel.averageViews;
    return parseFloat(outlierScore.toFixed(2));
  } catch (error) {
    console.error('Error calculating outlier score:', error);
    return 0;
  }
}

export async function getVideoVelocity(videoId, hours = 24) {
  try {
    const now = new Date();
    const startDate = new Date(now.getTime() - hours * 60 * 60 * 1000);

    const metrics = await VideoMetrics.find({
      videoId: videoId,
      timestamp: { $gte: startDate },
    }).sort({ timestamp: 1 });

    if (metrics.length < 2) {
      return 0;
    }

    const oldestMetric = metrics[0];
    const latestMetric = metrics[metrics.length - 1];

    const viewsGained = latestMetric.views - oldestMetric.views;
    const velocity = viewsGained / hours;
    return parseFloat(velocity.toFixed(0));
  } catch (error) {
    console.error('Error calculating velocity:', error);
    return 0;
  }
}

export async function getVideoGrowthRate(videoId, days = 7) {
  try {
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const metrics = await VideoMetrics.find({
      videoId: videoId,
      timestamp: { $gte: startDate },
    }).sort({ timestamp: 1 });

    if (metrics.length < 2) {
      return 0;
    }

    const oldestMetric = metrics[0];
    const latestMetric = metrics[metrics.length - 1];

    if (oldestMetric.views === 0) return 0;

    const growthRate = ((latestMetric.views - oldestMetric.views) / oldestMetric.views) * 100;
    return parseFloat(growthRate.toFixed(2));
  } catch (error) {
    console.error('Error calculating growth rate:', error);
    return 0;
  }
}

// ===== Retention Analysis =====
export async function generateRetentionCurve(videoId, durationSeconds = 1200) {
  try {
    // Get the latest metric for this video
    const metrics = await VideoMetrics.findOne({ videoId }).sort({ timestamp: -1 }).lean();
    
    if (!metrics) {
      // No metrics found - return empty to indicate no data
      return [];
    }

    // If we have a stored retention curve, use it
    if (metrics.retentionCurve && Array.isArray(metrics.retentionCurve) && metrics.retentionCurve.length > 0) {
      return metrics.retentionCurve;
    }

    // If we have engagement data, calculate retention from it
    if (metrics.avgViewDuration && metrics.engagementRate) {
      const engagementFactor = metrics.engagementRate / 100;
      const baseRetention = 100;
      const decayRate = 0.015 - (engagementFactor * 0.005); // High engagement = slower decay
      const curve = [];

      for (let i = 0; i <= 100; i += 5) {
        const percentWatched = i;
        const retention = Math.max(10, baseRetention * Math.exp(-decayRate * percentWatched));
        curve.push({
          percentile: percentWatched,
          retention: parseFloat(retention.toFixed(1)),
        });
      }
      return curve;
    }

    // No data available
    return [];
  } catch (error) {
    console.error('Error generating retention curve:', error);
    return [];
  }
}

export async function getAverageViewDuration(videoId) {
  try {
    const metrics = await VideoMetrics.findOne({ videoId }).lean();
    return metrics?.avgViewDuration || 0;
  } catch (error) {
    console.error('Error getting average view duration:', error);
    return 0;
  }
}

// ===== Earnings Estimation =====
export function estimateEarnings(views, cpm = null, country = 'US', niche = 'tech') {
  const cpmRates = {
    US: { tech: 8.5, finance: 12.0, gaming: 6.5, education: 5.5, general: 4.0 },
    UK: { tech: 7.5, finance: 10.5, gaming: 5.8, education: 4.8, general: 3.5 },
    IN: { tech: 2.5, finance: 3.5, gaming: 1.8, education: 1.5, general: 0.8 },
    DE: { tech: 8.0, finance: 11.0, gaming: 6.0, education: 5.0, general: 3.8 },
  };

  const effectiveCPM = cpm || (cpmRates[country]?.[niche] || 4.0);
  const adRevenue = (views / 1000) * effectiveCPM;
  const rpm = effectiveCPM * 0.55;
  
  return {
    adRevenue: parseFloat(adRevenue.toFixed(2)),
    cpm: parseFloat(effectiveCPM.toFixed(2)),
    rpm: parseFloat(rpm.toFixed(2)),
    estimatedMonthly: parseFloat((adRevenue * 4).toFixed(2)),
    estimatedYearly: parseFloat((adRevenue * 52).toFixed(2)),
  };
}

// ===== Similar Videos Discovery =====
export async function findSimilarVideos(videoId, limit = 6) {
  try {
    const video = await Video.findOne({ videoId }).lean();
    
    if (!video) {
      return [];
    }

    const similarVideos = await Video.find({
      videoId: { $ne: videoId },
      category: video.category,
      tags: { $in: video.tags || [] },
    })
      .sort({ engagementRate: -1, views: -1 })
      .limit(limit)
      .lean();

    const enriched = await Promise.all(
      similarVideos.map(async (v) => {
        const outlier = (await calculateOutlierScore(v)) > 1.5;
        return {
          id: v.videoId,
          title: v.title,
          views: formatViewCount(v.views),
          ctr: ((v.views > 0 ? (v.likes + v.comments) / v.views : 0) * 100).toFixed(1) + '%',
          channel: v.channelName,
          date: formatDate(v.publishedAt),
          outlier,
          engagement: parseFloat(v.engagementRate).toFixed(1),
        };
      })
    );

    return enriched;
  } catch (error) {
    console.error('Error finding similar videos:', error);
    return [];
  }
}

// ===== Outlier Detection =====
export async function detectOutlierVideos(limit = 6) {
  try {
    const videos = await Video.find().lean();
    
    const videosWithScores = await Promise.all(
      videos.map(async (video) => ({
        ...video,
        score: await calculateOutlierScore(video),
      }))
    );

    return videosWithScores
      .filter((v) => v.score > 1.5)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (error) {
    console.error('Error detecting outliers:', error);
    return [];
  }
}

export async function getEngagementTrends(days = 7) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await VideoMetrics.find({
      timestamp: { $gte: startDate },
    })
      .sort({ timestamp: 1 })
      .lean();

    const trends = {};
    metrics.forEach((m) => {
      const date = new Date(m.timestamp).toLocaleDateString();
      if (!trends[date]) {
        trends[date] = {
          ctr: 0,
          engagement: 0,
          velocity: 0,
          count: 0,
        };
      }
      trends[date].ctr += parseFloat(m.ctr || 0);
      trends[date].engagement += parseFloat(m.engagementRate || 0);
      trends[date].velocity += parseFloat(m.velocity || 0);
      trends[date].count += 1;
    });

    return Object.entries(trends).map(([date, data]) => ({
      date,
      ctr: parseFloat((data.ctr / data.count).toFixed(2)),
      engagement: parseFloat((data.engagement / data.count).toFixed(2)),
      velocity: parseFloat((data.velocity / data.count).toFixed(0)),
    }));
  } catch (error) {
    console.error('Error getting engagement trends:', error);
    return [];
  }
}

// ===== Helper Functions =====
export function formatViewCount(views) {
  if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
  if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
  return views.toString();
}

export function formatDate(date) {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

// ===== Original Functions =====

// Find outlier videos
export async function findOutlierVideos(threshold = 5) {
  try {
    const videos = await Video.find();
    const outliers = [];

    for (const video of videos) {
      const outlierScore = await calculateOutlierScore(video);
      if (outlierScore > threshold) {
        outliers.push({
          video: video,
          outlierScore: outlierScore,
        });
      }
    }

    return outliers.sort((a, b) => b.outlierScore - a.outlierScore);
  } catch (error) {
    console.error('Error finding outliers:', error);
    return [];
  }
}

// Get trending videos based on recent metrics
export async function getTrendingVideos(limit = 20) {
  try {
    const trendingVideos = await Video.find()
      .sort({ engagementRate: -1, views: -1 })
      .limit(limit)
      .lean();

    return trendingVideos;
  } catch (error) {
    console.error('Error getting trending videos:', error);
    return [];
  }
}

// Get top channels
export async function getTopChannels(metric = 'subscribers', limit = 20) {
  try {
    const sortBy = {};
    sortBy[metric] = -1;

    const channels = await Channel.find().sort(sortBy).limit(limit).lean();

    return channels;
  } catch (error) {
    console.error('Error getting top channels:', error);
    return [];
  }
}

// Get category statistics
export async function getCategoryStats() {
  try {
    const stats = await Video.aggregate([
      {
        $group: {
          _id: '$category',
          totalVideos: { $sum: 1 },
          avgViews: { $avg: '$views' },
          avgEngagement: { $avg: '$engagementRate' },
          totalViews: { $sum: '$views' },
        },
      },
      { $sort: { totalViews: -1 } },
    ]);

    return stats;
  } catch (error) {
    console.error('Error getting category stats:', error);
    return [];
  }
}

// Get keyword analysis
export async function getKeywordAnalysis() {
  try {
    const videos = await Video.find({ tags: { $exists: true, $ne: [] } }).lean();

    const keywordStats = {};

    videos.forEach((video) => {
      if (video.tags && Array.isArray(video.tags)) {
        video.tags.forEach((tag) => {
          if (!keywordStats[tag]) {
            keywordStats[tag] = {
              count: 0,
              totalViews: 0,
              totalEngagement: 0,
            };
          }
          keywordStats[tag].count += 1;
          keywordStats[tag].totalViews += video.views;
          keywordStats[tag].totalEngagement += video.engagementRate;
        });
      }
    });

    const analysis = Object.entries(keywordStats)
      .map(([keyword, data]) => ({
        keyword,
        frequency: data.count,
        avgViews: data.totalViews / data.count,
        avgEngagement: data.totalEngagement / data.count,
      }))
      .sort((a, b) => b.avgViews - a.avgViews);

    return analysis.slice(0, 50);
  } catch (error) {
    console.error('Error getting keyword analysis:', error);
    return [];
  }
}

// Get video performance timeline
export async function getVideoPerformanceTimeline(videoId, days = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const timeline = await VideoMetrics.find({
      videoId: videoId,
      timestamp: { $gte: startDate },
    })
      .sort({ timestamp: 1 })
      .lean();

    return timeline;
  } catch (error) {
    console.error('Error getting video timeline:', error);
    return [];
  }
}

// Get dashboard statistics
export async function getDashboardStats() {
  try {
    const totalVideos = await Video.countDocuments();
    const totalChannels = await Channel.countDocuments();
    const totalViewsResult = await Video.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' },
          averageEngagement: { $avg: '$engagementRate' },
        },
      },
    ]);

    const totalViews = totalViewsResult[0]?.totalViews || 0;
    const averageEngagement = totalViewsResult[0]?.averageEngagement || 0;

    const topVideos = await getTrendingVideos(10);
    const topChannels = await getTopChannels('subscribers', 10);
    const categoryStats = await getCategoryStats();

    return {
      totalVideos,
      totalChannels,
      totalViews,
      averageEngagement,
      topVideos,
      topChannels,
      categoryStats,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return null;
  }
}

export default {
  calculateEngagementRate,
  calculateLikeRate,
  calculateCommentRate,
  calculateShareRate,
  calculateCTR,
  calculateOutlierScore,
  getVideoVelocity,
  getVideoGrowthRate,
  generateRetentionCurve,
  getAverageViewDuration,
  estimateEarnings,
  findSimilarVideos,
  findOutlierVideos,
  detectOutlierVideos,
  getEngagementTrends,
  getTrendingVideos,
  getTopChannels,
  getCategoryStats,
  getKeywordAnalysis,
  getVideoPerformanceTimeline,
  getDashboardStats,
  formatViewCount,
  formatDate,
};
