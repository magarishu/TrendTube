# TrendTube - Complete Setup & Usage Guide

## ✅ What's been implemented

### 1. **MongoDB Models** ✓
- `Video` - Video information with engagement metrics
- `Channel` - Channel info with subscriber counts
- `VideoMetrics` - Time-series data for tracking growth
- `User` - User management (for future auth)

### 2. **Data Collection System** ✓
- **Automatic Cron Jobs** that run on schedule:
  - Every 1 hour: Collect 50 trending US videos
  - Every 3 hours: Collect regional trending videos (GB, IN, BR, DE)
  - Every 6 hours: Update metrics for existing videos
  - Every 12 hours: Search for trending keywords (AI, technology, gaming, etc.)
  
- **Manual Collection** endpoints:
  - `POST /api/collect/trending` - Collect trending videos on-demand
  - `POST /api/collect/keyword` - Collect videos for a keyword
  - `POST /api/collect/keywords` - Collect for multiple keywords

### 3. **Analytics Engine** ✓
- **Trending Videos Analysis**
- **Outlier Detection** (videos with 5x+ views vs channel avg)
- **Category Statistics**
- **Keyword Analysis**
- **Video Performance Timeline** (track growth over time)
- **Top Channels** ranking

### 4. **API Routes** ✓
Complete REST API with 12+ endpoints:
- Dashboard
- Trending videos
- Top channels
- Category stats
- Keyword analysis
- Outliers
- Video search
- Video details & timeline
- Database statistics

### 5. **Cron Jobs** ✓
Automatic data collection running on schedule

---

## 🚀 How to Start

### Step 1: Verify YouTube API Key
Make sure your YouTube API key in `.env` is valid:
```
YOUTUBE_API_KEY=your_key_here
```

### Step 2: Start the Server
```powershell
cd backend
npm run dev
```

You should see:
```
✓ MongoDB Connected Successfully
✓ All jobs initialized
Server is running on http://localhost:5000
```

### Step 3: Manually Trigger Data Collection (First Time)

**Option A: Collect Trending Videos**
```powershell
$body = @{ regionCode = 'US'; maxResults = 50 } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:5000/api/collect/trending" `
  -Method POST -ContentType "application/json" -Body $body
