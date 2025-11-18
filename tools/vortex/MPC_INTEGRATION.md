# MPC Integration Guide

## 🎬 Adobe Multimedia Platform (MPC) Integration

Vortex is now integrated with Adobe's real video platform! This means you can fetch actual video data, captions, transcripts, and metadata from MPC.

## ✨ Features Integrated

### 1. **Video Metadata** (JSON-LD for SEO)
- Video title, description, duration
- Upload dates
- Thumbnail URLs  
- Embed URLs
- Chapter/clip markers

**API Endpoint:**
```
https://video.tv.adobe.com/v/{VIDEO_ID}?format=json-ld
```

### 2. **Closed Captions** 
- Multi-language caption support
- Timestamped caption data
- Paragraph markers for formatting

**API Endpoint:**
```
https://video.tv.adobe.com/vc/{VIDEO_ID}/{LANGUAGE_CODE}.json
```

**Example:**
```javascript
// Get English captions
https://video.tv.adobe.com/vc/332595/eng.json

// Get French captions
https://video.tv.adobe.com/vc/332595/fre_fr.json
```

### 3. **Transcripts**
- Full transcript with chapters
- Captions
- Audio descriptions
- VPOPs (Video Pop-up CTA buttons)

**API Endpoint:**
```
https://api.tv.adobe.com/videos/{VIDEO_ID}/transcript/{LANGUAGE_CODE}.json
```

### 4. **Audio Descriptions**
- Accessibility text data
- Available in JSON and VTT formats

**API Endpoint:**
```
https://api.tv.adobe.com/videos/{VIDEO_ID}/audio-descriptions/{LANGUAGE_CODE}.json
```

## 📂 Files Created

### `mpc-service.js`
Main service file with all MPC API integrations:
- `getVideoMetadata(videoId)` - Fetch video metadata
- `getVideoCaptions(videoId, languageCode)` - Get captions
- `getVideoTranscript(videoId, languageCode)` - Get transcript
- `getAudioDescriptions(videoId, languageCode)` - Get audio descriptions
- `getCompleteVideoData(videoId)` - Fetch everything at once
- `parseVideoChapters(metadata)` - Extract chapters
- `parseDuration(duration)` - Parse ISO 8601 duration
- `formatTime(seconds)` - Format time for display
- `extractVideoId(url)` - Extract ID from various URL formats

### `mpc-video-examples.js`
Sample MPC video IDs for testing:
- `28729` - Video with chapters
- `16413` - Basic video
- `332595` - Adobe Summit 2021 (multi-language)
- `3419267` - Video with audio description
- `25819` - Product demo

## 🚀 How It Works

### 1. Toggle Real vs Mock Data

In `vortex.js`, there's a configuration flag:

```javascript
const USE_REAL_MPC_DATA = true; // Set to false to use mock data
```

### 2. Automatic Data Loading

When the app initializes:
1. Shows mock data immediately (fast initial load)
2. Fetches real MPC data in the background
3. Updates the UI when real data loads
4. Falls back to mock data if API fails

### 3. Real Video Cards

Video cards now display:
- ✅ **Real thumbnails** from MPC
- ✅ **Actual titles** and descriptions
- ✅ **Real durations**
- ✅ **Chapter indicators** (if available)
- ✅ **Caption badges** (CC)
- ✅ **Audio description badges** (AD)
- ✅ **MPC video IDs**

## 🎯 Supported Languages

```javascript
eng      // English
fre_fr   // French (France)
ger      // German
jpn      // Japanese
kor      // Korean
spa      // Spanish
ita      // Italian
por_br   // Portuguese (Brazil)
chi_cn   // Chinese (Simplified)
chi_tw   // Chinese (Traditional)
dut      // Dutch
pol      // Polish
rus      // Russian
swe      // Swedish
tur      // Turkish
```

## 📊 Example Usage

### Fetch Complete Video Data

