import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Video from '../models/Video.js';
import Channel from '../models/Channel.js';
import VideoMetrics from '../models/VideoMetrics.js';
import User from '../models/User.js';

// Load from the same .env file as server.js
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/trendtube';

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Video.deleteMany({});
    await Channel.deleteMany({});
    await VideoMetrics.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Create demo user for testing
    console.log('Creating demo user...');
    const hashedPassword = await bcryptjs.hash('password123', 10);
    await User.create({
      email: 'demo@example.com',
      password: hashedPassword,
      username: 'demo_user',
      subscription: 'pro',
    });
    console.log('Demo user created: demo@example.com / password123');

    // Create comprehensive test channels with real-world data
    const channels = await Channel.insertMany([
      // Top Tier Channels (1M+ subscribers)
      {
        channelId: 'UCkRfArvrzheW2E7b6SVV7vA',
        name: 'Tech With Tim',
        subscribers: 2100000,
        totalViews: 285000000,
        videoCount: 450,
        description: 'Web development, programming, and tech tutorials',
        thumbnail: 'https://ui-avatars.com/api/?name=Tech+With+Tim\&background=0D8ABC\&color=fff\&size=200',
        averageViews: 633333,
        category: 'Technology',
        country: 'US',
        url: 'https://youtube.com/@TechWithTim',
      },
      {
        channelId: 'UCFbNIlppjgumLqzJAltAP9w',
        name: 'Traversy Media',
        subscribers: 1900000,
        totalViews: 225000000,
        videoCount: 850,
        description: 'Modern web development, JavaScript, React, Node.js',
        thumbnail: 'https://ui-avatars.com/api/?name=Traversy+Media\&background=3498DB\&color=fff\&size=200',
        averageViews: 264706,
        category: 'Programming',
        country: 'US',
        url: 'https://youtube.com/@TraversyMedia',
      },
      {
        channelId: 'UCbmNph7DwFD0-75DwAKiO7g',
        name: 'freeCodeCamp.org',
        subscribers: 5200000,
        totalViews: 580000000,
        videoCount: 2100,
        description: 'Learn to code for free',
        thumbnail: 'https://ui-avatars.com/api/?name=freeCodeCamp\&background=304455\&color=fff\&size=200',
        averageViews: 276190,
        category: 'Programming',
        country: 'US',
        url: 'https://youtube.com/@freecodecamp',
      },
      {
        channelId: 'UCW6TXMJDG7bznBIute2biVA',
        name: 'Kyle Cook',
        subscribers: 820000,
        totalViews: 95000000,
        videoCount: 320,
        description: 'Advanced JavaScript and web development tutorials',
        thumbnail: 'https://ui-avatars.com/api/?name=Kyle+Cook\&background=1E90FF\&color=fff\&size=200',
        averageViews: 296875,
        category: 'Programming',
        country: 'US',
        url: 'https://youtube.com/@KyleCook',
      },

      // AI & Machine Learning
      {
        channelId: 'UC7_ZCqq2ch7vONcSXXRE3BA',
        name: 'Jeremy Howard',
        subscribers: 420000,
        totalViews: 65000000,
        videoCount: 180,
        description: 'Deep learning and AI research',
        thumbnail: 'https://ui-avatars.com/api/?name=Jeremy+Howard\&background=FF6B35\&color=fff\&size=200',
        averageViews: 361111,
        category: 'AI',
        country: 'US',
        url: 'https://youtube.com/@JeremyHoward',
      },
      {
        channelId: 'UCBIBY-HMZXQJ3YN0qYRJ-Ow',
        name: 'Greg Hogg',
        subscribers: 356000,
        totalViews: 48000000,
        videoCount: 245,
        description: 'Machine learning and AI tutorials',
        thumbnail: 'https://ui-avatars.com/api/?name=Greg+Hogg\&background=004E89\&color=fff\&size=200',
        averageViews: 195918,
        category: 'AI',
        country: 'UK',
        url: 'https://youtube.com/@GregHogg',
      },
      {
        channelId: 'UCr8O8l5oNX5zqyXAggnBUJA',
        name: 'Yannic Kilcher',
        subscribers: 1050000,
        totalViews: 185000000,
        videoCount: 580,
        description: 'AI research paper reviews and analysis',
        thumbnail: 'https://ui-avatars.com/api/?name=Yannic+Kilcher\&background=7209B7\&color=fff\&size=200',
        averageViews: 318966,
        category: 'AI',
        country: 'Switzerland',
        url: 'https://youtube.com/@YannicKilcher',
      },

      // Tech & Electronics
      {
        channelId: 'UCGy47dKQX-Yv6237XPCcsSw',
        name: 'MKBHD',
        subscribers: 19200000,
        totalViews: 3200000000,
        videoCount: 1500,
        description: 'Tech reviews, videos and short films',
        thumbnail: 'https://ui-avatars.com/api/?name=MKBHD\&background=F72585\&color=fff\&size=200',
        averageViews: 2133333,
        category: 'Technology',
        country: 'US',
        url: 'https://youtube.com/@mkbhd',
      },
      {
        channelId: 'UCn8Y0sg1993eMTtz_wNrMoQ',
        name: 'Linus Tech Tips',
        subscribers: 15100000,
        totalViews: 2850000000,
        videoCount: 5000,
        description: 'Tech reviews, Linux, hardware',
        thumbnail: 'https://ui-avatars.com/api/?name=Linus+Tech+Tips\&background=B5179E\&color=fff\&size=200',
        averageViews: 570000,
        category: 'Technology',
        country: 'Canada',
        url: 'https://youtube.com/@LinusTechTips',
      },
      {
        channelId: 'UCbF3eESrWuxo-mk7RqncsKA',
        name: 'JerryRigEverything',
        subscribers: 12500000,
        totalViews: 2100000000,
        videoCount: 1200,
        description: 'Durability and teardown tests',
        thumbnail: 'https://ui-avatars.com/api/?name=Tech+With+Tim\&background=0D8ABC\&color=fff\&size=2000',
        averageViews: 1750000,
        category: 'Technology',
        country: 'US',
        url: 'https://youtube.com/@JerryRigEverything',
      },

      // Web Development
      {
        channelId: 'UC8butISFMcsM6kSgMVXUWPA',
        name: 'Web Dev Simplified',
        subscribers: 2450000,
        totalViews: 387000000,
        videoCount: 650,
        description: 'Web development made simple',
        thumbnail: 'https://ui-avatars.com/api/?name=Tech+With+Tim\&background=0D8ABC\&color=fff\&size=2001',
        averageViews: 595385,
        category: 'Programming',
        country: 'US',
        url: 'https://youtube.com/@WebDevSimplified',
      },
      {
        channelId: 'UCB6-TAcTKwasLJW8dty7WDQ',
        name: 'Coding with Mosh',
        subscribers: 3150000,
        totalViews: 425000000,
        videoCount: 280,
        description: 'Programming tutorials for beginners to advanced',
        thumbnail: 'https://ui-avatars.com/api/?name=Tech+With+Tim\&background=0D8ABC\&color=fff\&size=2002',
        averageViews: 1517857,
        category: 'Programming',
        country: 'Australia',
        url: 'https://youtube.com/@programmingwithmosh',
      },
      {
        channelId: 'UCwBCWJnIjS6QBsapMml2-Tg',
        name: 'Programming with Mosh',
        subscribers: 2800000,
        totalViews: 380000000,
        videoCount: 350,
        description: 'Learn web development and programming',
        thumbnail: 'https://ui-avatars.com/api/?name=Tech+With+Tim\&background=0D8ABC\&color=fff\&size=2003',
        averageViews: 1085714,
        category: 'Programming',
        country: 'Australia',
        url: 'https://youtube.com/@ProgrammingwithMosh',
      },

      // Data Science
      {
        channelId: 'UCfV36TX5AejfAGIbtwTc8Zw',
        name: 'StatQuest',
        subscribers: 950000,
        totalViews: 125000000,
        videoCount: 180,
        description: 'Statistics and machine learning explained',
        thumbnail: 'https://ui-avatars.com/api/?name=Tech+With+Tim\&background=0D8ABC\&color=fff\&size=2004',
        averageViews: 694444,
        category: 'Data Science',
        country: 'US',
        url: 'https://youtube.com/@statquest',
      },
      {
        channelId: 'UCnxSrWQbozJKs8l8or6SnEA',
        name: 'AIEngineering',
        subscribers: 180000,
        totalViews: 18000000,
        videoCount: 95,
        description: 'AI and machine learning engineering',
        thumbnail: 'https://ui-avatars.com/api/?name=Tech+With+Tim\&background=0D8ABC\&color=fff\&size=2005',
        averageViews: 189474,
        category: 'AI',
        country: 'Global',
        url: 'https://youtube.com/@AIEngineering',
      },

      // Original Test Channels
      {
        channelId: 'UCtech123',
        name: 'Tech Vault',
        subscribers: 500000,
        totalViews: 25000000,
        videoCount: 150,
        description: 'Tech and AI content',
        thumbnail: 'https://ui-avatars.com/api/?name=TrendTube&background=6200EA&color=fff&size=200',
        averageViews: 166667,
        category: 'Technology',
        country: 'US',
        url: 'https://youtube.com/@techvault',
      },
      {
        channelId: 'UCcode456',
        name: 'Code Master',
        subscribers: 300000,
        totalViews: 12000000,
        videoCount: 100,
        description: 'Programming tutorials',
        thumbnail: 'https://ui-avatars.com/api/?name=TrendTube&background=6200EA&color=fff&size=200',
        averageViews: 120000,
        category: 'Programming',
        country: 'US',
        url: 'https://youtube.com/@codemaster',
      },
      {
        channelId: 'UCAi789',
        name: 'AI Explained',
        subscribers: 800000,
        totalViews: 50000000,
        videoCount: 120,
        description: 'AI and Machine Learning',
        thumbnail: 'https://ui-avatars.com/api/?name=TrendTube&background=6200EA&color=fff&size=200',
        averageViews: 416667,
        category: 'AI',
        country: 'Global',
        url: 'https://youtube.com/@aiexplained',
      },
    ]);
    console.log('Created channels');

    // Create test videos with actual metrics
    const videoData = [
      {
        videoId: 'vid1_ai_agents',
        title: 'I Built a Mass AI Agent System',
        description: 'Building scalable AI agent systems',
        channelId: 'UCtech123',
        channelName: 'Tech Vault',
        thumbnail: 'https://via.placeholder.com/320x180?text=TrendTube+Video&bg=6200EA&c=fff',
        views: 2400000,
        likes: 45000,
        comments: 8000,
        shares: 2500,
        duration: 1420,
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        tags: ['AI', 'agents', 'automation', 'tech', 'tutorial'],
        category: 'Technology',
        engagementRate: 2.23,
        outlierScore: 0,
        aiAnalysis: {
          viralKeywords: ['AI', 'agents', 'automation'],
          improvedTitle: 'How I Created an AI Agent Army (Scalable)',
          contentIdeas: ['Agent frameworks', 'Production deployment', 'Cost optimization'],
          thumbnailSuggestions: ['Action shot', 'Red accent', 'Bold text'],
          trendScore: 8.5,
        },
      },
      {
        videoId: 'vid2_dev_tools',
        title: 'Why Every Developer Needs This Tool',
        description: 'Essential development tools',
        channelId: 'UCcode456',
        channelName: 'Code Master',
        thumbnail: 'https://via.placeholder.com/320x180?text=TrendTube+Video&bg=6200EA&c=fff',
        views: 890000,
        likes: 12500,
        comments: 3200,
        shares: 850,
        duration: 980,
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        tags: ['programming', 'tools', 'development', 'tips'],
        category: 'Technology',
        engagementRate: 1.79,
        outlierScore: 0,
        aiAnalysis: {
          viralKeywords: ['tool', 'essential', 'productivity'],
          improvedTitle: 'This One Tool Changed My Entire Development Workflow',
          contentIdeas: ['Advanced features', 'Integration tutorial', 'Comparison'],
          thumbnailSuggestions: ['Tool icon', 'Before/after', 'Shocked expression'],
          trendScore: 7.2,
        },
      },
      {
        videoId: 'vid3_ai_future',
        title: 'The Future of AI Is Here',
        description: 'AI trends and predictions',
        channelId: 'UCAi789',
        channelName: 'AI Explained',
        thumbnail: 'https://via.placeholder.com/320x180?text=TrendTube+Video&bg=6200EA&c=fff',
        views: 5100000,
        likes: 102000,
        comments: 15000,
        shares: 5600,
        duration: 1850,
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        tags: ['AI', 'future', 'technology', 'research', 'trends'],
        category: 'Technology',
        engagementRate: 2.30,
        outlierScore: 12.2,
        aiAnalysis: {
          viralKeywords: ['future', 'AI', 'prediction', 'trends'],
          improvedTitle: '5 AI Breakthroughs That Will Change Everything in 2024',
          contentIdeas: ['Case studies', 'Expert interviews', 'Timeline prediction'],
          thumbnailSuggestions: ['Crystal ball', 'Futuristic design', 'Bold prediction'],
          trendScore: 9.1,
        },
      },
      {
        videoId: 'vid4_python_tips',
        title: '10 Coding Mistakes You\'re Making',
        description: 'Common coding errors',
        channelId: 'UCcode456',
        channelName: 'Code Master',
        thumbnail: 'https://via.placeholder.com/320x180?text=TrendTube+Video&bg=6200EA&c=fff',
        views: 1200000,
        likes: 19000,
        comments: 4500,
        shares: 1200,
        duration: 1540,
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        tags: ['programming', 'mistakes', 'tips', 'best-practices'],
        category: 'Education',
        engagementRate: 1.96,
        outlierScore: 10.0,
        aiAnalysis: {
          viralKeywords: ['mistakes', 'tips', 'beginners', 'common'],
          improvedTitle: 'TOP 10 Python Mistakes That Kill Your Code',
          contentIdeas: ['Advanced patterns', 'Anti-patterns', 'Performance'],
          thumbnailSuggestions: ['X mark', 'Red theme', 'Surprised face'],
          trendScore: 7.8,
        },
      },
      {
        videoId: 'vid5_career_advice',
        title: 'This Changed My Programming Career',
        description: 'Career development tips',
        channelId: 'UCcode456',
        channelName: 'Code Master',
        thumbnail: 'https://via.placeholder.com/320x180?text=TrendTube+Video&bg=6200EA&c=fff',
        views: 670000,
        likes: 9500,
        comments: 2100,
        shares: 640,
        duration: 1200,
        publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        tags: ['career', 'programming', 'growth', 'motivation'],
        category: 'Education',
        engagementRate: 1.76,
        outlierScore: 5.6,
        aiAnalysis: {
          viralKeywords: ['career', 'transformation', 'advice'],
          improvedTitle: 'The Skill That Got Me Hired 10x Faster',
          contentIdeas: ['Personal story', 'Skill breakdown', 'Learning path'],
          thumbnailSuggestions: ['Before/after', 'Chart growth', 'Testimonial'],
          trendScore: 6.9,
        },
      },
      {
        videoId: 'vid6_ai_takeover',
        title: 'AI Agents Are Taking Over',
        description: 'AI automation discussion',
        channelId: 'UCAi789',
        channelName: 'AI Explained',
        thumbnail: 'https://via.placeholder.com/320x180?text=TrendTube+Video&bg=6200EA&c=fff',
        views: 3800000,
        likes: 76000,
        comments: 11000,
        shares: 4200,
        duration: 1650,
        publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        tags: ['AI', 'agents', 'automation', 'future', 'work'],
        category: 'Technology',
        engagementRate: 2.29,
        outlierScore: 9.1,
        aiAnalysis: {
          viralKeywords: ['AI', 'takeover', 'automation', 'jobs'],
          improvedTitle: 'AI Agents Will Replace 90% of Jobs (Here\'s Why)',
          contentIdeas: ['Economic impact', 'Adaptation strategies', 'New opportunities'],
          thumbnailSuggestions: ['Robot hands', 'Scary/intriguing', 'Warning tone'],
          trendScore: 8.8,
        },
      },
    ];

    const videos = await Video.insertMany(videoData);
    console.log('Created videos');

    const metricsData = [];
    const now = Date.now();

    for (const video of videos) {
      // Create 7 days of metrics data
      for (let day = 0; day < 7; day++) {
        const daysAgo = 7 - day;
        const timestamp = new Date(now - daysAgo * 24 * 60 * 60 * 1000);
        
        // Simulate realistic growth curves with safe number calculations
        const dayDecay = 1 - (day * 0.12); // Linear decay factor
        
        const views = Math.max(100, Math.floor(video.views * dayDecay));
        const likes = Math.max(1, Math.floor(video.likes * dayDecay));
        const comments = Math.max(1, Math.floor(video.comments * dayDecay));
        // Calculate shares based on engagement (video doesn't have a shares field in DB)
        const shares = Math.max(1, Math.floor((video.likes / 10) * dayDecay));
        
        // Calculate rates as numbers (not strings) - ensure they are never NaN
        const likeRateNum = views > 0 ? parseFloat(((likes / views) * 100).toFixed(2)) || 0 : 0;
        const commentRateNum = views > 0 ? parseFloat(((comments / views) * 100).toFixed(2)) || 0 : 0;
        const shareRateNum = views > 0 ? parseFloat(((shares / views) * 100).toFixed(2)) || 0 : 0;
        
        const metric = {
          videoId: video.videoId,
          views: views,
          likes: likes,
          comments: comments,
          shares: shares,  // Now guaranteed to be a number
          engagementRate: Math.max(0.1, parseFloat((((likes + comments) / views) * 100).toFixed(2))),
          ctr: Math.max(0.5, parseFloat((video.engagementRate * (0.8 + Math.random() * 0.4)).toFixed(2))),
          avgViewDuration: Math.floor(video.duration * (0.5 + Math.random() * 0.3)),
          impressions: Math.floor(views * (1.1 + Math.random() * 0.2)),
          clickThroughRate: Math.max(1, parseFloat((video.engagementRate * 1.2).toFixed(2))),
          likeRate: likeRateNum,
          commentRate: commentRateNum,
          shareRate: shareRateNum,
          velocity: Math.floor(Math.random() * 1500 + 300),
          retentionCurve: [
            { percentile: 0, retention: 100 },
            { percentile: 5, retention: 95 },
            { percentile: 10, retention: 88 },
            { percentile: 25, retention: 72 },
            { percentile: 50, retention: 55 },
            { percentile: 75, retention: 41 },
            { percentile: 100, retention: 30 },
          ],
          timestamp: timestamp,
        };
        
        metricsData.push(metric);
      }
    }

    await VideoMetrics.insertMany(metricsData);
    console.log(`Created ${metricsData.length} metric records`);

    console.log('\n✅ Test data seeded successfully!');
    console.log(`\nCreated:`);
    console.log(`- ${channels.length} channels`);
    console.log(`- ${videos.length} videos`);
    console.log(`- ${metricsData.length} metric records`);
    console.log('\nYou can now test the analytics endpoints with these video IDs:');
    videos.forEach((v) => {
      console.log(`  - ${v.videoId}: ${v.title}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();



