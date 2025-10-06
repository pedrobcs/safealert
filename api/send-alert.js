import twilio from "twilio";

const client = twilio(
process.env.TWILIO_ACCOUNT_SID,
process.env.TWILIO_AUTH_TOKEN
);

export default async function handler(req, res) {
// Enable CORS
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

// Handle preflight
if (req.method === 'OPTIONS') {
  return res.status(200).end();
}

if (req.method !== "POST") {
  return res.status(405).json({ error: "Method not allowed" });
}

const { contacts, location } = req.body;

if (!contacts || !location) {
  return res.status(400).json({ error: "Missing required data" });
}

const results = [];

for (const contact of contacts) {
  try {
    const message = await client.messages.create({
  body: contact.message,
  from: process.env.TWILIO_PHONE_NUMBER, // e.g. "whatsapp:+14155238886"
  to: `whatsapp:${contact.phone}`        // e.g. "whatsapp:+15551234567"
});

    results.push({ sid: message.sid, to: contact.phone, success: true });
  } catch (error) {
    results.push({ to: contact.phone, success: false, error: error.message });
  }
}

return res.status(200).json({ success: true, results });
}
