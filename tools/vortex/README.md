# 🌀 Vortex - AI Video Command Center

Vortex is an innovative AI-powered video management and processing command center for Adobe's video platform. Built for the hackathon, it demonstrates cutting-edge AI capabilities for video content management.

## 🎯 Overview

Vortex transforms how teams interact with video content by providing an intelligent command center that understands natural language and performs complex video operations using AI.

## ✨ Key Features

### 1. **AI Command Center**
- Natural language command processing
- Intelligent video operations
- Context-aware AI responses
- Powered by AWS Bedrock (Claude AI)

### 2. **Smart Video Search**
- Search by transcription content
- Semantic search capabilities
- Timestamp-based results
- Context-aware matching

### 3. **Automated Video Processing**
- **Auto-transcription**: Convert speech to text with timestamps
- **Caption Generation**: Create SRT, VTT, and TXT formats
- **Chapter Detection**: AI-generated video chapters
- **Smart Clipping**: Extract highlights automatically
- **Content Summarization**: Generate video summaries

### 4. **Intelligent Collections**
- AI-recommended video collections
- Topic-based grouping
- Automated tagging
- Smart categorization

### 5. **Real-time Processing**
- Live progress tracking
- Multi-step workflow visualization
- Background processing
- Status notifications

## 🚀 Quick Start

### Access the App

Navigate to: `https://main--milo--adobecom.hlx.page/tools/vortex/vortex`

### Using the AI Command Center

1. **Enter Natural Language Commands**:
   ```
   Find all videos about Photoshop AI features
   Create a 30-second highlight reel from video #1234
   Generate captions for the Creative Cloud series
   Suggest a collection of beginner tutorials
   ```

2. **Use Quick Actions**:
   - Click any quick action button to load pre-configured commands
   - Modify the command as needed
   - Execute with one click

3. **Browse & Search**:
   - Filter videos by tags or content
   - Search transcriptions for specific topics
   - View organized collections

## 🏗️ Architecture

### Technology Stack

- **Frontend**: Vanilla JavaScript, Adobe Spectrum UI
- **AI Backend**: AWS Bedrock (Claude 3 Sonnet)
- **Video Processing**: AWS Media Services (planned)
- **Storage**: Adobe Experience Manager
- **Hosting**: Adobe Experience League

### Key Components

```
tools/vortex/
├── vortex.html         # Main application page
├── vortex.css          # Modern, gradient-based styling
├── vortex.js           # Core application logic
├── ai-service.js       # AWS Bedrock integration
└── README.md           # Documentation
```

## 🎨 Design Philosophy

### User Experience
- **Intuitive**: Natural language commands reduce learning curve
- **Visual**: Gradient-based design with clear hierarchy
- **Responsive**: Works seamlessly across devices
- **Fast**: Optimized for quick interactions

### Visual Design
- Modern gradient aesthetics (Blue to Purple)
- Adobe Spectrum component library
- Card-based layouts for clarity
- Smooth animations and transitions
- High contrast for accessibility

## 🤖 AI Capabilities

### Current Implementation (POC)

The current version uses **mock implementations** to demonstrate capabilities:

1. **Transcription**: Simulated AWS Transcribe output
2. **Caption Generation**: Mock SRT/VTT generation
3. **Chapter Detection**: AI-style chapter suggestions
4. **Smart Clipping**: Demo clip recommendations
5. **Semantic Search**: Simulated vector search results

### Production Roadmap

For production deployment, integrate:

```javascript
// AWS SDK Setup
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { TranscribeClient } from '@aws-sdk/client-transcribe';

// Configure Bedrock
const bedrockClient = new BedrockRuntimeClient({ 
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

// Use Claude 3 Sonnet for video analysis
const modelId = 'anthropic.claude-3-sonnet-20240229-v1:0';
```

## 📊 Features in Detail

### Video Transcription
- Real-time speech-to-text conversion
- Multiple language support
- Timestamp accuracy
- Confidence scoring

