// Frontend Integration for Vortex Backend
// Adobe I/O Runtime Actions Integration

/**
 * Vortex Backend API Client
 * Handles all communication with Adobe I/O Runtime backend actions
 */

class VortexAPI {
  constructor() {
    // Initialize Adobe IMS if not already initialized
    this.initIMS = async (loadScript) => {
      window.adobeid = {
        client_id: 'milo_ims',
        environment: 'prod',
        scope: 'AdobeID,openid',
      };

      if (!window.adobeIMS && loadScript) {
        await loadScript('https://auth.services.adobe.com/imslib/imslib.min.js');
      }
    };

    // Get IMS token from Adobe authentication
    this.getToken = () => {
      // Get token from Adobe IMS (same as send-to-caas)
      const token = window.adobeIMS?.getAccessToken()?.token;
      if (!token) {
        console.log('[Vortex API] No IMS token found');
        return null;
      }
      console.log('[Vortex API] Token:', `${token.substring(0, 20)}...`);
      return token;
    };

    // Get IMS Org ID - not needed for this integration
    // The backend will get it from the IMS token
    this.getOrgId = () => {
      // Check localStorage first (can be set via configure.html)
      const savedOrgId = localStorage.getItem('vortex:orgId');
      if (savedOrgId) {
        console.log('[Vortex API] Using saved Org ID:', `${savedOrgId.substring(0, 20)}...`);
        return savedOrgId;
      }
      return null;
    };

    // Production Action URLs
    this.endpoints = {
      generateTitles: 'https://14257-vortex-stage.adobeio-static.net/api/v1/web/vortex/generate-titles',
      generateChapters: 'https://14257-vortex-stage.adobeio-static.net/api/v1/web/vortex/generate-chapters',
      search: 'https://14257-vortex-stage.adobeio-static.net/api/v1/web/vortex/search',
      generateCtas: 'https://14257-vortex-stage.adobeio-static.net/api/v1/web/vortex/generate-ctas',
      enhanceCaptions: 'https://14257-vortex-stage.adobeio-static.net/api/v1/web/vortex/enhance-captions',
      recommend: 'https://14257-vortex-stage.adobeio-static.net/api/v1/web/vortex/recommend',
      // Additional endpoints available
      sample: 'https://14257-vortex-stage.adobeio-static.net/api/v1/web/vortex/sample',
      analytics: 'https://14257-vortex-stage.adobeio-static.net/api/v1/web/vortex/analytics',
      target: 'https://14257-vortex-stage.adobeio-static.net/api/v1/web/vortex/target',
      publishEvents: 'https://14257-vortex-stage.adobeio-static.net/api/v1/web/vortex/publish-events',
    };

    this.debug = true; // Enable debug logging
  }

  /**
   * Log debug information
   * @private
   */
  _log(message, data) {
    if (this.debug) {
      console.log(`[Vortex API] ${message}`, data || '');
    }
  }

  /**
   * Make authenticated request to backend action
   * @private
   */
  async _request(endpoint, data) {
    const token = this.getToken();

    // Allow test mode for local development (no IMS available)
    const isTestMode = !token && !window.adobeIMS;

    if (!token && !isTestMode) {
      throw new Error('Authentication required. Please sign in with Adobe IMS.');
    }

    this._log('Making request to:', endpoint);
    this._log('Request data:', data);
    this._log('Token available:', token ? 'Yes' : 'Test Mode');
    this._log('Test Mode:', isTestMode ? 'Yes (no IMS)' : 'No');

    try {
      // Build headers (same pattern as send-to-caas)
      const headers = {};

      if (token) {
        headers.Authorization = `Bearer ${token}`;

        // Add org ID if available (optional, backend can extract from token)
        const orgId = this.getOrgId();
        if (orgId) {
          headers['x-gw-ims-org-id'] = orgId;
        }
      } else if (isTestMode) {
        // Test mode - add header to indicate this
        headers['X-Test-Mode'] = 'true';
        this._log('⚠️ WARNING: Running in test mode without authentication', 'This should only be used for local development');
      }

      const requestOptions = {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      };

      this._log('Request options:', requestOptions);

      const response = await fetch(endpoint, requestOptions);

      this._log('Response status:', response.status);
      this._log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Try to parse response as JSON
      let result;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
        this._log('Response body (JSON):', result);
      } else {
        const text = await response.text();
        this._log('Response body (text):', text);

        // Try to parse as JSON anyway
        try {
          result = JSON.parse(text);
        } catch (e) {
          result = {
            success: false,
            error: {
              message: `Non-JSON response: ${text.substring(0, 200)}`,
              statusCode: response.status,
              statusText: response.statusText,
            },
          };
        }
      }

      if (!response.ok) {
        const errorMsg = result.error?.message || result.error || result.message || `HTTP ${response.status}: ${response.statusText}`;
        this._log('Request failed:', errorMsg);
        this._log('Full error response:', result);

        // Provide helpful error messages
        if (response.status === 403) {
          const helpMsg = 'HTTP 403 Forbidden - Possible causes:\n'
                         + '1. Invalid or expired authentication token\n'
                         + '2. Org ID doesn\'t have access to this namespace\n'
                         + '3. Backend action has additional permission checks\n'
                         + '4. Try using your actual Adobe IMS token instead of sandbox token';
          this._log('Help:', helpMsg);
          throw new Error(`${errorMsg}\n\n${helpMsg}`);
        }

        throw new Error(errorMsg);
      }

      if (result.success === false) {
        const errorMsg = result.error?.message || 'Request failed';
        this._log('Backend returned error:', errorMsg);
        this._log('Full error response:', result);
        throw new Error(errorMsg);
      }

      this._log('Request successful:', result);
      return result;
    } catch (error) {
      this._log('Request error:', error);

      // Provide more detailed error messages
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Network error: Cannot reach backend. Check CORS configuration or network connection.');
      }

