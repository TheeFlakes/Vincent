import { getAllSupportMessages } from '$lib/admin-utils.js';

export async function load({ url }) {
    const page = parseInt(url.searchParams.get('page') || '1');
    const status = url.searchParams.get('status') || '';
    
    // Build filter
    const filters = [];
    if (status) {
        filters.push(`status = "${status}"`);
    }
    
    const filter = filters.join(' && ');
    
    const messages = await getAllSupportMessages(page, 20, filter, '-created');
    
    return {
        messages: messages.items,
        totalMessages: messages.totalItems,
        totalPages: messages.totalPages,
        currentPage: page,
        currentFilters: {
            status
        }
    };
}
