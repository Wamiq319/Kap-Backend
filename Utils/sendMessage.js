import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

// Debug log to verify the SID is loaded
console.log("Messaging Service SID:", messagingServiceSid);

export async function sendSMS({ phoneNumber, message }) {
  // Basic validation
  if (!phoneNumber || !message) {
    return {
      success: false,
      error: "phoneNumber and message are required",
    };
  }

  if (!messagingServiceSid) {
    return {
      success: false,
      error: "Twilio Messaging Service SID is not configured",
    };
  }

  try {
    // Clean and format phone number
    const to = `+${phoneNumber.replace(/\D/g, "")}`;

    // Send via Messaging Service
    const response = await client.messages.create({
      body: message,
      messagingServiceSid: messagingServiceSid,
      to: to,
    });

    return {
      success: true,
      sid: response.sid,
      status: response.status,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }
}
