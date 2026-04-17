import axios from 'axios';
import Video from '../models/Video.js';
import Channel from '../models/Channel.js';
import VideoMetrics from '../models/VideoMetrics.js';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Helper to get video statistics from YouTube
async function getVideoStats(videoIds) {
  if (!videoIds || videoIds.length === 0) return {};

  try {
    const response = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
      params: {
        part: 'statistics,contentDetails',
        id: videoIds.join(','),
        key: YOUTUBE_API_KEY,
      },
    });

    const stats = {};
    response.data.items.forEach((item) => {
      stats[item.id] = {
        views: parseInt(item.statistics.viewCount || 0),
        likes: parseInt(item.statistics.likeCount || 0),
        comments: parseInt(item.statistics.commentCount || 0),
        duration: item.contentDetails.duration,
      };
    });

    return stats;
  } catch (error) {
    console.error('Error fetching video stats:', error.message);
    return {};
  }
}

// Helper to get channel information
async function getChannelInfo(channelId) {
  try {
    const response = await axios.get(`${YOUTUBE_API_BASE}/channels`, {
      params: {
        part: 'snippet,statistics,contentDetails',
        id: channelId,
        key: YOUTUBE_API_KEY,
      },
    });

    if (response.data.items.length === 0) return null;

    const channel = response.data.items[0];
    return {
      channelId: channel.id,
      name: channel.snippet.title,
      description: channel.snippet.description,
      thumbnail: channel.snippet.thumbnails.default.url,
      subscribers: parseInt(channel.statistics.subscriberCount || 0),
      totalViews: parseInt(channel.statistics.viewCount || 0),
      videoCount: parseInt(channel.statistics.videoCount || 0),
    };
  } catch (error) {
    console.error('Error fetching channel info:', error.message);
    return null;
  }
}

// Fetch and store trending videos
export async function collectTrendingVideos(regionCode = 'US', maxResults = 50) {
  try {
    console.log(`[Data Collector] Fetching trending videos from ${regionCode}...`);

    const response = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
      params: {
        part: 'snippet,statistics',
        chart: 'mostPopular',
        regionCode: regionCode,
        maxResults: maxResults,
        key: YOUTUBE_API_KEY,
      },
    });

    const videoIds = response.data.items.map((item) => item.id);
    const stats = await getVideoStats(videoIds);

    for (const item of response.data.items) {
      const videoData = stats[item.id] || {};
      const channelInfo = await getChannelInfo(item.snippet.channelId);

      // Calculate engagement rate
      const views = videoData.views || 0;
      const likes = videoData.likes || 0;
      const comments = videoData.comments || 0;
      const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0;

      const videoDoc = await Video.findOneAndUpdate(
        { videoId: item.id },
        {
          videoId: item.id,
          title: item.snippet.title,
          description: item.snippet.description,
          channelId: item.snippet.channelId,
          channelName: item.snippet.channelTitle,
          thumbnail: item.snippet.thumbnails.high.url,
          views: videoData.views || 0,
          likes: videoData.likes || 0,
          comments: videoData.comments || 0,
          publishedAt: item.snippet.publishedAt,
          tags: item.snippet.tags || [],
          category: item.snippet.categoryId,
          engagementRate: engagementRate,
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      );

      // Store metrics snapshot
      await VideoMetrics.create({
        videoId: item.id,
        views: videoData.views || 0,
        likes: videoData.likes || 0,
        comments: videoData.comments || 0,
        engagementRate: engagementRate,
      });

      // Store channel info
      if (channelInfo) {
        await Channel.findOneAndUpdate(
          { channelId: channelInfo.channelId },
          {
            ...channelInfo,
            updatedAt: new Date(),
          },
          { upsert: true }
        );
      }
    }

    console.log(`✓ Stored ${response.data.items.length} trending videos`);
    return response.data.items.length;
  } catch (error) {
    console.error('Error collecting trending videos:', error.message);
    throw error;
  }
}

// Search and store videos by keyword
export async function collectVideosByKeyword(keyword, maxResults = 50) {
  try {
    console.log(`[Data Collector] Searching for "${keyword}"...`);

    const response = await axios.get(`${YOUTUBE_API_BASE}/search`, {
      params: {
        part: 'snippet',
        q: keyword,
        type: 'video',
        maxResults: maxResults,
        order: 'viewCount',
        key: YOUTUBE_API_KEY,
      },
    });

    const videoIds = response.data.items.map((item) => item.id.videoId);
    const stats = await getVideoStats(videoIds);

    for (const item of response.data.items) {
      const videoId = item.id.videoId;
      const videoData = stats[videoId] || {};
      const channelInfo = await getChannelInfo(item.snippet.channelId);

      const views = videoData.views || 0;
      const likes = videoData.likes || 0;
      const comments = videoData.comments || 0;
      const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0;

      await Video.findOneAndUpdate(
        { videoId: videoId },
        {
          videoId: videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          channelId: item.snippet.channelId,
          channelName: item.snippet.channelTitle,
          thumbnail: item.snippet.thumbnails.high.url,
          views: videoData.views || 0,
          likes: videoData.likes || 0,
          comments: videoData.comments || 0,
          publishedAt: item.snippet.publishedAt,
          category: item.snippet.categoryId,
          engagementRate: engagementRate,
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      );

      await VideoMetrics.create({
        videoId: videoId,
        views: videoData.views || 0,
        likes: videoData.likes || 0,
        comments: videoData.comments || 0,
        engagementRate: engagementRate,
      });

      if (channelInfo) {
        await Channel.findOneAndUpdate(
          { channelId: channelInfo.channelId },
          {
            ...channelInfo,
            updatedAt: new Date(),
          },
          { upsert: true }
        );
      }
    }

    console.log(`✓ Stored ${response.data.items.length} videos for keyword: ${keyword}`);
    return response.data.items.length;
  } catch (error) {
    console.error(`Error collecting videos for keyword "${keyword}":`, error.message);
    throw error;
  }
}

// Update metrics for existing videos
export async function updateVideoMetrics() {
  try {
    console.log('[Data Collector] Updating video metrics...');

    const videos = await Video.find().limit(100);
    const videoIds = videos.map((v) => v.videoId);

    if (videoIds.length === 0) {
      console.log('No videos to update');
      return 0;
    }

    const stats = await getVideoStats(videoIds);

    for (const video of videos) {
      const newStats = stats[video.videoId];
      if (newStats) {
        const engagementRate =
          newStats.views > 0 ? ((newStats.likes + newStats.comments) / newStats.views) * 100 : 0;

        await Video.findByIdAndUpdate(
          video._id,
          {
            views: newStats.views,
            likes: newStats.likes,
            comments: newStats.comments,
            engagementRate: engagementRate,
            updatedAt: new Date(),
          }
        );

        await VideoMetrics.create({
          videoId: video.videoId,
          views: newStats.views,
          likes: newStats.likes,
          comments: newStats.comments,
          engagementRate: engagementRate,
        });
      }
    }

    console.log(`✓ Updated metrics for ${videos.length} videos`);
    return videos.length;
  } catch (error) {
    console.error('Error updating video metrics:', error.message);
    throw error;
  }
}

export default {
  collectTrendingVideos,
  collectVideosByKeyword,
  updateVideoMetrics,
};
