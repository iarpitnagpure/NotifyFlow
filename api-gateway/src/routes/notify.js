import { Router } from 'express';
import { notifyController } from '../controllers/notifyController.js';

const notifyRouter = Router();

notifyRouter.post('/', notifyController);

export default notifyRouter;
