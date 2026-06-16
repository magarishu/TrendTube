import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    index: true,
  },
  clerkId: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },
  password: {
    type: String,
  },
  username: String,
  subscription: {
    type: String,
    enum: ['free', 'pro', 'premium'],
    default: 'free',
  },
  favoriteVideos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
    },
  ],
  favoriteVideosMetadata: [
    {
      videoId: String,
      title: String,
      channel: String,
      thumbnail: String,
      views: String,
      duration: String,
      publishedAt: String,
      addedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  watchHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('User', userSchema);
