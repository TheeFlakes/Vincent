import { createCourse, updateCourse, deleteCourse } from '$lib/admin-utils.js';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
    try {
        const contentType = request.headers.get('content-type');
        
        if (contentType?.includes('multipart/form-data')) {
            // Handle FormData requests (create/update with file)
            const formData = await request.formData();
            const action = formData.get('action');
            
            if (action === 'create') {
                const courseData = {
                    title: formData.get('title')?.toString() || '',
                    description: formData.get('description')?.toString() || '',
                    price: parseFloat(formData.get('price')?.toString() || '0'),
                    isFree: formData.get('isFree') === 'true'
                };
                
                // Add thumbnail if provided
                const thumbnail = formData.get('thumbnail');
                if (thumbnail && thumbnail instanceof File && thumbnail.size > 0) {
                    Object.assign(courseData, { thumbnail });
                }
                
                const newCourse = await createCourse(courseData);
                return json({ success: true, course: newCourse });
                
            } else if (action === 'update') {
                const courseId = formData.get('courseId')?.toString();
                if (!courseId) {
                    return json({ success: false, error: 'Course ID is required' }, { status: 400 });
                }
                
                const courseData = {
                    title: formData.get('title')?.toString() || '',
                    description: formData.get('description')?.toString() || '',
                    price: parseFloat(formData.get('price')?.toString() || '0'),
                    isFree: formData.get('isFree') === 'true'
                };
                
                // Add thumbnail if provided
                const thumbnail = formData.get('thumbnail');
                if (thumbnail && thumbnail instanceof File && thumbnail.size > 0) {
                    Object.assign(courseData, { thumbnail });
                }
                
                const updatedCourse = await updateCourse(courseId, courseData);
                return json({ success: true, course: updatedCourse });
            }
        } else {
            // Handle JSON requests (delete)
            const { action, courseId } = await request.json();
            
            if (action === 'delete') {
                await deleteCourse(courseId);
                return json({ success: true });
            }
        }
        
        return json({ success: false, error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Error in course action:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return json({ success: false, error: errorMessage }, { status: 500 });
    }
}
