import { pb } from '$lib/pocketbase.js';
import { error } from '@sveltejs/kit';

export async function load({ locals, url }) {
    try {
        // Get query parameters for filtering and sorting
        const searchQuery = url.searchParams.get('search') || '';
        const filterType = url.searchParams.get('filter') || 'all'; // all, free, paid
        const sortBy = url.searchParams.get('sort') || 'newest'; // newest, oldest, price-low, price-high

        // Build PocketBase filter conditions
        let filter = '';
        const filterConditions = [];

        // Search filter (full-text search across title and description)
        if (searchQuery.trim()) {
            filterConditions.push(`(title ~ "${searchQuery}" || description ~ "${searchQuery}")`);
        }

        // Payment type filter
        if (filterType === 'free') {
            filterConditions.push('isFree = true');
        } else if (filterType === 'paid') {
            filterConditions.push('isFree = false');
        }

        // Combine all filter conditions
        if (filterConditions.length > 0) {
            filter = filterConditions.join(' && ');
        }

        // Build sort parameter
        let sort = '';
        switch (sortBy) {
            case 'oldest':
                sort = 'created';
                break;
            case 'price-low':
                sort = 'price';
                break;
            case 'price-high':
                sort = '-price';
                break;
            case 'newest':
            default:
                sort = '-created';
                break;
        }

        // Fetch courses from PocketBase
        const coursesResult = await pb.collection('courses').getList(1, 50, {
            filter: filter,
            sort: sort,
            requestKey: null // Disable auto-cancellation for server-side requests
        });

        // Fetch user progress for enrolled courses if user is logged in
        let userProgressMap = {};
        if (locals.user && coursesResult.items.length > 0) {
            try {
                const courseIds = coursesResult.items.map(course => course.id);
                const progressResult = await pb.collection('user_progress').getList(1, 50, {
                    filter: `user = "${locals.user.id}" && course ~ "${courseIds.join('|')}"`,
                    requestKey: null
                });
                
                // Create a map of course ID to progress
                progressResult.items.forEach(progress => {
                    userProgressMap[progress.course] = progress;
                });
            } catch (err) {
                console.log('No progress found for user');
            }
        }

        // Add progress information to courses
        const coursesWithProgress = coursesResult.items.map(course => ({
            ...course,
            isEnrolled: !!userProgressMap[course.id],
            userProgress: userProgressMap[course.id] || null
        }));

        return {
            user: locals.user,
            courses: coursesWithProgress,
            totalCourses: coursesResult.totalItems,
            currentFilters: {
                search: searchQuery,
                filter: filterType,
                sort: sortBy
            }
        };
    } catch (err) {
        console.error('Error loading courses:', err);
        throw error(500, 'Failed to load courses');
    }
}
