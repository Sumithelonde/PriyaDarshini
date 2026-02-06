import express from 'express';
const router = express.Router();

// POST /webhook endpoint to receive webhook calls
router.post('/webhook', (req, res) => {
  // Access webhook payload from req.body
  const payload = req.body;

  // TODO: Process the payload as needed
  console.log('Received webhook:', payload);

  // Respond to sender
  res.status(200).json({ message: 'Webhook received' });
});

export default router;
