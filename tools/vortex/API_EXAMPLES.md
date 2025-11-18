# 🔌 Vortex API Integration Examples

## Overview

This document provides practical examples for integrating Vortex with various backend services and APIs.

## AWS Bedrock Integration

### Setup

```bash
npm install @aws-sdk/client-bedrock-runtime
```

### Environment Variables

```bash
export AWS_REGION=us-east-1
export AWS_ACCESS_KEY_ID=your_key_here
export AWS_SECRET_ACCESS_KEY=your_secret_here
```

### Example: Transcription Analysis

```javascript
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function analyzeTranscript(transcript) {
  const prompt = `Analyze this video transcript and generate:
1. A 2-3 sentence summary
2. 5 key topics
3. Chapter suggestions with timestamps

Transcript: ${transcript}

Format as JSON.`;

  const payload = {
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  };

  const command = new InvokeModelCommand({
    modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
    contentType: 'application/json',
    body: JSON.stringify(payload),
  });

  const response = await client.send(command);
  const result = JSON.parse(new TextDecoder().decode(response.body));
  return JSON.parse(result.content[0].text);
}
```

### Example: Smart Clip Generation

```javascript
async function generateSmartClips(videoId, transcript, videoDuration) {
  const prompt = `Identify the 3 most engaging 30-second clips from this video.

Video ID: ${videoId}
Duration: ${videoDuration}
Transcript: ${transcript}

For each clip provide:
- startTime (HH:MM:SS)
- endTime (HH:MM:SS)
- title (engaging, 5-7 words)
- reason (why this is engaging)
- score (0-1)

Return as JSON array.`;

  const result = await invokeBedrockModel(prompt);
  return result;
}
```

## Adobe Video Platform API

### Get Video Metadata

```javascript
async function getVideoMetadata(videoId) {
  const response = await fetch(
    `https://video.adobe.com/api/v1/videos/${videoId}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.ADOBE_API_TOKEN}`,
        'x-api-key': process.env.ADOBE_API_KEY,
      },
    }
  );
  
  return await response.json();
}
```

### Upload Video

```javascript
async function uploadVideo(file, metadata) {
  const formData = new FormData();
  formData.append('video', file);
  formData.append('title', metadata.title);
  formData.append('description', metadata.description);
  formData.append('tags', JSON.stringify(metadata.tags));

  const response = await fetch(
    'https://video.adobe.com/api/v1/videos/upload',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ADOBE_API_TOKEN}`,
      },
      body: formData,
    }
  );

  return await response.json();
}
```

### Update Video Captions

```javascript
async function updateVideoCaptions(videoId, captionsVTT) {
  const response = await fetch(
    `https://video.adobe.com/api/v1/videos/${videoId}/captions`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${process.env.ADOBE_API_TOKEN}`,
        'Content-Type': 'text/vtt',
      },
      body: captionsVTT,
    }
  );

  return await response.json();
}
```

### Add Video Chapters

```javascript
async function addVideoChapters(videoId, chapters) {
  const response = await fetch(
    `https://video.adobe.com/api/v1/videos/${videoId}/chapters`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ADOBE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chapters }),
    }
  );

  return await response.json();
}
```

## AWS Transcribe Integration

### Start Transcription Job

```javascript
import { TranscribeClient, StartTranscriptionJobCommand } from '@aws-sdk/client-transcribe';

const transcribeClient = new TranscribeClient({ region: 'us-east-1' });

async function transcribeVideo(videoId, videoUrl) {
  const jobName = `vortex-${videoId}-${Date.now()}`;
  
  const command = new StartTranscriptionJobCommand({
    TranscriptionJobName: jobName,
    LanguageCode: 'en-US',
    MediaFormat: 'mp4',
    Media: { MediaFileUri: videoUrl },
    OutputBucketName: 'vortex-transcriptions',
    Settings: {
      ShowSpeakerLabels: true,
      MaxSpeakerLabels: 5,
    },
  });

  await transcribeClient.send(command);
  return jobName;
}
```

### Get Transcription Result

```javascript
import { GetTranscriptionJobCommand } from '@aws-sdk/client-transcribe';

