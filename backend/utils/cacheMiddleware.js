import NodeCache from 'node-cache';
import logger from './logger.js';

// Initialize cache with a standard TTL of 15 minutes (900 seconds)
const cache = new NodeCache({ stdTTL: 900, checkperiod: 120 });

/**
 * Express middleware for caching API responses.
 * @param {number} duration Cache duration in seconds
 */
export const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    // Skip caching for unsupported methods
    if (req.method !== 'GET' && req.method !== 'POST') {
      return next();
    }

    // Use URL and stringified body for POST requests as the cache key
    let key = `__express__${req.originalUrl || req.url}`;
    if (req.method === 'POST' && req.body) {
      key += `__body__${JSON.stringify(req.body)}`;
    }
    
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      logger.info(`[Cache HIT] ${key}`);
      return res.json(cachedResponse);
    }

    logger.info(`[Cache MISS] ${key}`);
    
    // Override res.json to store the response before sending it
    const originalJson = res.json;
    res.json = function (body) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, body, duration);
      }
      return originalJson.call(this, body);
    };

    next();
  };
};

export default cacheMiddleware;
