import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';

class ThumbnailGeneratorService {
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });
  }

  parseReferenceUrl(url) {
    if (!url) return '';
    try {
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
      if (match && match[1]) {
        return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
      }
      return url;
    } catch(e) {
      return url;
    }
  }

  async generateThumbnailDesigns(videoData) {
    const processedRefUrl = this.parseReferenceUrl(videoData.referenceImageUrl);

    const systemPrompt = `You are TrendTube's AI thumbnail strategist. Your PRIMARY job is generating 
detailed image generation prompts that will create UNIQUE, DYNAMIC YouTube thumbnails.

CRITICAL INSTRUCTION:
Every design you create MUST include a detailed, specific image generation prompt 
that will actually generate a REAL thumbnail image (not static placeholders).

YOUR RESPONSIBILITIES:
1. Design high-CTR thumbnail concepts
2. Create DETAILED image generation prompts for EACH design
3. Ensure prompts are compatible with image generation APIs
4. Include all necessary specifications (colors, dimensions, elements, style)
5. Make prompts SPECIFIC and UNIQUE for each variation

IMAGE GENERATION PROMPT REQUIREMENTS:
✓ Must be 250+ words (detailed, not vague)
✓ Must include specific colors (hex codes)
✓ Must specify exact composition and positioning
✓ Must specify style and quality
✓ Must include dimensions: "1280x720 pixels, 16:9 aspect ratio"
✓ Must describe lighting, colors, and materials
✓ Must include negative prompt section
✓ Must be UNIQUE for each of 3 variations`;

    const userPrompt = `GENERATE 3 COMPLETELY DIFFERENT DYNAMIC THUMBNAIL DESIGNS

VIDEO INFORMATION:
- Title: "${videoData.title}"
- Category: ${videoData.category}
- Description: "${videoData.summary}"
- Target Audience: ${videoData.audience}
- Reference Image URL: "${processedRefUrl || 'None provided'}"
- Style Preference: "${videoData.style}"
- Primary Brand Color: "${videoData.primaryColor}"
- Secondary Brand Color: "${videoData.secondaryColor}"
- Optional Text Overlay: "${videoData.includeText || 'None'}"

TASK:
Generate 3 thumbnail designs that are:
1. COMPLETELY DIFFERENT from each other (different layouts, colors, styles)
2. Include DETAILED image generation prompts (250+ words each) incorporating the title text: "${videoData.title}". ${processedRefUrl ? `Generate the image similar in style to this reference link: ${processedRefUrl}` : ''}
3. Have SPECIFIC colors with hex codes integrating the brand colors
4. Include exact positioning of all elements
5. Include quality and style specifications matching the preference: ${videoData.style}
6. Include negative prompts

Return ONLY this JSON structure - EXACTLY as shown:

{
  "variations": [
    {
      "variationNumber": 1,
      "name": "Design Name 1",
      "concept": "Unique concept description",
      "layoutComposition": "Detailed grid-based layout",
      "colorScheme": {
        "background": "#[HEX] color name",
        "primaryAccent": "#[HEX] color name",
        "secondaryAccent": "#[HEX] color name"
      },
      "visualElements": [
        {
          "element": "Element name",
          "description": "Detailed description",
          "placement": "Grid position",
          "size": "Size percentage"
        }
      ],
      "typography": {
        "mainText": "[EXACT TEXT]",
        "fontFamily": "Font name",
        "fontSize": "Size",
        "color": "#[HEX]",
        "effects": "Shadow, outline, etc"
      },
      "imageGenerationPrompt": "[250+ WORDS] Start with: 'Professional YouTube thumbnail, 1280x720px, 16:9 aspect ratio.' Include: background description with hex colors, foreground element with position and style, text with font and effects, additional decorative elements, overall style and quality, technical specs, negative prompt. Make it DETAILED and UNIQUE.",
      "performancePrediction": {
        "estimatedCTRImprovement": "+15%",
        "confidenceLevel": "High"
      }
    },
    {
      "variationNumber": 2,
      "name": "Design Name 2",
      "concept": "COMPLETELY DIFFERENT concept",
      "layoutComposition": "COMPLETELY DIFFERENT layout",
      "colorScheme": {
        "background": "#[DIFFERENT HEX] color name",
        "primaryAccent": "#[DIFFERENT HEX]",
        "secondaryAccent": "#[DIFFERENT HEX]"
      },
      "visualElements": [
        {
          "element": "DIFFERENT element type",
          "description": "DIFFERENT description",
          "placement": "DIFFERENT position",
          "size": "DIFFERENT size"
        }
      ],
      "typography": {
        "mainText": "[DIFFERENT TEXT or different styling]",
        "fontFamily": "DIFFERENT font",
        "fontSize": "DIFFERENT size",
        "color": "#[DIFFERENT HEX]",
        "effects": "DIFFERENT effects"
      },
      "imageGenerationPrompt": "[250+ WORDS] COMPLETELY DIFFERENT prompt from variation 1. Different colors, different layout, different style. Include: background, foreground, text, elements, style, quality, negative prompt.",
      "performancePrediction": {
        "estimatedCTRImprovement": "+18%",
        "confidenceLevel": "High"
      }
    },
    {
      "variationNumber": 3,
      "name": "Design Name 3",
      "concept": "COMPLETELY DIFFERENT concept from 1 and 2",
      "layoutComposition": "COMPLETELY DIFFERENT layout",
      "colorScheme": {
        "background": "#[COMPLETELY DIFFERENT HEX]",
        "primaryAccent": "#[DIFFERENT HEX]",
        "secondaryAccent": "#[DIFFERENT HEX]"
      },
      "visualElements": [
        {
          "element": "COMPLETELY DIFFERENT element",
          "description": "DIFFERENT description",
          "placement": "DIFFERENT position",
          "size": "DIFFERENT size"
        }
      ],
      "typography": {
        "mainText": "[DIFFERENT TEXT]",
        "fontFamily": "DIFFERENT font",
        "fontSize": "DIFFERENT size",
        "color": "#[DIFFERENT HEX]",
        "effects": "DIFFERENT effects"
      },
      "imageGenerationPrompt": "[250+ WORDS] COMPLETELY DIFFERENT from both variations 1 and 2. Unique colors, unique layout, unique style. Include all required sections.",
      "performancePrediction": {
        "estimatedCTRImprovement": "+20%",
        "confidenceLevel": "Medium"
      }
    }
  ]
}

VALIDATION CHECKLIST:
✓ All 3 variations have UNIQUE image generation prompts
✓ All prompts are 250+ words
✓ All prompts have specific hex colors
✓ All prompts specify 1280x720px
✓ All prompts describe element positions
✓ All prompts include quality specifications
✓ All prompts include negative prompts
✓ All 3 designs look COMPLETELY DIFFERENT
✓ Prompts are ready to send to image generation API

Return ONLY the JSON above. No additional text.`;

    try {
      if (!process.env.ANTHROPIC_API_KEY) {
        console.log("No ANTHROPIC_API_KEY found. Falling back to mock designs.");
        return this.generateMockDesigns(videoData);
      }

      console.log("Calling Claude API for thumbnail generation...");
      
      const message = await this.client.messages.create({
        model: "claude-3-opus-20240229", // using accurate claude model string
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
        system: systemPrompt,
      });

      const responseText = message.content[0].text;
      console.log("Claude response received, parsing JSON...");

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Claude did not return valid JSON");
      }

      const designs = JSON.parse(jsonMatch[0]);
      console.log(`Successfully generated ${designs.variations?.length || 0} thumbnail designs`);

      this.validateDesigns(designs.variations);

      return designs;
    } catch (error) {
      console.error("Error in generateThumbnailDesigns:", error);
      throw error;
    }
  }

  validateDesigns(variations) {
    if (!Array.isArray(variations)) return;
    
    variations.forEach((design, index) => {
      if (!design.imageGenerationPrompt) {
        throw new Error(`Variation ${index + 1} missing imageGenerationPrompt`);
      }
    });
  }

  generateMockDesigns(videoData) {
    const safeStyle = videoData.style === 'auto' ? 'Trendy & Dynamic' : videoData.style;
    return {
      variations: [
        {
          variationNumber: 1,
          name: 'High-Contrast Action Shot',
          concept: 'Diagonal composition with dynamic lines pointing to the center focus area. High energy look.',
          layoutComposition: 'Split layout with focus on the left',
          colorScheme: { background: videoData.primaryColor || '#FF0000', primaryAccent: '#FFFFFF' },
          visualElements: [{ element: 'Shocked face on left' }],
          typography: { fontFamily: 'Impact', mainText: videoData.includeText || 'WOW!' },
          imageGenerationPrompt: `A highly professional YouTube thumbnail about ${videoData.title || 'video'}, featuring ${videoData.category || 'content'}, ${safeStyle} style, extreme contrast, dynamic action composition, vivid colors, cinematic lighting, 8k resolution, highly detailed.`,
          performancePrediction: { estimatedCTRImprovement: '+18-22%', confidenceLevel: 'High' }
        },
        {
          variationNumber: 2,
          name: 'Clean & Educational',
          concept: 'Split screen: Left side clean text, right side crisp visual representation of the concept.',
          layoutComposition: 'Split layout, text on left, image on right',
          colorScheme: { background: videoData.secondaryColor || '#000000', primaryAccent: videoData.primaryColor || '#FFFFFF' },
          visualElements: [{ element: 'Clean graphics' }],
          typography: { fontFamily: 'Montserrat Bold', mainText: 'EXPLAINED' },
          imageGenerationPrompt: `Minimalist professional YouTube thumbnail for ${videoData.title || 'video'}, split layout, modern typography space, ${safeStyle} aesthetic, studio lighting, hyper-realistic, volumetric lighting.`,
          performancePrediction: { estimatedCTRImprovement: '+10-15%', confidenceLevel: 'Medium' }
        },
        {
          variationNumber: 3,
          name: 'Mystery Curiosity Gap',
          concept: 'Subject centered but blurred or shadowed, surrounded by glowing elements.',
          layoutComposition: 'Centered focus with glow',
          colorScheme: { background: '#111111', primaryAccent: '#00FFFF' },
          visualElements: [{ element: 'Silhouette or blurred subject' }],
          typography: { fontFamily: 'Arial Black', mainText: 'SECRET' },
          imageGenerationPrompt: `Intriguing YouTube thumbnail background for ${videoData.title || 'video'}, dark and dramatic, glowing neon accents, cinematic mystery vibe, ${safeStyle} elements, high quality digital art.`,
          performancePrediction: { estimatedCTRImprovement: '+20-25%', confidenceLevel: 'High' }
        }
      ]
    };
  }

  async generateImageFromDesign(design) {
    if (!design.imageGenerationPrompt) {
      throw new Error("Design missing imageGenerationPrompt");
    }

    const apiProvider = process.env.REACT_APP_IMAGE_API || "pollinations";

    console.log(`Generating image using ${apiProvider} API...`);

    try {
      if (apiProvider === "stability" && process.env.STABILITY_AI_API_KEY) {
        return await this.generateWithStabilityAI(design.imageGenerationPrompt);
      } else if (apiProvider === "replicate" && process.env.REPLICATE_API_TOKEN) {
        return await this.generateWithReplicate(design.imageGenerationPrompt);
      } else if (apiProvider === "openai" && process.env.OPENAI_API_KEY) {
        return await this.generateWithOpenAI(design.imageGenerationPrompt);
      } else {
        // Fallback to pollinations using the detailed prompt
        return await this.generateWithPollinations(design.imageGenerationPrompt);
      }
    } catch (error) {
      console.error(`Image generation failed with ${apiProvider}:`, error);
      // Fallback to pollinations on failure for resilience
      return await this.generateWithPollinations(design.imageGenerationPrompt);
    }
  }

  async generateWithPollinations(prompt) {
    const randomSeed = Math.floor(Math.random() * 10000000) + Date.now();
    const encodedPrompt = encodeURIComponent(prompt);
    // Pollinations can handle detailed prompts nicely without an API key
    // Using Date.now() bypasses aggressive caching layers
    return {
      success: true,
      imageUrl: `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&seed=${randomSeed}&t=${Date.now()}&nologo=true`,
      apiProvider: "pollinations"
    };
  }

  async generateWithStabilityAI(prompt) {
    const response = await axios.post(
      "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
      {
        text_prompts: [{ text: prompt, weight: 1 }],
        cfg_scale: 7,
        height: 768, // SDXL allows 1024x1024, 1344x768, 768x1344 etc. We use nearest.
        width: 1344, 
        samples: 1,
        steps: 30,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.STABILITY_AI_API_KEY}`,
        },
      }
    );

    if (response.data.artifacts && response.data.artifacts.length > 0) {
      // we need to return a displayable base64 string
      return {
        success: true,
        imageUrl: `data:image/jpeg;base64,${response.data.artifacts[0].base64}`,
        apiProvider: "stability",
      };
    }
    throw new Error("No image generated by Stability AI");
  }

  async generateWithReplicate(prompt) {
    const predictionResponse = await axios.post(
      "https://api.replicate.com/v1/predictions",
      {
        version: "39ed52f2a60c3b36b96f92f6006665400925378778e4a1b323b11e6c27eca69a",
        input: {
          prompt: prompt,
          width: 1280,
          height: 720,
          num_inference_steps: 30,
          guidance_scale: 7.5,
        },
      },
      {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    let prediction = predictionResponse.data;

    while (prediction.status !== "succeeded" && prediction.status !== "failed") {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const statusResponse = await axios.get(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          },
        }
      );
      prediction = statusResponse.data;
    }

    if (prediction.status === "succeeded" && prediction.output && prediction.output.length > 0) {
      return {
        success: true,
        imageUrl: prediction.output[0],
        apiProvider: "replicate",
      };
    }
    throw new Error(`Replicate generation failed: ${prediction.error}`);
  }

  async generateWithOpenAI(prompt) {
    const response = await axios.post(
      "https://api.openai.com/v1/images/generations",
      {
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        model: "dall-e-3",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.data && response.data.data.length > 0) {
      return {
        success: true,
        imageUrl: response.data.data[0].url,
        apiProvider: "openai",
      };
    }
    throw new Error("No image generated by OpenAI");
  }
}

export default new ThumbnailGeneratorService();
