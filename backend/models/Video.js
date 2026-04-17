import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  channelId: {
    type: String,
    required: true,
    index: true,
  },
  channelName: String,
  thumbnail: String,
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
  duration: Number,
  publishedAt: Date,
  tags: [String],
  category: String,
  engagementRate: {
    type: Number,
    default: 0,
  },
  outlierScore: {
    type: Number,
    default: 0,
  },
  aiAnalysis: {
    viralKeywords: [String],
    improvedTitle: String,
    contentIdeas: [String],
    thumbnailSuggestions: [String],
    trendScore: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Video', videoSchema);
