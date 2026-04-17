import express from 'express';
import axios from 'axios';

const router = express.Router();
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash';

// Debug endpoint
router.get('/debug', (req, res) => {
  res.json({
    message: 'Video Analyzer Debug Info',
    status: 'Route is registered and working',
    youtube_api_key: YOUTUBE_API_KEY ? `Configured (length: ${YOUTUBE_API_KEY.length})` : 'NOT SET',
    gemini_api_key: GEMINI_API_KEY ? `Configured (length: ${GEMINI_API_KEY.length})` : 'NOT SET',
  });
});

// Test endpoint
router.get('/test', (req, res) => {
  res.json({
    message: 'Video Analyzer is working!',
    timestamp: new Date().toISOString(),
    usage: 'POST /api/video/analyze?url=YOUR_YOUTUBE_URL'
  });
});

// Helper function to extract video ID from YouTube URL
const extractVideoId = (url) => {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
};

// Helper function to call Gemini API
const callGeminiAPI = async (prompt) => {
  try {
    const response = await axios.post(
      `${GEMINI_API_BASE}:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    throw error;
  }
};

// Analyze YouTube video
router.get('/analyze', async (req, res) => {
  try {
    const { url } = req.query;
    
    console.log('[Video Analyzer] Request received with URL:', url);

    if (!url) {
      console.log('[Video Analyzer] Error: URL parameter is missing');
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Extract video ID
    const videoId = extractVideoId(url);
    console.log('[Video Analyzer] Extracted video ID:', videoId);
    
    if (!videoId) {
      console.log('[Video Analyzer] Error: Could not extract video ID from URL');
      return res.status(400).json({ error: 'Invalid YouTube URL format' });
    }

    // Validate API keys
    if (!YOUTUBE_API_KEY) {
      console.error('[Video Analyzer] Error: YouTube API key not configured');
      return res.status(500).json({ error: 'YouTube API key not configured' });
    }

    console.log('[Video Analyzer] Fetching video details from YouTube API...');
    
    // Fetch video details from YouTube API
    const videoResponse = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
      params: {
        part: 'snippet,statistics',
        id: videoId,
        key: YOUTUBE_API_KEY,
      },
    });

    console.log('[Video Analyzer] YouTube API response received');

    if (!videoResponse.data.items || videoResponse.data.items.length === 0) {
      console.log('[Video Analyzer] Error: Video not found on YouTube');
      return res.status(404).json({ error: 'Video not found' });
    }

    const video = videoResponse.data.items[0];
    const snippet = video.snippet;
    const stats = video.statistics;

    // Extract data
    const title = snippet.title;
    const description = snippet.description;
    const tags = snippet.tags || [];
    const views = parseInt(stats.viewCount) || 0;
    const likes = parseInt(stats.likeCount) || 0;
    const comments = parseInt(stats.commentCount) || 0;
    const channelTitle = snippet.channelTitle;
    const publishedAt = snippet.publishedAt;
    const thumbnail = snippet.thumbnails.high?.url || snippet.thumbnails.default?.url;

    // Calculate engagement rate
    const engagementRate = views > 0 ? ((likes + comments) / views).toFixed(3) : 0;

    console.log('[Video Analyzer] Video data extracted successfully');

    // Calculate basic scores
    const viewThreshold = 100000;
    const engagementThreshold = 0.05;
    const baseSeoScore = Math.min(100, (title.length >= 30 && title.length <= 60 ? 20 : 10) + (tags.length * 3));
    const baseViralScore = Math.min(100, Math.round((engagementRate / engagementThreshold) * 50 + (views > viewThreshold ? 30 : 10)));

    // Attempt Gemini AI analysis (optional enhancement)
    let aiAnalysis = {
      viralScore: baseViralScore,
      audience: ["General audience"],
      strengths: ["Published content"],
      weaknesses: ["Needs optimization"],
      titleSuggestions: [`${title} - Ultimate Guide`, `${title} Explained`, `Best Tips for ${title.split(' ')[0]}`],
      analysis: "Video analysis complete. Gemini API provides enhanced insights.",
      thumbnailScore: 65,
      thumbnailTips: ["Use high contrast colors", "Include text overlay", "Show emotions in face-centered thumbnails"],
      thumbnailTextIdeas: ["VIRAL!", "MUST WATCH", "TOP STRATEGY"],
      viralVideoIdeas: [
        `"Why ${title.split(' ')[0]} is Trending Now"`,
        `"${title} in 60 Seconds"`,
        `"The Truth About ${title.split(' ')[0]}"`
      ],
      keywordSuggestions: tags.slice(0, 5) || [],
      aiAnalysisOverview: "This video covers an interesting topic with good engagement potential.",
      retentionInsights: [
        "Hook viewers in the first 10 seconds with a compelling intro",
        "Add pattern interrupts at the 25% mark to prevent drop-off",
        "Include strong call-to-action and end screen at 90% mark"
      ],
      targetAudience: {
        type: "General audience",
        experienceLevel: "Beginner to Intermediate",
        interests: ["Content from video topic"],
        geographicRegion: "Global"
      }
    };

    // Try Gemini if enabled for enhanced analysis
    if (GEMINI_API_KEY) {
      try {
        console.log('[Video Analyzer] Attempting Gemini AI analysis...');
        
        // Main analysis prompt
        const mainPrompt = `You are a YouTube expert analyst. Analyze this video and provide DETAILED structured insights in JSON format.

Video: "${title}"
Description: "${description}"
Views: ${views.toLocaleString()}
Likes: ${likes.toLocaleString()}
Comments: ${comments.toLocaleString()}
Engagement Rate: ${(engagementRate * 100).toFixed(2)}%

Respond ONLY with valid JSON (no markdown, no extra text, no backticks):
{
  "viralScore": <0-100 based on views, likes, comments ratio>,
  "audience": ["type1", "type2", "type3"],
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "titleSuggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "analysis": "comprehensive 2-3 sentence analysis",
  "thumbnailScore": <0-100>,
  "thumbnailTips": ["tip1", "tip2", "tip3"],
  "thumbnailTextIdeas": ["text1", "text2", "text3"],
  "viralVideoIdeas": ["idea1", "idea2", "idea3"],
  "keywordSuggestions": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}`;

        // AI Analysis Overview prompt
        const overviewPrompt = `You are a YouTube expert. Analyze this video's content and performance.

Title: "${title}"
Description: "${description}"
Tags: ${JSON.stringify(tags)}
Views: ${views.toLocaleString()}
Likes: ${likes.toLocaleString()}
Comments: ${comments.toLocaleString()}

Provide a short, professional overview (2-3 sentences) explaining:
1. The main topic of the video
2. Why it may attract viewers
3. The content style or niche

Return ONLY the text, no JSON or markdown.`;

        // Retention Insights prompt
        const retentionPrompt = `You are a YouTube retention expert. Generate audience retention insights for this video.

Title: "${title}"
Description: "${description}"

Provide 3-4 concise bullet points on:
1. What hooks viewers in the beginning
2. Potential drop-off points and how to prevent them
3. Tips to maintain retention throughout
4. How to improve end-card performance

Return ONLY bullet points as a JSON array of strings, no markdown or other text. Format:
["point 1", "point 2", "point 3", "point 4"]`;

        // Target Audience prompt
        const audiencePrompt = `You are a YouTube audience analyst. Predict the target audience for this video.

Title: "${title}"
Description: "${description}"
Tags: ${JSON.stringify(tags)}

Return ONLY valid JSON with no markdown or extra text:
{
  "type": "audience type (e.g., students, gamers, traders, entrepreneurs)",
  "experienceLevel": "beginner/intermediate/advanced/mixed",
  "interests": ["interest1", "interest2", "interest3"],
  "geographicRegion": "likely geographic region or Global"
}`;

        // Make parallel API calls for all three specialized analyses
        console.log('[Video Analyzer] Making parallel Gemini AI calls...');
        
        const [mainResponse, overviewResponse, retentionResponse, audienceResponse] = await Promise.all([
          callGeminiAPI(mainPrompt),
          callGeminiAPI(overviewPrompt),
          callGeminiAPI(retentionPrompt),
          callGeminiAPI(audiencePrompt)
        ]);

        console.log('[Video Analyzer] All Gemini responses received');
        
        try {
          // Parse main analysis
          let jsonStr = mainResponse.trim();
          if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }
          const parsedAnalysis = JSON.parse(jsonStr);
          
          // Parse AI Overview
          let overviewText = overviewResponse.trim();
          if (overviewText.startsWith('```')) {
            overviewText = overviewText.replace(/^```.*?\n/, '').replace(/\n```$/, '');
          }
          
          // Parse Retention Insights
          let retentionStr = retentionResponse.trim();
          if (retentionStr.startsWith('```json')) {
            retentionStr = retentionStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (retentionStr.startsWith('```')) {
            retentionStr = retentionStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }
          const parsedRetention = JSON.parse(retentionStr);
          
          // Parse Target Audience
          let audienceStr = audienceResponse.trim();
          if (audienceStr.startsWith('```json')) {
            audienceStr = audienceStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (audienceStr.startsWith('```')) {
            audienceStr = audienceStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }
          const parsedAudience = JSON.parse(audienceStr);
          
          // Merge with defaults, validating types
          aiAnalysis = {
            viralScore: Math.min(100, Math.max(0, parsedAnalysis.viralScore || baseViralScore)),
            audience: Array.isArray(parsedAnalysis.audience) ? parsedAnalysis.audience : ["General audience"],
            strengths: Array.isArray(parsedAnalysis.strengths) ? parsedAnalysis.strengths : ["Published content"],
            weaknesses: Array.isArray(parsedAnalysis.weaknesses) ? parsedAnalysis.weaknesses : ["Needs optimization"],
            titleSuggestions: Array.isArray(parsedAnalysis.titleSuggestions) ? parsedAnalysis.titleSuggestions : [],
            analysis: parsedAnalysis.analysis || "Video analysis complete",
            thumbnailScore: Math.min(100, Math.max(0, parsedAnalysis.thumbnailScore || 65)),
            thumbnailTips: Array.isArray(parsedAnalysis.thumbnailTips) ? parsedAnalysis.thumbnailTips : [],
            thumbnailTextIdeas: Array.isArray(parsedAnalysis.thumbnailTextIdeas) ? parsedAnalysis.thumbnailTextIdeas : [],
            viralVideoIdeas: Array.isArray(parsedAnalysis.viralVideoIdeas) ? parsedAnalysis.viralVideoIdeas : [],
            keywordSuggestions: Array.isArray(parsedAnalysis.keywordSuggestions) ? parsedAnalysis.keywordSuggestions : [],
            // New specialized fields
            aiAnalysisOverview: overviewText || "Video analysis complete",
            retentionInsights: Array.isArray(parsedRetention) ? parsedRetention : ["Optimize for viewer retention"],
            targetAudience: parsedAudience || {
              type: "General audience",
              experienceLevel: "Mixed",
              interests: [],
              geographicRegion: "Global"
            }
          };
          
          console.log('[Video Analyzer] Gemini analysis parsed successfully');
        } catch (parseError) {
          console.warn('[Video Analyzer] Failed to parse some Gemini responses, using defaults');
          console.error('[Video Analyzer] Parse error:', parseError.message);
        }
      } catch (geminiError) {
        console.warn('[Video Analyzer] Gemini API call failed, using default analysis');
        console.error('[Video Analyzer] Gemini error:', geminiError.message);
      }
    }

    // Construct response
    const analysisResult = {
      videoId: videoId,
      title: title,
      thumbnail: thumbnail,
      views: views,
      likes: likes,
      comments: comments,
      engagementRate: parseFloat(engagementRate),
      seoScore: baseSeoScore,
      viralPotential: aiAnalysis.viralScore || baseViralScore,
      // AI Analysis fields
      viralScore: aiAnalysis.viralScore || baseViralScore,
      audience: aiAnalysis.audience || [],
      strengths: aiAnalysis.strengths || [],
      weaknesses: aiAnalysis.weaknesses || [],
      analysis: aiAnalysis.analysis || 'Analysis complete',
      // Suggestions
      suggestedTitles: aiAnalysis.titleSuggestions || [],
      suggestedKeywords: aiAnalysis.keywordSuggestions || [],
      viralVideoIdeas: aiAnalysis.viralVideoIdeas || [],
      // Thumbnail insights
      thumbnailScore: aiAnalysis.thumbnailScore || 65,
      thumbnailTips: aiAnalysis.thumbnailTips || [],
      thumbnailTextIdeas: aiAnalysis.thumbnailTextIdeas || [],
      // Dynamic specialized insights
      aiAnalysisOverview: aiAnalysis.aiAnalysisOverview || "Video analysis complete",
      retentionInsights: aiAnalysis.retentionInsights || ["Optimize video structure for retention"],
      targetAudience: aiAnalysis.targetAudience || {
        type: "General audience",
        experienceLevel: "Mixed",
        interests: [],
        geographicRegion: "Global"
      },
      // Original fields
      publishedAt: publishedAt,
      channelTitle: channelTitle,
    };

    console.log('[Video Analyzer] Sending response');

    res.json({
      message: 'Video analysis complete',
      data: analysisResult,
    });
  } catch (error) {
    console.error('[Video Analyzer] Unexpected error:', error.message);
    console.error('[Video Analyzer] Error stack:', error.stack);
    
    res.status(500).json({
      error: 'Failed to analyze video',
      message: error.message,
    });
  }
});

