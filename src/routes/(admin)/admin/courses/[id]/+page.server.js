import { pb } from '$lib/pocketbase.js';
import { getCourseLesson } from '$lib/admin-utils.js';
import { redirect } from '@sveltejs/kit';

export async function load({ params, locals }) {
    if (!locals.user || locals.user.role !== 'admin') {
        throw redirect(303, '/login');
    }

    try {
        // Get course details
        const course = await pb.collection('courses').getOne(params.id);
        
        // Get course lessons
        const lessons = await getCourseLesson(params.id);

        return {
            course,
            lessons
        };
    } catch (error) {
        console.error('Error loading course details:', error);
        throw redirect(303, '/admin/courses');
    }
}
