// Vortex - AI Video Command Center
// Professional enterprise-grade video management tool

// Import MPC service for real video data
import {
  getCompleteVideoData,
  getVideoCaptions,
  getVideoTranscript,
  getVideoMetadata,
  extractVideoId,
  formatTime,
  getVideoEmbedUrl,
  getVideoThumbnail,
  LANGUAGE_CODES,
} from './mpc-service.js';

import { MPC_VIDEO_EXAMPLES, testMPCConnection } from './mpc-video-examples.js';

// Configuration: Toggle between mock and real MPC data
const USE_REAL_MPC_DATA = true; // Set to false to use mock data

// Helper function to create DOM elements
function createTag(tag, attributes = {}, content = '') {
  const element = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else {
      element.setAttribute(key, value);
    }
  });
  if (content) {
    element.innerHTML = content;
  }
  return element;
}

// Real MPC video IDs - these will fetch actual data from Adobe's platform
// You can add more video IDs here to load more videos
const MPC_VIDEO_IDS = [
  '28729',    // Video with chapters
  '16413',    // Basic video
  '332595',   // Adobe Summit 2021
  '3419267',  // Video with audio description
  '25819',    // Product demo
  // Add more video IDs below:
  '331465',   // Customer story
  '332460',   // Product tutorial
  '334820',   // Feature showcase
  '335568',   // How-to guide
  '340950',   // Demo video
  '341193',   // Training content
  '341477',   // Marketing video
  '342039',   // Product overview
  '343311',   // Technical demo
  '343479',   // Use case example
];

// Mock video data (fallback)
const MOCK_VIDEOS = [
  {
    id: '28729',
    mpcId: '28729',
    title: 'Adobe Creative Cloud Overview',
    duration: '7:31',
    views: '125K',
    date: '2 days ago',
    category: 'Creative Cloud',
    thumbnail: 'https://video.tv.adobe.com/v/28729?width=320&format=jpeg',
    hasChapters: true,
    hasCaptions: true,
  },
  {
    id: '16413',
    mpcId: '16413',
    title: 'Adobe Video Tutorial',
    duration: '12:00',
    views: '89K',
    date: '5 days ago',
    category: 'Tutorial',
    thumbnail: 'https://video.tv.adobe.com/v/16413?width=320&format=jpeg',
    hasChapters: false,
    hasCaptions: true,
  },
  {
    id: '332595',
    mpcId: '332595',
    title: 'Adobe Summit 2021 Sneaks',
    duration: '45:30',
    views: '256K',
    date: '1 week ago',
    category: 'Event',
    thumbnail: 'https://video.tv.adobe.com/v/332595?width=320&format=jpeg',
    hasChapters: true,
    hasCaptions: true,
    languages: ['eng', 'fre_fr', 'ger', 'jpn', 'kor'],
  },
  {
    id: '3419267',
    mpcId: '3419267',
    title: 'Adobe Video with Audio Description',
    duration: '15:40',
    views: '178K',
    date: '4 days ago',
    category: 'Tutorial',
    thumbnail: 'https://video.tv.adobe.com/v/3419267?width=320&format=jpeg',
    hasChapters: true,
    hasCaptions: true,
    hasAudioDescription: true,
  },
  {
    id: '25819',
    mpcId: '25819',
    title: 'Adobe Product Demo',
    duration: '10:25',
    views: '312K',
    date: '1 week ago',
    category: 'Demo',
    thumbnail: 'https://video.tv.adobe.com/v/25819?width=320&format=jpeg',
    hasChapters: false,
    hasCaptions: true,
  },
];

const MOCK_COLLECTIONS = [
  { id: 'c1', name: 'Creative Cloud Essentials', count: 12 },
  { id: 'c2', name: 'AI-Powered Features', count: 8 },
  { id: 'c3', name: 'Quick Tips & Tricks', count: 24 },
  { id: 'c4', name: 'Product Launches', count: 6 },
];

const QUICK_ACTIONS = [
  'Recommend Video Collection',
  'Create Smart Clips',
  'Generate Captions',
  'Auto-Generate Chapters',
  'Transcribe Audio',
  'Create Summary',
];

class VortexApp {
  constructor() {
    this.currentTab = 'videos';
    this.recentActions = [];
    this.isProcessing = false;
    this.videos = MOCK_VIDEOS; // Start with mock data
    this.allVideos = []; // Store all loaded videos for filtering
    this.realVideosLoaded = false;
    this.videosPerPage = 6;
    this.currentVideoPage = 1;
    this.totalVideosAvailable = MPC_VIDEO_IDS.length;
    this.currentFilter = 'all';
    this.currentLanguage = 'eng';
    this.init();
  }

  async init() {
    const container = document.querySelector('.vortex-app');
    if (!container) return;
    container.innerHTML = this.renderApp();
    this.attachEventListeners();
    this.addRecentAction('Application initialized');
    
    // Load real MPC data if enabled
    if (USE_REAL_MPC_DATA) {
      this.addRecentAction('Loading real video data from MPC...');
      await this.loadMPCVideos();
    }
  }

