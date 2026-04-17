import mongoose from 'mongoose';

const channelSchema = new mongoose.Schema({
  channelId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  thumbnail: String,
  subscribers: {
    type: Number,
    default: 0,
  },
  totalViews: {
    type: Number,
    default: 0,
  },
  videoCount: {
    type: Number,
    default: 0,
  },
  averageViews: {
    type: Number,
    default: 0,
  },
  category: String,
  country: String,
  url: String,
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

export default mongoose.model('Channel', channelSchema);
