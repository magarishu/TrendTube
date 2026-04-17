# Analytics Formulas & Implementations

## Engagement Metrics

### Engagement Rate
```javascript
// Total interaction rate
engagementRate = ((likes + comments + shares) / views) × 100

// Examples:
// 1000 views, 50 likes, 10 comments, 5 shares
// = (50 + 10 + 5) / 1000 × 100 = 6.5%
```

### Individual Rates
```javascript
likeRate = (likes / views) × 100
commentRate = (comments / views) × 100
shareRate = (shares / views) × 100

// Average YouTube benchmarks:
// - Like Rate: 2-5%
// - Comment Rate: 0.5-2%
// - Share Rate: 0.1-0.5%
```

### Click-Through Rate (CTR)
```javascript
// CTR = clicks from thumbnail / impressions
CTR = (impressions_clicked / impressions_shown) × 100

// YouTube benchmarks:
// - Good: 4-8%
// - Excellent: 8-12%
// - Viral: 12%+
```

## Performance Metrics

### Outlier Score (Anomaly Detection)
```javascript
// Compare video to channel average
outlierScore = video_views / channel_average_views

// Classification:
// > 3.0 = Extreme outlier (mega viral)
// 1.5-3.0 = Strong outlier (viral)
// 1.0-1.5 = Slightly above average
// < 1.0 = Below average

// YouTube example:
// Channel avg: 100K views/video
// Video views: 500K → Score = 5.0x (Extreme outlier)
```

### View Velocity
```javascript
// Growth rate in specific timeframe
velocity_24h = (views_now - views_24h_ago) / 24 hours

// Classification:
// < 100 views/hour = Slow growth
// 100-500 views/hour = Normal growth
// 500+ views/hour = Rapid growth
// 1000+ views/hour = Viral
```

### Growth Rate
```javascript
// Percentage growth over period
growthRate = ((latest_views - oldest_views) / oldest_views) × 100

// Example (7-day):
// Day 1: 1,000 views
// Day 7: 5,000 views
// Growth = (5000 - 1000) / 1000 × 100 = 400%
```

## Revenue Metrics

### CPM (Cost Per Mille)
```javascript
// How much advertisers pay YouTube per 1000 views
// CPM varies by region and content category

// Base CPM Rates (2024):
const cpmRates = {
  'US': {
    'tech': 8.50,
    'finance': 12.00,
    'gaming': 6.50,
    'education': 5.50
  },
  'UK': {
    'tech': 7.50,
    'finance': 10.50,
    'gaming': 5.80,
    'education': 4.80
  },
  'India': {
    'tech': 2.50,
    'finance': 3.50,
    'gaming': 1.80,
    'education': 1.50
  }
};
```

### RPM (Revenue Per Mille)
```javascript
// What creators actually earn per 1000 views
// YouTube pays creators ~55% of CPM
RPM = CPM × 0.55

// Example:
// CPM = $10
// RPM = $10 × 0.55 = $5.50 per 1000 views
```

### Ad Revenue
```javascript
ad_revenue = (views / 1000) × CPM

// Example:
// Views: 500,000
// CPM: $8.00 (Tech, US)
// Revenue = (500,000 / 1000) × 8 = $4,000
```

### Projected Earnings
```javascript
monthly_estimate = ad_revenue × 4  // ~4 weeks/month
yearly_estimate = ad_revenue × 52  // ~52 weeks/year

// More accurate:
// monthly = ad_revenue × (365/12) / 1000
// yearly = ad_revenue × 365 / 1000

// Conservative estimate (after taxes/fees):
// creator_take = yearly × 0.70  // 30% to platform/taxes
```

### Example Calculation
```javascript
// Video: 1 Million Views, Technology Category, US

const views = 1_000_000;
const cpm = 8.50;
const rpm = cpm * 0.55;

const adRevenue = (views / 1000) * cpm;      // $8,500
const monthlyEstimate = adRevenue * 4;       // $34,000
const yearlyEstimate = adRevenue * 52;       // $442,000
const creatorTake = yearlyEstimate * 0.70;   // $309,400
```

## Retention Curve

### Exponential Decay Model
```javascript
// Realistic viewer drop-off pattern
// Viewers tend to leave at exponential rate

function generateRetentionCurve(baseRetention = 100, decayRate = 0.012) {
  const curve = [];
  
  for (let percentile = 0; percentile <= 100; percentile += 5) {
    const retention = baseRetention * Math.exp(-decayRate * percentile);
    curve.push({
      percentile,
      retention: Math.max(10, retention)  // Min 10% retention
    });
  }
  
  return curve;
}

// Output example:
// 0%: 100%
// 5%: 94%
// 10%: 89%
// 25%: 74%
// 50%: 55%
// 75%: 41%
// 100%: 30%
```

### Critical Drop-off Points
```javascript
// YouTube videos typically lose:
// 50% viewers by 50% of video (for average videos)
// 80% viewers by video end (typical)
// 90% viewers who didn't complete (high engagement)

// Good videos:
// 60% retention at 50% mark
// 40% retention at end

// Excellent videos:
// 70%+ retention at 50% mark
// 50%+ retention at end
```

## Similar Video Discovery

