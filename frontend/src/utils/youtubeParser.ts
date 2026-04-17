// Helper function to extract video/channel ID from YouTube URLs

export interface ParsedYouTubeLink {
  type: 'video' | 'channel' | 'playlist' | 'channel_name' | 'search' | 'none';
  id: string;
  name?: string;
}

/**
 * Parse YouTube URL and extract video/channel ID
 * Handles formats like:
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://youtu.be/dQw4w9WgXcQ
 * - https://www.youtube.com/channel/UCxxxxxx
 * - https://www.youtube.com/@username
 * - https://www.youtube.com/playlist?list=PLxxxxxx
 */
export function parseYouTubeLink(url: string): ParsedYouTubeLink {
  const trimmedUrl = url.trim();

  // Check if it's a valid URL
  try {
    const urlObj = new URL(trimmedUrl);
    
    // Handle youtu.be short links
    if (urlObj.hostname === 'youtu.be' || urlObj.hostname === 'www.youtu.be') {
      const videoId = urlObj.pathname.split('/')[1];
      if (videoId && videoId.length === 11) {
        return { type: 'video', id: videoId };
      }
    }
    
    // Handle youtube.com links
    if (urlObj.hostname === 'youtube.com' || urlObj.hostname === 'www.youtube.com') {
      // Check for video URL (watch?v=ID)
      const videoId = urlObj.searchParams.get('v');
      if (videoId && videoId.length === 11) {
        return { type: 'video', id: videoId };
      }
      
      // Check for channel URL
      const channelMatch = urlObj.pathname.match(/\/channel\/([A-Za-z0-9_-]+)/);
      if (channelMatch && channelMatch[1]) {
        return { type: 'channel', id: channelMatch[1] };
      }
      
      // Check for custom URL (@username)
      const customMatch = urlObj.pathname.match(/\/@([A-Za-z0-9_-]+)/);
      if (customMatch && customMatch[1]) {
        return { type: 'channel_name', id: customMatch[1], name: customMatch[1] };
      }
      
      // Check for playlist URL
      const playlistId = urlObj.searchParams.get('list');
      if (playlistId && playlistId.startsWith('PL')) {
        return { type: 'playlist', id: playlistId };
      }
    }
  } catch (error) {
    // Not a valid URL, continue to other checks
  }

  // Check for just video ID (11 characters)
  if (trimmedUrl.length === 11 && /^[a-zA-Z0-9_-]+$/.test(trimmedUrl)) {
    return { type: 'video', id: trimmedUrl };
  }

  // Check for video ID in common format (dQw4w9WgXcQ)
  const videoIdMatch = trimmedUrl.match(/([a-zA-Z0-9_-]{11})/);
  if (videoIdMatch && videoIdMatch[1]) {
    return { type: 'video', id: videoIdMatch[1] };
  }

  // If it contains spaces or is text, treat as search (channel name or video title)
  if (trimmedUrl.length > 1 && trimmedUrl.length < 100) {
    // Could be a channel name or video title
    return { type: 'search', id: trimmedUrl, name: trimmedUrl };
  }

  return { type: 'none', id: '' };
}

/**
 * Check if string is a YouTube link or video ID
 */
export function isYouTubeLink(input: string): boolean {
  const parsed = parseYouTubeLink(input);
  return parsed.type !== 'none';
}

/**
 * Check if it's a searchable query (channel name or video title)
 */
export function isSearchQuery(input: string): boolean {
  const parsed = parseYouTubeLink(input);
  return parsed.type === 'search';
}

export default {
  parseYouTubeLink,
  isYouTubeLink,
  isSearchQuery,
};
