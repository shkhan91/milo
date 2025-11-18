/**
 * Mock Video Data for Vortex Demo
 *
 * This file contains sample video data for demonstration purposes.
 * In production, this would come from Adobe's video platform API.
 */

export const videos = [
  {
    id: '1',
    title: 'Adobe Creative Cloud Overview 2024',
    description: 'Complete introduction to Adobe Creative Cloud suite and its latest features',
    duration: '12:45',
    durationSeconds: 765,
    views: '125K',
    likes: 4523,
    date: '2024-11-15',
    dateFormatted: '2 days ago',
    thumbnail: '🎨',
    thumbnailUrl: '/path/to/thumbnail1.jpg',
    category: 'Creative Cloud',
    tags: ['creative-cloud', 'overview', 'tutorial', 'beginner'],
    author: 'Adobe Learning',
    language: 'en',
    transcriptAvailable: true,
    captionsAvailable: true,
    chaptersAvailable: true,
  },
  {
    id: '2',
    title: 'Photoshop AI Features Deep Dive',
    description: 'Explore the revolutionary AI-powered features in Adobe Photoshop',
    duration: '18:30',
    durationSeconds: 1110,
    views: '89K',
    likes: 3421,
    date: '2024-11-12',
    dateFormatted: '5 days ago',
    thumbnail: '🖼️',
    thumbnailUrl: '/path/to/thumbnail2.jpg',
    category: 'Photoshop',
    tags: ['photoshop', 'ai', 'generative-fill', 'advanced'],
    author: 'Adobe Creative Team',
    language: 'en',
    transcriptAvailable: true,
    captionsAvailable: true,
    chaptersAvailable: false,
  },
  {
    id: '3',
    title: 'Adobe Express Tutorial for Beginners',
    description: 'Quick start guide to creating stunning designs with Adobe Express',
    duration: '8:15',
    durationSeconds: 495,
    views: '256K',
    likes: 8734,
    date: '2024-11-10',
    dateFormatted: '1 week ago',
    thumbnail: '✨',
    thumbnailUrl: '/path/to/thumbnail3.jpg',
    category: 'Adobe Express',
    tags: ['express', 'beginner', 'quick-start', 'design'],
    author: 'Adobe Express Team',
    language: 'en',
    transcriptAvailable: true,
    captionsAvailable: true,
    chaptersAvailable: true,
  },
  {
    id: '4',
    title: 'Illustrator Vector Mastery',
    description: 'Master vector graphics with advanced Illustrator techniques',
    duration: '22:10',
    durationSeconds: 1330,
    views: '45K',
    likes: 1876,
    date: '2024-11-14',
    dateFormatted: '3 days ago',
    thumbnail: '🎯',
    thumbnailUrl: '/path/to/thumbnail4.jpg',
    category: 'Illustrator',
    tags: ['illustrator', 'vector', 'advanced', 'design'],
    author: 'Vector Academy',
    language: 'en',
    transcriptAvailable: true,
    captionsAvailable: false,
    chaptersAvailable: true,
  },
  {
    id: '5',
    title: 'After Effects Motion Graphics',
    description: 'Create professional motion graphics and animations',
    duration: '15:40',
    durationSeconds: 940,
    views: '178K',
    likes: 6234,
    date: '2024-11-13',
    dateFormatted: '4 days ago',
    thumbnail: '🎬',
    thumbnailUrl: '/path/to/thumbnail5.jpg',
    category: 'After Effects',
    tags: ['after-effects', 'motion-graphics', 'animation', 'intermediate'],
    author: 'Motion Masters',
    language: 'en',
    transcriptAvailable: true,
    captionsAvailable: true,
    chaptersAvailable: true,
  },
  {
    id: '6',
    title: 'Premiere Pro Editing Workflow',
    description: 'Optimize your video editing workflow in Premiere Pro',
    duration: '19:25',
    durationSeconds: 1165,
    views: '312K',
    likes: 9876,
    date: '2024-11-09',
    dateFormatted: '1 week ago',
    thumbnail: '🎞️',
    thumbnailUrl: '/path/to/thumbnail6.jpg',
    category: 'Premiere Pro',
    tags: ['premiere-pro', 'editing', 'workflow', 'intermediate'],
    author: 'Video Pro Academy',
    language: 'en',
    transcriptAvailable: true,
    captionsAvailable: true,
    chaptersAvailable: false,
  },
  {
    id: '7',
    title: 'Lightroom Photo Editing Essentials',
    description: 'Essential photo editing techniques in Adobe Lightroom',
    duration: '14:20',
    durationSeconds: 860,
    views: '203K',
    likes: 7123,
    date: '2024-11-08',
    dateFormatted: '9 days ago',
    thumbnail: '📸',
    thumbnailUrl: '/path/to/thumbnail7.jpg',
    category: 'Lightroom',
    tags: ['lightroom', 'photo-editing', 'beginner', 'photography'],
    author: 'Photo Academy',
    language: 'en',
    transcriptAvailable: true,
    captionsAvailable: true,
    chaptersAvailable: true,
  },
  {
    id: '8',
    title: 'InDesign Layout Fundamentals',
    description: 'Learn the fundamentals of professional layout design',
    duration: '16:55',
    durationSeconds: 1015,
    views: '67K',
    likes: 2345,
    date: '2024-11-07',
    dateFormatted: '10 days ago',
    thumbnail: '📄',
    thumbnailUrl: '/path/to/thumbnail8.jpg',
    category: 'InDesign',
    tags: ['indesign', 'layout', 'typography', 'intermediate'],
    author: 'Design Pro',
    language: 'en',
    transcriptAvailable: true,
    captionsAvailable: false,
    chaptersAvailable: true,
  },
];

