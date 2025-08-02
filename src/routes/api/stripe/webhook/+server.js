import { json } from '@sveltejs/kit';
import { stripe } from '$lib/stripe.js';
import { pb } from '$lib/pocketbase.js';

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST({ request }) {
    try {
        const body = await request.text();
        const signature = request.headers.get('stripe-signature');

        if (!signature) {
            return json({ error: 'No signature' }, { status: 400 });
        }

        if (!STRIPE_WEBHOOK_SECRET) {
            console.error('STRIPE_WEBHOOK_SECRET not configured');
            return json({ error: 'Webhook secret not configured' }, { status: 500 });
        }

        let event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            console.error('Webhook signature verification failed:', err);
            return json({ error: 'Invalid signature' }, { status: 400 });
        }

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                await handleCheckoutSessionCompleted(session);
                break;

            case 'checkout.session.expired':
                const expiredSession = event.data.object;
                await handleCheckoutSessionExpired(expiredSession);
                break;

            case 'payment_intent.payment_failed':
                const failedPayment = event.data.object;
                await handlePaymentFailed(failedPayment);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return json({ received: true });

    } catch (error) {
        console.error('Webhook error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Webhook processing failed';
        return json({ error: errorMessage }, { status: 500 });
    }
}

/**
 * @param {any} session
 */
async function handleCheckoutSessionCompleted(session) {
    try {
        console.log('Processing completed checkout session:', session.id);

        const { courseId, userId } = session.metadata;

        if (!courseId || !userId) {
            console.error('Missing metadata in session:', session.metadata);
            return;
        }

        // Check if enrollment already exists
        try {
            const existingEnrollment = await pb.collection('user_progress').getList(1, 1, {
                filter: `user = "${userId}" && course = "${courseId}"`
            });

            if (existingEnrollment.items.length > 0) {
                console.log('Enrollment already exists for user:', userId, 'course:', courseId);
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
            payment_status: 'completed',
            stripe_session_id: session.id,
            payment_intent_id: session.payment_intent
        });

        // Create transaction record with the requested format
        try {
            // First try to find existing pending transaction
            const existingTransactions = await pb.collection('transactions').getList(1, 1, {
                filter: `user = "${userId}" && course = "${courseId}" && stripe_session_id = "${session.id}"`
            });

            if (existingTransactions.items.length > 0) {
                // Update existing transaction
                await pb.collection('transactions').update(existingTransactions.items[0].id, {
                    stripe_payment_intent: session.payment_intent,
                    status: 'completed'
                });
            } else {
                // Create new transaction if none exists
                await pb.collection('transactions').create({
                    user: userId,
                    course: courseId,
                    amount: session.amount_total / 100, // Convert from cents to dollars
                    currency: session.currency,
                    stripe_session_id: session.id,
                    stripe_payment_intent: session.payment_intent,
                    status: 'completed'
                });
            }
        } catch (err) {
            console.error('Could not create/update transaction record:', err);
            // Don't fail the enrollment if transaction record creation fails
        }

        // Optionally create a payment record (keeping for backward compatibility)
        await pb.collection('payments').create({
            user: userId,
            course: courseId,
            amount: session.amount_total / 100, // Convert from cents
            currency: session.currency,
            status: 'completed',
            stripe_session_id: session.id,
            payment_intent_id: session.payment_intent,
            payment_method: session.payment_method_types[0] || 'card',
            created_at: new Date().toISOString()
        }).catch(err => {
            // Payments collection might not exist, log but don't fail
            console.log('Could not create payment record (collection might not exist):', err.message);
        });

        console.log('Successfully enrolled user:', userId, 'in course:', courseId);

    } catch (error) {
        console.error('Error handling completed checkout session:', error);
        throw error;
    }
}

/**
 * @param {any} session
 */
async function handleCheckoutSessionExpired(session) {
    try {
        console.log('Processing expired checkout session:', session.id);
        
        const { courseId, userId } = session.metadata;
        
        if (courseId && userId) {
            // Update transaction status to expired/failed
            try {
                const existingTransactions = await pb.collection('transactions').getList(1, 1, {
                    filter: `user = "${userId}" && course = "${courseId}" && stripe_session_id = "${session.id}"`
                });

                if (existingTransactions.items.length > 0) {
                    await pb.collection('transactions').update(existingTransactions.items[0].id, {
                        status: 'expired'
                    });
                    console.log('Updated transaction status to expired for session:', session.id);
                }
            } catch (err) {
                console.error('Could not update transaction status:', err);
            }
            
            // Log the abandoned cart for analytics
            console.log('Cart abandoned for user:', userId, 'course:', courseId);
            
            // You could send an email reminder here
            // await sendAbandonedCartEmail(userId, courseId);
        }

    } catch (error) {
        console.error('Error handling expired checkout session:', error);
    }
}

/**
 * @param {any} paymentIntent
 */
async function handlePaymentFailed(paymentIntent) {
    try {
        console.log('Processing failed payment:', paymentIntent.id);
        
        // Try to find transaction by payment intent and update status
        try {
            const existingTransactions = await pb.collection('transactions').getList(1, 50, {
                filter: `stripe_payment_intent = "${paymentIntent.id}"`
            });

            for (const transaction of existingTransactions.items) {
                await pb.collection('transactions').update(transaction.id, {
                    status: 'failed'
                });
                console.log('Updated transaction status to failed for payment intent:', paymentIntent.id);
            }
        } catch (err) {
            console.error('Could not update transaction status for failed payment:', err);
        }

    } catch (error) {
        console.error('Error handling failed payment:', error);
    }
}
