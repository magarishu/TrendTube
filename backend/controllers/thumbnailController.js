import thumbnailService from '../services/thumbnailGeneratorService.js';

export const generateThumbnailDesigns = async (req, res) => {
  try {
    const videoData = req.body;
    if (!videoData || !videoData.title) {
      return res.status(400).json({ error: 'Video data with title is required' });
    }

    const designs = await thumbnailService.generateThumbnailDesigns(videoData);
    res.json(designs);
  } catch (error) {
    console.error('Error generating designs:', error);
    res.status(500).json({ error: 'Failed to generate thumbnail designs' });
  }
};

export const generateThumbnailImage = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Image generation prompt is required' });
    }

    const result = await thumbnailService.generateImageFromDesign({ imageGenerationPrompt: prompt });
    res.json(result);
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
};
