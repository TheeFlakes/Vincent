import { redirect } from '@sveltejs/kit';
import { createServerPB } from '$lib/pocketbase.js';

export async function handle({ event, resolve }) {
    // Create a fresh PocketBase instance for this request
    const pb = createServerPB();
    
    // Get the auth token from cookies if available
    const authCookie = event.cookies.get('pb_auth');
    if (authCookie) {
        try {
            // Load auth from cookie
            pb.authStore.loadFromCookie(`pb_auth=${authCookie}`);
            
            // Only verify if we have a valid token structure
            if (pb.authStore.isValid && pb.authStore.token) {
                try {
                    // Try to refresh the auth to make sure it's still valid
                    await pb.collection('users').authRefresh();
                } catch (refreshError) {
                    console.log('Auth refresh failed, clearing invalid auth:', refreshError);
                    pb.authStore.clear();
                    event.cookies.delete('pb_auth', { path: '/' });
                }
            }
        } catch (error) {
            console.error('Error loading auth cookie:', error);
            // Clear invalid cookie
            pb.authStore.clear();
            event.cookies.delete('pb_auth', { path: '/' });
        }
    } else {
        // No cookie found, ensure auth store is clear
        pb.authStore.clear();
    }

    // Define protected routes
    const protectedRoutes = ['/dashboard'];
    const authRoutes = ['/login', '/signup'];
    
    const isProtectedRoute = protectedRoutes.some(route => 
        event.url.pathname.startsWith(route)
    );
    
    const isAuthRoute = authRoutes.some(route => 
        event.url.pathname.startsWith(route)
    );

    // Check if user is authenticated
    const isAuthenticated = pb.authStore.isValid;

    // Redirect logic
    if (isProtectedRoute && !isAuthenticated) {
        // Redirect to login if trying to access protected route without auth
        throw redirect(303, '/login');
    }

    if (isAuthRoute && isAuthenticated) {
        // Redirect to dashboard if already authenticated and trying to access auth pages
        throw redirect(303, '/dashboard');
    }

    // Store auth data in locals for use in load functions
    event.locals.user = pb.authStore.model;
    event.locals.pb = pb;

    // Handle cookie management BEFORE resolving the response
    if (pb.authStore.isValid) {
        try {
            const authCookieData = pb.authStore.exportToCookie();
            const cookieValue = authCookieData.split('=')[1];
            event.cookies.set('pb_auth', cookieValue, {
                secure: false, // Set to true in production with HTTPS
                httpOnly: false, // PocketBase needs access from client-side
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7, // 1 week
                path: '/'
            });
        } catch (error) {
            console.error('Error setting auth cookie:', error);
        }
    } else {
        // Clear auth cookie if not authenticated
        try {
            event.cookies.delete('pb_auth', { path: '/' });
        } catch (error) {
            // Ignore cookie deletion errors
        }
    }

    const response = await resolve(event);

    return response;
}