### Caption Generation
- **SRT Format**: Standard subtitle format
- **VTT Format**: WebVTT for web video
- **Plain Text**: Full transcript export
- Automatic timing and formatting

### Smart Clipping
- AI identifies key moments
- Configurable clip duration
- Engagement scoring
- Batch processing support

### Chapter Generation
- Content analysis for topic changes
- Descriptive titles
- Timestamp accuracy
- Hierarchical structure support

### Collection Recommendations
- Content similarity analysis
- Audience targeting
- Topic clustering
- Performance-based scoring

## 🎯 Use Cases

### Content Creators
- Quickly find specific content moments
- Auto-generate captions for accessibility
- Create highlight reels automatically
- Organize large video libraries

### Marketing Teams
- Extract key product mentions
- Create social media clips
- Generate video summaries
- Track brand messaging

### Training & Education
- Add chapters for better navigation
- Search by topic within videos
- Create curated learning paths
- Generate study guides from transcripts

### Video Editors
- Find footage by spoken content
- Auto-generate rough cuts
- Add captions efficiently
- Organize raw footage

## 🔧 Configuration

### AWS Bedrock Setup (Production)

1. **Create AWS Account** with Bedrock access
2. **Enable Claude 3 Models** in your region
3. **Configure Credentials**:
   ```bash
   export AWS_ACCESS_KEY_ID=your_key
   export AWS_SECRET_ACCESS_KEY=your_secret
   export AWS_REGION=us-east-1
   ```

4. **Update ai-service.js** with real API calls

### Alternative AI Services

While AWS Bedrock is recommended, you can also consider:

- **Azure AI Video Indexer**: Strong video analysis
- **Google Cloud Video Intelligence**: Good transcription
- **OpenAI GPT-4 Vision**: Excellent for content analysis
- **Anthropic Claude**: Direct API access

## 🎓 Command Examples

### Search Commands
```
Find videos about "generative AI"
Search for mentions of "Adobe Express"
Show videos discussing "workflow optimization"
```

### Processing Commands
```
Transcribe video #1234
Generate captions for all Creative Cloud videos
Create 30-second clips from video #5678
Add chapters to tutorial series
```

### Collection Commands
```
Recommend videos for beginners
Create collection of AI feature demos
Suggest related content for video #9012
Build a learning path for Photoshop
```

### Analysis Commands
```
Summarize video #3456
What topics are covered in video #7890?
List key features mentioned in this video
Find most engaging moments
```

## 📈 Metrics & Analytics

### Planned Analytics Features
- Processing time tracking
- AI accuracy metrics
- User engagement stats
- Cost optimization insights
- Video performance data

## 🔐 Security & Privacy

### Data Handling
- Secure AWS credential management
- Video content encryption
- Access control integration
- Audit logging
- GDPR compliance considerations

## 🚦 Development Status

### ✅ Completed (POC)
- Modern UI with Adobe Spectrum
- Natural language command interface
- Mock AI service implementation
- Video library management
- Collection organization
- Search interface

### 🔄 In Progress
- AWS Bedrock integration
- Real transcription service
- Production deployment pipeline

### 📋 Planned
- Real-time collaboration
- Advanced analytics dashboard
- Mobile app version
- Plugin system for extensibility
- Integration with Adobe Creative Cloud

## 🤝 Contributing

This is a hackathon project, but we welcome feedback and ideas!

### Running Locally

1. Clone the repository
2. Navigate to `/tools/vortex/`
3. Open `vortex.html` in a browser
4. For development, use a local server:
   ```bash
   python -m http.server 8000
   # or
   npx http-server
   ```

## 📝 License

Copyright © 2024 Adobe. All rights reserved.

## 🙏 Acknowledgments

- Adobe Spectrum Design System
- AWS Bedrock Team
- Milo Framework
- Hackathon Judges & Participants

## 📞 Contact

For questions or feedback about Vortex, reach out to the development team.

---

**Built with ❤️ for Adobe Hackathon 2024**

