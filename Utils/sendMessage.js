import axios from "axios";

const SMS_USER = "khalid2u";
const SMS_SECRET =
  "c121137bbf059125e59c12542d3e3fdedf62a1edd82cbbb9bfc3e02dbd99f6d4";
const SMS_SENDER = "kas.pub.sa";

export async function sendSMS(to, message) {
  const url = "https://www.dreams.sa/index.php/api/sendsms/";
  const params = new URLSearchParams({
    user: SMS_USER,
    secret_key: SMS_SECRET,
    sender: SMS_SENDER,
    to,
    message,
  });

  try {
    const res = await axios.get(`${url}?${params.toString()}`);
    console.log("SMS response:", res.data);
    return { success: true };
  } catch (error) {
    console.error("SMS Error:", error.message);
    return { success: false, error: error.message };
  }
}