```javascript
import { getCompleteVideoData } from './mpc-service.js';

// Fetch everything about a video
const videoData = await getCompleteVideoData('28729');

console.log(videoData);
// Output:
// {
//   id: "28729",
//   title: "Video Title",
//   description: "Description...",
//   duration: 451, // seconds
//   durationFormatted: "7:31",
//   embedUrl: "https://video.tv.adobe.com/v/28729",
//   thumbnailUrl: "https://...",
//   uploadDate: "2024-01-15T...",
//   chapters: [...],
//   captions: {...},
//   bucketId: "..."
// }
```

### Get Video Captions

```javascript
import { getVideoCaptions } from './mpc-service.js';

const captions = await getVideoCaptions('332595', 'eng');

console.log(captions);
// Array of caption objects with timestamps
```

### Extract Video ID from URL

```javascript
import { extractVideoId } from './mpc-service.js';

const id1 = extractVideoId('https://video.tv.adobe.com/v/28729');
// Returns: "28729"

const id2 = extractVideoId('28729');
// Returns: "28729"
```

## 🔧 Adding More Videos

To add more real MPC videos to Vortex:

1. **Add video ID to the list** in `vortex.js`:

```javascript
const MPC_VIDEO_IDS = [
  '28729',
  '16413',
  '332595',
  '3419267',
  '25819',
  'YOUR_NEW_VIDEO_ID', // Add here
];
```

2. **Or fetch dynamically:**

```javascript
import { getCompleteVideoData } from './mpc-service.js';

const newVideo = await getCompleteVideoData('YOUR_VIDEO_ID');
```

## 🎨 UI Features

### Video Cards Show:
- **Thumbnail**: Real image from MPC
- **Duration**: Parsed from ISO 8601 format
- **Category badge**: Top-left overlay
- **Feature badges**: Bottom-left (Chapters, CC, AD)
- **MPC ID**: In metadata section
- **Action buttons**:
  - View (opens video)
  - Chapters (if available)
  - Captions (if available)
  - Transcript

### Activity Log Shows:
- ⏳ "Loading real video data from MPC..."
- ✅ "Loaded 5 real videos from MPC"
- ⚠️ "Failed to load MPC videos, using mock data"
- ❌ "Error loading MPC videos, using mock data"

## 🌐 API Environments

### Production (Default)
```javascript
video: 'https://video.tv.adobe.com'
api: 'https://api.tv.adobe.com'
```

### Staging
```javascript
video: 'https://stage-video.tv.adobe.com'
api: 'https://stage-api.tv.adobe.com'
```

To switch environments, modify `BASE_URL` in `mpc-service.js`.

## 📝 Notes

- **No Authentication Required** for read-only APIs
- **CORS-enabled** for client-side access
- **Rate Limits**: Be mindful of API usage
- **Fallback**: Always gracefully falls back to mock data
- **Error Handling**: All API calls wrapped in try-catch

## 🔗 Official Documentation

Full MPC API documentation:
https://wrecking-ball.stoplight.io/docs/media-publishing-cloud

## 🎯 Next Steps

1. ✅ Basic video metadata integration
2. ✅ Captions/transcript display
3. ✅ Chapter markers
4. ⏳ Search within captions
5. ⏳ AI-powered video analysis
6. ⏳ Clip creation with chapter markers
7. ⏳ Multi-language caption management
8. ⏳ Bulk operations on videos

## 🐛 Troubleshooting

### Videos not loading?
- Check browser console for errors
- Verify video IDs are correct (must be numbers)
- Check network tab for API responses
- Ensure CORS is not blocking requests

### Captions not showing?
- Not all videos have captions
- Check language code is correct
- Try 'eng' first as it's most common

### Thumbnails not displaying?
- MPC may not have generated thumbnails yet
- Check thumbnail URL is valid
- Fallback to gradient background

---

**Built for Adobe Hackathon 2025** 🚀  
**Powered by Adobe MPC APIs** 🎬

