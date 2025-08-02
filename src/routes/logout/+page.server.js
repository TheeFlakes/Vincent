import { redirect } from '@sveltejs/kit';
import { logout } from '$lib/auth.js';

export const actions = {
    default: async ({ cookies }) => {
        // Clear the auth cookie
        cookies.delete('pb_auth', { path: '/' });
        
        // Call logout function to clear PocketBase auth store
        logout();
        
        throw redirect(303, '/login');
    }
};

export async function load({ cookies }) {
    // If someone visits /logout directly, also log them out
    cookies.delete('pb_auth', { path: '/' });
    logout();
    throw redirect(303, '/login');
}
