import { pb } from '$lib/pocketbase.js';

export async function load({ locals, url }) {
    // Use user from locals (set in hooks)
    const user = locals.user;
    
    return {
        user,
        url: url.pathname
    };
}