// Search for similar thumbnails by title with AI analysis
router.get('/similar-thumbnails', async (req, res) => {
  try {
    const { title } = req.query;

    if (!title) {
      return res.status(400).json({ error: 'Title parameter is required' });
    }

    console.log('[Similar Thumbnails] Searching for videos similar to:', title);

    // Search for videos
    const searchResponse = await axios.get(`${YOUTUBE_API_BASE}/search`, {
      params: {
        part: 'snippet',
        q: title,
        type: 'video',
        maxResults: 12,
        order: 'viewCount',
        key: YOUTUBE_API_KEY,
      },
    });

    if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
      return res.json({
        message: 'No similar videos found',
        data: {
          thumbnails: [],
          ctrScores: [],
          engagementRates: [],
          bestThumbnail: null,
          designInsights: [],
        },
      });
    }

    // Extract video IDs
    const videoIds = searchResponse.data.items
      .filter((_, i) => i < 9)
      .map(item => item.id.videoId);

    // Fetch detailed statistics
    const statsResponse = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
      params: {
        part: 'snippet,statistics',
        id: videoIds.join(','),
        key: YOUTUBE_API_KEY,
      },
    });

    console.log('[Similar Thumbnails] Fetched statistics for', statsResponse.data.items.length, 'videos');

    // Process videos
    const thumbnails = statsResponse.data.items.map(item => {
      const stats = item.statistics;
      const views = parseInt(stats.viewCount) || 0;
      const likes = parseInt(stats.likeCount) || 0;
      const comments = parseInt(stats.commentCount) || 0;
      
      // Calculate CTR: (likes + comments) / views * 100
      const ctrScore = views > 0 ? ((likes + comments) / views * 100).toFixed(2) : 0;
      const engagementRate = views > 0 ? ((likes + comments) / views).toFixed(3) : 0;

      return {
        videoId: item.id,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        views: views,
        viewsFormatted: views >= 1000000 ? `${(views / 1000000).toFixed(1)}M` : `${(views / 1000).toFixed(0)}K`,
        likes: likes,
        likesFormatted: likes >= 1000000 ? `${(likes / 1000000).toFixed(1)}M` : `${(likes / 1000).toFixed(0)}K`,
        comments: comments,
        commentsFormatted: comments >= 1000 ? `${(comments / 1000).toFixed(0)}K` : comments,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        publishedAt: item.snippet.publishedAt,
        engagementRate: parseFloat(engagementRate),
        ctrScore: parseFloat(ctrScore),
      };
    });

    // Find best thumbnail by CTR score
    const bestThumbnail = thumbnails.reduce((max, current) => 
      current.ctrScore > max.ctrScore ? current : max
    );

    console.log('[Similar Thumbnails] Best thumbnail CTR:', bestThumbnail.ctrScore);

    // Use Gemini to analyze top thumbnails
    let designInsights = [];
    if (GEMINI_API_KEY && thumbnails.length > 0) {
      try {
        const topThumbUrl = thumbnails[0].thumbnail;
        
        const prompt = `Analyze this YouTube thumbnail and provide insights on its design elements.
Thumbnail URL (for context): ${topThumbUrl}

Provide a JSON response with:
{
  "designElements": ["element1", "element2", "element3"],
  "strengths": ["strength1", "strength2", "strength3"],
  "styleTags": ["tag1", "tag2", "tag3"],
  "whyItWorks": "Brief explanation of why this thumbnail design is effective"
}

Design elements to look for: bold text, emotions/faces, arrows, contrast colors, central focus, CTA, numbers, urgency indicators, vibrant colors, geometric shapes.

Return ONLY valid JSON (no markdown).`;

        const geminiResponse = await callGeminiAPI(prompt);
        
        let jsonStr = geminiResponse.trim();
        if (jsonStr.startsWith('```json')) {
          jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        const parsedInsights = JSON.parse(jsonStr);
        designInsights = {
          designElements: Array.isArray(parsedInsights.designElements) ? parsedInsights.designElements : [],
          strengths: Array.isArray(parsedInsights.strengths) ? parsedInsights.strengths : [],
          styleTags: Array.isArray(parsedInsights.styleTags) ? parsedInsights.styleTags : [],
          whyItWorks: parsedInsights.whyItWorks || 'High-performing thumbnail design',
        };

        console.log('[Similar Thumbnails] Design insights generated');
      } catch (geminiError) {
        console.warn('[Similar Thumbnails] Gemini analysis failed, using defaults');
        designInsights = {
          designElements: ['Bold text', 'High contrast colors', 'Facial expression'],
          strengths: ['Eye-catching design', 'Clear focal point', 'Readable at small sizes'],
          styleTags: ['Bold', 'High Contrast', 'Expressive'],
          whyItWorks: 'This thumbnail uses proven design principles for high CTR',
        };
      }
    }

    res.json({
      message: 'Similar thumbnails analyzed',
      data: {
        thumbnails: thumbnails,
        ctrScores: thumbnails.map(t => ({ videoId: t.videoId, ctrScore: t.ctrScore })),
        engagementRates: thumbnails.map(t => ({ videoId: t.videoId, engagementRate: t.engagementRate })),
        bestThumbnail: bestThumbnail,
        designInsights: designInsights,
      },
    });
  } catch (error) {
    console.error('[Similar Thumbnails] Error:', error.message);
    res.status(500).json({
      error: 'Failed to analyze similar thumbnails',
      message: error.message,
    });
  }
});

