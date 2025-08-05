import { json } from '@sveltejs/kit';
import { paystack } from '$lib/paystack.js';

export async function GET({ url, locals }) {
    try {
        const reference = url.searchParams.get('reference');
        
        if (!reference) {
            return json({ error: 'No transaction reference provided' }, { status: 400 });
        }

        if (!locals.user) {
            return json({ error: 'Authentication required' }, { status: 401 });
        }

        // Verify the transaction with Paystack
        const verification = await paystack.transaction.verify(reference);

        if (!verification.status) {
            return json({ error: verification.message || 'Transaction verification failed' }, { status: 400 });
        }

        const transactionData = verification.data;

        // Verify the transaction belongs to the current user
        if (!transactionData.metadata || transactionData.metadata.userId !== locals.user.id) {
            return json({ error: 'Unauthorized' }, { status: 403 });
        }

        return json({
            transaction: {
                reference: transactionData.reference,
                amount: transactionData.amount / 100, // Convert from kobo back to main currency
                currency: transactionData.currency,
                status: transactionData.status,
                gateway_response: transactionData.gateway_response,
                paid_at: transactionData.paid_at,
                metadata: transactionData.metadata
            }
        });

    } catch (error) {
        console.error('Transaction verification error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to verify transaction';
        return json({ error: errorMessage }, { status: 500 });
    }
}
