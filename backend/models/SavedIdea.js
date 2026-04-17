import mongoose from 'mongoose';

const savedIdeaSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
      default: 'guest', // Default for unauthenticated users
    },
    type: {
      type: String,
      enum: ['title', 'thumbnail'],
      required: true,
      index: true,
    },
    videoId: String,
    title: {
      type: String,
      required: true,
    },
    thumbnailUrl: String,
    views: {
      type: Number,
      default: 0,
    },
    ctrScore: {
      type: Number,
      default: 0,
    },
    engagementRate: {
      type: Number,
      default: 0,
    },
    channelTitle: String,
    channelId: String,
    description: String,
    tags: [String],
    notes: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('SavedIdea', savedIdeaSchema);
