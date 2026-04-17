import express from 'express';

const router = express.Router();

// Mock function to generate realistic Google Trends-like data
const generateTrendsData = (keyword, days = 90, region = 'US') => {
  const data = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate realistic trend data with some randomness and variation
    const baseValue = 50;
    const trendDirection = Math.random() > 0.5 ? 1 : -1;
    const variance = Math.random() * 40 - 20; // -20 to +20
    const noise = (Math.random() - 0.5) * 10; // Random noise
    const seasonality = Math.sin((i / days) * Math.PI * 2) * 15; // Cyclical pattern
    
    const value = Math.max(0, Math.min(100, baseValue + trendDirection * variance + noise + seasonality));
    
    data.push({
      date: date.toISOString().split('T')[0],
      interest: Math.round(value),
    });
  }
  
  return data;
};

// Generate top queries for a keyword
const generateTopQueries = (keyword) => {
  const topQueries = [
    { query: `${keyword}`, volume: 1000000, percentChange: 0 },
    { query: `${keyword} meaning`, volume: 850000, percentChange: 5 },
    { query: `${keyword} definition`, volume: 720000, percentChange: -2 },
    { query: `${keyword} tutorial`, volume: 650000, percentChange: 8 },
    { query: `${keyword} course`, volume: 580000, percentChange: 12 },
    { query: `how to ${keyword}`, volume: 520000, percentChange: 3 },
    { query: `${keyword} explained`, volume: 480000, percentChange: 15 },
    { query: `best ${keyword}`, volume: 420000, percentChange: -5 },
    { query: `${keyword} for beginners`, volume: 380000, percentChange: 7 },
    { query: `${keyword} free`, volume: 350000, percentChange: 10 },
  ];
  
  return topQueries;
};

// Generate rising queries (queries with high growth)
const generateRisingQueries = (keyword) => {
  const risingQueries = [
    { query: `${keyword} 2024`, volume: 450000, growth: 2500, unit: '%' },
    { query: `${keyword} GitHub`, volume: 380000, growth: 1850, unit: '%' },
    { query: `${keyword} vs Python`, volume: 320000, growth: 1650, unit: '%' },
    { query: `${keyword} API`, volume: 280000, growth: 1420, unit: '%' },
    { query: `${keyword} framework`, volume: 240000, growth: 1250, unit: '%' },
    { query: `${keyword} library`, volume: 210000, growth: 980, unit: '%' },
    { query: `${keyword} best practices`, volume: 190000, growth: 850, unit: '%' },
    { query: `${keyword} performance`, volume: 160000, growth: 720, unit: '%' },
  ];
  
  return risingQueries;
};

// Generate commonly searched queries
const generateCommonlySearched = (keyword) => {
  const commonly = [
    { query: `${keyword} github`, frequency: 'Very High', trend: 'up' },
    { query: `${keyword} tutorial`, frequency: 'Very High', trend: 'up' },
    { query: `${keyword} documentation`, frequency: 'High', trend: 'stable' },
    { query: `${keyword} download`, frequency: 'High', trend: 'down' },
    { query: `${keyword} install`, frequency: 'High', trend: 'stable' },
    { query: `${keyword} example`, frequency: 'Medium', trend: 'up' },
    { query: `${keyword} vs`, frequency: 'Medium', trend: 'stable' },
    { query: `${keyword} price`, frequency: 'Medium', trend: 'down' },
  ];
  
  return commonly;
};

