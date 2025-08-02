import { json } from '@sveltejs/kit';
import { stripe } from '$lib/stripe.js';

export async function GET({ url, locals }) {
    try {
        const sessionId = url.searchParams.get('session_id');
        
        if (!sessionId) {
            return json({ error: 'No session ID provided' }, { status: 400 });
        }

        if (!locals.user) {
            return json({ error: 'Authentication required' }, { status: 401 });
        }

        // Retrieve the checkout session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (!session) {
            return json({ error: 'Session not found' }, { status: 404 });
        }

        // Verify the session belongs to the current user
        if (!session.metadata || session.metadata.userId !== locals.user.id) {
            return json({ error: 'Unauthorized' }, { status: 403 });
        }

        return json({
            session: {
                id: session.id,
                status: session.payment_status,
                amount_total: session.amount_total,
                currency: session.currency,
                metadata: session.metadata
            }
        });

    } catch (error) {
        console.error('Session verification error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to verify session';
        return json({ error: errorMessage }, { status: 500 });
    }
}
