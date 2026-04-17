import express from 'express';
import axios from 'axios';

const router = express.Router();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash';

// Helper function to call Gemini API
const callGeminiAPI = async (prompt) => {
  try {
    console.log('[Gemini] Making API call...');
    console.log('[Gemini] API Key present:', !!GEMINI_API_KEY);
    console.log('[Gemini] Prompt length:', prompt.length);
    
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
        timeout: 30000,
      }
    );

    console.log('[Gemini] API response received');
    console.log('[Gemini] Response structure:', {
      hasCandidates: !!response.data.candidates,
      candidateCount: response.data.candidates?.length || 0,
      firstCandidateHasContent: !!response.data.candidates?.[0]?.content,
    });

    if (!response.data.candidates || !response.data.candidates[0]) {
      throw new Error('No candidates in Gemini response');
    }

    const text = response.data.candidates[0].content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('No text content in Gemini response');
    }

    console.log('[Gemini] Text extracted, length:', text.length);
    return text;
  } catch (error) {
    console.error('[Gemini] API Error Details:');
    console.error('[Gemini] Status:', error.response?.status);
    console.error('[Gemini] Status Text:', error.response?.statusText);
    console.error('[Gemini] Data:', error.response?.data);
    console.error('[Gemini] Message:', error.message);
    
    if (error.response?.status === 400) {
      throw new Error('Invalid request to Gemini API - check prompt format');
    } else if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error('Gemini API key invalid or unauthorized');
    } else if (error.response?.status === 429) {
      throw new Error('Rate limited by Gemini API - please try again');
    }
    
    throw error;
  }
};

// Test endpoint to check if chatbot is working
router.get('/test', (req, res) => {
  res.json({
    message: 'ChatBot is running',
    status: 'OK',
    geminiConfigured: !!GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    message: 'ChatBot API is healthy',
    apiKeyConfigured: !!GEMINI_API_KEY,
    apiKeyLength: GEMINI_API_KEY ? GEMINI_API_KEY.length : 0,
  });
});

// Chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    console.log('[ChatBot] Received message:', message);
    console.log('[ChatBot] API Key configured:', !!GEMINI_API_KEY);

    if (!message || !message.trim()) {
      console.log('[ChatBot] Error: Empty message');
      return res.status(400).json({ error: 'Message is required' });
    }

    // Demo/Fallback mode - if no API key, use smart responses
    if (!GEMINI_API_KEY) {
      console.log('[ChatBot] No API key - using demo mode');
      
      const demoResponses = {
        thumbnail: "Great question! For thumbnails: use high contrast colors, include faces with emotion, add bold text that's readable at small sizes, and maintain consistent branding. A/B test different styles to see what resonates with your audience.",
        title: "Good titles should: be 50-60 characters, include keywords, use power words like 'Ultimate', 'Proven', 'Secret', have numbers when possible, and accurately describe content. Test variations and check CTR in YouTube Analytics.",
        engagement: "Boost engagement by: asking questions, encouraging likes/comments in videos, responding to all comments, creating community posts, using polls, and making videos that spark discussion. Aim for 3-5% engagement rate or higher.",
        viral: "Viral potential increases with: trending topics, emotional triggers, unique angles, hook within first 5 seconds, pattern interrupts, and content that people want to share. Study what's trending in your niche.",
        analytics: "Focus on: watch time (most important), average view duration, click-through rate (CTR), engagement rate (likes+comments/views), and traffic sources. Improve these metrics to grow your channel.",
        seo: "For SEO: use keywords in title and first 30 characters of description, add 30+ tags, use playlists, create custom thumbnails, enable captions, and link to related videos. This helps YouTube recommend your content.",
        duration: "Optimal video length depends on your content. Tutorials: 10-15 min. Vlogs: 15-25 min. Shorts: under 60 sec. General content: 8-12 min. Quality > Length - keep viewers engaged throughout.",
        frequency: "Consistency matters more than frequency. Post 1-2x per week regularly rather than sporadic uploads. Establish a schedule so your audience knows when to expect new videos.",
      };

      let reply = "I'm currently in demo mode. Here's what I know about YouTube: ";
      
      const messageLower = message.toLowerCase();
      for (const [key, value] of Object.entries(demoResponses)) {
        if (messageLower.includes(key)) {
          reply = value;
          break;
        }
      }

      if (reply === "I'm currently in demo mode. Here's what I know about YouTube: ") {
        reply = "I'm in demo mode (Gemini API not configured). Try asking about: thumbnails, titles, engagement, viral potential, analytics, SEO, video duration, or upload frequency. For full AI features, configure your GEMINI_API_KEY in .env";
      }

      return res.json({
        message: 'Reply generated (demo mode)',
        reply: reply,
      });
    }

    // Real API mode - call Gemini
    try {
      console.log('[ChatBot] Calling Gemini API...');
      
      const recentHistory = (conversationHistory || []).slice(-6);
      const conversationContext = recentHistory
        .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      const systemPrompt = `You are TrendTube AI, a helpful YouTube analytics expert. Keep responses to 2-3 sentences max.
Help with: video optimization, thumbnails, titles, engagement, growth, analytics, SEO.`;

      const fullPrompt = `${systemPrompt}

${conversationContext ? `Conversation:\n${conversationContext}` : 'New conversation'}

User: ${message}
Assistant:`;

      console.log('[ChatBot] Prompt prepared, calling API...');
      
      const reply = await callGeminiAPI(fullPrompt);
      const cleanReply = reply.trim();

      if (!cleanReply) {
        throw new Error('Empty response from Gemini');
      }

      console.log('[ChatBot] Got reply from Gemini');

      return res.json({
        message: 'Reply generated',
        reply: cleanReply,
      });
    } catch (geminiError) {
      console.error('[ChatBot] Gemini error, falling back to demo...');
      console.error('[ChatBot] Error details:', geminiError.message);

      // Fallback to demo mode if Gemini fails
      const fallbackReply = "I'm having temporary trouble with the AI service. But I can help! Ask me about: thumbnails, titles, engagement strategies, viral potential, video analytics, SEO, optimal duration, or upload frequency.";
      
      return res.json({
        message: 'Reply generated (fallback)',
        reply: fallbackReply,
      });
    }
  } catch (error) {
    console.error('[ChatBot] Unexpected error:', error.message);
    res.status(500).json({
      error: 'Failed to generate reply',
      message: error.message,
    });
  }
});

export default router;
