/**
 * MPC (Adobe Multimedia Platform) Service
 * Integrates with Adobe's video platform APIs for real video data
 * 
 * API Documentation: https://wrecking-ball.stoplight.io/docs/media-publishing-cloud
 */

// MPC API Configuration
const MPC_CONFIG = {
  production: {
    video: 'https://video.tv.adobe.com',
    api: 'https://api.tv.adobe.com',
  },
  stage: {
    video: 'https://stage-video.tv.adobe.com',
    api: 'https://stage-api.tv.adobe.com',
  },
};

// Use production by default
const BASE_URL = MPC_CONFIG.production;

/**
 * Get video metadata in JSON-LD format (for SEO)
 * @param {string} videoId - MPC video ID
 * @returns {Promise<Object>} Video metadata
 */
export async function getVideoMetadata(videoId) {
  try {
    const response = await fetch(`${BASE_URL.video}/v/${videoId}?format=json-ld`);
    if (!response.ok) throw new Error(`Failed to fetch video metadata: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching video metadata:', error);
    throw error;
  }
}

/**
 * Get full video data in JSON format
 * @param {string} videoId - MPC video ID
 * @returns {Promise<Object>} Full video data
 */
export async function getVideoData(videoId) {
  try {
    const response = await fetch(`${BASE_URL.video}/v/${videoId}?format=json`);
    if (!response.ok) throw new Error(`Failed to fetch video data: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching video data:', error);
    throw error;
  }
}

/**
 * Get video captions/closed captions
 * @param {string} videoId - MPC video ID
 * @param {string} languageCode - Language code (e.g., 'eng', 'fre_fr', 'jpn')
 * @returns {Promise<Object>} Captions data with timestamps
 */
export async function getVideoCaptions(videoId, languageCode = 'eng') {
  try {
    const response = await fetch(`${BASE_URL.video}/vc/${videoId}/${languageCode}.json`);
    if (!response.ok) {
      // Don't throw for 404 - captions simply don't exist
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch captions: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    // For network errors or other issues, return null instead of throwing
    console.log(`No captions for video ${videoId}: ${error.message}`);
    return null;
  }
}

/**
 * Get video transcript (includes chapters, captions, audio descriptions, VPOPs)
 * @param {string} videoId - MPC video ID
 * @param {string} languageCode - Language code (e.g., 'eng')
 * @returns {Promise<Object>} Transcript data
 */
export async function getVideoTranscript(videoId, languageCode = 'eng') {
  try {
    const response = await fetch(`${BASE_URL.api}/videos/${videoId}/transcript/${languageCode}.json`);
    if (!response.ok) throw new Error(`Failed to fetch transcript: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching transcript:', error);
    throw error;
  }
}

/**
 * Get audio description text
 * @param {string} videoId - MPC video ID
 * @param {string} languageCode - Language code (e.g., 'eng')
 * @returns {Promise<Object>} Audio description data
 */
export async function getAudioDescriptions(videoId, languageCode = 'eng') {
  try {
    const response = await fetch(`${BASE_URL.api}/videos/${videoId}/audio-descriptions/${languageCode}.json`);
    if (!response.ok) throw new Error(`Failed to fetch audio descriptions: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching audio descriptions:', error);
    throw error;
  }
}

/**
 * Get video embed URL
 * @param {string} videoId - MPC video ID
 * @param {Object} options - Embed options (autoplay, quality, etc.)
 * @returns {string} Embed URL
 */
export function getVideoEmbedUrl(videoId, options = {}) {
  const params = new URLSearchParams();
  
  if (options.quality) params.append('quality', options.quality);
  if (options.autoplay) params.append('autoplay', options.autoplay);
  if (options.startTime) params.append('t', options.startTime);
  
  const query = params.toString();
  return `${BASE_URL.video}/v/${videoId}${query ? '?' + query : ''}`;
}

/**
 * Get video thumbnail URL
 * @param {string} videoId - MPC video ID
 * @param {number} width - Thumbnail width (default: 640)
 * @returns {string} Thumbnail URL
 */
export function getVideoThumbnail(videoId, width = 640) {
  // Try multiple thumbnail URL patterns
  return `https://video.tv.adobe.com/v/${videoId}/thumbnail?width=${width}&format=jpeg`;
}

/**
 * Search videos in a bucket (requires authentication)
 * @param {string} bucketId - MPC bucket ID
 * @param {Object} filters - Search filters
 * @returns {Promise<Array>} List of videos
 */
export async function searchVideos(bucketId, filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.query) params.append('q', filters.query);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    
    const response = await fetch(`${BASE_URL.api}/buckets/${bucketId}/videos?${params.toString()}`);
    if (!response.ok) throw new Error(`Failed to search videos: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error searching videos:', error);
    throw error;
  }
}

/**
 * Parse video chapters from metadata
 * @param {Object} metadata - Video metadata (JSON-LD format)
 * @returns {Array} Array of chapters
 */
export function parseVideoChapters(metadata) {
  if (!metadata.hasPart || !Array.isArray(metadata.hasPart)) {
    return [];
  }
  
  return metadata.hasPart.map(chapter => ({
    name: chapter.name,
    startTime: parseTimeOffset(chapter.startOffset),
    endTime: parseTimeOffset(chapter.endOffset),
    url: chapter.url,
  }));
}

/**
 * Parse ISO 8601 duration to seconds
 * @param {string} duration - ISO 8601 duration (e.g., "PT0H7M31S")
 * @returns {number} Duration in seconds
 */
export function parseDuration(duration) {
  if (!duration) return 0;
  
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || 0, 10);
  const minutes = parseInt(match[2] || 0, 10);
  const seconds = parseInt(match[3] || 0, 10);
  
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Parse time offset to seconds
 * @param {number} offset - Time offset in seconds
 * @returns {number} Time in seconds
 */
function parseTimeOffset(offset) {
  return parseFloat(offset) || 0;
}

/**
 * Format seconds to readable time string (HH:MM:SS or MM:SS)
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Extract video ID from various MPC URL formats
 * @param {string} url - MPC video URL
 * @returns {string|null} Video ID or null
 */
export function extractVideoId(url) {
  const patterns = [
    /video\.tv\.adobe\.com\/v\/(\d+)/,
    /api\.tv\.adobe\.com\/videos\/(\d+)/,
    /\/v\/(\d+)/,
    /videos\/(\d+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  // If it's just a number, return it
  if (/^\d+$/.test(url)) return url;
  
  return null;
}

/**
 * Get list of available language codes
 * Common language codes used in MPC
 */
export const LANGUAGE_CODES = {
  eng: 'English',
  fre_fr: 'French (France)',
  ger: 'German',
  jpn: 'Japanese',
  kor: 'Korean',
  spa: 'Spanish',
  ita: 'Italian',
  por_br: 'Portuguese (Brazil)',
  chi_cn: 'Chinese (Simplified)',
  chi_tw: 'Chinese (Traditional)',
  dut: 'Dutch',
  pol: 'Polish',
  rus: 'Russian',
  swe: 'Swedish',
  tur: 'Turkish',
};

/**
 * Example: Fetch complete video data with all features
 * @param {string} videoId - MPC video ID
 * @returns {Promise<Object>} Complete video data package
 */
export async function getCompleteVideoData(videoId) {
  try {
    // Fetch metadata and captions in parallel
    const [metadata, captions] = await Promise.all([
      getVideoMetadata(videoId),
      getVideoCaptions(videoId, 'eng'), // Returns null if not available
    ]);
    
    console.log(`Raw metadata for ${videoId}:`, metadata);
    
    // The actual video data is inside jsonLinkedData
    const videoData = metadata.jsonLinkedData || metadata;
    
    console.log(`Video data extracted:`, {
      name: videoData.name,
      duration: videoData.duration,
      thumbnails: videoData.thumbnailUrl,
    });
    
    const chapters = parseVideoChapters(videoData);
    const duration = parseDuration(videoData.duration);
    
    // Get thumbnail - try multiple strategies
    let thumbnailUrl = null;
    
    // Strategy 1: Use thumbnailUrl from metadata (preferred)
    if (videoData.thumbnailUrl) {
      if (Array.isArray(videoData.thumbnailUrl) && videoData.thumbnailUrl.length > 0) {
        thumbnailUrl = videoData.thumbnailUrl[0];
      } else if (typeof videoData.thumbnailUrl === 'string') {
        thumbnailUrl = videoData.thumbnailUrl;
      }
    }
    
    // Strategy 2: Use contentUrl if available
    if (!thumbnailUrl && videoData.contentUrl) {
      thumbnailUrl = videoData.contentUrl;
    }
    
    // Strategy 3: Generate thumbnail URL
    if (!thumbnailUrl) {
      thumbnailUrl = getVideoThumbnail(videoId);
    }
    
    console.log(`Thumbnail for ${videoId}:`, thumbnailUrl);
    
    return {
      id: videoId,
      title: videoData.name || 'Untitled Video',
      description: videoData.description || '',
      duration,
      durationFormatted: formatTime(duration),
      embedUrl: videoData.embedUrl || `https://video.tv.adobe.com/v/${videoId}`,
      thumbnailUrl,
      uploadDate: videoData.uploadDate,
      chapters,
      captions,
      bucketId: metadata.bucketId,
    };
  } catch (error) {
    console.error(`Error fetching complete video data for ${videoId}:`, error);
    throw error;
  }
}

// Export configuration for testing
export { MPC_CONFIG, BASE_URL };

