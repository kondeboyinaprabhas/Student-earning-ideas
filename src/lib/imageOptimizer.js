// src/lib/imageOptimizer.js - Responsive Image URL Helper for Unsplash & CDNs

/**
 * Optimizes an image URL by adjusting width, quality, and format.
 * Specifically handles images.unsplash.com URLs to prevent downloading
 * oversized images (e.g., requesting 720px for mobile/card view instead of 1200px+).
 *
 * @param {string} url - Source image URL
 * @param {object} options - Optimization options
 * @param {number} [options.width=720] - Target image width in pixels
 * @param {number} [options.quality=75] - Compression quality (1-100)
 * @returns {string} Optimized URL or original URL if not optimizable
 */
export function getOptimizedImageUrl(url, { width = 720, quality = 75 } = {}) {
  if (!url || typeof url !== 'string') return url;

  // Unsplash image optimization
  if (url.includes('images.unsplash.com')) {
    try {
      const parsed = new URL(url);
      parsed.searchParams.set('auto', 'format');
      parsed.searchParams.set('fit', 'crop');
      parsed.searchParams.set('w', String(width));
      parsed.searchParams.set('q', String(quality));
      return parsed.toString();
    } catch {
      // Fallback regex if URL parsing fails
      let res = url;
      if (res.includes('w=')) {
        res = res.replace(/w=\d+/, `w=${width}`);
      } else {
        res += (res.includes('?') ? '&' : '?') + `w=${width}`;
      }
      if (res.includes('q=')) {
        res = res.replace(/q=\d+/, `q=${quality}`);
      } else {
        res += `&q=${quality}`;
      }
      if (!res.includes('auto=')) {
        res += '&auto=format';
      }
      if (!res.includes('fit=')) {
        res += '&fit=crop';
      }
      return res;
    }
  }

  return url;
}