```

**Option B: Collect by Keywords**
```powershell
$body = @{ 
  keywords = @('AI', 'machine learning', 'python', 'web development'); 
  maxResults = 30 
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/collect/keywords" `
  -Method POST -ContentType "application/json" -Body $body
```

### Step 4: Check Database Growth
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/analytics/stats" `
  -UseBasicParsing | ConvertFrom-Json | ConvertTo-Json
```

---

## 📊 How the System Works

```
┌─────────────────────────────────────────────────┐
│  Cron Jobs (Automatic Every Hour/Day)           │
│  ├── Fetch trending videos                       │
│  ├── Fetch regional videos                       │
│  └── Update metrics for existing videos          │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  YouTube Data API → Data Collector              │
│  ├── Extract video stats                        │
│  ├── Get channel info                           │
│  └── Store metrics snapshot                     │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  MongoDB Database                               │
│  ├── Videos (1000s+)                            │
│  ├── Channels (100s+)                           │
│  ├── VideoMetrics (10,000s - time series)       │
│  └── Users (for future)                         │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  Analytics Engine                               │
│  ├── Calculate engagement rates                 │
│  ├── Detect outliers                            │
│  ├── Track growth trends                        │
│  └── Analyze keywords                           │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  REST API Endpoints                             │
│  └── Frontend requests data from database       │
│      (No YouTube API quota waste!)              │
└─────────────────────────────────────────────────┘
```

---

## 📈 Database Growth Projection

| Time | Videos | Channels | Metrics |
|------|--------|----------|---------|
| Day 1 | 500 | 100 | 500 |
| Week 1 | 5,000 | 500 | 5,000+ |
| Month 1 | 150,000+ | 5,000+ | 150,000+ |
| Year 1 | Millions | 100,000+ | Millions |

---

## 🔑 Key Advantages Over On-Demand API Calls

**Without Database:**
```
User Request → YouTube API → WAIT 2-3s → Response
(Uses quota coins immediately)
(Limited quota: ~10,000 units/day)
```

**With Database:**
```
User Request → MongoDB → INSTANT ✓
(No quota used!)
Cron Jobs → YouTube API (1x per hour)
(Controlled quota usage)
```

---

## 📱 Frontend Integration

### React Example:
```typescript
// Get dashboard data
const dashboard = await apiClient.analytics.getDashboard();
console.log(dashboard.data.topVideos);

// Search videos
const results = await apiClient.analytics.searchVideos('AI tutorial', 50);

// Get outlier videos
const outliers = await apiClient.analytics.getOutliers(5);

// Track video growth
const timeline = await apiClient.analytics.getVideoTimeline('video_id', 30);
```

### Update Frontend Pages:
1. **Dashboard.tsx** - Use `/analytics/dashboard`
2. **Trending.tsx** - Use `/analytics/trending`
3. **VideoAnalysis.tsx** - Use `/analytics/video/:id/timeline`
4. **Creators.tsx** - Use `/analytics/top-channels`
5. **Categories.tsx** - Use `/analytics/categories`

---

## ⚙️ Configuration

### Adjust Cron Schedules
Edit `backend/services/cronJobs.js`:

```javascript
// Change from every 1 hour to every 30 minutes:
cron.schedule("*/30 * * * *", async () => {
  // ...
});
```

Cron Format: `minute hour day month weekday`
- `0 * * * *` = Every hour
- `*/30 * * * *` = Every 30 minutes
- `0 0 * * *` = Daily at midnight
- `0 */6 * * *` = Every 6 hours

### Change Keywords Collected
Edit `backend/services/cronJobs.js`:

```javascript
const trendingKeywords = [
  'AI',
  'technology',
  'your_keyword_here',
  // Add more...
];
```

---

## 🐛 Troubleshooting

### "YouTube API Error: 403"
**Problem:** API key invalid or quota exceeded
**Solution:**
1. Check YouTube API key in `.env`
2. Enable YouTube Data API v3 in Google Cloud Console
3. Check quota usage in Google Cloud Console
4. Wait 24 hours if quota exceeded

### "MongoDB Connection Failed"
**Problem:** Database connection timeout
**Solution:**
1. Check `MONGODB_URI` in `.env`
2. Verify password is correct (URL encoded if needed)
3. Check IP whitelist in MongoDB Atlas
4. Ensure cluster is running

### "Cron jobs not running"
**Problem:** No data being collected
**Solution:**
1. Check server console for `✓ All jobs initialized` message
2. Manually trigger collection with `/api/collect/trending`
3. Check MongoDB is connected
4. Check YouTube API is working

---

## 📚 File Structure

```
backend/
├── models/
│   ├── Video.js
│   ├── Channel.js
│   ├── VideoMetrics.js
│   └── User.js
├── services/
│   ├── dataCollector.js     (Fetches from YouTube)
│   ├── analytics.js         (Calculates metrics)
│   └── cronJobs.js          (Automatic scheduling)
├── routes/
│   ├── analytics.js         (Analytics endpoints)
│   └── collect.js           (Manual collection endpoints)
├── utils/
│   └── database.js          (MongoDB connection)
└── server.js                (Main entry point)
```

---

## 🎯 Next Steps

1. ✅ Start server: `npm run dev`
2. ✅ Manually collect first batch: POST `/api/collect/trending`
3. ✅ Monitor growth: GET `/api/analytics/stats`
4. ✅ Connect frontend to endpoints
5. ✅ Let cron jobs run automatically (collect every hour)
6. ✅ Analyze trends after 1+ weeks of data

---

## 💡 Pro Tips

- **First week:** Manually collect multiple keywords to bootstrap database
- **Weekly:** Check `/api/analytics/outliers` for trending opportunities
- **Monthly:** Review `/api/analytics/keywords` for content ideas
- **Always:** Use database endpoints (no quote waste!)

---

## 🚀 You Now Have a Professional Analytics System!

This is the same architecture used by:
- vidIQ
- TubeBuddy
- Social Blade

The key difference? **You own the data, no cloud dependence, and full control.**

Happy analyzing! 🎉
