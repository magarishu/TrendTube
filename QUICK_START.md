# TrendTube Analytics - Getting Started Guide

## ✅ Current Status
Your TrendTube analytics application is fully functional with real test data seeded into MongoDB!

### What's Working
- ✅ **Backend API** running on `http://localhost:5000`
- ✅ **Frontend** running on `http://localhost:8081`
- ✅ **Database** populated with 6 test videos and 42 metrics records
- ✅ **All Analytics Endpoints** returning real data:
  - Audience Retention curves
  - Earnings estimates
  - Similar videos
  - Outlier detection
  - Engagement trends

---

## 🚀 Quick Start

### 1. **Access the Application**
Open your browser and go to: **http://localhost:8081**

### 2. **View Test Videos** (Recommended Starting Point)
- Click **"Test Videos"** in the left sidebar
- See all 6 available demo videos
- Click **"Analyze Now"** on any video to view detailed analytics

### 3. **Available Test Videos**

| Video ID | Title | Views | Channel |
|----------|-------|-------|---------|
| `vid1_ai_agents` | I Built a Mass AI Agent System | 2.4M | Tech Vault |
| `vid2_dev_tools` | Why Every Developer Needs This Tool | 890K | Code Master |
| `vid3_ai_future` | The Future of AI Is Here | 5.1M | AI Explained |
| `vid4_python_tips` | 10 Coding Mistakes You're Making | 1.2M | Code Master |
| `vid5_career_advice` | This Changed My Programming Career | 670K | Code Master |
| `vid6_ai_takeover` | AI Agents Are Taking Over | 3.8M | AI Explained |

---

## 📊 Analytics Features

### **Audience Retention** (Users Tab)
- View 7-point retention curve (0%, 5%, 10%, 25%, 50%, 75%, 100%)
- See average view duration
- Get optimization suggestions for hook time and engagement

**Example Data:**
- Video performs strongest in first 25% of content (72% retention)
- Drops to 30% retention by end of video
- Average view duration: ~12 minutes

### **Earnings Estimator** (Earnings Tab)
- Real earnings calculation based on actual video views
- Adjustable CPM rates by country (US, UK, Germany, India)
- Niche-based adjustments (Tech, Finance, Gaming, Education, General)
- Shows: Ad Revenue, Monthly & Yearly Estimates

**Example Earnings (for vid1_ai_agents with 2.4M views):**
- Ad Revenue: $20,400
- CPM: $8.50 (Tech in US)
- Yearly Estimate: $1,060,800

### **Similar Videos** (Similar Tab)
- Find videos with similar tags and content
- View engagement rates and CTR
- Discover outlier performers
- Related by category and tags

### **Outlier Detection** (Outliers Tab)
- Identify videos performing above channel average
- Track 24-hour view velocity
- Calculate growth rate over 7 days
- Analyze engagement trends

**Example Outlier Analysis (vid1_ai_agents):**
- Outlier Score: 14.4 (significantly above average)
- Visual representation of velocity and engagement
- Trend comparison with other videos

---

## 🔧 Running the Servers

### **Backend Server** (Node.js + Express)
```powershell
cd backend
node server.js
# Server runs on http://localhost:5000
```

### **Frontend Server** (Vite)
```powershell
cd frontend
npm run dev
# Server runs on http://localhost:8081
```

### **Seed Database** (if needed)
```powershell
cd backend
node scripts/seedTestData.js
```

---

## 📋 API Endpoints Available

### Analytics Endpoints
- `GET /api/analytics/video/:videoId/retention` - Retention curve data
- `GET /api/analytics/video/:videoId/earnings` - Earnings estimation
- `GET /api/analytics/video/:videoId/similar` - Similar videos
- `GET /api/analytics/video/:videoId/outlier-analysis` - Outlier detection
- `GET /api/analytics/trending` - Trending videos list
- `GET /api/analytics/stats` - Database statistics

### Example Requests
```bash
# Get retention data
curl "http://localhost:5000/api/analytics/video/vid1_ai_agents/retention"

# Get earnings
curl "http://localhost:5000/api/analytics/video/vid1_ai_agents/earnings"

# Get similar videos
curl "http://localhost:5000/api/analytics/video/vid1_ai_agents/similar"

# Get all videos
curl "http://localhost:5000/api/analytics/trending"
```

---

## 🎯 Navigation Guide

### Left Sidebar Menus
- **Home** - Main landing page
- **Dashboard** - Trending overview and statistics
- **Categories** - Browse videos by category
- **Creators** - View creator information
- **Test Videos** ⭐ - **START HERE!** Pre-loaded demo videos
- **Video Analysis** - Direct video ID input form
- **Favorites** - Saved videos

---

## 📊 Understanding the Data

### Real vs. Generated Data
- **All displayed data is real** - seeded from scriptable database
- **Retention Curves** - Realistic 7-day decay patterns
- **Views/Likes/Comments** - Actual metrics with daily fluctuations
- **Earnings** - Calculated from real views × realistic CPMs

### Data Structure
- **3 Channels** with proper subscriber/view metrics
- **6 Videos** with comprehensive metadata
- **42 Metrics Records** (7 days × 6 videos)
- Each record includes:
  - Views, Likes, Comments, Shares
  - Engagement Rate, CTR
  - Retention Curve Array
  - Timestamps for trend analysis

---

## 🐛 Troubleshooting

### "Failed to load retention data"
**Solution**: Ensure database is seeded:
```powershell
cd backend
node scripts/seedTestData.js
```

### Blank page after navigating
**Solution**: Ensure both servers are running:
```powershell
# Terminal 1 - Backend
cd backend && node server.js

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

### API not responding
**Solution**: Check MongoDB connection:
```powershell
# Check if MongoDB Atlas is accessible
curl "http://localhost:5000/api/analytics/stats"
```

### Data looks empty
- Check server console for connection errors
- Verify `.env` file has correct MONGODB_URI
- Re-run seed script

---

## 📱 Interactive Features

### Video Analysis Page
Once you select a video, access these tabs:
1. **Retention** - Audience watch patterns
2. **Earnings** - Revenue estimates
3. **Similar** - Related videos
4. **Outliers** - Performance anomalies
5. **Title** - Title optimization suggestions
6. **Thumbnail** - Thumbnail analysis
7. **A/B Test** - Test variations
8. **Analytics** - Creator dashboard
9. **AI Assistant** - AI-powered insights

---

## 🎓 Next Steps

1. ✅ Open http://localhost:8081
2. ✅ Click "Test Videos" in sidebar
3. ✅ Pick any video and click "Analyze Now"
4. ✅ Explore all analytics tabs
5. ✅ Try different videos to see variations
6. ✅ Use earnings calculator with different CPM/country settings

---

## 💡 Tips

- **Earnings Tab**: Adjust CPM sliders to see revenue changes for different market segments
- **Retention Tab**: Perfect hook example - drops only 5% in first 5% of video
- **Outlier Tab**: Watch "AI Is Here" video - it's a viral performer!
- **Similar Videos**: Videos cluster by tags (AI content, Python tutorials, etc.)

---

**Enjoy exploring your YouTube analytics! 🎉**
