import { fail, redirect } from '@sveltejs/kit';
import { createServerPB } from '$lib/pocketbase.js';

export const actions = {
    default: async ({ request, cookies }) => {
        const pb = createServerPB();
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
            
            // Add timeout to prevent hanging requests
            const authPromise = pb.collection('users').authWithPassword(email, password);
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Authentication timeout')), 10000)
            );
            
            const authData = await Promise.race([authPromise, timeoutPromise]);
            console.log('Authentication successful, user:', authData.record.email);
            
            // Ensure auth store is properly set
            if (!pb.authStore.isValid) {
                console.error('Auth store is not valid after authentication');
                throw new Error('Authentication failed - invalid auth store');
            }
            
            // Wait a bit to ensure auth state is stable
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Set the auth cookie with proper serialization
            const authCookie = pb.authStore.exportToCookie();
            const cookieValue = authCookie.split('=')[1];
            
            console.log('Setting auth cookie...');
            cookies.set('pb_auth', cookieValue, {
                secure: process.env.NODE_ENV === 'production', // Secure in production
                httpOnly: false, // PocketBase needs access from client-side
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7, // 1 week
                path: '/',
                domain: '' // Leave empty to use the current domain
            });
            
            // Also store in localStorage as a fallback
            if (typeof window !== 'undefined') {
                localStorage.setItem('pocketbase_auth', pb.authStore.exportToCookie());
            }

            console.log('Redirecting to dashboard...');
            // Redirect to dashboard on successful login
            throw redirect(303, '/dashboard');
            
        } catch (error) {
            console.error('Login error:', error);
            
            // Handle specific PocketBase errors
            let errorMessage = 'Login failed';
            
            if (error && typeof error === 'object') {
                // Handle redirect errors (these are actually success cases)
                if ('status' in error && error.status === 303) {
                    throw error; // Re-throw redirect
                }
                if ('location' in error) {
                    throw error; // Re-throw redirect
                }
                
                if ('status' in error) {
                    if (error.status === 400) {
                        errorMessage = 'Invalid email or password';
                    } else if (error.status === 0) {
                        errorMessage = 'Service temporarily unavailable. Please try again later.';
                    } else if (error.status === 404) {
                        errorMessage = 'Service temporarily unavailable. Please try again later.';
                    }
                }
                
                // Handle network errors
                if ('message' in error && typeof error.message === 'string') {
                    if (error.message.includes('fetch')) {
                        errorMessage = 'Service temporarily unavailable. Please try again later.';
                    } else if (error.message.includes('Failed to authenticate')) {
                        errorMessage = 'Invalid email or password';
                    } else if (error.message.includes('timeout')) {
                        errorMessage = 'Request timed out. Please try again.';
                    }
                }
            }
            
            return fail(400, {
                error: errorMessage,
                email
            });
        }
    }
};
