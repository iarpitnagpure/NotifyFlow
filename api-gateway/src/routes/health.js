import { Router } from 'express';
import { healthController } from '../controllers/healthController.js';
import redisRateLimiter from '../middlewares/redisRateLimiter.js';

const healthRouter = Router();

healthRouter.get('/', redisRateLimiter, healthController);

export default healthRouter;
