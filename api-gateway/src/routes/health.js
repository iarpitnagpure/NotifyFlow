import { Router } from 'express';
import { healthController } from '../controllers/healthController.js';

const healthRouter = Router();

healthRouter.get('/', healthController);

export default healthRouter;
