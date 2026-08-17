import { placeOrder } from '@/app/actions/checkout';
import { POST } from '@/app/api/paystack/webhook/route';
import { sendNotification } from '@/lib/notification';

// --- MOCKS ---

// 0. Mock the store context/config (multi-store registry)
jest.mock('@/lib/stores/context', () => ({
    getCurrentStoreSlug: jest.fn().mockResolvedValue('derme'),
    getCurrentStore: jest.fn().mockResolvedValue({
        slug: 'derme',
        name: 'The Perfume Store Ghana',
        tagline: 'Luxury Fragrances',
        description: 'Test store',
        tableSuffix: '_perfume_store',
        bucketName: 'product-images-perfume-store',
        currency: 'GHS',
        currencyCode: 'GHS',
        theme: {},
    }),
    getCurrentTables: jest.fn().mockResolvedValue({
        categories: 'categories_perfume_store',
        products: 'products_perfume_store',
        productVariants: 'product_variants_perfume_store',
        inventory: 'inventory_master_perfume_store',
        orders: 'orders_perfume_store',
        orderItems: 'order_items_perfume_store',
        payments: 'payments_perfume_store',
        storeSettings: 'store_settings_perfume_store',
        deliveryZones: 'delivery_zones_perfume_store',
        taxes: 'taxes_perfume_store',
        notificationTemplates: 'notification_templates_perfume_store',
        posts: 'posts_perfume_store',
        campaigns: 'marketing_campaigns_perfume_store',
        reviews: 'product_reviews_perfume_store',
        smsLogs: 'sms_logs_perfume_store',
        profiles: 'profiles_perfume_store',
    }),
}));

jest.mock('@/lib/stores/config', () => ({
    getStore: (slug: string) => ({
        slug: slug || 'derme',
        name: 'The Perfume Store Ghana',
        tagline: 'Luxury Fragrances',
        description: 'Test store',
        tableSuffix: '_perfume_store',
        bucketName: 'product-images-perfume-store',
        currency: 'GHS',
        currencyCode: 'GHS',
        theme: {},
    }),
    getStoreOrNull: (slug: string) => slug ? ({
        slug,
        name: 'The Perfume Store Ghana',
        tagline: 'Luxury Fragrances',
        description: 'Test store',
        tableSuffix: '_perfume_store',
        bucketName: 'product-images-perfume-store',
        currency: 'GHS',
        currencyCode: 'GHS',
        theme: {},
    }) : null,
    getTables: (slug: string) => ({
        categories: 'categories_perfume_store',
        products: 'products_perfume_store',
        productVariants: 'product_variants_perfume_store',
        inventory: 'inventory_master_perfume_store',
        orders: 'orders_perfume_store',
        orderItems: 'order_items_perfume_store',
        payments: 'payments_perfume_store',
        storeSettings: 'store_settings_perfume_store',
        deliveryZones: 'delivery_zones_perfume_store',
        taxes: 'taxes_perfume_store',
        notificationTemplates: 'notification_templates_perfume_store',
        posts: 'posts_perfume_store',
        campaigns: 'marketing_campaigns_perfume_store',
        reviews: 'product_reviews_perfume_store',
        smsLogs: 'sms_logs_perfume_store',
        profiles: 'profiles_perfume_store',
    }),
    STORES: {
        derme: { slug: 'derme', tableSuffix: '_perfume_store' },
        'play-time': { slug: 'play-time', tableSuffix: '_toy_shop' },
    },
    storeSlugs: ['derme', 'play-time'],
    STORE_COOKIE: 'jarayel_store',
}));

