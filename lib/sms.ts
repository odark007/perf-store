export async function sendSMS(phone: string, message: string) {
  const apiKey = process.env.ARKESEL_API_KEY;
  const senderId = process.env.ARKESEL_SENDER_ID || 'LiquorShop';
  const url = "https://sms.arkesel.com/api/v2/sms/send";

  if (!apiKey) {
    console.error("SMS Error: ARKESEL_API_KEY is missing");
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
      console.log(`SMS Sent to ${phone}`);
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