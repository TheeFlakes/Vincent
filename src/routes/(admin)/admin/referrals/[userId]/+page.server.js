import { getUserReferralTree } from '$lib/admin-utils.js';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    const { userId } = params;
    
    try {
        const referralData = await getUserReferralTree(userId);
        
        if (!referralData.user) {
            throw error(404, 'User not found');
        }
        
        return {
            user: referralData.user,
            uplines: referralData.uplines,
            downlines: referralData.downlines
        };
    } catch (err) {
        console.error('Error loading referral tree:', err);
        throw error(500, 'Failed to load referral tree');
    }
}
