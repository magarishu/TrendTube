import express from 'express';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import cacheMiddleware from '../utils/cacheMiddleware.js';

const router = express.Router();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash';

// Helper function to make Gemini API calls
const callGeminiAPI = async (text) => {
  try {
    const response = await axios.post(
      `${GEMINI_API_BASE}:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: text,
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
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Debug endpoint to test API configuration
router.get('/debug', (req, res) => {
  res.json({
    message: 'Gemini API Configuration',
    apiKey: GEMINI_API_KEY ? `Key length: ${GEMINI_API_KEY.length}` : 'NOT SET',
    apiBase: GEMINI_API_BASE,
    endpoint: `${GEMINI_API_BASE}:generateContent?key=***`,
  });
});

// Analyze video title and suggest improvements
router.post('/analyze-title', cacheMiddleware(3600), async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const prompt = `You are a YouTube expert. Analyze the following video title and suggest 3 alternative titles that are more catchy, SEO-optimized, and engaging. Also provide a brief analysis of the current title.

Video Title: "${title}"

Please provide your response in JSON format with the following structure:
{
  "currentAnalysis": "brief analysis of the current title",
  "suggestions": ["title1", "title2", "title3"],
  "seoScore": 0-10,
  "engagementScore": 0-10
}`;

    const response = await callGeminiAPI(prompt);

    const responseText = response.candidates[0].content.parts[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { analysis: responseText };

    res.json({
      message: 'Title analysis complete',
      data: analysis,
    });
  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to analyze title',
      message: error.response?.data?.error?.message || error.message,
      details: error.response?.data,
    });
  }
});

// Generate video description
router.post('/generate-description', cacheMiddleware(3600), async (req, res) => {
  try {
    const { title, keywords = [], topic = '' } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const keywordStr = keywords.length > 0 ? `Keywords: ${keywords.join(', ')}` : '';
    const prompt = `You are a professional YouTube content creator. Generate an engaging YouTube video description for a video with the following details:

Title: "${title}"
${keywordStr}
${topic ? `Topic: ${topic}` : ''}

The description should:
1. Be compelling and SEO-optimized
2. Include a brief summary of what the video is about
3. Include timestamps if relevant
4. Have a call-to-action
5. Be 200-300 words

Please provide just the description without any additional text.`;

    const response = await callGeminiAPI(prompt);

    const description = response.candidates[0].content.parts[0].text;

    res.json({
      message: 'Description generated',
      data: {
        description: description.trim(),
      },
    });
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    res.status(500).json({
      error: 'Failed to generate description',
      message: error.message,
    });
  }
});

// Generate content ideas
router.post('/generate-ideas', cacheMiddleware(3600), async (req, res) => {
  try {
    const { topic, count = 5, style = 'engaging' } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const prompt = `You are a creative YouTube content strategist. Generate ${count} innovative and ${style} video ideas related to the topic: "${topic}"

For each idea, provide:
1. Video Title
2. Hook (first 10 seconds summary)
3. Main Points (3 key points to cover)
4. Target Audience

Please provide the response in JSON format as an array of objects.`;

    const response = await callGeminiAPI(prompt);

    const responseText = response.candidates[0].content.parts[0].text;
    const jsonMatch = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
    const ideas = jsonMatch ? JSON.parse(jsonMatch[0]) : [{ ideas: responseText }];

    res.json({
      message: 'Content ideas generated',
      data: ideas,
    });
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    res.status(500).json({
      error: 'Failed to generate ideas',
      message: error.message,
    });
  }
});

// Analyze video thumbnail text
router.post('/analyze-thumbnail', cacheMiddleware(3600), async (req, res) => {
  try {
    const { text, context = '' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Thumbnail text is required' });
    }

    const prompt = `You are a YouTube thumbnail design expert. Analyze the following text that would appear on a YouTube thumbnail and provide feedback on its effectiveness.

Thumbnail Text: "${text}"
${context ? `Context: ${context}` : ''}

Provide your analysis in JSON format:
{
  "readability": 0-10,
  "engagement": 0-10,
  "clarity": 0-10,
  "suggestions": ["suggestion1", "suggestion2"],
  "overallScore": 0-10
}`;

    const response = await callGeminiAPI(prompt);

    const responseText = response.candidates[0].content.parts[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { analysis: responseText };

    res.json({
      message: 'Thumbnail analysis complete',
      data: analysis,
    });
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    res.status(500).json({
      error: 'Failed to analyze thumbnail',
      message: error.message,
    });
  }
});

// General AI Chat for video analysis
router.post('/chat', async (req, res) => {
  try {
    const { message, context = '' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const fullPrompt = context 
      ? `Context: ${context}\n\nUser Question: ${message}`
      : message;

    const response = await callGeminiAPI(fullPrompt);

    const reply = response.candidates[0].content.parts[0].text;

    res.json({
      message: 'AI response generated',
      data: {
        reply: reply.trim(),
      },
    });
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    res.status(500).json({
      error: 'Failed to get AI response',
      message: error.message,
    });
  }
});

// Summarize content
router.post('/summarize', async (req, res) => {
  try {
    const { content, length = 'medium' } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const lengthGuide = {
      short: '50-100 words',
      medium: '100-200 words',
      long: '200-300 words',
    };

    const prompt = `Summarize the following content in ${lengthGuide[length] || lengthGuide.medium}:

${content}

Provide just the summary without any additional text.`;

    const response = await callGeminiAPI(prompt);

    const summary = response.candidates[0].content.parts[0].text;

    res.json({
      message: 'Content summarized',
      data: {
        summary: summary.trim(),
      },
    });
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    res.status(500).json({
      error: 'Failed to summarize content',
      message: error.message,
    });
  }
});

export default router;
