import { json } from '@sveltejs/kit';
import { paystack } from '$lib/paystack.js';
import { pb } from '$lib/pocketbase.js';
import crypto from 'crypto';

const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET || '';

export async function POST({ request }) {
    try {
        const body = await request.text();
        const signature = request.headers.get('x-paystack-signature');

        if (!signature) {
            return json({ error: 'No signature' }, { status: 400 });
        }

        if (!PAYSTACK_WEBHOOK_SECRET) {
            console.error('PAYSTACK_WEBHOOK_SECRET not configured');
            return json({ error: 'Webhook secret not configured' }, { status: 500 });
        }

        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac('sha512', PAYSTACK_WEBHOOK_SECRET)
            .update(body)
            .digest('hex');

        if (signature !== expectedSignature) {
            console.error('Webhook signature verification failed');
            return json({ error: 'Invalid signature' }, { status: 400 });
        }

        const event = JSON.parse(body);

        // Handle the event
        switch (event.event) {
            case 'charge.success':
                await handleChargeSuccess(event.data);
                break;

            case 'charge.failed':
                await handleChargeFailed(event.data);
                break;

            case 'transfer.success':
                // Handle successful transfers (for affiliate commissions, etc.)
                console.log('Transfer successful:', event.data.reference);
                break;

            case 'transfer.failed':
                // Handle failed transfers
                console.log('Transfer failed:', event.data.reference);
                break;

            default:
                console.log(`Unhandled event type: ${event.event}`);
        }

        return json({ received: true });

    } catch (error) {
        console.error('Webhook error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Webhook processing failed';
        return json({ error: errorMessage }, { status: 500 });
    }
}

/**
 * Handle successful charge
 * @param {any} charge
 */
async function handleChargeSuccess(charge) {
    try {
        console.log('Processing successful charge:', charge.reference);

        const { courseId, userId } = charge.metadata;

        if (!courseId || !userId) {
            console.error('Missing metadata in charge:', charge.metadata);
            return;
        }

        // Check if enrollment already exists
        try {
            const existingEnrollment = await pb.collection('user_progress').getList(1, 1, {
                filter: `user = "${userId}" && course = "${courseId}"`
            });

            if (existingEnrollment.items.length > 0) {
                console.log('Enrollment already exists for user:', userId, 'course:', courseId);
                // Still update transaction status
                await updateTransactionStatus(charge.reference, 'paid', charge);
                return;
            }
        } catch (err) {
            // No existing enrollment, continue
        }

        // Create enrollment record
        await pb.collection('user_progress').create({
            user: userId,
            course: courseId,
            completed_lessons: [],
            current_lesson: null,
            completion_percentage: 0,
            last_accessed: new Date().toISOString(),
            payment_status: 'paid',
            paystack_reference: charge.reference,
            payment_gateway: 'paystack'
        });

        // Update transaction record
        await updateTransactionStatus(charge.reference, 'paid', charge);

        console.log('Successfully enrolled user:', userId, 'in course:', courseId);

    } catch (error) {
        console.error('Error handling successful charge:', error);
    }
}

/**
 * Handle failed charge
 * @param {any} charge
 */
async function handleChargeFailed(charge) {
    try {
        console.log('Processing failed charge:', charge.reference);
        
        // Update transaction status to failed
        await updateTransactionStatus(charge.reference, 'failed', charge);

    } catch (error) {
        console.error('Error handling failed charge:', error);
    }
}

/**
 * Update transaction status
 * @param {string} reference - Paystack reference
 * @param {string} status - New status ('pending', 'paid', 'failed')
 * @param {any} charge - Charge data from Paystack
 */
async function updateTransactionStatus(reference, status, charge = null) {
    try {
        // Find transaction by Paystack reference
        const existingTransactions = await pb.collection('transactions').getList(1, 1, {
            filter: `paystack_reference = "${reference}"`
        });

        if (existingTransactions.items.length > 0) {
            const updateData = {
                status,
                updated: new Date().toISOString(),
                ...(charge && {
                    paystack_charge_id: charge.id,
                    gateway_response: charge.gateway_response,
                    paid_at: charge.paid_at,
                    // Update stripe fields with Paystack data for compatibility
                    stripe_payment_intent: charge.id || reference
                })
            };

            await pb.collection('transactions').update(existingTransactions.items[0].id, updateData);
            console.log('Updated transaction status to', status, 'for reference:', reference);
        } else {
            console.warn('No transaction found with reference:', reference);
        }
    } catch (err) {
        console.error('Could not update transaction status:', err);
    }
}