// Outlier analysis - compare with channel average
router.get('/outlier-analysis', async (req, res) => {
  try {
    const { videoId } = req.query;

    if (!videoId) {
      return res.status(400).json({ error: 'Video ID parameter is required' });
    }

    // Get video details
    const videoResponse = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
      params: {
        part: 'snippet,statistics',
        id: videoId,
        key: YOUTUBE_API_KEY,
      },
    });

    if (!videoResponse.data.items.length) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const video = videoResponse.data.items[0];
    const channelId = video.snippet.channelId;
    const videoViews = parseInt(video.statistics.viewCount) || 0;

    // Get channel uploads playlist
    const channelResponse = await axios.get(`${YOUTUBE_API_BASE}/channels`, {
      params: {
        part: 'contentDetails',
        id: channelId,
        key: YOUTUBE_API_KEY,
      },
    });

    const uploadsPlaylistId = channelResponse.data.items[0].contentDetails.relatedPlaylists.uploads;

    // Get videos from uploads playlist
    const playlistResponse = await axios.get(`${YOUTUBE_API_BASE}/playlistItems`, {
      params: {
        part: 'contentDetails',
        playlistId: uploadsPlaylistId,
        maxResults: 50,
        key: YOUTUBE_API_KEY,
      },
    });

    const videoIds = playlistResponse.data.items.map(item => item.contentDetails.videoId);

    // Get statistics for all videos
    const statsResponse = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
      params: {
        part: 'statistics',
        id: videoIds.join(','),
        key: YOUTUBE_API_KEY,
      },
    });

    // Calculate channel average
    const views = statsResponse.data.items
      .map(item => parseInt(item.statistics.viewCount) || 0)
      .filter(v => v > 0);
    
    const channelAverageViews = views.length > 0 ? Math.round(views.reduce((a, b) => a + b, 0) / views.length) : 0;

    // Calculate outlier score
    const outlierScore = channelAverageViews > 0 ? Math.round((videoViews / channelAverageViews) * 100) : 0;

    res.json({
      message: 'Outlier analysis complete',
      data: {
        videoViews,
        channelAverageViews,
        outlierScore,
        isOutlier: outlierScore > 150,
        percentageAboveAverage: channelAverageViews > 0 ? Math.round(((videoViews - channelAverageViews) / channelAverageViews) * 100) : 0,
        rank: outlierScore > 200 ? 'Top Performer' : outlierScore > 150 ? 'Above Average' : 'Average',
      },
    });
  } catch (error) {
    console.error('[Outlier Analysis] Error:', error.message);
    res.status(500).json({
      error: 'Failed to analyze outlier',
      message: error.message,
    });
  }
});

