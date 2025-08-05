import { pb } from '$lib/pocketbase.js';
import { error } from '@sveltejs/kit';

export async function load({ params, locals }) {
    try {
        // Check if we have a user
        if (!locals.user) {
            throw error(401, 'Authentication required');
        }

        console.log('Loading course with ID:', params.id);

        // Optimized timeout with retry logic
        const timeout = (ms = 6000) => new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database request timeout')), ms)
        );

        // Retry function for failed requests
        const retryRequest = async (fn, maxRetries = 2) => {
            for (let i = 0; i <= maxRetries; i++) {
                try {
                    return await fn();
                } catch (err) {
                    if (i === maxRetries) throw err;
                    console.log(`Request failed, retrying... (${i + 1}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
                }
            }
        };

        // Use Promise.all for parallel loading with optimized timeout and retry
        const [course, lessonsResult, userProgressResult] = await Promise.race([
            retryRequest(async () => Promise.all([
                // Fetch the specific course
                pb.collection('courses').getOne(params.id, {
                    requestKey: null // Disable auto-cancellation for server-side requests
                }),
                
                // Fetch course lessons with pagination
                pb.collection('course_lessons').getList(1, 100, {
                    filter: `module = "${params.id}"`,
                    sort: 'order',
                    requestKey: null
                }),
                
                // Check if user is enrolled (has progress record) - with fallback
                pb.collection('user_progress').getList(1, 1, {
                    filter: `user = "${locals.user.id}" && course = "${params.id}"`,
                    requestKey: null
                }).catch(() => ({ items: [] }))
            ])),
            timeout(6000) // Reduced timeout to 6 seconds
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
                paystackReference: userProgress.paystack_reference
            });
            
            // For paid courses, verify payment status
            if (!course.isFree) {
                // Consider enrolled if payment_status is 'completed' or if there's a valid payment reference
                isEnrolled = userProgress.payment_status === 'completed' || 
                            (userProgress.paystack_reference && userProgress.paystack_reference.length > 0);
                console.log('Paid course enrollment check:', { 
                    isEnrolled, 
                    paymentStatus: userProgress.payment_status, 
                    hasPaystackReference: !!userProgress.paystack_reference
                });
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