jest.mock('next/headers', () => ({
    cookies: jest.fn().mockResolvedValue({
        get: jest.fn().mockReturnValue({ value: 'derme' }),
    }),
}));

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

            const resolveData = (data: any, error: any = null) => {
                return Promise.resolve({ data, error });
            };

            // Default responses
            let responseData: any = [];
            if (table === 'product_variants_perfume_store') {
                responseData = [{
                    id: 'variant-1',
                    stock_deduction: 1,
                    master_stock_id: 'master-1',
                    price: 100,
                    inventory: { id: 'master-1', current_stock_level: 100 },
                    product: { is_featured: false, discount_percent: 0 }
                }];
            } else if (table === 'orders_perfume_store') {
                responseData = { id: 'order-123', order_number: 'ORD-001' };
            } else if (table === 'store_settings_perfume_store') {
                responseData = { bulk_threshold: 10, bulk_surcharge: 5 };
            } else if (table === 'delivery_zones_perfume_store') {
                responseData = { base_price: 10 };
            }

            mockChain.then = (resolve: any) => resolveData(responseData).then(resolve);

            mockChain.single = jest.fn().mockImplementation(() => {
                // single() returns a promise-like that resolves to ONE item
                return { data: Array.isArray(responseData) ? responseData[0] : responseData, error: null };
            });

            return mockChain;
        }),
    }),
}));

// 2. Mock Supabase Client (for webhook)
jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
            update: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            insert: jest.fn().mockResolvedValue({ data: null, error: null }),
            // .select('id') resolves the update result (array of updated rows)
            select: jest.fn().mockImplementation((cols: string) =>
                cols === 'id'
                    ? Promise.resolve({ data: [{ id: 'order-123' }], error: null })
                    : ({
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
            )
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
    formatPhoneForGH: jest.fn(val => val),
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

jest.mock('crypto', () => ({
    createHmac: jest.fn().mockReturnValue({
        update: jest.fn().mockReturnValue({
            digest: jest.fn().mockReturnValue('mock-hash')
        })
    })
}));

// 6. Mock the order_data sent to notifications for objectContaining checks
interface OrderData {
    order_number: string;
    customer_name: string;
    user_email: string;
}

const castNotification = sendNotification as unknown as jest.Mock;

describe('Notification System Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('checkout.ts: placeOrder() triggers new_order_admin and new_order_customer for manual payment', async () => {
        const payload = {
            items: [{
                variantId: 'variant-1',
                quantity: 1,
                title: 'Test Product',
                variantName: 'Default',
                price: 100,
                productId: 'product-1',
                image: '',
                stockDeduction: 1,
                masterStockTotal: 100
            }],
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
        if (castNotification.mock.calls.length !== 2) {
            console.log('sendNotification calls:', castNotification.mock.calls);
        }
        expect(castNotification).toHaveBeenCalledTimes(2);
        expect(castNotification).toHaveBeenCalledWith('new_order_admin', expect.objectContaining({
            order_number: 'ORD-001',
            customer_name: 'Test Customer',
            user_email: 'test@example.com'
        }));
        expect(castNotification).toHaveBeenCalledWith('new_order_customer', expect.objectContaining({
            order_number: 'ORD-001',
            customer_name: 'Test Customer'
        }));
    });

    test('checkout.ts: placeOrder() does NOT send notifications for paystack at checkout', async () => {
        const payload = {
            items: [{
                variantId: 'variant-1',
                quantity: 1,
                title: 'Test Product',
                variantName: 'Default',
                price: 100,
                productId: 'product-1',
                image: '',
                stockDeduction: 1,
                masterStockTotal: 100
            }],
            userPhone: '1234567890',
            userEmail: 'test@example.com',
            deliveryZoneId: null,
            deliveryAddress: '',
            paymentMethod: 'paystack',
            notes: 'Test Customer - Notes'
        };

        const result = await placeOrder(payload);

        expect(result).toHaveProperty('success', true);
        // Paystack: notifications must wait for payment confirmation
        expect(castNotification).not.toHaveBeenCalled();
    });

    test('route.ts: Webhook triggers new_order_admin and new_order_customer on charge.success', async () => {
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

        // Verify Notifications (webhook sends the standard new-order alerts since
        // they were skipped at checkout)
        expect(castNotification).toHaveBeenCalledWith('new_order_admin', expect.objectContaining({
            order_number: 'ORD-webhook',
            total_amount: 500
        }), 'derme');
        expect(castNotification).toHaveBeenCalledWith('new_order_customer', expect.objectContaining({
            order_number: 'ORD-webhook',
            total_amount: 500
        }), 'derme');
    });
});