// Generate video ideas using Gemini AI
router.post('/generate-ideas', async (req, res) => {
  try {
    const { topic, description } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic parameter is required' });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const prompt = `You are a creative YouTube content strategist. Generate 5 viral video ideas based on this topic: "${topic}".
${description ? `Video description for context: ${description}` : ''}

Return ONLY valid JSON (no markdown, no extra text):
{
  "ideas": ["idea1", "idea2", "idea3", "idea4", "idea5"]
}

Make ideas specific, actionable, and trending-focused.`;

    const geminiResponse = await callGeminiAPI(prompt);
    
    let jsonStr = geminiResponse.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    const parsedIdeas = JSON.parse(jsonStr);

    res.json({
      message: 'Video ideas generated',
      data: {
        ideas: Array.isArray(parsedIdeas.ideas) ? parsedIdeas.ideas : [],
      },
    });
  } catch (error) {
    console.error('[Generate Ideas] Error:', error.message);
    res.status(500).json({
      error: 'Failed to generate ideas',
      message: error.message,
    });
  }
});

// Find competitor videos
router.get('/competitors', async (req, res) => {
  try {
    const { title } = req.query;

    if (!title) {
      return res.status(400).json({ error: 'Title parameter is required' });
    }

    const searchResponse = await axios.get(`${YOUTUBE_API_BASE}/search`, {
      params: {
        part: 'snippet',
        q: title,
        type: 'video',
        maxResults: 9,
        order: 'viewCount',
        key: YOUTUBE_API_KEY,
      },
    });

    const videoIds = searchResponse.data.items
      .filter((_, i) => i < 3)
      .map(item => item.id.videoId);

    if (videoIds.length === 0) {
      return res.json({
        message: 'No competitors found',
        data: [],
      });
    }

    const statsResponse = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
      params: {
        part: 'snippet,statistics',
        id: videoIds.join(','),
        key: YOUTUBE_API_KEY,
      },
    });

    const competitors = statsResponse.data.items.map(item => {
      const stats = item.statistics;
      const views = parseInt(stats.viewCount) || 0;
      const likes = parseInt(stats.likeCount) || 0;
      const comments = parseInt(stats.commentCount) || 0;
      const engagement = views > 0 ? (((likes + comments) / views) * 100).toFixed(1) : 0;

      return {
        videoId: item.id,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        views: views >= 1000000 ? `${(views / 1000000).toFixed(1)}M` : `${(views / 1000).toFixed(0)}K`,
        channelTitle: item.snippet.channelTitle,
        engagement: `${engagement}%`,
      };
    });

    res.json({
      message: 'Competitor videos found',
      data: competitors,
    });
  } catch (error) {
    console.error('[Competitors] Error:', error.message);
    res.status(500).json({
      error: 'Failed to find competitors',
      message: error.message,
    });
  }
});

// Improve This Video - Generate improvement suggestions using Gemini AI
router.post('/improve', async (req, res) => {
  try {
    const { title, description, views, likes, comments } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    const engagementRate = views > 0 ? ((likes + comments) / views * 100).toFixed(2) : 0;

    const prompt = `You are a YouTube content strategist and video optimization expert. Analyze this video and provide specific, actionable improvement suggestions across 5 categories.

Video Details:
- Title: "${title}"
- Description: "${description || 'No description provided'}"
- Views: ${views || 0}
- Likes: ${likes || 0}
- Comments: ${comments || 0}
- Engagement Rate: ${engagementRate}%

Return ONLY valid JSON (no markdown, no extra text, no backticks):
{
  "titleSuggestions": [
    "suggestion 1",
    "suggestion 2",
    "suggestion 3"
  ],
  "descriptionTips": [
    "tip 1",
    "tip 2",
    "tip 3"
  ],
  "thumbnailTips": [
    "tip 1",
    "tip 2",
    "tip 3"
  ],
  "engagementTips": [
    "tip 1",
    "tip 2",
    "tip 3"
  ],
  "retentionTips": [
    "tip 1",
    "tip 2",
    "tip 3"
  ]
}

Guidelines:
- Title suggestions: Focus on keywords, hooks, length (50-60 chars), emotionality, clarity
- Description tips: SEO optimization, CTAs, links placement, hashtags, keyword density
- Thumbnail tips: Design elements, text, contrast, emotion, consistency
- Engagement tips: Calls-to-action, community posts, responses, pinned comments
- Retention tips: Hook timing, pacing, chapters, pattern interrupts, video length

Make suggestions specific to this video's current performance and metrics.`;

    const geminiResponse = await callGeminiAPI(prompt);
    
    let jsonStr = geminiResponse.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    const parsedSuggestions = JSON.parse(jsonStr);

    res.json({
      message: 'Video improvement suggestions generated',
      data: {
        titleSuggestions: Array.isArray(parsedSuggestions.titleSuggestions) ? parsedSuggestions.titleSuggestions : [],
        descriptionTips: Array.isArray(parsedSuggestions.descriptionTips) ? parsedSuggestions.descriptionTips : [],
        thumbnailTips: Array.isArray(parsedSuggestions.thumbnailTips) ? parsedSuggestions.thumbnailTips : [],
        engagementTips: Array.isArray(parsedSuggestions.engagementTips) ? parsedSuggestions.engagementTips : [],
        retentionTips: Array.isArray(parsedSuggestions.retentionTips) ? parsedSuggestions.retentionTips : [],
      },
    });
  } catch (error) {
    console.error('[Improve Video] Error:', error.message);
    res.status(500).json({
      error: 'Failed to generate improvement suggestions',
      message: error.message,
    });
  }
});

