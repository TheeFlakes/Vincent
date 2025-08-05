import Paystack from 'paystack';
import { PAYSTACK_SECRET_KEY } from '$env/static/private';

if (!PAYSTACK_SECRET_KEY) {
    throw new Error('PAYSTACK_SECRET_KEY is not set in environment variables');
}

export const paystack = Paystack(PAYSTACK_SECRET_KEY);
