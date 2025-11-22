// Vortex Integration - Following send-to-caas pattern
import vortexApi from './vortexApi.js';

const IMS_CLIENT_ID = 'milo_ims';
const IMS_PROD_URL = 'https://auth.services.adobe.com/imslib/imslib.min.js';

/**
 * Initialize Adobe IMS for authentication
 * Same pattern as send-to-caas
 */
const initializeIMS = async (loadScript) => {
  window.adobeid = {
    client_id: IMS_CLIENT_ID,
    environment: 'prod',
    scope: 'AdobeID,openid',
  };

  if (!window.adobeIMS && loadScript) {
    await loadScript(IMS_PROD_URL);
  }
};

/**
 * Get IMS token
 * Same pattern as send-to-caas/utils.js getImsToken
 */
const getImsToken = async (loadScript) => {
  await initializeIMS(loadScript);
  const token = window.adobeIMS?.getAccessToken()?.token;
  
  if (!token) {
    console.warn('[Vortex] No IMS token found. User needs to sign in.');
  }
  
  return token;
};

/**
 * Check if user is authenticated
 */
const isAuthenticated = () => {
  return !!window.adobeIMS?.getAccessToken()?.token;
};

/**
 * Sign in with Adobe IMS
 */
const signIn = () => {
  if (!window.adobeIMS) {
    console.error('[Vortex] Adobe IMS not initialized');
    return;
  }
  
  window.adobeIMS.signIn({
    scopes: 'AdobeID,openid',
  });
};

/**
 * Sign out
 */
const signOut = () => {
  if (window.adobeIMS) {
    window.adobeIMS.signOut();
  }
};

/**
 * Main integration function - Generate titles for videos
 * @param {Array} videos - Array of video objects
 * @param {Object} options - Generation options
 * @param {Function} loadScript - Script loader function
 * @returns {Promise<Object>} Results from backend
 */
const generateTitles = async (videos, options = {}, loadScript) => {
  const token = await getImsToken(loadScript);
  
  if (!token) {
    throw new Error('Authentication required. Please sign in with Adobe IMS.');
  }
  
  return vortexApi.generateTitles(videos, options);
};

/**
 * Generate chapters for videos
 */
const generateChapters = async (videos, options = {}, loadScript) => {
  const token = await getImsToken(loadScript);
  
  if (!token) {
    throw new Error('Authentication required. Please sign in with Adobe IMS.');
  }
  
  return vortexApi.generateChapters(videos, options);
};

/**
 * Search videos
 */
const searchVideos = async (query, videos, options = {}, loadScript) => {
  const token = await getImsToken(loadScript);
  
  if (!token) {
    throw new Error('Authentication required. Please sign in with Adobe IMS.');
  }
  
  return vortexApi.search(query, videos, options);
};

/**
 * Generate CTAs
 */
const generateCtas = async (videos, options = {}, loadScript) => {
  const token = await getImsToken(loadScript);
  
  if (!token) {
    throw new Error('Authentication required. Please sign in with Adobe IMS.');
  }
  
  return vortexApi.generateCtas(videos, options);
};

/**
 * Enhance captions
 */
const enhanceCaptions = async (videos, options = {}, loadScript) => {
  const token = await getImsToken(loadScript);
  
  if (!token) {
    throw new Error('Authentication required. Please sign in with Adobe IMS.');
  }
  
  return vortexApi.enhanceCaptions(videos, options);
};

/**
 * Get recommendations
 */
const getRecommendations = async (criteria, availableVideos, loadScript) => {
  const token = await getImsToken(loadScript);
  
  if (!token) {
    throw new Error('Authentication required. Please sign in with Adobe IMS.');
  }
  
  return vortexApi.recommend(criteria, availableVideos);
};

export {
  generateTitles,
  generateChapters,
  searchVideos,
  generateCtas,
  enhanceCaptions,
  getRecommendations,
  getImsToken,
  isAuthenticated,
  signIn,
  signOut,
  initializeIMS,
};

export default {
  generateTitles,
  generateChapters,
  searchVideos,
  generateCtas,
  enhanceCaptions,
  getRecommendations,
  isAuthenticated,
  signIn,
  signOut,
};

