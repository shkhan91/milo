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
    this.selectedVideos = new Set(); // Track selected video IDs
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
      this.addRecentAction(`Filtered: ${filtered.length} videos found`);
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
        // Don't trigger if clicking a button or checkbox
        if (e.target.classList.contains('vortex-video-action')) return;
        if (e.target.classList.contains('vortex-video-checkbox')) return;
        if (e.target.closest('.vortex-video-checkbox-wrapper')) return;
        
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
            <span class="vortex-ai-badge">AI</span>
            Command Center
          </h3>
          <span class="vortex-ai-status">Powered by AWS Bedrock</span>
        </div>
        <div class="vortex-panel-body">
          <textarea 
            class="vortex-command-input" 
            id="vortex-command"
            placeholder="Enter your AI prompt...

Examples:
• Recommend videos for beginners
• Create a collection of advanced Photoshop tutorials
• Summarize video #12345
• Find videos about AI features"></textarea>
          <div class="vortex-button-row">
            <button class="vortex-btn vortex-btn-primary" id="execute-btn">
              Execute Prompt
            </button>
            <button class="vortex-btn vortex-btn-secondary" id="clear-btn">
              Clear
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderLLMFeaturesPanel() {
    return `
      <div class="vortex-panel vortex-llm-panel">
        <div class="vortex-panel-header">
          <h3 class="vortex-panel-title">
            <span class="vortex-ai-badge">LLM</span>
            Content Enhancement
          </h3>
        </div>
        <div class="vortex-panel-body">
          <div class="vortex-llm-feature">
            <div class="vortex-llm-feature-header">
              <strong>AI Titles & Summaries</strong>
              <span class="vortex-llm-badge-new">NEW</span>
            </div>
            <p class="vortex-llm-description">Generate LLM-optimized titles and summaries distinct from SEO content</p>
            <button class="vortex-btn vortex-btn-small" id="generate-titles-btn">Generate for Selected</button>
          </div>

          <div class="vortex-llm-feature">
            <div class="vortex-llm-feature-header">
              <strong>Smart Chapters</strong>
              <span class="vortex-llm-badge-new">NEW</span>
            </div>
            <p class="vortex-llm-description">Auto-generate chapter markers with AI-powered scene detection</p>
            <button class="vortex-btn vortex-btn-small" id="generate-chapters-btn">Generate Chapters</button>
          </div>

          <div class="vortex-llm-feature">
            <div class="vortex-llm-feature-header">
              <strong>AI Captions & Transcripts</strong>
              <span class="vortex-llm-badge-new">NEW</span>
            </div>
            <p class="vortex-llm-description">Enhance captions with context-aware improvements and multi-language support</p>
            <button class="vortex-btn vortex-btn-small" id="enhance-captions-btn">Enhance Captions</button>
          </div>

          <div class="vortex-llm-feature">
            <div class="vortex-llm-feature-header">
              <strong>In-Video CTA Popups</strong>
              <span class="vortex-llm-badge-new">NEW</span>
            </div>
            <p class="vortex-llm-description">AI-powered in-video call-to-action popups and intelligent placement</p>
            <button class="vortex-btn vortex-btn-small" id="vpops-process-btn">Generate CTAs</button>
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
      { id: 'videos', label: 'Video Library' },
      { id: 'llm', label: 'LLM Processing' },
      { id: 'collections', label: 'AI Collections' },
      { id: 'search', label: 'AI-Powered Search' },
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
      llm: this.renderLLMTab(),
      collections: this.renderCollectionsTab(),
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
          <button class="vortex-search-button" id="search-btn">Search</button>
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
    
    const isSelected = this.selectedVideos.has(video.id);
    
    return `
      <div class="vortex-video-card ${isSelected ? 'selected' : ''}" data-video-id="${video.id}">
        <div class="vortex-video-checkbox-wrapper">
          <input 
            type="checkbox" 
            class="vortex-video-checkbox" 
            data-video-id="${video.id}"
            ${isSelected ? 'checked' : ''}
          />
        </div>
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
            ${video.views !== 'N/A' ? `<span>${video.views} views</span>` : ''}
            <span>${video.date}</span>
            ${video.mpcId ? `<span>ID: ${video.mpcId}</span>` : ''}
          </div>
          <div class="vortex-video-actions">
            <button class="vortex-video-action" data-action="view">View</button>
            ${video.hasChapters ? '<button class="vortex-video-action" data-action="chapters">Chapters</button>' : '<button class="vortex-video-action vortex-ai-action" data-action="generate-chapters">Generate Chapters</button>'}
            ${video.hasCaptions ? '<button class="vortex-video-action" data-action="captions">Captions</button>' : ''}
            <button class="vortex-video-action" data-action="transcript">Transcript</button>
            <button class="vortex-video-action vortex-ai-action" data-action="ai-summary">AI Summary</button>
            <button class="vortex-video-action vortex-ai-action" data-action="llm-title">LLM Title</button>
          </div>
        </div>
      </div>
    `;
  }

  renderLLMTab() {
    const selectedCount = this.selectedVideos.size;
    const selectedList = Array.from(this.selectedVideos)
      .map(id => this.allVideos.find(v => v.id === id))
      .filter(Boolean);
    
    return `
      <div class="vortex-llm-tab">
        <!-- Header with Selection Info -->
        <div class="vortex-llm-header">
          <div>
            <h2 class="vortex-section-title">
              <span class="vortex-ai-badge-inline">LLM</span>
              Content Enhancement
            </h2>
            <p style="color: #6b7280; font-size: 14px; margin: 8px 0 0 0;">
              Select videos from the Video Library tab, then apply AI enhancements here.
            </p>
          </div>
          <div class="vortex-selection-badge">
            <div class="vortex-selection-count">${selectedCount}</div>
            <div class="vortex-selection-label">Selected</div>
          </div>
        </div>

        ${selectedCount === 0 ? `
          <!-- Empty State: No Selection -->
          <div class="vortex-llm-empty-state">
            <div class="vortex-llm-empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="2">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
              </svg>
            </div>
            <h3 style="color: #374151; font-size: 18px; margin: 16px 0 8px 0;">No Videos Selected</h3>
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px 0;">
              Go to the <strong>Video Library</strong> tab and select videos using the checkboxes.
            </p>
            <button class="vortex-btn vortex-btn-primary" id="go-to-video-library">
              Go to Video Library
            </button>
          </div>
        ` : `
          <!-- Selection Summary -->
          <div class="vortex-selection-summary">
            <div class="vortex-summary-grid">
              <div class="vortex-summary-item">
                <div class="vortex-summary-number">${selectedCount}</div>
                <div class="vortex-summary-label">Videos Selected</div>
              </div>
              <div class="vortex-summary-item">
                <div class="vortex-summary-number">${selectedList.filter(v => !v.hasChapters).length}</div>
                <div class="vortex-summary-label">Need Chapters</div>
              </div>
              <div class="vortex-summary-item">
                <div class="vortex-summary-number">${selectedList.filter(v => v.hasCaptions).length}</div>
                <div class="vortex-summary-label">Have Captions</div>
              </div>
              <div class="vortex-summary-item">
                <button class="vortex-btn-link" id="clear-selection">Clear Selection</button>
              </div>
            </div>
          </div>

          <!-- Enhancement Actions -->
          <div class="vortex-llm-actions-grid">
            <div class="vortex-llm-action-card">
              <div class="vortex-llm-action-icon" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </div>
              <h3 class="vortex-llm-action-title">LLM Titles & Summaries</h3>
              <p class="vortex-llm-action-desc">Generate engagement-optimized metadata separate from SEO content</p>
              <button class="vortex-btn vortex-btn-primary vortex-btn-block" id="batch-generate-titles">
                Generate for ${selectedCount} Video${selectedCount !== 1 ? 's' : ''}
              </button>
            </div>

            <div class="vortex-llm-action-card">
              <div class="vortex-llm-action-icon" style="background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                  <line x1="7" y1="2" x2="7" y2="22"></line>
                  <line x1="17" y1="2" x2="17" y2="22"></line>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                </svg>
              </div>
              <h3 class="vortex-llm-action-title">AI Chapters</h3>
              <p class="vortex-llm-action-desc">Auto-generate chapters with meaningful titles from transcripts</p>
              <button class="vortex-btn vortex-btn-primary vortex-btn-block" id="batch-generate-chapters">
                Generate Chapters
              </button>
            </div>

            <div class="vortex-llm-action-card">
              <div class="vortex-llm-action-icon" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h3 class="vortex-llm-action-title">Caption Enhancement</h3>
              <p class="vortex-llm-action-desc">Fix errors, add formatting, and improve accessibility</p>
              <button class="vortex-btn vortex-btn-primary vortex-btn-block" id="enhance-all-captions">
                Enhance Captions
              </button>
            </div>

            <div class="vortex-llm-action-card">
              <div class="vortex-llm-action-icon" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </div>
              <h3 class="vortex-llm-action-title">In-Video CTA Popups</h3>
              <p class="vortex-llm-action-desc">AI-powered call-to-action placement and timing optimization</p>
              <button class="vortex-btn vortex-btn-primary vortex-btn-block" id="vpops-process">
                Generate CTAs
              </button>
            </div>
          </div>

          <!-- Selected Videos List -->
          <div class="vortex-selected-videos">
            <h3 style="font-size: 16px; color: #1f2937; margin: 0 0 16px 0;">Selected Videos</h3>
            <div class="vortex-selected-videos-grid">
              ${selectedList.map(video => `
                <div class="vortex-selected-video-item">
                  <div class="vortex-selected-video-thumb" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    ${video.thumbnail ? `<img src="${video.thumbnail}" alt="${video.title}">` : ''}
                  </div>
                  <div class="vortex-selected-video-info">
                    <div class="vortex-selected-video-title">${video.title}</div>
                    <div class="vortex-selected-video-meta">
                      ${video.duration} • ${video.category}
                      ${!video.hasChapters ? '<span class="vortex-needs-badge">Needs Chapters</span>' : ''}
                    </div>
                  </div>
                  <button class="vortex-selected-video-remove" data-video-id="${video.id}" title="Remove from selection">×</button>
                </div>
              `).join('')}
            </div>
          </div>
        `}
      </div>
    `;
  }

  renderCollectionsTab() {
    return `
      <div class="vortex-section-header">
        <h2 class="vortex-section-title">
          <span class="vortex-ai-badge-inline">AI</span>
          Generated Collections
        </h2>
        <button class="vortex-btn vortex-btn-primary">
          Create AI Collection
        </button>
      </div>
      <div style="background: #f0f9ff; border: 2px solid #bfdbfe; padding: 16px; border-radius: 12px; margin-bottom: 24px;">
        <p style="color: #1e40af; font-weight: 600; margin: 0 0 8px 0;">AI-Powered Collections</p>
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
        <span class="vortex-ai-badge-inline">AI</span>
        Semantic Video Search
      </h2>
      <div style="background: #f0f9ff; border: 2px solid #bfdbfe; padding: 16px; border-radius: 12px; margin-bottom: 24px;">
        <p style="color: #1e40af; font-weight: 600; margin: 0 0 8px 0;">AI-Powered Transcript Search</p>
        <p style="color: #1e3a8a; font-size: 13px; margin: 0;">
          Search across all video transcripts using natural language. AI understands context and finds relevant moments even if exact words don't match.
        </p>
      </div>
      <div class="vortex-search-bar">
        <input 
          type="text" 
          class="vortex-search-input" 
          placeholder="Search transcripts with natural language (e.g., 'AI features in Photoshop', 'how to remove backgrounds')"
          id="transcript-search">
        <button class="vortex-search-button">
          AI Search
        </button>
      </div>
      <div class="vortex-filter-bar" style="margin-top: 16px;">
        <button class="vortex-filter-chip active">Semantic (AI)</button>
        <button class="vortex-filter-chip">Exact Match</button>
        <button class="vortex-filter-chip">With Timestamps</button>
        <button class="vortex-filter-chip">Multi-Language</button>
      </div>
      <div class="vortex-empty-state" style="margin-top: 40px;">
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

    // Video selection checkboxes
    document.querySelectorAll('.vortex-video-checkbox').forEach((checkbox) => {
      checkbox.addEventListener('change', (e) => {
        e.stopPropagation(); // Prevent triggering card click
        const videoId = e.target.dataset.videoId;
        const card = e.target.closest('.vortex-video-card');
        
        if (e.target.checked) {
          this.selectedVideos.add(videoId);
          card.classList.add('selected');
        } else {
          this.selectedVideos.delete(videoId);
          card.classList.remove('selected');
        }
        
        // Update LLM tab if it's active
        if (this.currentTab === 'llm') {
          this.updateView();
        }
      });
      
      // Also prevent click events on the checkbox wrapper from bubbling
      checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    });

    // Clear selection button
    const clearSelectionBtn = document.getElementById('clear-selection');
    if (clearSelectionBtn) {
      clearSelectionBtn.addEventListener('click', () => {
        this.selectedVideos.clear();
        document.querySelectorAll('.vortex-video-checkbox').forEach((cb) => cb.checked = false);
        document.querySelectorAll('.vortex-video-card').forEach((card) => card.classList.remove('selected'));
        this.updateView();
        this.showNotification('Selection cleared', 'success');
      });
    }

    // Remove from selection buttons
    document.querySelectorAll('.vortex-selected-video-remove').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const videoId = e.target.dataset.videoId;
        this.selectedVideos.delete(videoId);
        
        // Uncheck the checkbox in video library
        const checkbox = document.querySelector(`.vortex-video-checkbox[data-video-id="${videoId}"]`);
        if (checkbox) {
          checkbox.checked = false;
          checkbox.closest('.vortex-video-card')?.classList.remove('selected');
        }
        
        this.updateView();
        this.showNotification('Video removed from selection', 'success');
      });
    });

    // Go to Video Library button
    const goToVideoLibraryBtn = document.getElementById('go-to-video-library');
    if (goToVideoLibraryBtn) {
      goToVideoLibraryBtn.addEventListener('click', () => {
        this.currentTab = 'videos';
        this.updateView();
      });
    }

    // LLM Feature Buttons
    const batchGenerateTitlesBtn = document.getElementById('batch-generate-titles');
    if (batchGenerateTitlesBtn) {
      batchGenerateTitlesBtn.addEventListener('click', () => {
        this.showNotification(`Generating LLM titles for ${this.selectedVideos.size} videos - AWS Bedrock integration ready`, 'info');
      });
    }

    const batchGenerateChaptersBtn = document.getElementById('batch-generate-chapters');
    if (batchGenerateChaptersBtn) {
      batchGenerateChaptersBtn.addEventListener('click', () => {
        this.showNotification(`Generating AI chapters for ${this.selectedVideos.size} videos - AWS Bedrock integration ready`, 'info');
      });
    }

    const enhanceCaptionsBtn = document.getElementById('enhance-all-captions');
    if (enhanceCaptionsBtn) {
      enhanceCaptionsBtn.addEventListener('click', () => {
        this.showNotification(`Enhancing captions for ${this.selectedVideos.size} videos - AWS Bedrock integration ready`, 'info');
      });
    }

    const vpopsProcessBtn = document.getElementById('vpops-process');
    if (vpopsProcessBtn) {
      vpopsProcessBtn.addEventListener('click', () => {
        this.showNotification(`Generating in-video CTAs for ${this.selectedVideos.size} videos - AWS Bedrock integration ready`, 'info');
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
        
      case 'generate-chapters':
        this.generateChaptersWithLLM(video);
        break;
        
      case 'ai-summary':
        this.generateAISummary(video);
        break;
        
      case 'llm-title':
        this.generateLLMTitle(video);
        break;
        
      default:
        this.showNotification(`Action "${action}" coming soon!`, 'info');
    }
  }

  // LLM Feature Methods
  generateChaptersWithLLM(video) {
    this.showModal(
      'AI Chapter Generation',
      `
        <div class="vortex-modal-section">
          <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
            <h4 style="color: #0c4a6e; margin: 0 0 12px 0;">How AI Chapter Generation Works</h4>
            <p style="color: #075985; font-size: 14px; margin: 0 0 12px 0;">
              AWS Bedrock analyzes the video transcript to identify natural topic transitions and key moments, 
              then generates meaningful chapter titles and timestamps.
            </p>
            <ul style="color: #075985; font-size: 13px; margin: 0; padding-left: 20px;">
              <li>Automatic scene detection from transcript</li>
              <li>Topic-based segmentation</li>
              <li>Descriptive chapter titles (not just "Chapter 1")</li>
              <li>Optimal chapter length (5-8 chapters recommended)</li>
            </ul>
          </div>
          
          <h4 style="margin: 0 0 12px 0;">Video: ${video.title}</h4>
          <p style="color: #6b7280; margin-bottom: 20px;">Duration: ${video.duration}</p>
          
          <div style="background: #fef3c7; padding: 16px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
            <strong style="color: #92400e; display: block; margin-bottom: 8px;">Preview Mode - Demo</strong>
            <p style="color: #78350f; font-size: 13px; margin: 0;">
              In production, this would call AWS Bedrock to analyze the transcript and generate chapters. 
              Example output would include 5-8 chapters with timestamps and descriptive titles.
            </p>
          </div>
          
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px;">
            <strong style="display: block; margin-bottom: 12px;">Expected AI Output:</strong>
            <div style="font-family: monospace; font-size: 12px; color: #374151;">
              <div style="margin-bottom: 8px;">00:00 - Introduction & Overview</div>
              <div style="margin-bottom: 8px;">02:15 - Setting Up Your Workspace</div>
              <div style="margin-bottom: 8px;">05:30 - Core Features Walkthrough</div>
              <div style="margin-bottom: 8px;">08:45 - Advanced Techniques</div>
              <div style="margin-bottom: 8px;">12:20 - Tips & Best Practices</div>
              <div>14:10 - Conclusion & Next Steps</div>
            </div>
          </div>
        </div>
      `,
      [
        { label: 'Close', primary: false, action: () => this.closeModal() },
        { label: 'Generate Chapters (Demo)', primary: true, action: () => {
          this.closeModal();
          this.showNotification('AWS Bedrock integration ready - connect to generate real chapters', 'info');
        }}
      ]
    );
  }

  generateAISummary(video) {
    this.showModal(
      'AI Video Summary',
      `
        <div class="vortex-modal-section">
          <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
            <h4 style="color: #14532d; margin: 0 0 12px 0;">LLM-Powered Summarization</h4>
            <p style="color: #166534; font-size: 14px; margin: 0;">
              Creates engagement-optimized summaries that differ from SEO descriptions. Tailored for human readers 
              who want to quickly understand the value and content of the video.
            </p>
          </div>
          
          <h4 style="margin: 0 0 8px 0;">${video.title}</h4>
          <p style="color: #6b7280; font-size: 13px; margin-bottom: 20px;">Video ID: ${video.mpcId}</p>
          
          <div style="background: #fff; border: 2px solid #e5e7eb; padding: 20px; border-radius: 8px; margin-bottom: 16px;">
            <strong style="display: block; margin-bottom: 12px; color: #1f2937;">SEO Description (Current):</strong>
            <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0;">
              ${video.description || 'Standard video description optimized for search engines and metadata.'}
            </p>
          </div>
          
          <div style="background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border: 2px solid #a855f7; padding: 20px; border-radius: 8px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              <span style="background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); color: white; font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 4px;">LLM GENERATED</span>
              <strong style="color: #5b21b6;">Enhanced Summary:</strong>
            </div>
            <p style="color: #6b21a8; font-size: 14px; line-height: 1.7; margin: 0 0 16px 0;">
              <em>This would contain the AI-generated summary focused on learning outcomes, key topics, 
              target audience, and what viewers will be able to do after watching. It emphasizes value 
              and engagement over keyword optimization.</em>
            </p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; font-size: 13px;">
              <div>
                <strong style="color: #7c3aed; display: block; margin-bottom: 4px;">Skill Level:</strong>
                <span style="color: #6b21a8;">Intermediate</span>
              </div>
              <div>
                <strong style="color: #7c3aed; display: block; margin-bottom: 4px;">Duration:</strong>
                <span style="color: #6b21a8;">${video.duration}</span>
              </div>
              <div>
                <strong style="color: #7c3aed; display: block; margin-bottom: 4px;">Prerequisites:</strong>
                <span style="color: #6b21a8;">Basic Photoshop</span>
              </div>
              <div>
                <strong style="color: #7c3aed; display: block; margin-bottom: 4px;">Key Topics:</strong>
                <span style="color: #6b21a8;">3 main topics</span>
              </div>
            </div>
          </div>
          
          <div style="background: #fef3c7; padding: 16px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-top: 20px;">
            <p style="color: #78350f; font-size: 13px; margin: 0;">
              <strong>Demo Mode:</strong> Connect AWS Bedrock to generate real LLM summaries from video transcripts.
            </p>
          </div>
        </div>
      `,
      [
        { label: 'Close', primary: false, action: () => this.closeModal() },
        { label: 'Generate Summary (Demo)', primary: true, action: () => {
          this.closeModal();
          this.showNotification('AWS Bedrock integration ready - connect to generate real summaries', 'info');
        }}
      ]
    );
  }

  generateLLMTitle(video) {
    this.showModal(
      'LLM Title Generation',
      `
        <div class="vortex-modal-section">
          <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
            <h4 style="color: #1e3a8a; margin: 0 0 12px 0;">SEO vs LLM Titles</h4>
            <p style="color: #1e40af; font-size: 14px; margin: 0 0 12px 0;">
              SEO titles are optimized for search algorithms. LLM titles are optimized for human engagement, 
              highlighting specific value propositions and learning outcomes.
            </p>
            <div style="background: white; padding: 12px; border-radius: 6px; margin-bottom: 8px;">
              <div style="color: #64748b; font-size: 12px; margin-bottom: 4px;">SEO Title:</div>
              <div style="color: #1f2937; font-weight: 600;">"Adobe Photoshop Tutorial 2024 - Beginner Guide"</div>
            </div>
            <div style="background: white; padding: 12px; border-radius: 6px;">
              <div style="color: #7c3aed; font-size: 12px; margin-bottom: 4px;">LLM Title:</div>
              <div style="color: #5b21b6; font-weight: 600;">"Master AI-powered background removal in 15 minutes - No experience needed"</div>
            </div>
          </div>
          
          <h4 style="margin: 0 0 8px 0;">Current Video</h4>
          <div style="background: #f9fafb; border: 2px solid #e5e7eb; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <div style="color: #6b7280; font-size: 12px; margin-bottom: 8px;">Current SEO Title:</div>
            <div style="color: #1f2937; font-size: 16px; font-weight: 600;">${video.title}</div>
          </div>
          
          <div style="background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border: 2px solid #a855f7; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%); color: white; font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 4px;">LLM GENERATED</span>
              <div style="color: #5b21b6; font-size: 12px;">AI-Optimized Title:</div>
            </div>
            <div style="color: #6b21a8; font-size: 16px; font-weight: 600; line-height: 1.5;">
              <em>AI would analyze the transcript and generate 3-5 title variants focused on specific value, 
              target audience, and key outcomes. Each variant would emphasize different aspects.</em>
            </div>
          </div>
          
          <div style="background: #fef3c7; padding: 16px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="color: #78350f; font-size: 13px; margin: 0;">
              <strong>Demo Mode:</strong> AWS Bedrock would generate multiple title variants. You could A/B test 
              different titles for different platforms (YouTube, social media, LMS, etc.).
            </p>
          </div>
        </div>
      `,
      [
        { label: 'Close', primary: false, action: () => this.closeModal() },
        { label: 'Generate Titles (Demo)', primary: true, action: () => {
          this.closeModal();
          this.showNotification('AWS Bedrock integration ready - connect to generate real LLM titles', 'info');
        }}
      ]
    );
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
