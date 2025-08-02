import { getAllUsers } from '$lib/admin-utils.js';

export async function load({ url }) {
    const page = parseInt(url.searchParams.get('page') || '1');
    
    // Get users with referral data
    const users = await getAllUsers(page, 20, '', '-created');
    
    // Calculate referral stats for each user
    const usersWithStats = [];
    
    for (const user of users.items) {
        try {
            // Get direct referrals count
            const referrals = await getAllUsers(1, 100, `referredBy = "${user.id}"`);
            usersWithStats.push({
                ...user,
                directReferrals: referrals.totalItems
            });
        } catch (error) {
            usersWithStats.push({
                ...user,
                directReferrals: 0
            });
        }
    }
    
    return {
        users: usersWithStats,
        totalUsers: users.totalItems,
        totalPages: users.totalPages,
        currentPage: page
    };
}