// Calculate dynamic title analysis score based on video metadata
router.get('/calculate-title-score', async (req, res) => {
  try {
    const { videoId } = req.query;

    console.log('[Calculate Title Score] Request received with videoId:', videoId);

    if (!videoId) {
      return res.status(400).json({ 
        error: 'videoId parameter is required',
        message: 'Please provide a valid video ID to calculate title score',
      });
    }

    if (!YOUTUBE_API_KEY) {
      return res.status(500).json({ error: 'YouTube API key not configured' });
    }

    console.log('[Calculate Title Score] Fetching video metadata for:', videoId);

    // Fetch video metadata
    const videoResponse = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
      params: {
        part: 'snippet,statistics',
        id: videoId,
        key: YOUTUBE_API_KEY,
      },
    });

    if (!videoResponse.data.items.length) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const video = videoResponse.data.items[0];
    const { title, description, tags } = video.snippet;
    const { viewCount, likeCount, commentCount } = video.statistics;

    const views = parseInt(viewCount) || 0;
    const likes = parseInt(likeCount) || 0;
    const comments = parseInt(commentCount) || 0;

    console.log('[Calculate Title Score] Video data extracted:', { title, views, likes, comments });

    // 1. Title Length Score (20 points)
    const titleLength = title.length;
    let lengthScore = 0;
    if (titleLength >= 50 && titleLength <= 60) {
      lengthScore = 20; // Ideal length
    } else if (titleLength >= 45 && titleLength <= 65) {
      lengthScore = 15; // Good length
    } else if (titleLength >= 30 && titleLength <= 70) {
      lengthScore = 10; // Acceptable length
    } else if (titleLength >= 20 && titleLength <= 80) {
      lengthScore = 5; // Needs improvement
    } else {
      lengthScore = 0; // Too short or too long
    }

    console.log('[Calculate Title Score] Length score:', lengthScore, 'Title length:', titleLength);

    // 2. Keyword Strength Score (20 points)
    // Check for important keywords in title (first 3-4 words are most important)
    const titleWords = title.toLowerCase().split(/\s+/).slice(0, 4).join(' ');
    const descriptionWords = (description || '').toLowerCase();
    const tagsList = (tags || []).map(t => t.toLowerCase());
    
    let keywordScore = 0;
    const firstWords = title.split(' ').slice(0, 3);
    
    // Check if first words are meaningful (not common stop words)
    const stopWords = new Set(['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    const meaningfulFirstWords = firstWords.filter(w => !stopWords.has(w.toLowerCase()));
    
    if (meaningfulFirstWords.length >= 2) {
      keywordScore += 10; // Good keyword placement
    } else if (meaningfulFirstWords.length >= 1) {
      keywordScore += 5;
    }
    
    // Check if keywords match tags
    const titleKeywords = title.toLowerCase().split(/\s+/);
    const matchingTags = titleKeywords.filter(word => tagsList.some(tag => tag.includes(word) && word.length > 3)).length;
    keywordScore += Math.min(10, matchingTags * 3);

    console.log('[Calculate Title Score] Keyword score:', keywordScore);

    // 3. Curiosity / Clickability Score (20 points)
    const curiosityWords = [
      'why', 'how', 'what', 'revealed', 'unexpected', 'finally', 'exposed', 'discover',
      'must', 'can\'t', 'don\'t', 'won\'t', 'surprising', 'shocking', 'incredible',
      'amazing', 'unbelievable', 'secret', 'hack', 'trick', 'guide', 'tutorial',
      'learn', 'know', 'understand'
    ];
    
    const titleLower = title.toLowerCase();
    let curiosityScore = 0;
    
    // Check for curiosity words
    const hasCuriosityWord = curiosityWords.some(word => titleLower.includes(word));
    if (hasCuriosityWord) curiosityScore += 7;
    
    // Check for numbers
    const hasNumbers = /\d+/.test(title);
    if (hasNumbers) curiosityScore += 7;
    
    // Check for question mark
    const isQuestion = title.includes('?');
    if (isQuestion) curiosityScore += 6;

    console.log('[Calculate Title Score] Curiosity score:', curiosityScore);

    // 4. Engagement Score (20 points)
    let engagementScore = 0;
    const engagementRate = views > 0 ? (likes + comments) / views : 0;
    
    if (engagementRate >= 0.1) {
      engagementScore = 20; // Excellent engagement
    } else if (engagementRate >= 0.05) {
      engagementScore = 15; // Good engagement
    } else if (engagementRate >= 0.01) {
      engagementScore = 10; // Average engagement
    } else if (engagementRate >= 0.002) {
      engagementScore = 5; // Below average
    } else {
      engagementScore = 2; // Poor engagement
    }

    console.log('[Calculate Title Score] Engagement score:', engagementScore, 'Rate:', (engagementRate * 100).toFixed(2) + '%');

    // 5. Competition Score (20 points)
    // Search for similar videos and analyze their titles
    let competitionScore = 15; // Default middle score
    
    try {
      const searchResponse = await axios.get(`${YOUTUBE_API_BASE}/search`, {
        params: {
          part: 'snippet',
          q: title.split(' ').slice(0, 3).join(' '), // Search with first 3 words
          type: 'video',
          maxResults: 5,
          order: 'viewCount',
          key: YOUTUBE_API_KEY,
        },
      });

      if (searchResponse.data.items && searchResponse.data.items.length > 0) {
        const competitorTitles = searchResponse.data.items.map(item => item.snippet.title);
        
        // Check if our title is unique
        const isDuplicate = competitorTitles.some(ct => ct.toLowerCase() === title.toLowerCase());
        if (isDuplicate) {
          competitionScore = 5; // Duplicate title
        } else {
          // Check for similarity and originality
          const avgCompetitorLength = competitorTitles.reduce((sum, t) => sum + t.length, 0) / competitorTitles.length;
          const lengthDifference = Math.abs(titleLength - avgCompetitorLength);
          
          if (lengthDifference > 10) {
            competitionScore = 18; // Good differentiation
          } else {
            competitionScore = 12; // Similar to competitors
          }
        }
      }
    } catch (searchError) {
      console.warn('[Calculate Title Score] Competition analysis failed, using default');
    }

    console.log('[Calculate Title Score] Competition score:', competitionScore);

    // Calculate total score
    const totalScore = lengthScore + keywordScore + curiosityScore + engagementScore + competitionScore;

    // Generate suggestions using Gemini AI
    let suggestions = [];
    
    if (GEMINI_API_KEY) {
      try {
        const suggestionPrompt = `Based on this YouTube title analysis, provide 3 specific, actionable suggestions to improve the title score.

Current Title: "${title}"
Title Length: ${titleLength} characters (ideal: 50-60)
Length Score: ${lengthScore}/20
Keyword Score: ${keywordScore}/20
Curiosity Score: ${curiosityScore}/20
Engagement Score: ${engagementScore}/20
Competition Score: ${competitionScore}/20
Total Score: ${totalScore}/100

Current Engagement Rate: ${(engagementRate * 100).toFixed(2)}%
Videos with this title: ${views.toLocaleString()} views

Return ONLY valid JSON with NO markdown, no backticks, no extra text:
{
  "suggestions": [
    "specific suggestion 1",
    "specific suggestion 2",
    "specific suggestion 3"
  ]
}`;

        const geminiResponse = await callGeminiAPI(suggestionPrompt);
        
        let jsonStr = geminiResponse.trim();
        if (jsonStr.startsWith('```json')) {
          jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonStr = jsonMatch[0];
        }
        
        const parsedSuggestions = JSON.parse(jsonStr);
        suggestions = Array.isArray(parsedSuggestions.suggestions) ? parsedSuggestions.suggestions : [];
        
        console.log('[Calculate Title Score] Suggestions generated');
      } catch (geminiError) {
        console.warn('[Calculate Title Score] Gemini suggestion generation failed');
        // Use default suggestions based on scores
        suggestions = [];
        
        if (lengthScore < 15) {
          suggestions.push(`Adjust title length to 50-60 characters (currently ${titleLength})`);
        }
        if (curiosityScore < 10) {
          suggestions.push('Add curiosity words like "Why", "How", "Revealed", or numbers to improve CTR');
        }
        if (keywordScore < 15) {
          suggestions.push('Place more relevant keywords at the beginning of the title');
        }
      }
    } else {
      // Fallback suggestions
      if (lengthScore < 15) {
        suggestions.push(`Adjust title length to 50-60 characters (currently ${titleLength})`);
      }
      if (curiosityScore < 10) {
        suggestions.push('Add curiosity words like "Why", "How", or numbers');
      }
      if (keywordScore < 15) {
        suggestions.push('Place important keywords at the beginning');
      }
    }

    console.log('[Calculate Title Score] Title score calculated successfully');

    res.json({
      message: 'Title score calculated',
      data: {
        videoId: videoId,
        originalTitle: title,
        titleScore: totalScore,
        breakdown: {
          lengthScore: lengthScore,
          keywordScore: keywordScore,
          curiosityScore: curiosityScore,
          engagementScore: engagementScore,
          competitionScore: competitionScore,
        },
        metadata: {
          titleLength: titleLength,
          engagementRate: parseFloat((engagementRate * 100).toFixed(2)),
          views: views,
          likes: likes,
          comments: comments,
        },
        suggestions: suggestions,
      },
    });
  } catch (error) {
    console.error('[Calculate Title Score] Error:', error.message);
    console.error('[Calculate Title Score] Stack:', error.stack);
    res.status(500).json({
      error: 'Failed to calculate title score',
      message: error.message,
    });
  }
});

