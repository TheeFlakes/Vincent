import { fail, redirect } from '@sveltejs/kit';
import { signup } from '$lib/auth.js';

export const actions = {
    default: async ({ request }) => {
        const data = await request.formData();
        const name = data.get('name')?.toString();
        const email = data.get('email')?.toString();
        const password = data.get('password')?.toString();
        const passwordConfirm = data.get('passwordConfirm')?.toString();
        const referralCode = data.get('referralCode')?.toString();

        if (!name || !email || !password || !passwordConfirm || !referralCode) {
            return fail(400, {
                error: 'All fields are required, including referral code',
                name,
                email,
                referralCode
            });
        }

        // Validate referral code format (basic validation)
        if (referralCode.trim().length < 3) {
            return fail(400, {
                error: 'Referral code must be at least 3 characters long',
                name,
                email,
                referralCode
            });
        }

        if (password !== passwordConfirm) {
            return fail(400, {
                error: 'Passwords do not match',
                name,
                email,
                referralCode
            });
        }

        if (password.length < 8) {
            return fail(400, {
                error: 'Password must be at least 8 characters long',
                name,
                email,
                referralCode
            });
        }

        const userData = {
            name,
            email,
            password,
            passwordConfirm,
            referralCode: referralCode.trim()
        };

        const result = await signup(userData);
        
        if (!result.success) {
            return fail(400, {
                error: result.error,
                name,
                email,
                referralCode
            });
        }

        // On successful signup, redirect to dashboard
        // Note: Email verification request has been sent automatically
        throw redirect(303, '/dashboard');
    }
};
