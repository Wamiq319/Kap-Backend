// utils/whatsapp.js
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Get numbers from environment
const sandboxNumber =
  process.env.TWILIO_SANDBOX_NUMBER || "whatsapp:+14155238886";
const productionNumber = process.env.TWILIO_WHATSAPP_NUMBER;

/**
 * Formats phone number to E.164 standard
 * @param {string} rawNumber - Raw phone number input
 * @returns {string} Formatted number
 */
function formatPhoneNumber(rawNumber) {
  // Remove all non-digit characters
  let cleaned = rawNumber.replace(/\D/g, "");

  // Handle Saudi numbers
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
 * @returns {Promise<object>} Twilio response or sandbox simulation
 */
export async function sendWhatsAppMessage(phoneNumber, message) {
  const formattedTo = formatPhoneNumber(phoneNumber);
  const from =
    process.env.NODE_ENV === "production" ? productionNumber : sandboxNumber;

  // Validate we have a from number
  if (!from) {
    const error = new Error(
      "Missing WhatsApp from number in environment variables"
    );
    console.error(error.message);
    throw error;
  }

  try {
    // In non-production, log instead of sending
    if (process.env.NODE_ENV !== "production") {
      console.log("[WhatsApp Sandbox]", {
        from: from,
        to: formattedTo,
        message: message,
      });
      return {
        status: "sandbox",
        from: from,
        to: formattedTo,
        message: message,
      };
    }

    // Production - real message
    const response = await client.messages.create({
      body: message,
      from: from,
      to: `whatsapp:${formattedTo}`,
    });

    console.log("WhatsApp message sent:", {
      sid: response.sid,
      to: formattedTo,
      timestamp: new Date().toISOString(),
    });
    return response;
  } catch (error) {
    console.error("WhatsApp send failed:", {
      to: formattedTo,
      error: error.message,
    });
    throw new Error(`Failed to send WhatsApp: ${error.message}`);
  }
}