// Calculate dynamic title analysis score based on video metadata
router.get('/generate-title-suggestions', async (req, res) => {
  try {
    const { videoId } = req.query;

    console.log('[Generate Title Suggestions] Request received with videoId:', videoId);

    if (!videoId) {
      console.log('[Generate Title Suggestions] Error: videoId parameter is missing');
      return res.status(400).json({ 
        error: 'videoId parameter is required',
        message: 'Please provide a valid video ID to generate title suggestions',
      });
    }

    if (!YOUTUBE_API_KEY) {
      console.error('[Generate Title Suggestions] Error: YouTube API key not configured');
      return res.status(500).json({ error: 'YouTube API key not configured' });
    }

    if (!GEMINI_API_KEY) {
      console.error('[Generate Title Suggestions] Error: Gemini API key not configured');
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    console.log('[Generate Title Suggestions] Fetching metadata for video:', videoId);

    // Fetch video metadata
    const videoResponse = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
      params: {
        part: 'snippet,statistics',
        id: videoId,
        key: YOUTUBE_API_KEY,
      },
    });

    if (!videoResponse.data.items.length) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const video = videoResponse.data.items[0];
    const { title, description, tags, channelTitle } = video.snippet;
    const { viewCount, likeCount, commentCount } = video.statistics;

    console.log('[Generate Title Suggestions] Video metadata retrieved:', { title, viewCount, likeCount, commentCount });

    // Prepare tags for prompt
    const tagsString = (tags && tags.length > 0) ? tags.join(', ') : 'No tags available';

    // Create the Gemini prompt
    const geminiPrompt = `Analyze this YouTube video and generate 5 unique, high-performing title suggestions.

Current Video Details:
- Title: "${title}"
- Description: ${description ? description.substring(0, 300) : 'No description'} ...
- Tags: ${tagsString}
- Channel: ${channelTitle}
- Views: ${viewCount}
- Likes: ${likeCount}
- Comments: ${commentCount}

Generate 5 optimized YouTube titles following these rules:
1. Use curiosity triggers (words like "Revealed", "Unexpected", "Finally", "Exposed")
2. Include numbers when relevant (7, 5, 10x, 100%, etc.)
3. Keep each title between 50-60 characters
4. Make them SEO-friendly with relevant keywords
5. Do NOT repeat the original title
6. Focus on high click-through rate (CTR)
7. Each title should have a different style/approach
8. Avoid clickbait while remaining engaging

Return ONLY valid JSON (no markdown, no extra text, no backticks):
{
  "titleSuggestions": [
    "suggestion1",
    "suggestion2",
    "suggestion3",
    "suggestion4",
    "suggestion5"
  ]
}`;

    console.log('[Generate Title Suggestions] Calling Gemini API with prompt');

    let geminiResponse;
    try {
      geminiResponse = await callGeminiAPI(geminiPrompt);
      console.log('[Generate Title Suggestions] Raw Gemini response:', geminiResponse.substring(0, 300));
    } catch (geminiError) {
      console.error('[Generate Title Suggestions] Gemini API error:', geminiError.message);
      console.error('[Generate Title Suggestions] Gemini stack:', geminiError.stack);
      
      // Fallback: generate default suggestions
      const suggestions = [
        `${title.substring(0, 40)} - Learn How`,
        `5 Things You Didn't Know About ${title.split(' ')[0]}`,
        `Why Experts Love ${title.split(' ')[0]}`,
        `The Complete Guide to ${title.split(' ')[0]}`,
        `${title.substring(0, 35)}... [2024]`
      ];
      
      return res.json({
        message: 'Title suggestions generated (fallback)',
        data: {
          videoId: videoId,
          originalTitle: title,
          titleSuggestions: suggestions,
        },
      });
    }

    let jsonStr = geminiResponse.trim();
    
    // Remove markdown code blocks
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Remove any leading/trailing whitespace and newlines
    jsonStr = jsonStr.trim();
    
    // Find JSON object in response (in case there's extra text)
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    console.log('[Generate Title Suggestions] Cleaned JSON string (first 200 chars):', jsonStr.substring(0, 200));

    let parsedSuggestions;
    try {
      parsedSuggestions = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('[Generate Title Suggestions] JSON Parse Error:', parseError.message);
      console.error('[Generate Title Suggestions] Attempted to parse:', jsonStr.substring(0, 300));
      
      // Fallback: generate default suggestions
      parsedSuggestions = {
        titleSuggestions: [
          `${title.substring(0, 40)} - Revealed`,
          `5 Things About ${title.split(' ')[0]}`,
          `Why Everyone Is Watching ${title.split(' ')[0]}`,
          `The Truth About ${title.split(' ')[0]}`,
          `${title.substring(0, 35)}... (2024)`
        ]
      };
      console.log('[Generate Title Suggestions] Using fallback suggestions');
    }

    console.log('[Generate Title Suggestions] Suggestions generated successfully');

    res.json({
      message: 'Title suggestions generated',
      data: {
        videoId: videoId,
        originalTitle: title,
        titleSuggestions: Array.isArray(parsedSuggestions.titleSuggestions)
          ? parsedSuggestions.titleSuggestions
          : [],
      },
    });
  } catch (error) {
    console.error('[Generate Title Suggestions] Error:', error.message);
    console.error('[Generate Title Suggestions] Stack:', error.stack);
    res.status(500).json({
      error: 'Failed to generate title suggestions',
      message: error.message,
    });
  }
});

