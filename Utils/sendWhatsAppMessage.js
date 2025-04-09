// utils/whatsapp.js
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Get production number from environment
const productionNumber = process.env.TWILIO_WHATSAPP_NUMBER;

/**
 * Formats phone number to E.164 standard
 * @param {string} rawNumber - Raw phone number input
 * @returns {string} Formatted number
 */
function formatPhoneNumber(rawNumber) {
  let cleaned = rawNumber.replace(/\D/g, "");

  if (cleaned.startsWith("966")) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith("0")) {
    return `+966${cleaned.substring(1)}`;
  }
  if (!cleaned.startsWith("+")) {
    return `+${cleaned}`;
  }
  return cleaned;
}

/**
 * Sends WhatsApp message
 * @param {string} phoneNumber - Recipient phone number (any format)
 * @param {string} message - Message content
 * @returns {Promise<boolean>} True if message sent successfully, false otherwise
 */
export async function sendWhatsAppMessage(phoneNumber, message) {
  const formattedTo = formatPhoneNumber(phoneNumber);

  // Validate production number
  if (!productionNumber) {
    console.error(
      "Missing WhatsApp production number in environment variables"
    );
    return false; // Return false if no production number is found
  }

  try {
    // Send real message in production
    const response = await client.messages.create({
      body: message,
      from: productionNumber,
      to: `whatsapp:${formattedTo}`,
    });

    console.log("WhatsApp message sent:", {
      sid: response.sid,
      to: formattedTo,
      timestamp: new Date().toISOString(),
    });

    // Check if the message was successfully sent
    if (response.status === "queued" || response.status === "sent") {
      return true; // Return true if message is successfully sent or queued for delivery
    } else {
      console.error("Message failed to send. Status:", response.status);
      return false; // Return false if message failed
    }
  } catch (error) {
    console.error("WhatsApp send failed:", {
      to: formattedTo,
      error: error.message,
    });
    return false; // Return false if there is an error during message sending
  }
}
