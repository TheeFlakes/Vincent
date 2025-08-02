import { pb } from '$lib/pocketbase.js';
import { error } from '@sveltejs/kit';

export async function load({ params, locals }) {
    try {
        // Check if we have a user
        if (!locals.user) {
            throw error(401, 'Authentication required');
        }

        console.log('Loading course with ID:', params.id);

        // Add timeout and better error handling for PocketBase requests
        const timeout = (ms) => new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), ms)
        );

        // Use Promise.all for parallel loading with timeout protection
        const [course, lessonsResult, userProgressResult] = await Promise.race([
            Promise.all([
                // Fetch the specific course
                pb.collection('courses').getOne(params.id, {
                    requestKey: null // Disable auto-cancellation for server-side requests
                }),
                
                // Fetch course lessons
                pb.collection('course_lessons').getList(1, 50, {
                    filter: `module = "${params.id}"`,
                    sort: 'order',
                    requestKey: null
                }),
                
                // Check if user is enrolled (has progress record)
                pb.collection('user_progress').getList(1, 1, {
                    filter: `user = "${locals.user.id}" && course = "${params.id}"`,
                    requestKey: null
                }).catch(() => ({ items: [] }))
            ]),
            timeout(10000) // 10 second timeout
        ]);

        // Process enrollment status
        let userProgress = null;
        let isEnrolled = false;
        
        if (userProgressResult.items.length > 0) {
            userProgress = userProgressResult.items[0];
            
            console.log('Found user progress record:', {
                courseId: params.id,
                userId: locals.user.id,
                courseName: course.title,
                isFree: course.isFree,
                paymentStatus: userProgress.payment_status,
                stripeSessionId: userProgress.stripe_session_id
            });
            
            // For paid courses, verify payment status
            if (!course.isFree) {
                // Only consider enrolled if payment_status is 'completed' or if there's a valid stripe_session_id
                isEnrolled = userProgress.payment_status === 'completed' || 
                            (userProgress.stripe_session_id && userProgress.stripe_session_id.length > 0);
                console.log('Paid course enrollment check:', { isEnrolled, paymentStatus: userProgress.payment_status, hasSessionId: !!userProgress.stripe_session_id });
            } else {
                // For free courses, just having a progress record is enough
                isEnrolled = true;
                console.log('Free course - user is enrolled');
            }
        } else {
            console.log('No user progress record found for course:', params.id, 'user:', locals.user.id);
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
        
        // Handle specific error types
        if (err instanceof Error && err.message === 'Request timeout') {
            throw error(503, 'Database service is temporarily unavailable. Please try again later.');
        }
        
        if (err && typeof err === 'object' && 'status' in err && err.status === 404) {
            throw error(404, 'Course not found');
        }
        
        if (err && typeof err === 'object' && 
            (('status' in err && err.status === 0) || 
             ('message' in err && typeof err.message === 'string' && 
              (err.message.includes('fetch failed') || err.message.includes('Connect Timeout'))))) {
            throw error(503, 'Unable to connect to the database. Please check your internet connection and try again.');
        }
        
        // Generic server error
        throw error(500, 'An error occurred while loading the course. Please try again later.');
    }
}
