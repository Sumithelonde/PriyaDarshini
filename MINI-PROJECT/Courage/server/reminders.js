import express from 'express';
import twilio from 'twilio';
import cron from 'node-cron';
import { MOCK_CASES } from './data/mockCases.js';

const router = express.Router();

// Twilio credentials from environment
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM;

// Initialize Twilio client
let twilioClient;
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

/**
 * Check if a date is tomorrow
 */
const isTomorrow = (dateString) => {
  if (!dateString) return false;
  
  const hearingDate = new Date(dateString);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  hearingDate.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);
  
  return hearingDate.getTime() === tomorrow.getTime();
};

/**
 * Format date to DD MMM YYYY
 */
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
};

/**
 * Send WhatsApp reminder via Twilio
 */
const sendWhatsAppReminder = async (phoneNumber, caseData) => {
  if (!twilioClient) {
    console.error('Twilio not configured');
    return null;
  }

  try {
    const message = `🔔 *HEARING REMINDER*

Case Number: *${caseData.caseNumber}*
Court: ${caseData.courtName}
Case Type: ${caseData.caseType}
Status: ${caseData.status}
Hearing Date: *${formatDate(caseData.nextHearingDate)}*

Please be prepared for your hearing!`;

    const result = await twilioClient.messages.create({
      from: `whatsapp:${TWILIO_WHATSAPP_FROM}`,
      to: `whatsapp:${phoneNumber}`,
      body: message,
    });

    console.log(`✓ WhatsApp sent to ${phoneNumber} for case ${caseData.caseNumber}. SID: ${result.sid}`);
    return result;
  } catch (error) {
    console.error(`✗ Failed to send WhatsApp to ${phoneNumber}:`, error.message);
    return null;
  }
};

/**
 * Check all cases and send reminders for hearings tomorrow
 */
const checkAndSendReminders = async () => {
  console.log(`[${new Date().toISOString()}] Checking for hearings tomorrow...`);

  // Mock user phone numbers (in real app, store these in database)
  const userPhoneNumbers = {
    'demo-user': '+918830227694', // Test number format
  };

  try {
    for (const [caseNumber, caseData] of Object.entries(MOCK_CASES)) {
      if (isTomorrow(caseData.nextHearingDate)) {
        console.log(`Found case with hearing tomorrow: ${caseNumber}`);
        
        // Send to all registered users (demo: just one)
        for (const [userId, phoneNumber] of Object.entries(userPhoneNumbers)) {
          await sendWhatsAppReminder(phoneNumber, caseData);
        }
      }
    }
  } catch (error) {
    console.error('Error checking reminders:', error);
  }
};

/**
 * API endpoint to manually trigger reminders
 */
router.post('/send-reminders', async (req, res) => {
  try {
    const { phoneNumber, caseNumber } = req.body;

    if (!phoneNumber || !caseNumber) {
      return res.status(400).json({ 
        error: 'phoneNumber and caseNumber are required' 
      });
    }

    const caseData = MOCK_CASES[caseNumber];
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const result = await sendWhatsAppReminder(phoneNumber, caseData);
    
    if (result) {
      res.status(200).json({ 
        message: 'WhatsApp reminder sent successfully',
        messageSid: result.sid 
      });
    } else {
      res.status(500).json({ error: 'Failed to send WhatsApp reminder' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Start the reminder scheduler
 * Runs every day at 8:00 AM to check for hearings tomorrow
 */
export const startReminderScheduler = () => {
  if (!TWILIO_ACCOUNT_SID) {
    console.log('⚠️  Twilio not configured. Reminders will not send.');
    console.log('Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM in .env');
    return;
  }

  // Schedule to run daily at 8:00 AM
  cron.schedule('0 8 * * *', () => {
    console.log('📅 Running daily reminder check...');
    checkAndSendReminders();
  });

  console.log('✓ Reminder scheduler started (runs daily at 8:00 AM)');
};

export default router;
