import { getAnalyticsData } from '$lib/admin-utils.js';
import { json } from '@sveltejs/kit';

export async function GET({ locals }) {
    try {
        if (!locals.user || locals.user.role !== 'admin') {
            return json({ error: 'Unauthorized' }, { status: 401 });
        }

        const analyticsData = await getAnalyticsData();
        return json(analyticsData);
    } catch (error) {
        console.error('Error fetching analytics data:', error);
        return json({ error: 'Failed to fetch analytics data' }, { status: 500 });
    }
}