      throw error;
    }
  }

  /**
   * Generate AI-powered titles and summaries for videos
   * @param {Array} videos - Array of video objects with id, title, description, transcript, duration
   * @param {Object} options - Generation options (generateVariants, variantCount, tone)
   * @returns {Promise<Object>} Results with titles, summaries, and cost
   */
  async generateTitles(videos, options = {}) {
    const defaultOptions = {
      generateVariants: true,
      variantCount: 3,
      tone: 'engaging',
    };

    return this._request(this.endpoints.generateTitles, {
      videos,
      options: { ...defaultOptions, ...options },
    });
  }

  /**
   * Generate chapter markers from video transcripts
   * @param {Array} videos - Array of video objects with id, title, transcript, duration
   * @param {Object} options - Chapter options (targetChapterCount, minChapterLength, includeDescriptions)
   * @returns {Promise<Object>} Results with chapters and timestamps
   */
  async generateChapters(videos, options = {}) {
    const defaultOptions = {
      targetChapterCount: 6,
      minChapterLength: 45,
      includeDescriptions: true,
    };

    return this._request(this.endpoints.generateChapters, {
      videos,
      options: { ...defaultOptions, ...options },
    });
  }

  /**
   * Perform semantic search across video transcripts
   * @param {string} query - Search query
   * @param {Array} videos - Array of video objects to search
   * @param {Object} options - Search options (topResults, matchType)
   * @returns {Promise<Object>} Search results with relevance scores
   */
  async search(query, videos, options = {}) {
    const defaultOptions = {
      includeTimestamps: true,
      matchType: 'semantic',
      topResults: 10,
    };

    return this._request(this.endpoints.search, {
      query,
      videos,
      options: { ...defaultOptions, ...options },
    });
  }

  /**
   * Generate smart CTA placements for videos
   * @param {Array} videos - Array of video objects with transcript, duration, chapters
   * @param {Object} options - CTA options (ctaTypes, maxCTAsPerVideo, placementStrategy)
   * @returns {Promise<Object>} CTA recommendations with timestamps
   */
  async generateCtas(videos, options = {}) {
    const defaultOptions = {
      ctaTypes: ['subscribe', 'learnMore', 'tryFree', 'nextVideo'],
      maxCTAsPerVideo: 3,
      placementStrategy: 'optimal',
    };

    return this._request(this.endpoints.generateCtas, {
      videos,
      options: { ...defaultOptions, ...options },
    });
  }

  /**
   * Enhance video captions with proper formatting
   * @param {Array} videos - Array of video objects with captions and context
   * @param {Object} options - Enhancement options (fixPunctuation, recognizeTerms, improveReadability)
   * @returns {Promise<Object>} Enhanced captions with change tracking
   */
  async enhanceCaptions(videos, options = {}) {
    const defaultOptions = {
      fixPunctuation: true,
      recognizeTerms: true,
      improveReadability: true,
    };

    return this._request(this.endpoints.enhanceCaptions, {
      videos,
      options: { ...defaultOptions, ...options },
    });
  }

  /**
   * Get AI-powered video recommendations
   * @param {Object} criteria - Recommendation criteria (userQuery, skillLevel, topic, maxResults)
   * @param {Array} availableVideos - Pool of videos to recommend from
   * @returns {Promise<Object>} Recommended videos with relevance scores
   */
  async recommend(criteria, availableVideos) {
    return this._request(this.endpoints.recommend, {
      criteria,
      availableVideos,
    });
  }

  /**
   * Test endpoint - verify backend connectivity
   * @returns {Promise<Object>} Sample response from backend
   */
  async testConnection() {
    return this._request(this.endpoints.sample, {
      test: true,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Simple GET request to test endpoint accessibility
   * @returns {Promise<Object>} Basic connectivity test
   */
  async testEndpointAccess(endpointName = 'sample') {
    const endpoint = this.endpoints[endpointName];

    this._log('Testing endpoint access:', endpoint);

    try {
      // Try a simple GET request first (no auth needed)
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      this._log('GET Response status:', response.status);
      const text = await response.text();
      this._log('GET Response:', text);

      return {
        success: true,
        status: response.status,
        accessible: true,
        response: text,
      };
    } catch (error) {
      this._log('GET Request failed:', error);
      return {
        success: false,
        accessible: false,
        error: error.message,
      };
    }
  }
}

// Create singleton instance
const vortexApi = new VortexAPI();

export default vortexApi;

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example 1: Generate titles for selected videos
 */
export async function example_generateTitles(selectedVideos) {
  try {
    const result = await vortexApi.generateTitles(
      selectedVideos.map((video) => ({
        id: video.id,
        title: video.title,
        description: video.description || '',
        transcript: video.transcript,
        duration: video.duration,
        category: video.category || 'General',
      })),
      {
        generateVariants: true,
        variantCount: 3,
        tone: 'engaging',
      },
    );

    console.log('Generated titles:', result.results);
    console.log('Cost:', `$${result.cost}`);
    console.log('Tokens used:', result.tokensUsed.total);

    return result.results;
  } catch (error) {
    console.error('Failed to generate titles:', error);
    throw error;
  }
}

/**
 * Example 2: Generate chapters for a video
 */
export async function example_generateChapters(video) {
  try {
    const result = await vortexApi.generateChapters([{
      id: video.id,
      title: video.title,
      transcript: video.transcript,
      duration: video.duration,
    }]);

    const { chapters } = result.results[0];
    console.log('Generated chapters:', chapters);

    return chapters;
  } catch (error) {
    console.error('Failed to generate chapters:', error);
    throw error;
  }
}

/**
 * Example 3: Search videos
 */
export async function example_searchVideos(query, videoLibrary) {
  try {
    const result = await vortexApi.search(
      query,
      videoLibrary.map((v) => ({
        id: v.id,
        title: v.title,
        transcript: v.transcript,
        chapters: v.chapters || [],
      })),
      { topResults: 5 },
    );

    console.log('Search results:', result.results);
    console.log('Execution time:', `${result.executionTime}ms`);

    return result.results;
  } catch (error) {
    console.error('Search failed:', error);
    throw error;
  }
}

/**
 * Example 4: Generate CTAs
 */
export async function example_generateCtas(video) {
  try {
    const result = await vortexApi.generateCtas([{
      id: video.id,
      title: video.title,
      transcript: video.transcript,
      duration: video.duration,
      chapters: video.chapters || [],
      targetAudience: 'beginners',
    }], {
      ctaTypes: ['subscribe', 'tryFree', 'nextVideo'],
      maxCTAsPerVideo: 2,
    });

    const { ctas } = result.results[0];
    console.log('Generated CTAs:', ctas);

    return ctas;
  } catch (error) {
    console.error('Failed to generate CTAs:', error);
    throw error;
  }
}

/**
 * Example 5: Enhance captions
 */
export async function example_enhanceCaptions(video) {
  try {
    const result = await vortexApi.enhanceCaptions([{
      id: video.id,
      captions: video.captions,
      context: {
        product: video.productTag || 'Adobe',
        category: video.category || 'Tutorial',
      },
    }]);

    const enhanced = result.results[0].enhancedCaptions;
    console.log('Enhanced captions:', enhanced);
    console.log('Improvements:', result.results[0].improvements);

    return enhanced;
  } catch (error) {
    console.error('Failed to enhance captions:', error);
    throw error;
  }
}

/**
 * Example 6: Get recommendations
 */
export async function example_getRecommendations(userPreferences, videoLibrary) {
  try {
    const result = await vortexApi.recommend(
      {
        userQuery: userPreferences.query || '',
        skillLevel: userPreferences.skillLevel || 'beginner',
        topic: userPreferences.topic || 'photoshop',
        maxResults: 5,
      },
      videoLibrary.map((v) => ({
        id: v.id,
        title: v.title,
        description: v.description,
        metadata: v.metadata || {},
      })),
    );

    const { recommendations } = result;
    console.log('Recommendations:', recommendations);
    console.log('Strategy:', result.strategy);

    return recommendations;
  } catch (error) {
    console.error('Failed to get recommendations:', error);
    throw error;
  }
}

/**
 * Example 7: Test backend connectivity
 */
export async function example_testConnection() {
  try {
    const result = await vortexApi.testConnection();
    console.log('Backend connection successful:', result);
    return result;
  } catch (error) {
    console.error('Backend connection failed:', error);
    throw error;
  }
}
