import { pb } from '$lib/pocketbase.js';
import { error } from '@sveltejs/kit';

export async function load({ params, locals }) {
    try {
        const { id: courseId, lessonId } = params;
        
        if (!locals.user) {
            throw error(401, 'Authentication required');
        }

        // Fetch the course
        const course = await pb.collection('courses').getOne(courseId, {
            requestKey: null
        });

        // Fetch the specific lesson
        const lesson = await pb.collection('course_lessons').getOne(lessonId, {
            requestKey: null
        });

        // Verify lesson belongs to this course
        if (lesson.module !== courseId) {
            throw error(404, 'Lesson not found in this course');
        }

        // Fetch all lessons for navigation
        const lessonsResult = await pb.collection('course_lessons').getList(1, 50, {
            filter: `module = "${courseId}"`,
            sort: 'order',
            requestKey: null
        });

        // Fetch or create user progress
        let userProgress = null;
        try {
            const progressResult = await pb.collection('user_progress').getList(1, 1, {
                filter: `user = "${locals.user.id}" && course = "${courseId}"`,
                requestKey: null
            });
            
            if (progressResult.items.length > 0) {
                userProgress = progressResult.items[0];
            }
        } catch (err) {
            console.log('No existing progress found, will create new one');
        }

        // If no progress exists, create initial progress record
        if (!userProgress) {
            try {
                userProgress = await pb.collection('user_progress').create({
                    user: locals.user.id,
                    course: courseId,
                    completed_lessons: [],
                    current_lesson: lessonId,
                    completion_percentage: 0,
                    last_accessed: new Date().toISOString()
                });
            } catch (err) {
                console.error('Error creating progress:', err);
                // Continue without progress tracking if creation fails
            }
        }

        return {
            user: locals.user,
            course,
            lesson,
            lessons: lessonsResult.items,
            totalLessons: lessonsResult.totalItems,
            userProgress
        };
    } catch (err) {
        console.error('Error loading lesson:', err);
        if (err.status) {
            throw err;
        }
        throw error(500, 'Failed to load lesson');
    }
}
