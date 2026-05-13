import { createClient } from 'redis';
import logger from './logger.js';

const redisClient  = createClient();

redisClient.on('error', err => logger.error({ err }, "Redis Client Error"));

(async () => {
  await redisClient.connect();
  logger.info('Redis Connected');
})();

export default redisClient;
