import { createClient } from 'redis';
import logger from './logger.js';

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

redisClient.on('error', (err) =>
  logger.error({ err }, "Redis Client Error")
);

(async () => {
  await redisClient.connect();
  logger.info('Redis Connected');
})();

export default redisClient;