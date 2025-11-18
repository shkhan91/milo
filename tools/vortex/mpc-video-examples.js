/**
 * Real MPC Video Examples
 * 
 * These are actual Adobe MPC (Multimedia Platform) video IDs
 * that can be used to fetch real data from the MPC APIs
 */

export const MPC_VIDEO_EXAMPLES = [
  {
    id: '28729',
    description: 'Video with chapters - Great for testing chapter/clip functionality',
    hasChapters: true,
    hasCaptions: true,
    apiUrl: 'https://video.tv.adobe.com/v/28729?format=json-ld',
  },
  {
    id: '16413',
    description: 'Video without chapters - Basic video example',
    hasChapters: false,
    hasCaptions: true,
    apiUrl: 'https://video.tv.adobe.com/v/16413?format=json-ld',
  },
  {
    id: '332595',
    description: 'Adobe Summit 2021 Sneaks - Has multiple language captions (eng, fre_fr, ger, jpn, kor)',
    hasChapters: true,
    hasCaptions: true,
    languages: ['eng', 'fre_fr', 'ger', 'jpn', 'kor'],
    apiUrl: 'https://video.tv.adobe.com/v/332595?format=json-ld',
  },
  {
    id: '3419267',
    description: 'Video with audio descriptions and transcript',
    hasChapters: true,
    hasCaptions: true,
    hasAudioDescription: true,
    hasTranscript: true,
    apiUrl: 'https://video.tv.adobe.com/v/3419267?format=json-ld',
  },
  {
    id: '25819',
    description: 'Example video for testing',
    hasChapters: false,
    hasCaptions: true,
    apiUrl: 'https://video.tv.adobe.com/v/25819?format=json-ld',
  },
];

/**
 * Sample MPC bucket IDs (for authenticated API calls)
 * Note: These require proper authentication and permissions
 */
export const MPC_BUCKET_EXAMPLES = {
  // Add your bucket IDs here when you have authentication set up
  // example: 'my-bucket-id',
};

/**
 * Quick test function to verify MPC API connectivity
 */
export async function testMPCConnection(videoId = '28729') {
  try {
    const response = await fetch(`https://video.tv.adobe.com/v/${videoId}?format=json-ld`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('✅ MPC API connection successful!');
    console.log('Video title:', data.name);
    console.log('Duration:', data.duration);
    console.log('Has chapters:', data.hasPart?.length > 0);
    return data;
  } catch (error) {
    console.error('❌ MPC API connection failed:', error);
    throw error;
  }
}