async function getTranscriptionResult(jobName) {
  const command = new GetTranscriptionJobCommand({
    TranscriptionJobName: jobName,
  });

  const response = await transcribeClient.send(command);
  const job = response.TranscriptionJob;

  if (job.TranscriptionJobStatus === 'COMPLETED') {
    // Fetch the transcript JSON
    const transcriptUrl = job.Transcript.TranscriptFileUri;
    const transcript = await fetch(transcriptUrl).then(r => r.json());
    return formatTranscript(transcript);
  }

  return null;
}
```

## Vector Search (Semantic Search)

### Using AWS OpenSearch

```javascript
import { Client } from '@opensearch-project/opensearch';

const client = new Client({
  node: process.env.OPENSEARCH_ENDPOINT,
  auth: {
    username: process.env.OPENSEARCH_USER,
    password: process.env.OPENSEARCH_PASS,
  },
});

async function indexVideoTranscript(videoId, transcript) {
  // Generate embeddings using Bedrock
  const embeddings = await generateEmbeddings(transcript);

  await client.index({
    index: 'video-transcripts',
    id: videoId,
    body: {
      videoId,
      transcript,
      embeddings,
      timestamp: new Date().toISOString(),
    },
  });
}

async function semanticSearch(query) {
  const queryEmbedding = await generateEmbeddings(query);

  const response = await client.search({
    index: 'video-transcripts',
    body: {
      query: {
        knn: {
          embeddings: {
            vector: queryEmbedding,
            k: 10,
          },
        },
      },
    },
  });

  return response.body.hits.hits.map(hit => ({
    videoId: hit._source.videoId,
    transcript: hit._source.transcript,
    score: hit._score,
  }));
}
```

## Webhook Integration

### Video Processing Complete Webhook

```javascript
// Express.js endpoint
app.post('/webhooks/video-processed', async (req, res) => {
  const { videoId, status, transcription } = req.body;

  if (status === 'completed') {
    // Automatically generate captions
    const captions = await generateCaptions(transcription);
    await updateVideoCaptions(videoId, captions);

    // Generate chapters
    const chapters = await generateChapters(transcription);
    await addVideoChapters(videoId, chapters);

    // Send notification
    await notifyUser(videoId, 'Video processing complete!');
  }

  res.status(200).json({ received: true });
});
```

## Batch Processing

### Process Multiple Videos

```javascript
async function batchProcessVideos(videoIds, operation) {
  const BATCH_SIZE = 5;
  const results = [];

  for (let i = 0; i < videoIds.length; i += BATCH_SIZE) {
    const batch = videoIds.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (videoId) => {
        try {
          const result = await operation(videoId);
          return { videoId, success: true, result };
        } catch (error) {
          return { videoId, success: false, error: error.message };
        }
      })
    );
    results.push(...batchResults);
  }

  return results;
}

// Usage
const videoIds = ['1', '2', '3', '4', '5', '6'];
const results = await batchProcessVideos(videoIds, async (videoId) => {
  const video = await getVideoMetadata(videoId);
  const transcript = await transcribeVideo(videoId, video.url);
  return await generateCaptions(transcript);
});
```

## Caching Strategy

### Redis Cache

```javascript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function getCachedTranscript(videoId) {
  const cached = await redis.get(`transcript:${videoId}`);
  if (cached) {
    return JSON.parse(cached);
  }

  const transcript = await transcribeVideo(videoId);
  await redis.setex(
    `transcript:${videoId}`,
    86400, // 24 hours
    JSON.stringify(transcript)
  );

  return transcript;
}
```

## Error Handling

### Robust Error Handling

```javascript
class VortexError extends Error {
  constructor(message, code, details) {
    super(message);
    this.name = 'VortexError';
    this.code = code;
    this.details = details;
  }
}

