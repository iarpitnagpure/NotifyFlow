import { Router } from 'express';
import { notifyController } from '../controllers/notifyController.js';
import redisRateLimiter from '../middlewares/redisRateLimiter.js';

const notifyRouter = Router();

notifyRouter.post('/', redisRateLimiter, notifyController);

export default notifyRouter;
