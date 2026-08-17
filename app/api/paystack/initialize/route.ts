import { NextResponse } from 'next/server';

export async function POST(req: Request) {

    // DEBUG LOG
    console.log("Paystack Key Check:", process.env.PAYSTACK_SECRET_KEY ? "Key Exists" : "Key MISSING");

    try {
        const body = await req.json();
        const { email, amount, orderId, phone } = body;

        if (!email || !amount || !orderId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Paystack expects amount in Kobos/Pesewas (multiply by 100)
        const amountInKobo = Math.round(amount * 100);

        // Normalize base URL (strip trailing slash) to avoid double-slash in callback_url.
        // Prefer a dedicated PAYSTACK_CALLBACK_BASE_URL (useful for local dev, e.g. http://localhost:3000),
        // then fall back to the public site URL.
        const rawBaseUrl = process.env.PAYSTACK_CALLBACK_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const baseUrl = rawBaseUrl.replace(/\/+$/, '');

        const params = {
            email,
            amount: amountInKobo,
            currency: 'GHS',
            callback_url: `${baseUrl}/checkout/verify?orderId=${orderId}`,
            metadata: {
                order_id: orderId,
                phone_number: phone,
                custom_fields: [
                    {
                        display_name: "Order ID",
                        variable_name: "order_id",
                        value: orderId
                    },
                    {
                        display_name: "Phone Number",
                        variable_name: "phone_number",
                        value: phone
                    }
                ]
            },
            channels: ['card', 'mobile_money']
        };

        const response = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        });

        const data = await response.json();

        if (!data.status) {
            return NextResponse.json({ error: data.message }, { status: 400 });
        }

        return NextResponse.json({ url: data.data.authorization_url, reference: data.data.reference, callback_url: `${baseUrl}/checkout/verify?orderId=${orderId}` });

    } catch (error: any) {
        console.error('Paystack Init Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}