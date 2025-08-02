import { pb } from '$lib/pocketbase.js';
import { error } from '@sveltejs/kit';

export async function load({ params, locals }) {
    try {
        // Fetch the specific course
        const course = await pb.collection('courses').getOne(params.id, {
            requestKey: null // Disable auto-cancellation for server-side requests
        });

        // Fetch course lessons
        const lessonsResult = await pb.collection('course_lessons').getList(1, 50, {
            filter: `module = "${params.id}"`,
            sort: 'order',
            requestKey: null
        });

        // Check if user is enrolled (has progress record)
        let userProgress = null;
        let isEnrolled = false;
        
        if (locals.user) {
            try {
                const progressResult = await pb.collection('user_progress').getList(1, 1, {
                    filter: `user = "${locals.user.id}" && course = "${params.id}"`,
                    requestKey: null
                });
                
                if (progressResult.items.length > 0) {
                    userProgress = progressResult.items[0];
                    isEnrolled = true;
                }
            } catch (err) {
                console.log('No enrollment found');
            }
        }

        return {
            user: locals.user,
            course: course,
            lessons: lessonsResult.items,
            totalLessons: lessonsResult.totalItems,
            userProgress,
            isEnrolled
        };
    } catch (err) {
        console.error('Error loading course:', err);
        throw error(404, 'Course not found');
    }
}
