import { fail, redirect } from '@sveltejs/kit';
import { pb } from '$lib/pocketbase.js';

export const actions = {
    default: async ({ request, cookies }) => {
        const data = await request.formData();
        const email = data.get('email')?.toString();
        const password = data.get('password')?.toString();

        console.log('Login attempt for email:', email);

        if (!email || !password) {
            return fail(400, {
                error: 'Email and password are required',
                email
            });
        }

        try {
            // Authenticate with PocketBase
            console.log('Attempting to authenticate with PocketBase...');
            const authData = await pb.collection('users').authWithPassword(email, password);
            console.log('Authentication successful, user:', authData.record.email);
            
            // Set the auth cookie
            const authCookie = pb.authStore.exportToCookie();
            const cookieValue = authCookie.split('=')[1];
            
            console.log('Setting auth cookie...');
            cookies.set('pb_auth', cookieValue, {
                secure: false, // Set to true in production with HTTPS
                httpOnly: false, // PocketBase needs access from client-side
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7, // 1 week
                path: '/'
            });

            console.log('Redirecting to dashboard...');
            // Redirect to dashboard on successful login
            throw redirect(303, '/dashboard');
            
        } catch (error) {
            console.error('Login error:', error);
            
            // Handle specific PocketBase errors
            let errorMessage = 'Login failed';
            
            if (error && typeof error === 'object' && 'status' in error) {
                if (error.status === 400) {
                    errorMessage = 'Invalid email or password';
                } else if (error.status === 0) {
                    errorMessage = 'Unable to connect to server. Please make sure PocketBase is running.';
                }
            }
            
            // Handle network errors
            if (error && typeof error === 'object' && 'message' in error && 
                typeof error.message === 'string' && error.message.includes('fetch')) {
                errorMessage = 'Unable to connect to server. Please make sure PocketBase is running.';
            }
            
            return fail(400, {
                error: errorMessage,
                email
            });
        }
    }
};