  async loadMPCVideos(append = false) {
    try {
      const startIndex = append ? this.videos.filter(v => v.mpcId).length : 0;
      const endIndex = startIndex + this.videosPerPage;
      const videoIdsToLoad = MPC_VIDEO_IDS.slice(startIndex, endIndex);
      
      console.log(`Loading MPC videos ${startIndex + 1}-${endIndex}...`, videoIdsToLoad);
      
      if (videoIdsToLoad.length === 0) {
        this.addRecentAction('✅ All available videos loaded');
        return;
      }
      
      const videoPromises = videoIdsToLoad.map(async (videoId) => {
        try {
          console.log(`Fetching video ${videoId}...`);
          const videoData = await getCompleteVideoData(videoId);
          
          console.log(`Video data received for ${videoId}:`, {
            title: videoData.title,
            thumbnail: videoData.thumbnailUrl,
            duration: videoData.durationFormatted,
            hasChapters: videoData.chapters?.length > 0,
            hasCaptions: videoData.captions !== null,
          });
          
          // Determine category based on title/description
          let category = 'Adobe';
          const titleLower = videoData.title.toLowerCase();
          const descLower = (videoData.description || '').toLowerCase();
          
          if (titleLower.includes('photoshop') || descLower.includes('photoshop')) {
            category = 'Photoshop';
          } else if (titleLower.includes('illustrator') || descLower.includes('illustrator')) {
            category = 'Illustrator';
          } else if (titleLower.includes('after effects') || descLower.includes('after effects')) {
            category = 'After Effects';
          } else if (titleLower.includes('premiere') || descLower.includes('premiere')) {
            category = 'Premiere Pro';
          } else if (titleLower.includes('xd') || descLower.includes('xd')) {
            category = 'XD';
          } else if (titleLower.includes('creative cloud') || descLower.includes('creative cloud')) {
            category = 'Creative Cloud';
          } else if (titleLower.includes('acrobat') || descLower.includes('acrobat')) {
            category = 'Acrobat';
          } else if (titleLower.includes('lightroom') || descLower.includes('lightroom')) {
            category = 'Lightroom';
          }
          
          const video = {
            id: videoId,
            mpcId: videoId,
            title: videoData.title,
            description: videoData.description,
            duration: videoData.durationFormatted,
            durationSeconds: videoData.duration,
            thumbnail: videoData.thumbnailUrl,
            embedUrl: videoData.embedUrl,
            uploadDate: videoData.uploadDate,
            category,
            views: 'N/A',
            date: videoData.uploadDate ? new Date(videoData.uploadDate).toLocaleDateString() : 'Recent',
            hasChapters: videoData.chapters && videoData.chapters.length > 0,
            chapters: videoData.chapters,
            hasCaptions: videoData.captions !== null,
            captions: videoData.captions,
            bucketId: videoData.bucketId,
          };
          
          console.log(`✓ Loaded video ${videoId}:`, video.title, 'thumbnail:', video.thumbnail);
          return video;
        } catch (error) {
          console.error(`✗ Failed to load video ${videoId}:`, error);
          return null;
        }
      });

      const loadedVideos = (await Promise.all(videoPromises)).filter(v => v !== null);
      
      const totalLoaded = append ? this.videos.length + loadedVideos.length : loadedVideos.length;
      console.log(`Loaded ${loadedVideos.length} videos (${totalLoaded} total of ${MPC_VIDEO_IDS.length} available)`);
      
      if (loadedVideos.length > 0) {
        if (append) {
          this.allVideos = [...this.allVideos, ...loadedVideos];
        } else {
          this.allVideos = loadedVideos;
        }
        this.realVideosLoaded = true;
        this.currentVideoPage = Math.ceil(totalLoaded / this.videosPerPage);
        this.addRecentAction(`✅ Loaded ${loadedVideos.length} more videos (${totalLoaded}/${MPC_VIDEO_IDS.length})`);
        
        // Apply current filter and refresh
        this.applyFilter();
      } else {
        if (!append) {
          this.addRecentAction('⚠️ Failed to load MPC videos, using mock data');
          console.warn('No videos loaded, keeping mock data');
        }
      }
    } catch (error) {
      console.error('Error loading MPC videos:', error);
      if (!append) {
        this.addRecentAction('❌ Error loading MPC videos, using mock data');
      }
    }
  }