// Similar Titles - Analyze competing video titles with AI insights
router.get('/similar-titles', async (req, res) => {
  try {
    const { title, videoId } = req.query;

    if (!title && !videoId) {
      return res.status(400).json({ error: 'Title or videoId parameter is required' });
    }

    // Extract keywords from title - remove common words and get main terms
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
      'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do',
      'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can',
      'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
    ]);

    const keywords = title
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.has(word))
      .slice(0, 3)
      .join(' ');

    const searchQuery = keywords || title;

    console.log('[Similar Titles] Searching for similar videos with query:', searchQuery);

    // Search for similar videos
    const searchResponse = await axios.get(`${YOUTUBE_API_BASE}/search`, {
      params: {
        part: 'snippet',
        q: searchQuery,
        type: 'video',
        maxResults: 12,
        order: 'viewCount',
        key: YOUTUBE_API_KEY,
      },
    });

    const videoIds = searchResponse.data.items
      .map(item => item.id.videoId)
      .filter(id => id !== videoId); // Exclude the analyzed video itself

    if (videoIds.length === 0) {
      return res.json({
        message: 'No similar videos found',
        data: {
          titles: [],
          ctrScores: [],
          engagementRates: [],
          bestTitle: null,
          titleInsights: {
            patterns: [],
            suggestions: [],
          },
        },
      });
    }

    // Fetch full statistics for the videos
    const statsResponse = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
      params: {
        part: 'snippet,statistics',
        id: videoIds.slice(0, 9).join(','),
        key: YOUTUBE_API_KEY,
      },
    });

    // Process video data
    const titles = statsResponse.data.items.map(item => {
      const stats = item.statistics;
      const views = parseInt(stats.viewCount) || 0;
      const likes = parseInt(stats.likeCount) || 0;
      const comments = parseInt(stats.commentCount) || 0;
      const engagementRate = views > 0 ? ((likes + comments) / views * 100).toFixed(2) : 0;
      const ctrScore = engagementRate; // CTR = (likes + comments) / views * 100
      const titleLength = item.snippet.title.length;
      const publishedDate = new Date(item.snippet.publishedAt).toLocaleDateString();

      return {
        videoId: item.id,
        title: item.snippet.title,
        views: views,
        viewsFormatted: views >= 1000000 ? `${(views / 1000000).toFixed(1)}M` : `${(views / 1000).toFixed(0)}K`,
        likes: likes,
        comments: comments,
        channelTitle: item.snippet.channelTitle,
        engagementRate: parseFloat(engagementRate),
        ctrScore: parseFloat(ctrScore),
        titleLength: titleLength,
        publishedAt: publishedDate,
      };
    });

    // Find best title by CTR score
    let bestTitle = null;
    if (titles.length > 0) {
      bestTitle = titles.reduce((max, current) => 
        current.ctrScore > max.ctrScore ? current : max
      );
    }

    // Use Gemini AI to analyze title patterns and generate suggestions
    let titleInsights = {
      patterns: [],
      suggestions: [],
    };

    if (GEMINI_API_KEY && titles.length > 0) {
      try {
        const topTitles = titles.slice(0, 5).map(t => t.title).join('\n- ');
        const analyzedTitle = title || (titles.length > 0 ? titles[0].title : 'Unknown');

        const geminiPrompt = `You are a YouTube title optimization expert. Analyze these high-performing video titles and the analyzed video title, then provide insights and suggestions.

Top Performing Titles:
- ${topTitles}

Analyzed Video Title:
"${analyzedTitle}"

Return ONLY valid JSON (no markdown, no extra text, no backticks):
{
  "patterns": {
    "usesNumbers": true,
    "curiosityWords": ["why", "revealed"],
    "keywordPlacement": "front",
    "averageLength": 52,
    "commonElements": ["question", "list", "how-to"]
  },
  "suggestions": [
    "suggestion 1",
    "suggestion 2",
    "suggestion 3",
    "suggestion 4",
    "suggestion 5"
  ]
}

Guidelines:
- Analyze patterns like: use of numbers, curiosity words (Why, Revealed, Unexpected, etc.), keyword placement (front-loaded or end), average title length, common structural elements
- Generate 5 specific, actionable title suggestions based on the patterns found in top performers
- Suggestions should be optimized for the analyzed video's topic while incorporating proven patterns`;

        const geminiResponse = await callGeminiAPI(geminiPrompt);
        
        let jsonStr = geminiResponse.trim();
        if (jsonStr.startsWith('```json')) {
          jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        const parsedInsights = JSON.parse(jsonStr);
        titleInsights = {
          patterns: parsedInsights.patterns || {},
          suggestions: Array.isArray(parsedInsights.suggestions) ? parsedInsights.suggestions : [],
        };

        console.log('[Similar Titles] Title insights generated successfully');
      } catch (geminiError) {
        console.warn('[Similar Titles] Gemini analysis failed:', geminiError.message);
        // Use default insights on failure
        titleInsights = {
          patterns: {
            usesNumbers: true,
            curiosityWords: ['Why', 'Revealed', 'Unexpected'],
            keywordPlacement: 'Front-loaded',
            averageLength: Math.round(titles.reduce((sum, t) => sum + t.titleLength, 0) / titles.length),
            commonElements: ['How-to', 'Question', 'List']
          },
          suggestions: [
            `Optimize Your ${title ? title.split(' ')[0] : 'Content'} Strategy - Proven Tactics Revealed`,
            `Why Most ${title ? title.split(' ')[0] : 'Videos'} Fail (And How to Fix It)`,
            `${title ? title.split(' ')[0] : 'Complete'} Guide: 5 Things You Must Know`,
            `I Tested This For 30 Days - Here's What Happened`,
            `${title ? title.split(' ')[0] : 'This'} Changed Everything About My Strategy`,
          ]
        };
      }
    }

    res.json({
      message: 'Similar titles analyzed',
      data: {
        titles: titles,
        ctrScores: titles.map(t => ({ videoId: t.videoId, ctrScore: t.ctrScore })),
        engagementRates: titles.map(t => ({ videoId: t.videoId, engagementRate: t.engagementRate })),
        bestTitle: bestTitle,
        titleInsights: titleInsights,
      },
    });
  } catch (error) {
    console.error('[Similar Titles] Error:', error.message);
    res.status(500).json({
      error: 'Failed to analyze similar titles',
      message: error.message,
    });
  }
});

export default router;
