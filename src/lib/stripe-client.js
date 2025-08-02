import { loadStripe } from '@stripe/stripe-js';
import { PUBLIC_STRIPE_PUBLISHABLE_KEY } from '$env/static/public';

/** @type {Promise<import('@stripe/stripe-js').Stripe | null> | null} */
let stripePromise = null;

export function getStripe() {
    if (!stripePromise) {
        stripePromise = loadStripe(PUBLIC_STRIPE_PUBLISHABLE_KEY);
    }
    return stripePromise;
}

/**
 * Create a checkout session and redirect to Stripe
 * @param {string} courseId - The course ID
 * @param {string} mode - 'payment' for one-time, 'subscription' for recurring
 * @param {string | null} priceId - Optional Stripe price ID
 */
export async function createCheckoutSession(courseId, mode = 'payment', priceId = null) {
    try {
        const response = await fetch('/api/stripe/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                courseId,
                mode,
                priceId
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to create checkout session');
        }

        const stripe = await getStripe();
        if (!stripe) {
            throw new Error('Stripe failed to load');
        }

        // Redirect to Stripe Checkout
        const { error } = await stripe.redirectToCheckout({
            sessionId: data.sessionId
        });

        if (error) {
            throw new Error(error.message);
        }

    } catch (error) {
        console.error('Checkout error:', error);
        throw error;
    }
}
