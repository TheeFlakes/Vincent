import { getDashboardStats } from '$lib/admin-utils.js';
import { json } from '@sveltejs/kit';

export async function GET() {
    try {
        const stats = await getDashboardStats();
        return json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        return json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
