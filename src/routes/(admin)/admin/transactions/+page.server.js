import { getAllTransactions } from '$lib/admin-utils.js';

export async function load({ url }) {
    const page = parseInt(url.searchParams.get('page') || '1');
    const status = url.searchParams.get('status') || '';
    const search = url.searchParams.get('search') || '';
    
    // Build filter
    const filters = [];
    if (status) {
        filters.push(`status = "${status}"`);
    }
    if (search) {
        filters.push(`(expand.user.email ~ "${search}" || expand.course.title ~ "${search}")`);
    }
    
    const filter = filters.join(' && ');
    
    const transactions = await getAllTransactions(page, 20, filter, '-created');
    
    return {
        transactions: transactions.items,
        totalTransactions: transactions.totalItems,
        totalPages: transactions.totalPages,
        currentPage: page,
        currentFilters: {
            status,
            search
        }
    };
}
