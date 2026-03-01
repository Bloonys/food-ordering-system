const redis = require('redis');

// 从 .env 获取环境变量，若获取不到则使用默认值 'redis'
const REDIS_HOST = process.env.REDIS_HOST || 'redis';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

const client = redis.createClient({
    url: `redis://${REDIS_HOST}:${REDIS_PORT}`
});

// 错误处理逻辑
client.on('error', (err) => {
    if (err.code === 'ENOTFOUND') {
        console.error(`❌ Redis Host [${REDIS_HOST}] Not Found. 请检查 docker-compose 命名或 .env 加载。`);
    } else {
        console.error('❌ Redis Client Error:', err.message);
    }
});

// 异步连接与重试
const connectRedis = async () => {
    try {
        if (!client.isOpen) {
            await client.connect();
            console.log(`✓ Connected to Redis successfully at ${REDIS_HOST}:${REDIS_PORT}`);
        }
    } catch (err) {
        console.error('✗ Failed to connect to Redis, retrying in 5 seconds...');
        setTimeout(connectRedis, 5000);
    }
};

connectRedis();

module.exports = client;