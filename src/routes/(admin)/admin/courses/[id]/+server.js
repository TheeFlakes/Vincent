import { createCourseLesson, updateCourseLesson, deleteCourseLesson } from '$lib/admin-utils.js';
import { json } from '@sveltejs/kit';

export async function POST({ request, params }) {
    try {
        const { action, lessonId, lessonData } = await request.json();
        
        if (action === 'create') {
            const newLesson = await createCourseLesson(lessonData);
            return json({ success: true, lesson: newLesson });
        } else if (action === 'update') {
            const updatedLesson = await updateCourseLesson(lessonId, lessonData);
            return json({ success: true, lesson: updatedLesson });
        } else if (action === 'delete') {
            await deleteCourseLesson(lessonId);
            return json({ success: true });
        }
        
        return json({ success: false, error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Error in lesson action:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return json({ success: false, error: errorMessage }, { status: 500 });
    }
}