// Get comprehensive Google Trends data for a specific keyword/topic
router.get('/trends', async (req, res) => {
  try {
    const { keyword, days = 90, region = 'US', category = null } = req.query;

    if (!keyword) {
      return res.status(400).json({ error: 'Keyword parameter is required' });
    }

    console.log('[Trends] Fetching data for:', {
      keyword,
      days,
      region,
      category,
    });

    try {
      // Try to use google-trends-api if available
      const googleTrends = require('google-trends-api');
      
      const timelineData = await googleTrends.interestOverTime({
        keyword: keyword,
        startTime: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        granularTimeResolution: false,
      }).then(results => {
        return JSON.parse(results);
      });

      // Format data for charts
      const formattedData = timelineData.default.map((item) => ({
        date: new Date(item.time * 1000).toISOString().split('T')[0],
        interest: item.value,
      }));

      console.log('[Trends] Successfully fetched real Google Trends data');

      res.json({
        message: 'Google Trends data retrieved',
        data: {
          keyword,
          region,
          category,
          timeline: formattedData,
          topQueries: generateTopQueries(keyword),
          risingQueries: generateRisingQueries(keyword),
          commonlySearched: generateCommonlySearched(keyword),
          isRealData: true,
        },
      });
    } catch (error) {
      // Fallback to mock data if google-trends-api fails
      console.log('[Trends] Using mock data fallback:', error.message);

      const trendsData = generateTrendsData(keyword, parseInt(days), region);

      res.json({
        message: 'Trends data retrieved (simulated)',
        data: {
          keyword,
          region,
          category,
          timeline: trendsData,
          topQueries: generateTopQueries(keyword),
          risingQueries: generateRisingQueries(keyword),
          commonlySearched: generateCommonlySearched(keyword),
          isRealData: false,
        },
      });
    }
  } catch (error) {
    console.error('[Trends] Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch trends data',
      message: error.message,
    });
  }
});

// Get trending topics in a category
router.get('/trending-topics', async (req, res) => {
  try {
    const { category = 'All', region = 'US' } = req.query;

    console.log('[Trending Topics] Fetching topics for:', { category, region });

    // Mock trending topics data
    const trendingTopics = {
      All: ['AI Technology', 'Cryptocurrency', 'Gaming', 'Social Media', 'Web Development', 'Machine Learning', 'Cloud Computing', 'Python', 'JavaScript', 'React'],
      Technology: ['AI', 'Machine Learning', 'Web3', 'Cloud Computing', 'DevOps', 'Cybersecurity', 'API Development', 'Database', 'Microservices', 'Kubernetes'],
      Gaming: ['Gaming', 'Esports', 'Game Development', 'Streaming', 'Console', 'PC Gaming', 'Mobile Gaming', 'Indie Games', 'Game Design', 'Unity'],
      Finance: ['Stock Market', 'Crypto Trading', 'Investment', 'Forex', 'Finance', 'Trading', 'Stocks', 'Bonds', 'ETF', 'Wealth Management'],
      Entertainment: ['Movies', 'Music', 'Celebrity', 'Entertainment', 'Streaming', 'Series', 'Comedy', 'Viral', 'TikTok', 'YouTube'],
      Education: ['Courses', 'Online Learning', 'Education', 'Programming', 'Language Learning', 'Skills', 'Tutorial', 'Bootcamp', 'Certification', 'University'],
    };

    const topics = trendingTopics[category] || trendingTopics.All;

    res.json({
      message: 'Trending topics retrieved',
      data: {
        category,
        region,
        topics,
      },
    });
  } catch (error) {
    console.error('[Trending Topics] Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch trending topics',
      message: error.message,
    });
  }
});

// Get related keywords
router.get('/related-keywords', async (req, res) => {
  try {
    const { keyword, region = 'US' } = req.query;

    if (!keyword) {
      return res.status(400).json({ error: 'Keyword parameter is required' });
    }

    console.log('[Related Keywords] Fetching for:', { keyword, region });

    try {
      // Try to use google-trends-api if available
      const googleTrends = require('google-trends-api');
      
      const relatedData = await googleTrends.relatedQueries({
        keyword: keyword,
      }).then(results => {
        return JSON.parse(results);
      });

      res.json({
        message: 'Related keywords retrieved',
        data: {
          keyword,
          related: relatedData.default.top.map(item => ({
            query: item.query,
            value: item.value,
          })) || [],
          isRealData: true,
        },
      });
    } catch (error) {
      // Fallback mock data
      console.log('[Related Keywords] Using mock data fallback');

      const mockRelated = [
        { query: `${keyword} tutorial`, value: 95 },
        { query: `${keyword} course`, value: 88 },
        { query: `${keyword} guide`, value: 82 },
        { query: `${keyword} trending`, value: 75 },
        { query: `best ${keyword}`, value: 72 },
        { query: `${keyword} 2024`, value: 68 },
        { query: `learn ${keyword}`, value: 65 },
        { query: `${keyword} tips`, value: 60 },
      ];

      res.json({
        message: 'Related keywords retrieved (simulated)',
        data: {
          keyword,
          related: mockRelated,
          isRealData: false,
        },
      });
    }
  } catch (error) {
    console.error('[Related Keywords] Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch related keywords',
      message: error.message,
    });
  }
});

export default router;
