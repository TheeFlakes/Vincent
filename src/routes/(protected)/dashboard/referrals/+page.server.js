import { pb } from '$lib/pocketbase.js';
import { getReferralStats } from '$lib/pocketbase-utils.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ locals }) {
    // Check if user is authenticated
    if (!locals.user) {
        throw redirect(302, '/login');
    }

    try {
        // Get referral statistics
        const referralStats = await getReferralStats(locals.user.id);
        
        return {
            user: locals.user,
            referralStats
        };
    } catch (err) {
        console.error('Error loading referral data:', err);
        throw error(500, 'Failed to load referral data');
    }
}