async function safeTranscribe(videoId) {
  try {
    return await transcribeVideo(videoId);
  } catch (error) {
    if (error.code === 'ThrottlingException') {
      // Retry with backoff
      await sleep(5000);
      return await transcribeVideo(videoId);
    }
    
    throw new VortexError(
      'Transcription failed',
      'TRANSCRIBE_ERROR',
      { videoId, originalError: error.message }
    );
  }
}
```

## Rate Limiting

### Token Bucket Implementation

```javascript
class RateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  async acquire() {
    const now = Date.now();
    this.requests = this.requests.filter(t => now - t < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest);
      await sleep(waitTime);
      return this.acquire();
    }

    this.requests.push(now);
  }
}

const bedrockLimiter = new RateLimiter(50, 60000); // 50 req/min

async function rateLimitedInvoke(prompt) {
  await bedrockLimiter.acquire();
  return await invokeBedrockModel(prompt);
}
```

## Monitoring & Logging

### CloudWatch Logging

```javascript
import { CloudWatchLogsClient, PutLogEventsCommand } from '@aws-sdk/client-cloudwatch-logs';

const cwClient = new CloudWatchLogsClient({ region: 'us-east-1' });

async function logEvent(level, message, metadata) {
  const logEvent = {
    timestamp: Date.now(),
    level,
    message,
    metadata,
  };

  const command = new PutLogEventsCommand({
    logGroupName: '/vortex/application',
    logStreamName: 'ai-processing',
    logEvents: [{
      timestamp: logEvent.timestamp,
      message: JSON.stringify(logEvent),
    }],
  });

  await cwClient.send(command);
}
```

## Testing

### Mock AI Service for Testing

```javascript
class MockAIService {
  async transcribeVideo(videoId) {
    return {
      videoId,
      transcription: [
        { timestamp: '00:00:00', text: 'Test transcript', confidence: 0.95 },
      ],
      language: 'en-US',
    };
  }

  async generateCaptions(videoId, transcript) {
    return {
      videoId,
      formats: {
        srt: 'Mock SRT content',
        vtt: 'WEBVTT\n\nMock VTT content',
      },
    };
  }
}

// In tests
const aiService = process.env.NODE_ENV === 'test' 
  ? new MockAIService() 
  : new VortexAIService();
```

## Performance Optimization

### Parallel Processing

```javascript
async function processVideoComplete(videoId) {
  // Get video metadata
  const video = await getVideoMetadata(videoId);

  // Process multiple AI tasks in parallel
  const [transcript, summary, tags] = await Promise.all([
    transcribeVideo(videoId, video.url),
    generateSummary(video.description),
    extractTags(video.title + ' ' + video.description),
  ]);

  // Process dependent tasks
  const [captions, chapters, clips] = await Promise.all([
    generateCaptions(videoId, transcript),
    generateChapters(videoId, transcript),
    createSmartClips(videoId, transcript, video.duration),
  ]);

  return {
    transcript,
    summary,
    tags,
    captions,
    chapters,
    clips,
  };
}
```

## Cost Optimization

### Estimating API Costs

```javascript
function estimateCost(operation, inputSize) {
  const costs = {
    bedrock_input: 0.003 / 1000,    // per token
    bedrock_output: 0.015 / 1000,   // per token
    transcribe: 0.024 / 60,         // per minute
  };

  const estimates = {
    transcription: {
      cost: costs.transcribe * (inputSize / 60),
      currency: 'USD',
    },
    ai_analysis: {
      input: costs.bedrock_input * inputSize,
      output: costs.bedrock_output * (inputSize * 0.3), // Estimated 30% output
      total: costs.bedrock_input * inputSize + costs.bedrock_output * (inputSize * 0.3),
      currency: 'USD',
    },
  };

  return estimates;
}
```

---

## Quick Reference

### AWS Bedrock Models
```
Claude 3 Sonnet:  anthropic.claude-3-sonnet-20240229-v1:0
Claude 3 Haiku:   anthropic.claude-3-haiku-20240307-v1:0
```

### Content Type Headers
```
JSON:  application/json
VTT:   text/vtt
SRT:   application/x-subrip
```

### Status Codes
```
200: Success
201: Created
400: Bad Request
401: Unauthorized
429: Rate Limited
500: Server Error
```

---

**For More Information:**
- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [Adobe Video Platform API](https://developer.adobe.com/video/)
- [OpenSearch Documentation](https://opensearch.org/docs/)

