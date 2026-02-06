import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import webhookRouter from './webhook.js';
import remindersRouter, { startReminderScheduler } from './reminders.js';
import authRouter from './auth/routes.js';
import { ensureJwtSecret } from './auth/auth.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', webhookRouter);
app.use('/api', remindersRouter);
app.use('/api', authRouter);

// Endpoint to send data to the external webhook URL
app.post('/api/send-webhook', async (req, res) => {
    try {
        const payload = req.body;
        const webhookUrl = 'http://localhost:5678/webhook/86816cfb-edb3-41c2-a959-b5c72a110eb6/chat';

        // Send POST request to the webhook URL
        const response = await axios.post(webhookUrl, payload);

        res.status(200).json({ message: 'Webhook sent', data: response.data });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send webhook', details: error.message });
    }
});

ensureJwtSecret();
startReminderScheduler();

export default app;