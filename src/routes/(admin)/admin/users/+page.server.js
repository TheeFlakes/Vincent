import { getAllUsers } from '$lib/admin-utils.js';

export async function load({ url }) {
    const page = parseInt(url.searchParams.get('page') || '1');
    const search = url.searchParams.get('search') || '';
    const role = url.searchParams.get('role') || '';
    
    // Build filter
    const filters = [];
    if (search) {
        filters.push(`(name ~ "${search}" || email ~ "${search}")`);
    }
    if (role) {
        filters.push(`role = "${role}"`);
    }
    
    const filter = filters.join(' && ');
    
    const users = await getAllUsers(page, 20, filter, '-created');
    
    return {
        users: users.items,
        totalUsers: users.totalItems,
        totalPages: users.totalPages,
        currentPage: page,
        currentFilters: {
            search,
            role
        }
    };
}
