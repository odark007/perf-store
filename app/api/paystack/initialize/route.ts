import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getLockedStoreSlug, getStoreOrNull, getTables } from '@/lib/stores/config';
import { getCurrentStoreSlugOrNull } from '@/lib/stores/context';

export async function POST(req: Request) {

    // DEBUG LOG
    console.log("Paystack Key Check:", process.env.PAYSTACK_SECRET_KEY ? "Key Exists" : "Key MISSING");

    try {
        const body = await req.json();
        const { email, amount, orderId, phone, storeSlug } = body;

        if (!email || !amount || !orderId || !storeSlug) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const store = getStoreOrNull(storeSlug);
        if (!store) {
            return NextResponse.json({ error: 'Invalid store' }, { status: 400 });
        }

        // The client may not choose a different tenant than the active request.
        const activeStore = await getCurrentStoreSlugOrNull();
        if (!activeStore || activeStore !== storeSlug) {
            return NextResponse.json({ error: 'Store context mismatch' }, { status: 403 });
        }

        // Never trust the client's amount. Read the order created server-side and
        // charge exactly what the database says the customer owes.
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false } }
        );
        const { data: order, error: orderError } = await supabaseAdmin
            .from(getTables(storeSlug).orders)
            .select('total_amount, payment_status')
            .eq('id', orderId)
            .single();

        if (orderError || !order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }
        if (order.payment_status === 'paid') {
            return NextResponse.json({ error: 'Order already paid' }, { status: 400 });
        }

        // Paystack expects amount in Kobos/Pesewas (multiply by 100)
        const amountInKobo = Math.round(Number(order.total_amount) * 100);

        // Normalize base URL (strip trailing slash) to avoid double-slash in callback_url.
        // Prefer a dedicated PAYSTACK_CALLBACK_BASE_URL (useful for local dev, e.g. http://localhost:3000),
        // then fall back to the public site URL.
        const rawBaseUrl = process.env.PAYSTACK_CALLBACK_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const baseUrl = rawBaseUrl.replace(/\/+$/, '');

        // On a tenant-locked deployment the store lives at the root.
        const storeSegment = getLockedStoreSlug() === storeSlug ? '' : `/${storeSlug}`;

        const params = {
            email,
            amount: amountInKobo,
            currency: store?.currency || 'GHS',
            callback_url: `${baseUrl}${storeSegment}/checkout/verify?orderId=${orderId}`,
            metadata: {
                order_id: orderId,
                store_slug: storeSlug,
                phone_number: phone,
                custom_fields: [
                    {
                        display_name: "Order ID",
                        variable_name: "order_id",
                        value: orderId
                    },
                    {
                        display_name: "Store",
                        variable_name: "store_slug",
                        value: storeSlug
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

        return NextResponse.json({ url: data.data.authorization_url, reference: data.data.reference, callback_url: `${baseUrl}${storeSegment}/checkout/verify?orderId=${orderId}` });

    } catch (error: any) {
        console.error('Paystack Init Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}