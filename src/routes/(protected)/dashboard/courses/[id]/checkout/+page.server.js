import { pb } from '$lib/pocketbase.js';
import { error } from '@sveltejs/kit';

export async function load({ params, locals }) {
    try {
        if (!locals.user) {
            throw error(401, 'Authentication required');
        }

        // Fetch the course
        const course = await pb.collection('courses').getOne(params.id, {
            requestKey: null
        });

        // Check if course is free
        if (course.isFree) {
            throw error(400, 'This course is free and does not require checkout');
        }

        // Check if user is already enrolled
        let isEnrolled = false;
        try {
            const enrollmentResult = await pb.collection('user_progress').getList(1, 1, {
                filter: `user = "${locals.user.id}" && course = "${params.id}"`,
                requestKey: null
            });
            isEnrolled = enrollmentResult.items.length > 0;
        } catch (err) {
            console.log('No enrollment found');
        }

        return {
            user: locals.user,
            course,
            isEnrolled
        };
    } catch (err) {
        console.error('Error loading checkout:', err);
        if (err.status) {
            throw err;
        }
        throw error(500, 'Failed to load checkout page');
    }
}
