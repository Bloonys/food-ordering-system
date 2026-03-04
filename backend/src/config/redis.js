const redis = require('redis');

/**
 * 💡 
 * 1. Docker：REDIS_HOST may be overridden by docker-compose to 'redis'.
 * 2. Mac local： run .env file '127.0.0.1'.
 */
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const client = redis.createClient({
    url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
    socket: {
        // auto-retry on connection failure with exponential backoff, max 5s
        reconnectStrategy: (retries) => {
            if (retries > 20) {
                return new Error('Redis reconnection failed after 20 attempts');
            }
            // delay increases with each retry, capped at 5 seconds
            return Math.min(retries * 100, 5000);
        }
    }
});

// wrong
client.on('error', (err) => {
    if (!client.isOpen) {
        if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
            console.warn(`⚠️  Redis connection fail [${REDIS_HOST}:${REDIS_PORT}]: Mac do not connect to Redis.`);
        } else {
            console.error('❌ Redis wrong:', err.message);
        }
    }
});

// async connect with auto-retry
const connectRedis = async () => {
    try {
        if (!client.isOpen) {
            await client.connect();
            console.log(`✅ Redis connected: ${REDIS_HOST}:${REDIS_PORT}`);
        }
    } catch (err) {
        // socket.reconnectStrategy，do not need setTimeout to start connectRedis
        // avoid too many logs when retrying
        console.error(`✗ Redis wrong, reconnecting...`);
    }
};

connectRedis();

module.exports = client;