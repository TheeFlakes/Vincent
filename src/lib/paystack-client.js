import { PUBLIC_PAYSTACK_PUBLIC_KEY } from '$env/static/public';

/**
 * Initialize Paystack checkout and redirect to payment
 * @param {string} courseId - The course ID
 * @param {number} amount - Amount in account's base currency
 * @param {string} email - User's email
 * @param {string|null} currency - Currency code (optional, defaults to account currency)
 */
export async function createPaystackCheckout(courseId, amount, email, currency = null) {
    try {
        // First, create a checkout session on the server
        const requestBody = {
            courseId,
            amount,
            email,
            ...(currency && { currency })
        };

        const response = await fetch('/api/paystack/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to create checkout session');
        }

        // Redirect to Paystack checkout
        if (data.authorization_url) {
            window.location.href = data.authorization_url;
        } else {
            throw new Error('No authorization URL received from Paystack');
        }

    } catch (error) {
        console.error('Paystack checkout error:', error);
        throw error;
    }
}

/**
 * Verify a Paystack transaction
 * @param {string} reference - Transaction reference
 */
export async function verifyPaystackTransaction(reference) {
    try {
        const response = await fetch(`/api/paystack/verify-transaction?reference=${reference}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to verify transaction');
        }

        return data;
    } catch (error) {
        console.error('Transaction verification error:', error);
        throw error;
    }
}
