const redisClient = require('../config/redis');

const cacheMiddleware = (duration) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      const cachedData = await redisClient.get(key);
      if (cachedData) {
        console.log(`--- Cache Hit for ${key} ---`);
        return res.json(JSON.parse(cachedData));
      }

      // If cache miss, override res.json so that we can store the response in Redis when the controller returns data
      res.sendResponse = res.json;
      res.json = (data) => {
        redisClient.setEx(key, duration, JSON.stringify(data));
        res.sendResponse(data);
      };
      
      next();
    } catch (err) {
      console.error('Redis Middleware Error:', err);
      next(); // If Redis fails, ensure the request can still proceed to the database
    }
  };
};

module.exports = cacheMiddleware;