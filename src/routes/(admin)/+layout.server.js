import { pb } from '$lib/pocketbase.js';
import { isAdmin } from '$lib/admin-utils.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ locals }) {
    // Check if user is authenticated
    if (!locals.user) {
        throw redirect(303, '/login');
    }

    // Check if user is admin
    if (!isAdmin(locals.user)) {
        throw redirect(303, '/dashboard');
    }

    return {
        user: locals.user
    };
}
