import 'dotenv/config';
import express from 'express';
import healthRouter from './routes/health.js';
import notifyRouter from './routes/notify.js';

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

// Health check
app.use('/api/health', healthRouter);
// Notification
app.use('/api/notify', notifyRouter);

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
