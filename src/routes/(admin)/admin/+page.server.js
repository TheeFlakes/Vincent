import { getDashboardStats, getAnalyticsData } from '$lib/admin-utils.js';

export async function load({ locals }) {
    const [stats, analytics] = await Promise.all([
        getDashboardStats(),
        getAnalyticsData()
    ]);
    
    return {
        stats,
        analytics
    };
}