  applyFilter(searchQuery = '') {
    let filtered = [...this.allVideos];
    
    // Apply category filter
    if (this.currentFilter !== 'all') {
      filtered = filtered.filter(v => v.category === this.currentFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(v => 
        v.title.toLowerCase().includes(query) ||
        (v.description && v.description.toLowerCase().includes(query)) ||
        (v.category && v.category.toLowerCase().includes(query))
      );
    }
    
    this.videos = filtered;
    this.updateView();
    
    console.log(`Filtered: ${filtered.length} of ${this.allVideos.length} videos`);
    if (searchQuery || this.currentFilter !== 'all') {
      this.addRecentAction(`🔍 Filtered: ${filtered.length} videos found`);
    }
  }

  refreshVideoGrid() {
    const videoGrid = document.querySelector('.vortex-video-grid');
    if (videoGrid) {
      videoGrid.innerHTML = this.renderVideoGrid();
      // Re-attach event listeners for video cards
      this.attachVideoCardListeners();
    }
    
    // Update results summary
    const summary = document.querySelector('.vortex-results-summary');
    if (summary) {
      summary.innerHTML = `
        Showing <strong>${this.videos.length}</strong> video${this.videos.length !== 1 ? 's' : ''}
        ${this.currentFilter !== 'all' ? ` in <strong>${this.currentFilter}</strong>` : ''}
      `;
    }
    
    // Update stats
    const statsOverview = document.querySelector('.vortex-stats-overview');
    if (statsOverview) {
      statsOverview.innerHTML = this.renderStats().match(/<div class="vortex-stats-overview">([\s\S]*)<\/div>/)[1];
    }
  }

  attachVideoCardListeners() {
    // Video card clicks
    document.querySelectorAll('.vortex-video-card').forEach((card) => {
      card.addEventListener('click', (e) => {
        // Don't trigger if clicking a button
        if (e.target.classList.contains('vortex-video-action')) return;
        
        const videoId = card.dataset.videoId;
        const video = this.videos.find(v => v.id === videoId);
        if (video) {
          this.showVideoDetails(video);
        }
      });
    });

    // Video action buttons
    document.querySelectorAll('.vortex-video-action').forEach((button) => {
      button.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent card click
        
        const action = button.dataset.action;
        const card = button.closest('.vortex-video-card');
        const videoId = card?.dataset.videoId;
        const video = this.videos.find(v => v.id === videoId);
        
        if (video) {
          this.handleVideoAction(action, video);
        }
      });
    });
  }

  renderVideoGrid() {
    if (!this.videos || this.videos.length === 0) {
      return '<div class="vortex-empty-state"><p>No videos available</p></div>';
    }
    return this.videos.map((video) => this.renderVideoCard(video)).join('');
  }

  renderApp() {
    return `
      <div class="vortex-container">
        ${this.renderStats()}
        <div class="vortex-layout">
          ${this.renderSidebar()}
          ${this.renderMainContent()}
        </div>
      </div>
    `;
  }

  renderStats() {
    const totalVideos = this.allVideos.length || this.videos.length;
    const totalLoaded = this.allVideos.length;
    const totalAvailable = this.totalVideosAvailable;
    const withChapters = this.allVideos.filter(v => v.hasChapters).length;
    const withCaptions = this.allVideos.filter(v => v.hasCaptions).length;
    const categories = new Set(this.allVideos.map(v => v.category).filter(Boolean)).size;
    const filtered = this.videos.length;
    
    return `
      <div class="vortex-stats-overview">
        <div class="vortex-stat-card">
          <div class="vortex-stat-number">${totalLoaded}/${totalAvailable}</div>
          <div class="vortex-stat-label">Videos Loaded</div>
        </div>
        <div class="vortex-stat-card">
          <div class="vortex-stat-number">${filtered}</div>
          <div class="vortex-stat-label">Currently Showing</div>
        </div>
        <div class="vortex-stat-card">
          <div class="vortex-stat-number">${withChapters}</div>
          <div class="vortex-stat-label">With Chapters</div>
        </div>
        <div class="vortex-stat-card">
          <div class="vortex-stat-number">${withCaptions}</div>
          <div class="vortex-stat-label">With Captions</div>
        </div>
      </div>
    `;
  }

  renderSidebar() {
    return `
      <div class="vortex-sidebar">
        ${this.renderCommandPanel()}
        ${this.renderActionsPanel()}
        ${this.renderRecentPanel()}
      </div>
    `;
  }

  renderCommandPanel() {
    return `
      <div class="vortex-panel">
        <div class="vortex-panel-header">
          <h3 class="vortex-panel-title">
            <span class="vortex-ai-badge">✨ AI</span>
            Command Center
          </h3>
          <span class="vortex-ai-status">Powered by AWS Bedrock</span>
        </div>
        <div class="vortex-panel-body">
          <textarea 
            class="vortex-command-input" 
            id="vortex-command"
            placeholder="Ask AI anything...

🎯 Smart Recommendations:
• 'Recommend videos for beginners'
• 'Find tutorials about AI in Photoshop'

📚 AI Collections:
• 'Create collection of advanced content'
• 'Group videos by skill level'

✂️ Content Generation:
• 'Generate 30-sec clips from chapters'
• 'Create highlight reel from video #1234'

📝 AI Analysis:
• 'Summarize this video'
• 'Extract key topics from transcripts'"></textarea>
          <div class="vortex-button-row">
            <button class="vortex-btn vortex-btn-primary" id="execute-btn">
              <span style="margin-right: 6px;">✨</span>Execute AI Command
            </button>
            <button class="vortex-btn vortex-btn-secondary" id="clear-btn">
              Clear
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderActionsPanel() {
    return `
      <div class="vortex-panel">
        <div class="vortex-panel-header">
          <h3 class="vortex-panel-title">Quick Actions</h3>
        </div>
        <ul class="vortex-action-list">
          ${QUICK_ACTIONS.map((action, idx) => `
            <li class="vortex-action-item" data-action="${idx}">${action}</li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  renderRecentPanel() {
    return `
      <div class="vortex-panel">
        <div class="vortex-panel-header">
          <h3 class="vortex-panel-title">Recent Actions</h3>
        </div>
        <div class="vortex-panel-body">
          <div class="vortex-recent-list" id="recent-list">
            ${this.recentActions.length === 0 ? `
              <div class="vortex-empty-state">
                <div class="vortex-empty-state-text">No recent actions</div>
              </div>
            ` : this.recentActions.map((action) => `
              <div class="vortex-recent-item">
                ${action.text}
                <div class="vortex-recent-time">${action.time}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  renderMainContent() {
    return `
      <div class="vortex-main-content">
        ${this.renderTabs()}
        <div class="vortex-tab-content">
          ${this.renderTabContent()}
        </div>
      </div>
    `;
  }

  renderTabs() {
    const tabs = [
      { id: 'videos', label: '🎬 Video Library' },
      { id: 'collections', label: '✨ AI Collections' },
      { id: 'processing', label: '⚡ AI Processing' },
      { id: 'search', label: '🔍 AI-Powered Search' },
    ];

    return `
      <div class="vortex-tabs">
        ${tabs.map((tab) => `
          <button 
            class="vortex-tab ${this.currentTab === tab.id ? 'active' : ''}"
            data-tab="${tab.id}">
            ${tab.label}
          </button>
        `).join('')}
      </div>
    `;
  }

  renderTabContent() {
    const content = {
      videos: this.renderVideosTab(),
      collections: this.renderCollectionsTab(),
      processing: this.renderProcessingTab(),
      search: this.renderSearchTab(),
    };
    return content[this.currentTab];
  }

  renderVideosTab() {
    const hasMoreVideos = this.allVideos.length < this.totalVideosAvailable;
    
    // Get unique categories from loaded videos
    const categories = ['all', ...new Set(this.allVideos.map(v => v.category).filter(Boolean))];
    
    return `
      <div class="vortex-search-area">
        <div class="vortex-search-bar">
          <input 
            type="text" 
            class="vortex-search-input" 
            placeholder="Search videos by title, description, or tags..."
            id="video-search">
          <button class="vortex-search-button" id="search-btn">🔍 Search</button>
        </div>
        <div class="vortex-filter-controls">
          <div class="vortex-filter-section">
            <label class="vortex-filter-label">Category:</label>
            <div class="vortex-filter-bar">
              ${categories.map(cat => `
                <button class="vortex-filter-chip ${this.currentFilter === cat ? 'active' : ''}" data-filter="${cat}">
                  ${cat === 'all' ? '🎬 All Videos' : cat}
                </button>
              `).join('')}
            </div>
          </div>
          <div class="vortex-filter-section">
            <label class="vortex-filter-label">Language:</label>
            <select class="vortex-language-select" id="language-select">
              <option value="eng" ${this.currentLanguage === 'eng' ? 'selected' : ''}>🇺🇸 English</option>
              <option value="fre_fr" ${this.currentLanguage === 'fre_fr' ? 'selected' : ''}>🇫🇷 French</option>
              <option value="ger" ${this.currentLanguage === 'ger' ? 'selected' : ''}>🇩🇪 German</option>
              <option value="spa" ${this.currentLanguage === 'spa' ? 'selected' : ''}>🇪🇸 Spanish</option>
              <option value="jpn" ${this.currentLanguage === 'jpn' ? 'selected' : ''}>🇯🇵 Japanese</option>
              <option value="kor" ${this.currentLanguage === 'kor' ? 'selected' : ''}>🇰🇷 Korean</option>
              <option value="ita" ${this.currentLanguage === 'ita' ? 'selected' : ''}>🇮🇹 Italian</option>
              <option value="por_br" ${this.currentLanguage === 'por_br' ? 'selected' : ''}>🇧🇷 Portuguese</option>
              <option value="chi_cn" ${this.currentLanguage === 'chi_cn' ? 'selected' : ''}>🇨🇳 Chinese (Simplified)</option>
              <option value="dut" ${this.currentLanguage === 'dut' ? 'selected' : ''}>🇳🇱 Dutch</option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="vortex-results-summary">
        Showing <strong>${this.videos.length}</strong> video${this.videos.length !== 1 ? 's' : ''}
        ${this.currentFilter !== 'all' ? ` in <strong>${this.currentFilter}</strong>` : ''}
      </div>
      
      <div class="vortex-video-grid">
        ${this.renderVideoGrid()}
      </div>
      ${hasMoreVideos ? `
        <div class="vortex-load-more-container">
          <button class="vortex-load-more-btn" id="load-more-videos">
            <span class="vortex-load-more-text">Load More Videos</span>
            <span class="vortex-load-more-count">${this.allVideos.length} of ${this.totalVideosAvailable} loaded</span>
          </button>
        </div>
      ` : `
        <div class="vortex-all-loaded-message">
          ✅ All ${this.totalVideosAvailable} videos loaded
        </div>
      `}
    `;
  }

  renderVideoCard(video) {
    console.log(`Rendering card for ${video.id}:`, video.thumbnail);
    
    const badges = [];
    if (video.hasChapters) badges.push('<span class="vortex-badge">Chapters</span>');
    if (video.hasCaptions) badges.push('<span class="vortex-badge">CC</span>');
    if (video.hasAudioDescription) badges.push('<span class="vortex-badge">AD</span>');
    
    // Use img tag instead of background-image for better error handling
    const thumbnailHTML = video.thumbnail 
      ? `<img src="${video.thumbnail}" alt="${video.title}" class="vortex-video-thumb-img" onerror="this.style.display='none'; this.parentElement.classList.add('vortex-video-thumb-fallback');">` 
      : '';
    
    return `
      <div class="vortex-video-card" data-video-id="${video.id}">
        <div class="vortex-video-thumb ${!video.thumbnail ? 'vortex-video-thumb-fallback' : ''}" title="${video.thumbnail || 'No thumbnail'}">
          ${thumbnailHTML}
          <div class="vortex-video-category">${video.category || 'Video'}</div>
          <div class="vortex-video-duration">${video.duration}</div>
          ${badges.length > 0 ? `<div class="vortex-video-badges">${badges.join('')}</div>` : ''}
        </div>
        <div class="vortex-video-info">
          <h4 class="vortex-video-title">${video.title}</h4>
          ${video.description ? `<p class="vortex-video-description">${video.description.substring(0, 100)}...</p>` : ''}
          <div class="vortex-video-meta">
            ${video.views !== 'N/A' ? `<span>👁️ ${video.views} views</span>` : ''}
            <span>📅 ${video.date}</span>
            ${video.mpcId ? `<span>🎬 ID: ${video.mpcId}</span>` : ''}
          </div>
          <div class="vortex-video-actions">
            <button class="vortex-video-action" data-action="view">View</button>
            ${video.hasChapters ? '<button class="vortex-video-action" data-action="chapters">Chapters</button>' : ''}
            ${video.hasCaptions ? '<button class="vortex-video-action" data-action="captions">Captions</button>' : ''}
            <button class="vortex-video-action" data-action="transcript">Transcript</button>
          </div>
        </div>
      </div>
    `;
  }

  renderCollectionsTab() {
    return `
      <div class="vortex-section-header">
        <h2 class="vortex-section-title">
          <span class="vortex-ai-badge-inline">✨ AI</span>
          Generated Collections
        </h2>
        <button class="vortex-btn vortex-btn-primary">
          <span style="margin-right: 6px;">✨</span>
          Create AI Collection
        </button>
      </div>
      <div style="background: #f0f9ff; border: 2px solid #bfdbfe; padding: 16px; border-radius: 12px; margin-bottom: 24px;">
        <p style="color: #1e40af; font-weight: 600; margin: 0 0 8px 0;">💡 AI-Powered Collections</p>
        <p style="color: #1e3a8a; font-size: 13px; margin: 0;">
          Let AI automatically group and organize your videos by topic, skill level, product, or custom criteria. Collections update intelligently as new content is added.
        </p>
      </div>
      <div class="vortex-collections-grid">
        ${MOCK_COLLECTIONS.map((collection) => `
          <div class="vortex-collection-card" data-collection-id="${collection.id}">
            <div class="vortex-collection-header">
              <span class="vortex-ai-badge-small">AI</span>
              <div class="vortex-collection-icon">${collection.name.substring(0, 2)}</div>
              <div class="vortex-collection-info">
                <h4 class="vortex-collection-name">${collection.name}</h4>
                <div class="vortex-collection-count">${collection.count} videos</div>
              </div>
            </div>
            <div class="vortex-collection-actions">
              <button class="vortex-collection-action">View</button>
              <button class="vortex-collection-action">Edit</button>
              <button class="vortex-collection-action">AI Enhance</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderProcessingTab() {
    if (!this.isProcessing) {
      return `
        <div class="vortex-empty-state" style="padding: 80px 32px;">
          <div style="font-size: 48px; opacity: 0.2; margin-bottom: 16px;">⚡</div>
          <div style="font-size: 18px; font-weight: 400; color: #505050; margin-bottom: 8px;">
            No Active Processing Tasks
          </div>
          <div class="vortex-empty-state-text">
            Use the AI Command Center to start processing videos with AI
          </div>
        </div>
      `;
    }

    return `
      <div class="vortex-processing">
        <div class="vortex-processing-header">
          <div class="vortex-processing-title">
            <div class="vortex-spinner"></div>
            <span>AI Processing in Progress</span>
          </div>
          <button class="vortex-btn vortex-btn-secondary" style="background: rgba(255,255,255,0.3); color: #000;">
            Cancel
          </button>
        </div>
        <div class="vortex-processing-steps">
          <div class="vortex-processing-step">
            <div class="vortex-step-icon complete">✓</div>
            <div class="vortex-step-info">
              <div class="vortex-step-title">Video Analysis</div>
              <div class="vortex-step-desc">Analyzing video content and metadata</div>
            </div>
          </div>
          <div class="vortex-processing-step">
            <div class="vortex-step-icon complete">✓</div>
            <div class="vortex-step-info">
              <div class="vortex-step-title">Audio Transcription</div>
              <div class="vortex-step-desc">Converting speech to text using AI</div>
            </div>
          </div>
          <div class="vortex-processing-step">
            <div class="vortex-step-icon">
              <div class="vortex-spinner" style="width: 16px; height: 16px; border-width: 2px;"></div>
            </div>
            <div class="vortex-step-info">
              <div class="vortex-step-title">AI Enhancement</div>
              <div class="vortex-step-desc">Generating captions and chapters</div>
            </div>
          </div>
          <div class="vortex-processing-step" style="opacity: 0.5;">
            <div class="vortex-step-icon">⏳</div>
            <div class="vortex-step-info">
              <div class="vortex-step-title">Smart Recommendations</div>
              <div class="vortex-step-desc">Building related video suggestions</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderSearchTab() {
    return `
      <h2 class="vortex-section-title" style="margin-bottom: 16px;">
        <span class="vortex-ai-badge-inline">✨ AI</span>
        Semantic Video Search
      </h2>
      <div style="background: #f0f9ff; border: 2px solid #bfdbfe; padding: 16px; border-radius: 12px; margin-bottom: 24px;">
        <p style="color: #1e40af; font-weight: 600; margin: 0 0 8px 0;">🔍 AI-Powered Transcript Search</p>
        <p style="color: #1e3a8a; font-size: 13px; margin: 0;">
          Search across all video transcripts using natural language. AI understands context and finds relevant moments even if exact words don't match.
        </p>
      </div>
      <div class="vortex-search-bar">
        <input 
          type="text" 
          class="vortex-search-input" 
          placeholder="Ask AI to search... (e.g., 'AI features in Photoshop', 'how to remove backgrounds')"
          id="transcript-search">
        <button class="vortex-search-button">
          <span style="margin-right: 6px;">✨</span>AI Search
        </button>
      </div>
      <div class="vortex-filter-bar" style="margin-top: 16px;">
        <button class="vortex-filter-chip active">Semantic (AI)</button>
        <button class="vortex-filter-chip">Exact Match</button>
        <button class="vortex-filter-chip">With Timestamps</button>
        <button class="vortex-filter-chip">Multi-Language</button>
      </div>
      <div class="vortex-empty-state" style="margin-top: 40px;">
        <div style="font-size: 48px; opacity: 0.2; margin-bottom: 16px;">🔍</div>
        <div style="font-size: 18px; font-weight: 400; color: #505050; margin-bottom: 8px;">
          Search Video Transcriptions
        </div>
        <div class="vortex-empty-state-text">
          Find exact moments in videos by searching through AI-generated transcriptions
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Tab switching
    document.querySelectorAll('.vortex-tab').forEach((tab) => {
      tab.addEventListener('click', (e) => {
        this.currentTab = e.target.dataset.tab;
        this.updateView();
      });
    });

    // Execute AI command
    const executeBtn = document.getElementById('execute-btn');
    if (executeBtn) {
      executeBtn.addEventListener('click', () => this.executeCommand());
    }

    // Clear command
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        document.getElementById('vortex-command').value = '';
      });
    }

    // Quick actions
    document.querySelectorAll('.vortex-action-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        const actionText = e.currentTarget.textContent;
        const textarea = document.getElementById('vortex-command');
        if (textarea) {
          textarea.value = `Execute: ${actionText}`;
          textarea.focus();
        }
        this.showNotification(`Quick action loaded: ${actionText}`, 'info');
      });
    });

    // Filter chips
    document.querySelectorAll('.vortex-filter-chip').forEach((chip) => {
      chip.addEventListener('click', (e) => {
        const parent = e.target.parentElement;
        parent.querySelectorAll('.vortex-filter-chip').forEach((c) => c.classList.remove('active'));
        e.target.classList.add('active');
        
        // Apply filter
        const filter = e.target.dataset.filter;
        this.currentFilter = filter;
        const searchInput = document.getElementById('video-search');
        this.applyFilter(searchInput?.value || '');
      });
    });

    // Search functionality
    const searchInput = document.getElementById('video-search');
    const searchBtn = document.getElementById('search-btn');
    
    if (searchBtn && searchInput) {
      const performSearch = () => {
        const query = searchInput.value;
        this.applyFilter(query);
      };
      
      searchBtn.addEventListener('click', performSearch);
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          performSearch();
        }
      });
      
      // Real-time search (debounced)
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.applyFilter(e.target.value);
        }, 500); // Wait 500ms after typing stops
      });
    }

    // Language selector
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
      languageSelect.addEventListener('change', (e) => {
        this.currentLanguage = e.target.value;
        const langName = e.target.options[e.target.selectedIndex].text;
        this.addRecentAction(`🌍 Language changed to: ${langName}`);
        
        // Show info about language availability
        if (e.target.value !== 'eng') {
          this.showNotification(
            `Language set to ${langName}. Note: Not all videos have captions/transcripts in all languages. English is most widely available.`, 
            'info'
          );
        } else {
          this.showNotification(`Language set to ${langName}`, 'success');
        }
      });
    }

    // Load more videos button
    const loadMoreBtn = document.getElementById('load-more-videos');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', async () => {
        loadMoreBtn.disabled = true;
        loadMoreBtn.innerHTML = '<div class="vortex-loading-spinner"></div> Loading...';
        this.addRecentAction('Loading more videos...');
        await this.loadMPCVideos(true); // append = true
        loadMoreBtn.disabled = false;
      });
    }

    // Attach video card listeners (initial load)
    this.attachVideoCardListeners();
  }

  showVideoDetails(video) {
    console.log('Showing video details:', { 
      title: video.title, 
      thumbnail: video.thumbnail,
      embedUrl: video.embedUrl 
    });
    
    const modalContent = `
      <div class="vortex-modal-section">
        ${video.embedUrl ? `
          <div class="vortex-modal-video">
            <iframe 
              src="${video.embedUrl}?quality=12" 
              frameborder="0" 
              webkitallowfullscreen 
              mozallowfullscreen 
              allowfullscreen 
              scrolling="no"
              style="width: 100%; height: 480px; border-radius: 12px;">
            </iframe>
          </div>
        ` : video.thumbnail ? `
          <div class="vortex-modal-thumbnail">
            <img src="${video.thumbnail}" alt="${video.title}" onerror="console.error('Image failed to load:', this.src); this.style.display='none';">
          </div>
        ` : ''}
      </div>
      
      <div class="vortex-modal-section">
        <h3 class="vortex-modal-section-title">📊 Video Information</h3>
        <div class="vortex-modal-info-grid">
          <div class="vortex-modal-info-item">
            <div class="vortex-modal-info-label">Duration</div>
            <div class="vortex-modal-info-value">${video.duration}</div>
          </div>
          <div class="vortex-modal-info-item">
            <div class="vortex-modal-info-label">MPC ID</div>
            <div class="vortex-modal-info-value">${video.mpcId}</div>
          </div>
          <div class="vortex-modal-info-item">
            <div class="vortex-modal-info-label">Upload Date</div>
            <div class="vortex-modal-info-value">${video.date}</div>
          </div>
          <div class="vortex-modal-info-item">
            <div class="vortex-modal-info-label">Category</div>
            <div class="vortex-modal-info-value">${video.category}</div>
          </div>
        </div>
      </div>
      
      ${video.description ? `
        <div class="vortex-modal-section">
          <h3 class="vortex-modal-section-title">📝 Description</h3>
          <div class="vortex-modal-description">${video.description}</div>
        </div>
      ` : ''}
      
      <div class="vortex-modal-section">
        <h3 class="vortex-modal-section-title">✨ Features</h3>
        <div class="vortex-modal-info-grid">
          <div class="vortex-modal-info-item">
            <div class="vortex-modal-info-label">Chapters</div>
            <div class="vortex-modal-info-value">${video.hasChapters ? `✓ ${video.chapters.length} chapters` : '✗ None'}</div>
          </div>
          <div class="vortex-modal-info-item">
            <div class="vortex-modal-info-label">Captions</div>
            <div class="vortex-modal-info-value">${video.hasCaptions ? '✓ Available' : '✗ Not available'}</div>
          </div>
        </div>
      </div>
    `;
    
    const buttons = video.embedUrl ? [
      { label: 'Close', action: () => this.closeModal(), secondary: true },
      { label: 'Open in New Tab', action: () => { window.open(video.embedUrl, '_blank'); this.closeModal(); } },
    ] : [
      { label: 'Close', action: () => this.closeModal(), secondary: true },
    ];
    
    this.showModal('🎬 Video Details', modalContent, buttons);
    
    this.addRecentAction(`Viewed details for: ${video.title}`);
  }

  handleVideoAction(action, video) {
    console.log(`Action: ${action} on video:`, video);
    
    switch (action) {
      case 'view':
        // Open video in modal instead of new tab
        this.showVideoDetails(video);
        break;
        
      case 'chapters':
        if (video.chapters && video.chapters.length > 0) {
          this.showChapters(video);
        } else {
          this.showNotification('No chapters available for this video', 'warning');
        }
        break;
        
      case 'captions':
        // Captions and transcripts are similar - show captions/transcript data
        if (video.captions) {
          this.showCaptionsOrTranscript(video, 'captions');
        } else {
          this.showNotification('No captions available for this video', 'warning');
        }
        break;
        
      case 'transcript':
        // Fetch full transcript from API
        this.fetchAndShowTranscript(video);
        break;
        
      default:
        this.showNotification(`Action "${action}" coming soon!`, 'info');
    }
  }

  showChapters(video) {
    const chaptersHTML = `
      <div class="vortex-modal-section">
        <p style="color: #6b7280; margin-bottom: 20px;">Click any chapter to jump to that timestamp in the video.</p>
        <ul class="vortex-chapter-list">
          ${video.chapters.map((chapter, index) => `
            <li class="vortex-chapter-item" data-url="${chapter.url || ''}">
              <div class="vortex-chapter-number">${index + 1}</div>
              <div class="vortex-chapter-info">
                <div class="vortex-chapter-name">${chapter.name}</div>
                <div class="vortex-chapter-time">${formatTime(chapter.startTime)} - ${formatTime(chapter.endTime)}</div>
              </div>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
    
    this.showModal(`📑 Chapters (${video.chapters.length})`, chaptersHTML, [
      { label: 'Close', action: () => this.closeModal(), secondary: true },
      { label: 'Watch Video', action: () => { window.open(video.embedUrl, '_blank'); this.closeModal(); } },
    ]);
    
    // Add click handlers for chapters
    setTimeout(() => {
      document.querySelectorAll('.vortex-chapter-item').forEach(item => {
        item.addEventListener('click', () => {
          const url = item.dataset.url || video.embedUrl;
          window.open(url, '_blank');
        });
      });
    }, 100);
    
    this.addRecentAction(`Viewed chapters for: ${video.title}`);
  }

  showCaptionsOrTranscript(video, type = 'captions') {
    const data = type === 'captions' ? video.captions : video.transcript;
    const icon = type === 'captions' ? '💬' : '📄';
    const title = type === 'captions' ? 'Closed Captions' : 'Transcript';
    
    console.log(`${title} data:`, data);
    
    let contentHTML = '';
    let entries = [];
    
    if (!data) {
      contentHTML = `
        <div class="vortex-empty-state">
          <div class="vortex-empty-state-icon">${icon}</div>
          <p>No ${type} available for this video</p>
        </div>
      `;
    } else if (Array.isArray(data)) {
      entries = data;
    } else if (typeof data === 'object') {
      // Try common formats
      if (data.cues && Array.isArray(data.cues)) {
        entries = data.cues;
      } else if (data.captions && Array.isArray(data.captions)) {
        entries = data.captions;
      } else if (data.items && Array.isArray(data.items)) {
        entries = data.items;
      } else if (data.entries && Array.isArray(data.entries)) {
        entries = data.entries;
      } else if (data.transcript && Array.isArray(data.transcript)) {
        entries = data.transcript;
      } else {
        // Show as formatted JSON
        const keys = Object.keys(data);
        if (keys.length > 0) {
          contentHTML = `
            <div class="vortex-modal-section">
              <p style="color: #6b7280; margin-bottom: 20px;">
                <strong>Note:</strong> ${type === 'captions' ? 'Captions' : 'Transcripts'} from MPC are typically in WebVTT or similar timed text formats. 
                Below is the raw data structure:
              </p>
              <pre style="background: #f9fafb; padding: 20px; border-radius: 12px; overflow-x: auto; max-height: 500px; font-size: 13px; line-height: 1.6; white-space: pre-wrap; word-wrap: break-word;">${JSON.stringify(data, null, 2)}</pre>
            </div>
          `;
        }
      }
    }
    
    // Display parsed entries
    if (entries.length > 0 && !contentHTML) {
      const displayCount = Math.min(100, entries.length);
      const displayEntries = entries.slice(0, displayCount);
      
      contentHTML = `
        <div class="vortex-modal-section">
          <p style="color: #6b7280; margin-bottom: 20px;">
            Showing ${displayCount} of ${entries.length} ${type} entries (timed text).
          </p>
          <div style="max-height: 500px; overflow-y: auto;">
            ${displayEntries.map((entry, index) => {
              const time = entry.timestamp || entry.startTime || entry.start || entry.time || `${index}`;
              const text = entry.text || entry.content || entry.caption || entry.cue || entry.value || JSON.stringify(entry);
              
              return `
                <div class="vortex-caption-entry">
                  <div class="vortex-caption-time">${time}</div>
                  <div class="vortex-caption-text">${text}</div>
                </div>
              `;
            }).join('')}
          </div>
          ${entries.length > displayCount ? `<p style="color: #9ca3af; text-align: center; margin-top: 20px;">...and ${entries.length - displayCount} more entries</p>` : ''}
        </div>
      `;
    } else if (!contentHTML) {
      contentHTML = `
        <div class="vortex-empty-state">
          <div class="vortex-empty-state-icon">${icon}</div>
          <p>Data structure not recognized</p>
          <p style="color: #9ca3af; font-size: 13px; margin-top: 10px;">Check console for raw data</p>
        </div>
      `;
    }
    
    this.showModal(`${icon} ${title}`, contentHTML, [
      { label: 'Close', action: () => this.closeModal(), secondary: true },
    ]);
    
    this.addRecentAction(`Viewed ${type} for: ${video.title}`);
  }

  async fetchAndShowTranscript(video) {
    // Show loading modal
    const langName = document.getElementById('language-select')?.selectedOptions[0]?.text || 'English';
    this.showModal('📄 Full Transcript', `
      <div class="vortex-empty-state">
        <div class="vortex-loading-spinner" style="margin: 0 auto 20px;"></div>
        <p>Fetching full transcript from MPC API...</p>
        <p style="color: #9ca3af; font-size: 13px; margin-top: 10px;">Language: ${langName}</p>
      </div>
    `, []);
    
    try {
      const { getVideoTranscript } = await import('./mpc-service.js');
      const transcript = await getVideoTranscript(video.mpcId, this.currentLanguage);
      
      console.log('Full transcript data:', transcript);
      
      // Check if transcript is empty or null
      if (!transcript || (typeof transcript === 'object' && Object.keys(transcript).length === 0)) {
        throw new Error(`No transcript available in ${langName}. This language may not be supported for this video.`);
      }
      
      // Parse and extract readable transcript text
      let transcriptHTML = '';
      let fullText = '';
      let entries = [];
      
      if (transcript && typeof transcript === 'object') {
        // Try to extract text entries from various formats
        if (Array.isArray(transcript)) {
          entries = transcript;
        } else if (transcript.cues && Array.isArray(transcript.cues)) {
          entries = transcript.cues;
        } else if (transcript.captions && Array.isArray(transcript.captions)) {
          entries = transcript.captions;
        } else if (transcript.items && Array.isArray(transcript.items)) {
          entries = transcript.items;
        } else if (transcript.entries && Array.isArray(transcript.entries)) {
          entries = transcript.entries;
        } else if (transcript.transcript && Array.isArray(transcript.transcript)) {
          entries = transcript.transcript;
        }
        
        // Extract text from entries
        if (entries.length > 0) {
          fullText = entries.map(entry => {
            const text = entry.text || entry.content || entry.caption || entry.cue || entry.value || '';
            return text.trim();
          }).filter(text => text.length > 0).join(' ');
        }
        
        // Check for pre-formatted text
        if (!fullText && (transcript.text || transcript.content || transcript.fullText)) {
          fullText = transcript.text || transcript.content || transcript.fullText;
        }
        
        // Display the transcript
        if (fullText) {
          const wordCount = fullText.split(/\s+/).length;
          const readTime = Math.ceil(wordCount / 200); // ~200 words per minute
          
          transcriptHTML = `
            <div class="vortex-modal-section">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 2px solid #e5e7eb;">
                <div>
                  <h3 style="color: #374151; font-weight: 700; margin: 0;">📝 Video Transcript</h3>
                  <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0;">${wordCount} words • ~${readTime} min read</p>
                </div>
                <button onclick="navigator.clipboard.writeText(\`${fullText.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`); alert('Transcript copied to clipboard!')" 
                        style="padding: 8px 16px; background: #1473E6; color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;">
                  📋 Copy
                </button>
              </div>
              <div style="background: #fff; padding: 24px; border-radius: 12px; border: 2px solid #e5e7eb; line-height: 1.8; font-size: 15px; color: #1f2937; max-height: 500px; overflow-y: auto;">
                ${fullText}
              </div>
            </div>
          `;
        } else if (entries.length > 0) {
          // Show timestamped entries if we couldn't create full text
          transcriptHTML = `
            <div class="vortex-modal-section">
              <h3 style="color: #374151; font-weight: 600; margin-bottom: 16px;">📝 Transcript (${entries.length} entries)</h3>
              <div style="max-height: 500px; overflow-y: auto;">
                ${entries.map((entry, index) => {
                  const time = entry.timestamp || entry.startTime || entry.start || entry.time || '';
                  const text = entry.text || entry.content || entry.caption || entry.cue || entry.value || '';
                  return `
                    <div style="padding: 12px; background: #f9fafb; margin-bottom: 8px; border-radius: 8px; border-left: 3px solid #1473E6;">
                      ${time ? `<div style="color: #1473E6; font-size: 12px; font-weight: 600; margin-bottom: 4px; font-family: 'Courier New', monospace;">${time}</div>` : ''}
                      <div style="color: #374151; line-height: 1.6;">${text}</div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        } else {
          // Try to extract any text content from unknown format
          let extractedText = '';
          const textKeys = ['text', 'content', 'transcript', 'body', 'data'];
          
          for (const key of textKeys) {
            if (transcript[key] && typeof transcript[key] === 'string') {
              extractedText = transcript[key];
              break;
            }
          }
          
          if (extractedText) {
            const wordCount = extractedText.split(/\s+/).length;
            const readTime = Math.ceil(wordCount / 200);
            
            transcriptHTML = `
              <div class="vortex-modal-section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 2px solid #e5e7eb;">
                  <div>
                    <h3 style="color: #374151; font-weight: 700; margin: 0;">📝 Transcript (${langName})</h3>
                    <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0;">${wordCount} words • ~${readTime} min read</p>
                  </div>
                </div>
                <div style="background: #fff; padding: 24px; border-radius: 12px; border: 2px solid #e5e7eb; line-height: 1.8; font-size: 15px; color: #1f2937; max-height: 500px; overflow-y: auto;">
                  ${extractedText}
                </div>
              </div>
            `;
          } else {
            // Check if it's likely a language availability issue
            const isLikelyLanguageIssue = this.currentLanguage !== 'eng' && 
              (!transcript || Object.keys(transcript).length < 3);
            
            transcriptHTML = `
              <div class="vortex-modal-section">
                <div style="background: ${isLikelyLanguageIssue ? '#fee2e2' : '#fef3c7'}; border-left: 4px solid ${isLikelyLanguageIssue ? '#dc2626' : '#f59e0b'}; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                  <p style="color: ${isLikelyLanguageIssue ? '#991b1b' : '#92400e'}; font-weight: 600; margin: 0 0 8px 0;">
                    ${isLikelyLanguageIssue ? '❌' : '⚠️'} ${isLikelyLanguageIssue ? 'Transcript not available in ' + langName : 'Transcript format not recognized'}
                  </p>
                  <p style="color: ${isLikelyLanguageIssue ? '#7f1d1d' : '#78350f'}; font-size: 13px; margin: 0;">
                    ${isLikelyLanguageIssue 
                      ? 'This video may not have a transcript in ' + langName + '. Most videos only have English transcripts.'
                      : 'The transcript data is in a format we can\'t parse yet. Raw data shown below.'}
                  </p>
                </div>
                ${!isLikelyLanguageIssue ? `
                  <details style="background: #f9fafb; padding: 16px; border-radius: 12px; border: 2px solid #e5e7eb;">
                    <summary style="cursor: pointer; font-weight: 600; color: #374151;">📋 View Raw Data (JSON)</summary>
                    <pre style="background: #fff; padding: 16px; border-radius: 8px; overflow-x: auto; max-height: 400px; font-size: 12px; line-height: 1.6; white-space: pre-wrap; margin: 12px 0 0 0;">${JSON.stringify(transcript, null, 2)}</pre>
                  </details>
                ` : ''}
                <div style="background: #f0f9ff; border: 1px solid #bfdbfe; padding: 12px; border-radius: 8px; margin-top: 16px;">
                  <p style="color: #1e40af; font-size: 13px; font-weight: 600; margin: 0 0 8px 0;">💡 Recommended Actions:</p>
                  <ul style="color: #1e3a8a; font-size: 12px; margin: 0; padding-left: 20px;">
                    <li>Switch to <strong>English</strong> (most reliable)</li>
                    <li>Try the <strong>"Captions"</strong> button (pre-loaded, always works)</li>
                    <li>Check if this video has multi-language support</li>
                  </ul>
                </div>
              </div>
            `;
          }
        }
      } else if (typeof transcript === 'string') {
        const wordCount = transcript.split(/\s+/).length;
        const readTime = Math.ceil(wordCount / 200);
        
        transcriptHTML = `
          <div class="vortex-modal-section">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 2px solid #e5e7eb;">
              <div>
                <h3 style="color: #374151; font-weight: 700; margin: 0;">📝 Transcript (${langName})</h3>
                <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0;">${wordCount} words • ~${readTime} min read</p>
              </div>
            </div>
            <div style="background: #fff; padding: 24px; border-radius: 12px; border: 2px solid #e5e7eb; line-height: 1.8; font-size: 15px; color: #1f2937; max-height: 500px; overflow-y: auto;">
              ${transcript}
            </div>
          </div>
        `;
      } else {
        transcriptHTML = `
          <div class="vortex-modal-section">
            <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 16px; border-radius: 8px;">
              <p style="color: #991b1b; font-weight: 600; margin: 0;">⚠️ Unexpected format: ${typeof transcript}</p>
            </div>
            <pre style="background: #f9fafb; padding: 20px; border-radius: 12px; overflow-x: auto; max-height: 500px; font-size: 13px; line-height: 1.6; margin-top: 16px;">${JSON.stringify(transcript, null, 2)}</pre>
          </div>
        `;
      }
      
      this.showModal('📄 Full Transcript', transcriptHTML, [
        { label: 'Close', action: () => this.closeModal(), secondary: true },
      ]);
      
      this.addRecentAction(`Fetched full transcript for: ${video.title}`);
    } catch (error) {
      const isLanguageIssue = error.message.includes('404') || error.message.includes('Failed to fetch');
      const errorMsg = isLanguageIssue 
        ? `Transcript not available in ${langName}` 
        : 'Failed to fetch transcript from API';
      
      this.showModal('📄 Full Transcript', `
        <div class="vortex-empty-state">
          <div class="vortex-empty-state-icon">⚠️</div>
          <p>${errorMsg}</p>
          <p style="color: #9ca3af; font-size: 13px; margin-top: 10px;">${error.message}</p>
          ${isLanguageIssue ? `
            <p style="color: #9ca3af; font-size: 12px; margin-top: 10px;">
              💡 Tip: Try switching to English (most common) or check the "Captions" button for pre-loaded captions.
            </p>
          ` : ''}
        </div>
      `, [
        { label: 'Close', action: () => this.closeModal(), secondary: true },
        { label: 'Try English', action: () => { 
          this.currentLanguage = 'eng';
          document.getElementById('language-select').value = 'eng';
          this.closeModal();
          this.fetchAndShowTranscript(video);
        }, secondary: false },
      ]);
      console.error('Transcript error:', error);
    }
  }

  showModal(title, content, buttons = []) {
    // Remove existing modal if any
    const existing = document.querySelector('.vortex-modal-overlay');
    if (existing) existing.remove();
    
    // Create modal
    const modal = createTag('div', { class: 'vortex-modal-overlay' });
    
    const buttonHTML = buttons.map(btn => 
      `<button class="vortex-modal-button ${btn.secondary ? 'vortex-modal-button-secondary' : 'vortex-modal-button-primary'}">${btn.label}</button>`
    ).join('');
    
    modal.innerHTML = `
      <div class="vortex-modal">
        <div class="vortex-modal-header">
          <h2 class="vortex-modal-title">${title}</h2>
          <button class="vortex-modal-close">✕</button>
        </div>
        <div class="vortex-modal-body">
          ${content}
        </div>
        ${buttons.length > 0 ? `
          <div class="vortex-modal-footer">
            ${buttonHTML}
          </div>
        ` : ''}
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    const closeBtn = modal.querySelector('.vortex-modal-close');
    closeBtn.addEventListener('click', () => this.closeModal());
    
    // Click outside to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal();
      }
    });
    
    // Button actions
    const modalButtons = modal.querySelectorAll('.vortex-modal-button');
    buttons.forEach((btn, index) => {
      if (modalButtons[index]) {
        modalButtons[index].addEventListener('click', btn.action);
      }
    });
    
    // ESC key to close
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  closeModal() {
    const modal = document.querySelector('.vortex-modal-overlay');
    if (modal) {
      modal.style.opacity = '0';
      setTimeout(() => modal.remove(), 200);
    }
  }

  executeCommand() {
    const textarea = document.getElementById('vortex-command');
    const command = textarea?.value.trim();
    
    if (!command) {
      this.showNotification('Please enter an AI command', 'warning');
      return;
    }

    this.addRecentAction(`AI Command: ${command.substring(0, 50)}...`);
    this.showNotification('AI command executed successfully! Processing...', 'success');
    
    // Switch to processing tab
    this.isProcessing = true;
    this.currentTab = 'processing';
    this.updateView();

    // Simulate completion
    setTimeout(() => {
      this.isProcessing = false;
      this.showNotification('Processing complete!', 'success');
      this.updateView();
    }, 5000);
  }

  addRecentAction(text) {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    this.recentActions.unshift({ text, time });
    if (this.recentActions.length > 5) {
      this.recentActions.pop();
    }

    const list = document.getElementById('recent-list');
    if (list) {
      list.innerHTML = this.recentActions.map((action) => `
        <div class="vortex-recent-item">
          ${action.text}
          <div class="vortex-recent-time">${action.time}</div>
        </div>
      `).join('');
    }
  }

  showNotification(message, type = 'info') {
    const colors = {
      success: '#2D9D78',
      warning: '#E68619',
      danger: '#D7373F',
      info: '#0b5cad',
    };

    const toast = createTag('div', {
      style: {
        position: 'fixed',
        top: '24px',
        right: '24px',
        background: colors[type],
        color: '#fff',
        padding: '14px 20px',
        borderRadius: '2px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        zIndex: '10000',
        animation: 'slideInRight 0.3s ease',
        maxWidth: '400px',
        fontSize: '14px',
        fontWeight: '400',
      },
    }, message);

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  updateView() {
    const container = document.querySelector('.vortex-container');
    if (container) {
      container.innerHTML = `
        ${this.renderStats()}
        <div class="vortex-layout">
          ${this.renderSidebar()}
          ${this.renderMainContent()}
        </div>
      `;
      this.attachEventListeners();
    }
  }
}

// Initialize function for Milo
export default function init() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new VortexApp();
    });
  } else {
    new VortexApp();
  }
}

export { VortexApp };
