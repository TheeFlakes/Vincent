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

        // Optionally create a payment record
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
        
        // You can implement logic here to handle abandoned carts
        // For example, send an email reminder or analytics tracking
        
        const { courseId, userId } = session.metadata;
        
        if (courseId && userId) {
            // Log the abandoned cart for analytics
            console.log('Cart abandoned for user:', userId, 'course:', courseId);
            
            // You could send an email reminder here
            // await sendAbandonedCartEmail(userId, courseId);
        }

    } catch (error) {
        console.error('Error handling expired checkout session:', error);
    }
}
