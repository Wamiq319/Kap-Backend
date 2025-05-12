import twilio from "twilio";
import dotenv from "dotenv";
import { parsePhoneNumberFromString } from "libphonenumber-js";

dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sender = process.env.TWILIO_WHATSAPP_NUMBER;
const templateSid = process.env.TWILIO_TEMPLATE_SID;

export async function sendWhatsAppMessage(messageData) {
  const { phoneNumber, name, username, password } = messageData;

  // Validate phone number exists
  if (!phoneNumber) {
    console.error("No phone number provided");
    return false;
  }

  try {
    // Parse and validate international phone number
    const parsedNumber = parsePhoneNumberFromString(phoneNumber);

    if (!parsedNumber || !parsedNumber.isValid()) {
      console.error("Invalid phone number format:", phoneNumber);
      return false;
    }

    // Format for WhatsApp (E.164 format with whatsapp: prefix)
    const to = `whatsapp:${parsedNumber.format("E.164")}`;

    const response = await client.messages.create({
      from: sender,
      to: to,
      contentSid: templateSid,
      contentType: "template",
      contentVariables: JSON.stringify({
        1: name || "",
        2: username || "",
        3: password || "",
      }),
    });

    console.log("Message sent to:", to, "SID:", response.sid);
    return ["queued", "sent", "delivered"].includes(response.status);
  } catch (error) {
    console.error("Failed to send WhatsApp message:", {
      error: error.message,
      phoneNumber,
      templateSid,
    });
    return false;
  }
}
