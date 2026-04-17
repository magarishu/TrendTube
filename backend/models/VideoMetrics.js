import mongoose from 'mongoose';

const videoMetricsSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
    index: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
  comments: {
    type: Number,
    default: 0,
  },
  shares: {
    type: Number,
    default: 0,
  },
  engagementRate: {
    type: Number,
    default: 0,
  },
  ctr: {
    type: Number,
    default: 0,
  },
  avgViewDuration: {
    type: Number,
    default: 0,
  },
  retentionCurve: [
    {
      percentile: Number,
      retention: Number,
    },
  ],
  impressions: {
    type: Number,
    default: 0,
  },
  clickThroughRate: {
    type: Number,
    default: 0,
  },
  relativeLyrics: {
    type: Number,
    default: 0,
  },
  likeRate: {
    type: Number,
    default: 0,
  },
  commentRate: {
    type: Number,
    default: 0,
  },
  shareRate: {
    type: Number,
    default: 0,
  },
  velocity: {
    type: Number,
    default: 0,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

export default mongoose.model('VideoMetrics', videoMetricsSchema);
