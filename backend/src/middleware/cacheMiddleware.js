const redisClient = require('../config/redis');

const cacheMiddleware = (duration) => {
  return async (req, res, next) => {
    // 只对 GET 请求进行缓存
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

      // 如果没命中，我们要重写 res.send，以便在 Controller 返回数据时顺便存入 Redis
      res.sendResponse = res.json;
      res.json = (data) => {
        redisClient.setEx(key, duration, JSON.stringify(data));
        res.sendResponse(data);
      };
      
      next();
    } catch (err) {
      console.error('Redis Middleware Error:', err);
      next(); // 如果 Redis 挂了，确保请求还能继续查数据库
    }
  };
};

module.exports = cacheMiddleware;