### Tag-Based Similarity
```javascript
function findSimilarVideos(targetVideo) {
  return videos.filter(v => 
    v.id !== targetVideo.id &&
    v.category === targetVideo.category &&
    v.tags.some(tag => targetVideo.tags.includes(tag))
  ).sort((a, b) => b.engagementRate - a.engagementRate);
}

// Matching criteria:
// 1. Same category
// 2. At least one common tag
// 3. Sorted by engagement (best first)
```

### Similarity Score
```javascript
// Advanced similarity scoring
function calculateSimilarity(video1, video2) {
  const categoryMatch = video1.category === video2.category ? 1 : 0;
  const commonTags = video1.tags.filter(t => video2.tags.includes(t)).length;
  const durationDiff = Math.abs(video1.duration - video2.duration) / 600;  // normalized
  const engagementDiff = Math.abs(video1.engagement - video2.engagement) / 10;
  
  const similarity = (
    categoryMatch * 0.4 +           // 40% weight
    (commonTags / 5) * 0.3 +        // 30% weight
    (1 - durationDiff) * 0.2 +      // 20% weight
    (1 - engagementDiff) * 0.1      // 10% weight
  );
  
  return similarity;
}

// Score range: 0-1
// > 0.7 = Highly similar
// 0.5-0.7 = Similar
// < 0.5 = Somewhat similar
```

## Date Formatting

### Relative Time
```javascript
function formatDate(date) {
  const diff = Date.now() - new Date(date);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days/7)} weeks ago`;
  if (days < 365) return `${Math.floor(days/30)} months ago`;
  return `${Math.floor(days/365)} years ago`;
}

// Output: "2 days ago", "3 weeks ago", etc.
```

### View Count Formatting
```javascript
function formatViewCount(views) {
  if (views >= 1_000_000) return (views / 1_000_000).toFixed(1) + 'M';
  if (views >= 1_000) return (views / 1_000).toFixed(1) + 'K';
  return views.toString();
}

// Examples:
// 1,500,000 → "1.5M"
// 45,000 → "45K"
// 350 → "350"
```

## Database Queries

### Count Videos by Status
```javascript
db.videos.aggregate([
  {
    $group: {
      _id: null,
      totalVideos: { $sum: 1 },
      avgViews: { $avg: '$views' },
      avgEngagement: { $avg: '$engagementRate' },
      maxViews: { $max: '$views' },
      minViews: { $min: '$views' }
    }
  }
]);
```

### Find Outliers
```javascript
// Videos performing > 1.5x channel average
db.videos.aggregate([
  {
    $lookup: {
      from: 'channels',
      localField: 'channelId',
      foreignField: 'channelId',
      as: 'channel'
    }
  },
  {
    $addFields: {
      outlierScore: {
        $divide: ['$views', { $arrayElemAt: ['$channel.averageViews', 0] }]
      }
    }
  },
  {
    $match: {
      outlierScore: { $gte: 1.5 }
    }
  },
  {
    $sort: { outlierScore: -1 }
  }
]);
```

### Engagement Trends
```javascript
// Average engagement by day for 7 days
db.videoMetrics.aggregate([
  {
    $match: {
      timestamp: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    }
  },
  {
    $group: {
      _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
      avgCTR: { $avg: '$ctr' },
      avgEngagement: { $avg: '$engagementRate' },
      count: { $sum: 1 }
    }
  },
  {
    $sort: { _id: 1 }
  }
]);
```

## Performance Benchmarks

### According to YouTube Creator Academy:

**Engagement Rates**
- Good: 2-5%
- Excellent: 5-10%
- Outstanding: 10%+

**Click-Through Rate (CTN)**
- Below average: < 2%
- Average: 2-4%
- Good: 4-6%
- Excellent: 6-8%
- Outstanding: 8%+

**Audience Retention**
- Good: 40% at video end
- Excellent: 50% at video end
- Outstanding: 60%+ at video end

**Topic CPM Rankings**
1. Finance & Investment: $10-15
2. Technology: $7-10
3. Business: $6-9
4. Education: $4-7
5. Gaming: $5-8
6. Entertainment: $3-6
7. Lifestyle: $2-5
8. News & Politics: $4-8

## Validation Rules

```javascript
// Validate video metrics
function validateMetrics(metrics) {
  const valid =
    metrics.views >= 0 &&
    metrics.likes >= 0 && metrics.likes <= metrics.views &&
    metrics.comments >= 0 &&
    metrics.shares >= 0 &&
    metrics.engagementRate >= 0 && metrics.engagementRate <= 100 &&
    metrics.ctr >= 0 && metrics.ctr <= 100 &&
    metrics.velocity >= 0;
  
  return valid;
}
```

## Common Issues & Fixes

**Issue**: Retention curve shows 100% at end
**Fix**: Ensure exponential decay is applied correctly

**Issue**: Earnings way too high/low
**Fix**: Check CPM rates match creator's region and content niche

**Issue**: Outlier score always high
**Fix**: Verify channel.averageViews is calculated and stored

**Issue**: No similar videos found
**Fix**: Ensure videos have tags and category assigned

**Issue**: CTR showing as 0
**Fix**: Verify clickThroughRate field is populated in metrics
