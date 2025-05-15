
import * as nsfwjs from 'https://cdn.jsdelivr.net/npm/nsfwjs/dist/nsfwjs.esm.js';
import { safePostToApi } from './apiUtils.js';

// Configuration
const THRESHOLD = 0.75;
let model = null;
let enabled = true;

/**
 * Initialize the NSFWJS model
 * @returns {Promise<void>}
 */
async function initModel() {
  if (!model) {
    model = await nsfwjs.load();
  }
  return model;
}

/**
 * Apply blur effect to an element
 * @param {HTMLElement} el - Element to blur
 */
function blur(el) {
  el.style.filter = 'blur(24px)';
  el.style.transition = 'filter .3s';
}

/**
 * Remove blur from all elements
 */
function unblurAll() {
  document.querySelectorAll('[data-__nsfw_scanned]').forEach(el => {
    el.style.filter = '';
  });
}

/**
 * Run NSFW detection on an element
 * @param {HTMLElement} el - Element to scan
 * @param {Function} onDetection - Callback when NSFW content is detected
 * @returns {Promise<void>}
 */
async function detectNsfw(el, onDetection) {
  if (!el || el.dataset.__nsfw_scanned) return;
  el.dataset.__nsfw_scanned = '1';
  
  try {
    const predictions = await model.classify(el);
    const { className, probability } = predictions.sort((a, b) => b.probability - a.probability)[0];
    
    if (probability >= THRESHOLD && className !== 'Neutral') {
      blur(el);
      if (onDetection) {
        onDetection(el.src || el.currentSrc, className, probability);
      }
      return { className, probability };
    }
    return null;
  } catch (e) {
    // Ignore cross-origin errors
    return null;
  }
}

/**
 * Report NSFW content to backend
 * @param {string} mediaUrl - URL of the media
 * @param {string} detectedClass - Class of NSFW content detected
 * @param {number} confidence - Confidence score
 * @returns {Promise<void>}
 */
async function report(mediaUrl, detectedClass, confidence) {
  const pageUrl = location.href;
  const { clutchToken } = await chrome.storage.local.get('clutchToken');
  const payload = { 
    pageUrl, 
    mediaUrl, 
    detectedClass, 
    confidence, 
    timestamp: new Date().toISOString() 
  };
  
  try {
    // Use the safePostToApi utility for consistent error handling
    const response = await safePostToApi('/nsfw-detections', payload, clutchToken);
    
    // Store last detection regardless of API response success
    chrome.storage.local.set({ lastDetection: payload });
    
    if (response.error) {
      console.error('Error reporting NSFW content:', response.error);
    }
  } catch (error) {
    console.error('Error reporting NSFW content:', error);
  }
}

export {
  initModel,
  blur,
  unblurAll,
  detectNsfw,
  report
};
