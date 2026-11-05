export async function sendSMS(phone: string, message: string) {
  const apiKey = process.env.ARKESEL_API_KEY;
  // Trim whitespace, strip ONE layer of surrounding quotes, and enforce the
  // Arkesel alphanumeric sender-ID format (max 11 chars). If the env value
  // fails validation we still proceed with the cleaned value so a paste like
  // "\nMY_SENDER" cannot be silently dropped by the API.
  const rawSenderId = process.env.ARKESEL_SENDER_ID;
  let senderId = rawSenderId?.trim();
  if (senderId && /^["'].*["']$/.test(senderId)) {
    senderId = senderId.slice(1, -1).trim();
  }
  if (senderId && !/^[a-zA-Z0-9]{1,11}$/.test(senderId)) {
    console.warn(`SMS Warning: ARKESEL_SENDER_ID "${senderId}" has non-alphanumeric/over-11 chars — Arkesel may fall back to AlphanumericDefault.`);
  }
  const url = "https://sms.arkesel.com/api/v2/sms/send";

  if (!apiKey) {
    console.error("SMS Error: ARKESEL_API_KEY is missing");
    return { success: false, error: "Configuration Error" };
  }

  if (!senderId) {
    console.error("SMS Error: ARKESEL_SENDER_ID is missing");
    return { success: false, error: "Configuration Error" };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: senderId,
        recipients: [phone],
        message: message,
      }),
    });

    const data = await response.json();

    if (data.status === 'success') {
      console.log(`SMS Sent to ${phone} (sender: ${senderId})`);
      return { success: true, data };
    } else {
      console.error("Arkesel API Error:", data);
      return { success: false, error: data.message };
    }

  } catch (error) {
    console.error("SMS Network Error:", error);
    return { success: false, error: "Network Error" };
  }
}