import twilio from "twilio";
import dotenv from "dotenv";
import { parsePhoneNumberFromString } from "libphonenumber-js";

dotenv.config();

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Get sender number from environment (will change later)
const senderNumber = process.env.TWILIO_PHONE_NUMBER;

export async function sendSMSMessage(messageData) {
  const { phoneNumber, message } = messageData;

  // Validate required fields
  if (!phoneNumber || !message) {
    console.error(
      "Missing required parameters: phoneNumber and message are required"
    );
    return {
      success: false,
      error: "Missing required parameters",
    };
  }

  try {
    // Parse and validate phone number
    const parsedNumber = parsePhoneNumberFromString(phoneNumber);

    if (!parsedNumber || !parsedNumber.isValid()) {
      console.error("Invalid phone number format:", phoneNumber);
      return {
        success: false,
        error: "Invalid phone number format",
      };
    }

    const to = parsedNumber.format("E.164");

    const from = senderNumber;

    const response = await client.messages.create({
      body: message,
      from: from,
      to: to,
      statusCallback: process.env.TWILIO_STATUS_CALLBACK_URL,
      validityPeriod: 1440,
    });

    console.log("SMS sent successfully:", {
      to: to,
      sid: response.sid,
      status: response.status,
    });

    return {
      success: true,
      sid: response.sid,
      status: response.status,
    };
  } catch (error) {
    console.error("SMS sending failed:", {
      error: error.message,
      code: error.code,
      phoneNumber: phoneNumber,
      moreInfo: error.moreInfo,
    });

    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }
}
