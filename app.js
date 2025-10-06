iimport twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { contacts, location } = req.body;

    if (!contacts || !Array.isArray(contacts) || !location) {
      return res.status(400).json({ error: "Missing required data" });
    }

    const results = [];

    for (const contact of contacts) {
      try {
        const message = await client.messages.create({
          body: contact.message || `Emergency alert: ${location}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: contact.phone,
        });
        results.push({ sid: message.sid, to: contact.phone, success: true });
      } catch (error) {
        results.push({
          to: contact.phone,
          success: false,
          error: error.message,
        });
      }
    }

    return res.status(200).json({ success: true, results });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}
