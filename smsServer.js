import express from "express";
import axios from "axios";
import { networkInterfaces } from "os";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON body
app.use(express.json());

// Dream SMS credentials
const SMS_USER = "khalid2u";
const SMS_SECRET =
  "c121137bbf059125e59c12542d3e3fdedf62a1edd82cbbb9bfc3e02dbd99f6d4";
const SMS_SENDER = "kas.pub.sa";

// Utility function to send SMS
async function sendSMS(to, message) {
  const params = new URLSearchParams({
    user: SMS_USER,
    secret_key: SMS_SECRET,
    sender: SMS_SENDER,
    to,
    message,
  });

  try {
    const res = await axios.get(
      `https://www.dreams.sa/index.php/api/sendsms/?${params.toString()}`
    );
    console.log("SMS response:", res.data);
    return { success: true, data: res.data };
  } catch (error) {
    console.error("SMS Error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

// POST route to send SMS with JSON body { to: "...", message: "..." }
app.post("/send-sms", async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({
      success: false,
      error: "Missing 'to' or 'message' in request body",
    });
  }

  const result = await sendSMS(to, message);

  if (result.success) {
    res.json({
      success: true,
      message: "SMS sent successfully!",
      data: result.data,
    });
  } else {
    res.status(500).json({ success: false, error: result.error });
  }
});

// Utility to get local IPv4 address (non-internal)
function getLocalIpAddress() {
  const interfaces = networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "0.0.0.0";
}

// Start server and log URLs
app.listen(PORT, "0.0.0.0", () => {
  const localIp = getLocalIpAddress();

  console.log("\n===============================================");
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("Available at:");
  console.log(`- Local:    http://localhost:${PORT}`);
  console.log(`- Network:  http://${localIp}:${PORT}`);
  console.log("===============================================\n");
  console.log("Send SMS endpoint: POST /send-sms");
  console.log(
    `Body JSON: { "to": "966541575666", "message": "Hello from EC2" }\n`
  );
});
