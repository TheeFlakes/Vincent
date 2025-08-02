import { getAllCourses } from '$lib/admin-utils.js';

export async function load({ url }) {
    const page = parseInt(url.searchParams.get('page') || '1');
    const search = url.searchParams.get('search') || '';
    const isFree = url.searchParams.get('isFree') || '';
    
    // Build filter
    const filters = [];
    if (search) {
        filters.push(`(title ~ "${search}" || description ~ "${search}")`);
    }
    if (isFree === 'true') {
        filters.push('isFree = true');
    } else if (isFree === 'false') {
        filters.push('isFree = false');
    }
    
    const filter = filters.join(' && ');
    
    const courses = await getAllCourses(page, 20, filter, '-created');
    
    return {
        courses: courses.items,
        totalCourses: courses.totalItems,
        totalPages: courses.totalPages,
        currentPage: page,
        currentFilters: {
            search,
            isFree
        }
    };
}
