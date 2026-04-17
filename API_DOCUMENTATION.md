# TrendTube API Documentation

## System Architecture

```
Frontend (React)
        ↓
Backend API (Node.js + Express)
        ├── YouTube Data API (on-demand)
        ├── Data Collector (Cron Jobs) → MongoDB
        ├── Analytics Engine
        └── AI Analysis (Gemini)
        ↓
MongoDB Database
```

## Data Collection Strategy

Instead of fetching YouTube data on-demand (which hits quota limits), the system collects data periodically:

### Cron Jobs Schedule

- **Every 1 hour**: Fetch 50 trending videos from US
- **Every 3 hours**: Fetch trending videos from multiple regions (GB, IN, BR, DE)
- **Every 6 hours**: Update metrics for existing videos
- **Every 12 hours**: Search and collect videos for trending keywords (AI, technology, gaming, etc.)

Over time, this builds a massive dataset without hitting API limits.

## Collections/Models

### 1. Video
```javascript
{
  videoId: String (unique),
  title: String,
  description: String,
  channelId: String,
  channelName: String,
  thumbnail: String,
  views: Number,
  likes: Number,
  comments: Number,
  duration: Number,
  publishedAt: Date,
  tags: [String],
  category: String,
  engagementRate: Number,
  outlierScore: Number,
  aiAnalysis: {
    viralKeywords: [String],
    improvedTitle: String,
    contentIdeas: [String],
    thumbnailSuggestions: [String],
    trendScore: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Channel
```javascript
{
  channelId: String (unique),
  name: String,
  description: String,
  thumbnail: String,
  subscribers: Number,
  totalViews: Number,
  videoCount: Number,
  averageViews: Number,
  category: String,
  country: String,
  url: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 3. VideoMetrics (Time Series)
```javascript
{
  videoId: String,
  views: Number,
  likes: Number,
  comments: Number,
  engagementRate: Number,
  timestamp: Date
}
```

### 4. User
```javascript
{
  email: String,
  password: String,
  username: String,
  subscription: String (free|pro|premium),
  favoriteVideos: [ObjectId],
  watchHistory: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Base URL
```
http://localhost:5000/api/analytics
```

### 1. Get Dashboard (All Analytics)
```
GET /analytics/dashboard
```
Returns: Total videos, channels, views, top videos, top channels, category stats

**Response:**
```json
{
  "message": "Dashboard analytics",
  "data": {
    "totalVideos": 1250,
    "totalChannels": 350,
    "totalViews": 50000000,
    "averageEngagement": 2.5,
    "topVideos": [...],
    "topChannels": [...],
    "categoryStats": [...]
  }
}
```

---

### 2. Get Trending Videos
```
GET /analytics/trending?limit=20
```
**Query Parameters:**
- `limit` (optional): Number of videos (default: 20, max: 100)

**Response:**
```json
{
  "message": "Trending videos from database",
  "data": [
    {
      "videoId": "xxx",
      "title": "...",
      "views": 1000000,
      "engagementRate": 3.5,
      ...
    }
  ],
  "count": 20
}
```

---

### 3. Get Top Channels
```
GET /analytics/top-channels?metric=subscribers&limit=20
```
**Query Parameters:**
- `metric` (optional): subscribers, totalViews, videoCount (default: subscribers)
- `limit` (optional): Number of channels (default: 20, max: 100)

---

### 4. Get Category Statistics
```
GET /analytics/categories
```
Returns stats for each video category: total videos, avg views, avg engagement

---

### 5. Get Keyword Analysis
```
GET /analytics/keywords
```
Returns top keywords with frequency, average views, and engagement

---

### 6. Get Outlier Videos
```
GET /analytics/outliers?threshold=5
```
Videos performing significantly above their channel average

**Query Parameters:**
- `threshold` (optional): Outlier score threshold (default: 5)

---

### 7. Get Video Performance Timeline
```
GET /analytics/video/:videoId/timeline?days=30
```
Historical metrics for a specific video

**Query Parameters:**
- `days` (optional): Days of history (default: 30)

---

### 8. Search Videos
```
GET /analytics/search?q=tutorial&limit=20
```
Search video titles and tags in database

**Query Parameters:**
- `q` (required): Search query
- `limit` (optional): Results limit (default: 20, max: 100)

---

### 9. Get Video Details
```
GET /analytics/video/:videoId
```
Detailed video info + recent metrics

---

### 10. Get Videos by Category
```
GET /analytics/category/:categoryId?limit=20
```

---

### 11. Get Channel Videos
```
GET /analytics/channel/:channelId/videos?limit=20
```

---

### 12. Get Database Statistics
```
GET /analytics/stats
```
Returns: Total videos, channels, metrics, oldest/newest video dates

---

## Usage Examples

### Example 1: Get Dashboard Data
```javascript
const response = await fetch('http://localhost:5000/api/analytics/dashboard');
const data = await response.json();
console.log('Total videos:', data.data.totalVideos);
console.log('Top videos:', data.data.topVideos);
```

### Example 2: Search for "AI" Videos
```javascript
const response = await fetch('http://localhost:5000/api/analytics/search?q=AI&limit=50');
const videos = await response.json();
console.log('Found videos:', videos.count);
```

### Example 3: Get Outliers
```javascript
const response = await fetch('http://localhost:5000/api/analytics/outliers?threshold=8');
const outliers = await response.json();
// Videos with 8x+ views compared to channel average
```

### Example 4: Track Video Growth
```javascript
const response = await fetch('http://localhost:5000/api/analytics/video/dQw4w9WgXcQ/timeline?days=30');
const timeline = await response.json();
// Shows view/like/comment progression over 30 days
```

---

## Key Features

### 1. **Smart Data Collection**
- Cron jobs run automatically
- No quota waste - data is collected periodically
- Historical metrics tracked

### 2. **Advanced Analytics**
- Engagement rate = (likes + comments) / views
- Outlier detection = video views / channel average views
- Growth tracking = view changes over time
- Category analysis
- Keyword analysis

### 3. **Scalability**
- Database stores unlimited videos
- Time-series metrics for trend analysis
- Indexed queries for fast searches

### 4. **Database-First Approach**
- Fetch from MongoDB (instant, no API calls)
- Periodically refresh with cron jobs
- No quota limitations

---

## Database Growth Timeline

- **Day 1**: ~500 videos collected (50 trending + 450 from search)
- **Week 1**: ~5,000+ videos
- **Month 1**: ~150,000+ videos
- **Year 1**: Potentially millions of videos

Over time, you'll have:
- Complete video database
- Historical metrics for analysis
- Trend patterns and insights
- Channel performance data

---

## Frontend Integration Example

```typescript
// src/services/apiClient.ts
const apiClient = {
  analytics: {
    getDashboard: () => apiClient.request('/analytics/dashboard'),
    getTrending: (limit = 20) => apiClient.request(`/analytics/trending?limit=${limit}`),
    getOutliers: (threshold = 5) => apiClient.request(`/analytics/outliers?threshold=${threshold}`),
    searchVideos: (query, limit = 20) => apiClient.request(`/analytics/search?q=${query}&limit=${limit}`),
    getKeywords: () => apiClient.request('/analytics/keywords'),
    getVideoTimeline: (videoId, days = 30) => apiClient.request(`/analytics/video/${videoId}/timeline?days=${days}`),
    getTopChannels: (metric = 'subscribers', limit = 20) => apiClient.request(`/analytics/top-channels?metric=${metric}&limit=${limit}`),
  },
};
```

---

## Next Steps

1. **Start the server**: `npm run dev`
2. **Wait for cron jobs** to collect initial data (first run: immediate, then scheduled)
3. **Monitor**: Check `/api/analytics/stats` to see data growth
4. **Query**: Use the endpoints to power your frontend

The system will automatically grow your database without hitting YouTube API quota limits!