export const collections = [
  {
    id: 'c1',
    name: 'Creative Cloud Essentials',
    description: 'Must-watch videos for Creative Cloud beginners',
    count: 12,
    icon: '📚',
    videoIds: ['1', '3'],
    dateCreated: '2024-11-01',
    lastUpdated: '2024-11-15',
    author: 'Adobe Learning',
    isPublic: true,
    tags: ['beginner', 'essentials'],
  },
  {
    id: 'c2',
    name: 'AI-Powered Features',
    description: 'Discover the latest AI capabilities across Adobe apps',
    count: 8,
    icon: '🤖',
    videoIds: ['2'],
    dateCreated: '2024-11-05',
    lastUpdated: '2024-11-12',
    author: 'Adobe AI Team',
    isPublic: true,
    tags: ['ai', 'advanced', 'features'],
  },
  {
    id: 'c3',
    name: 'Quick Tips & Tricks',
    description: 'Short videos packed with useful tips and tricks',
    count: 24,
    icon: '💡',
    videoIds: ['3'],
    dateCreated: '2024-10-15',
    lastUpdated: '2024-11-14',
    author: 'Community',
    isPublic: true,
    tags: ['tips', 'quick', 'productivity'],
  },
  {
    id: 'c4',
    name: 'Product Launches',
    description: 'Latest product announcements and feature releases',
    count: 6,
    icon: '🚀',
    videoIds: ['1', '2'],
    dateCreated: '2024-11-10',
    lastUpdated: '2024-11-15',
    author: 'Adobe Marketing',
    isPublic: true,
    tags: ['launch', 'new', 'features'],
  },
  {
    id: 'c5',
    name: 'Video Editing Masterclass',
    description: 'Complete guide to professional video editing',
    count: 15,
    icon: '🎥',
    videoIds: ['5', '6'],
    dateCreated: '2024-10-20',
    lastUpdated: '2024-11-09',
    author: 'Video Academy',
    isPublic: true,
    tags: ['video', 'editing', 'advanced'],
  },
  {
    id: 'c6',
    name: 'Photography Workshop',
    description: 'From capture to edit - complete photography workflow',
    count: 18,
    icon: '📷',
    videoIds: ['7'],
    dateCreated: '2024-10-25',
    lastUpdated: '2024-11-08',
    author: 'Photo Academy',
    isPublic: true,
    tags: ['photography', 'workflow', 'lightroom'],
  },
];

