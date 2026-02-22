import { placeOrder } from '@/app/actions/checkout';
import { POST } from '@/app/api/paystack/webhook/route';
import { sendNotification } from '@/lib/notification';

// --- MOCKS ---

// 1. Mock Supabase Server Client (for checkout action)
jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn().mockReturnValue({
        auth: {
            getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } } }),
        },
        from: jest.fn().mockImplementation((table) => {
            const mockChain: any = {
                select: jest.fn().mockReturnThis(),
                insert: jest.fn().mockReturnThis(),
                update: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                in: jest.fn().mockReturnThis(),
                single: jest.fn(),
                then: jest.fn(), // Placeholder
            };

            // Implement 'then' to resolve data based on table context
            // We use a getter or simple implementation to resolve differently?
            // Actually simpliest is to make specific methods resolve specific data if awaited?
            // But Supabase is: query.then().
            // Let's modify the chain based on what's called.

            const resolveData = (data: any, error: any = null) => {
                return Promise.resolve({ data, error });
            };

            // Default responses
            let responseData: any = [];
            if (table === 'product_variants') {
                responseData = [{
                    id: 'variant-1',
                    stock_deduction: 1,
                    master_stock_id: 'master-1',
                    price: 100,
                    inventory: { id: 'master-1', current_stock_level: 100 },
                    product: { is_featured: false, discount_percent: 0 }
                }];
            } else if (table === 'orders') {
                responseData = { id: 'order-123', order_number: 'ORD-001' };
            } else if (table === 'store_settings') {
                responseData = { bulk_threshold: 10, bulk_surcharge: 5 };
            } else if (table === 'delivery_zones') {
                responseData = { base_price: 10 };
            }

            mockChain.then = (resolve: any) => resolveData(responseData).then(resolve);

            mockChain.single = jest.fn().mockImplementation(() => {
                // single() returns a promise-like that resolves to ONE item
                return { data: Array.isArray(responseData) ? responseData[0] : responseData, error: null };
            });

            // Special logic for specific chains if needed
            if (table === 'product_variants') {
                mockChain.in = jest.fn().mockReturnThis(); // Valid
            }

            return mockChain;
        }),
    }),
}));

// 2. Mock Supabase Client (for webhook) - verifying it is mocked appropriately
jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
            update: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
                data: {
                    order_number: 'ORD-webhook',
                    notes: 'Customer Name - Notes',
                    total_amount: 500,
                    user_phone: '123',
                    user_email: 'test@test.com'
                },
                error: null
            })
        })
    })
}));

// 3. Mock Notification Service
jest.mock('@/lib/notification', () => ({
    sendNotification: jest.fn().mockResolvedValue(true),
}));

// 4. Mock Utils
jest.mock('@/lib/utils', () => ({
    getDiscountedPrice: jest.fn().mockReturnValue({ finalPrice: 100 }),
    formatCurrency: jest.fn(val => `$${val}`),
}));

// 5. Mock Next Request/Response for Webhook
jest.mock('next/server', () => ({
    NextResponse: {
        json: jest.fn((body, init) => ({
            body,
            init,
            json: async () => typeof body === 'string' ? JSON.parse(body) : body
        })),
    },
}));


describe('Notification System Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('checkout.ts: placeOrder() triggers admin_new_order and customer_confirmation', async () => {
        const payload = {
            items: [{ variantId: 'variant-1', quantity: 1, title: 'Test Product', variantName: 'Default' }],
            userPhone: '1234567890',
            userEmail: 'test@example.com',
            deliveryZoneId: 'zone-1',
            deliveryAddress: 'Test Address',
            paymentMethod: 'cash',
            notes: 'Test Customer - Notes'
        };

        const result = await placeOrder(payload);

        // Debugging output if failing
        if (!result.success) {
            console.error('Test Result Error:', result.error);
        }

        expect(result).toHaveProperty('success', true);

        // VERIFY NOTIFICATIONS
        // We expect 2 calls. If not, print what we got.
        if (sendNotification.mock.calls.length !== 2) {
            console.log('sendNotification calls:', sendNotification.mock.calls);
        }
        expect(sendNotification).toHaveBeenCalledTimes(2);
        expect(sendNotification).toHaveBeenCalledWith('admin_new_order', expect.objectContaining({
            order_number: 'ORD-001',
            customer_name: 'Test Customer',
            user_email: 'test@example.com'
        }));
        expect(sendNotification).toHaveBeenCalledWith('customer_confirmation', expect.objectContaining({
            order_number: 'ORD-001',
            customer_name: 'Test Customer'
        }));
    });

    test('route.ts: Webhook triggers payment_received on charge.success', async () => {
        const body = JSON.stringify({
            event: 'charge.success',
            data: {
                metadata: { order_id: 'order-123' },
                reference: 'ref-123'
            }
        });

        const req = {
            text: jest.fn().mockResolvedValue(body),
            headers: {
                get: jest.fn().mockReturnValue('mock-hash')
            }
        } as unknown as Request;

        const res = await POST(req);
        const json = await res.json();

        expect(json).toEqual({ received: true });

        // Verify Notification
        expect(sendNotification).toHaveBeenCalledWith('payment_received', expect.objectContaining({
            order_number: 'ORD-webhook',
            total_amount: 500
        }));
    });
});

jest.mock('crypto', () => ({
    createHmac: jest.fn().mockReturnValue({
        update: jest.fn().mockReturnValue({
            digest: jest.fn().mockReturnValue('mock-hash')
        })
    })
}));