export const transcripts = {
  1: [
    {
      timestamp: '00:00:00',
      text: 'Welcome to Adobe Creative Cloud. In this video, we\'ll explore the amazing features that make Creative Cloud the industry standard for creative professionals.',
      confidence: 0.95,
    },
    {
      timestamp: '00:00:15',
      text: 'Let\'s start with the new AI-powered tools that will transform your workflow and boost your creativity to new heights.',
      confidence: 0.92,
    },
    {
      timestamp: '00:00:30',
      text: 'First, we have the generative fill feature in Photoshop, which uses artificial intelligence to seamlessly add or remove content from your images.',
      confidence: 0.94,
    },
    {
      timestamp: '00:01:00',
      text: 'Creative Cloud also includes seamless integration across all apps, allowing you to start a project in one application and finish it in another.',
      confidence: 0.93,
    },
  ],
  2: [
    {
      timestamp: '00:00:00',
      text: 'Today we\'re diving deep into Photoshop\'s revolutionary AI features. These tools are changing the game for designers and photographers everywhere.',
      confidence: 0.96,
    },
    {
      timestamp: '00:00:20',
      text: 'Generative AI in Photoshop has revolutionized the way we work with images. Let me show you some practical examples.',
      confidence: 0.89,
    },
  ],
};

export const categories = [
  { id: 'creative-cloud', name: 'Creative Cloud', color: '#FF0000' },
  { id: 'photoshop', name: 'Photoshop', color: '#31A8FF' },
  { id: 'illustrator', name: 'Illustrator', color: '#FF9A00' },
  { id: 'after-effects', name: 'After Effects', color: '#9999FF' },
  { id: 'premiere-pro', name: 'Premiere Pro', color: '#9999FF' },
  { id: 'lightroom', name: 'Lightroom', color: '#31A8FF' },
  { id: 'indesign', name: 'InDesign', color: '#FF3366' },
  { id: 'express', name: 'Adobe Express', color: '#FF0000' },
];

export const quickActions = [
  {
    id: 'recommend',
    label: 'Recommend Video Collection',
    icon: '🎯',
    description: 'Get AI-powered video recommendations based on criteria',
    prompt: 'Recommend a collection of videos for beginners interested in ',
  },
  {
    id: 'clip',
    label: 'Create Smart Clips',
    icon: '✂️',
    description: 'Extract highlights and key moments automatically',
    prompt: 'Create 3 x 30-second highlight clips from video ',
  },
  {
    id: 'captions',
    label: 'Generate Captions',
    icon: '💬',
    description: 'Auto-generate captions in multiple formats',
    prompt: 'Generate captions in SRT and VTT format for video ',
  },
  {
    id: 'chapters',
    label: 'Auto-Generate Chapters',
    icon: '📑',
    description: 'Detect topics and create chapter markers',
    prompt: 'Analyze and create chapter markers for video ',
  },
  {
    id: 'transcribe',
    label: 'Transcribe Audio',
    icon: '📝',
    description: 'Convert speech to text with timestamps',
    prompt: 'Transcribe the audio from video ',
  },
  {
    id: 'summarize',
    label: 'Create Summary',
    icon: '📊',
    description: 'Generate a comprehensive video summary',
    prompt: 'Create a detailed summary of video ',
  },
];

// Helper functions to work with the data

export function getVideoById(id) {
  return videos.find((video) => video.id === id);
}

export function getCollectionById(id) {
  return collections.find((collection) => collection.id === id);
}

export function getVideosByCategory(category) {
  return videos.filter((video) => video.category.toLowerCase() === category.toLowerCase());
}

export function getVideosByTag(tag) {
  return videos.filter((video) => video.tags.includes(tag));
}

export function searchVideos(query) {
  const lowerQuery = query.toLowerCase();
  return videos.filter((video) => video.title.toLowerCase().includes(lowerQuery)
      || video.description.toLowerCase().includes(lowerQuery)
      || video.tags.some((tag) => tag.includes(lowerQuery)));
}

export function getPopularVideos(limit = 5) {
  return [...videos]
    .sort((a, b) => parseInt(b.views, 10) - parseInt(a.views, 10))
    .slice(0, limit);
}

export function getRecentVideos(limit = 5) {
  return [...videos]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
}

export default {
  videos,
  collections,
  transcripts,
  categories,
  quickActions,
  getVideoById,
  getCollectionById,
  getVideosByCategory,
  getVideosByTag,
  searchVideos,
  getPopularVideos,
  getRecentVideos,
};
