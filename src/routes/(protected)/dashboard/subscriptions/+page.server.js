import { pb } from '$lib/pocketbase.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ locals, url }) {
    // Check if user is authenticated
    if (!locals.user) {
        throw redirect(302, '/login');
    }

    try {
        // Fetch subscriptions for the current user with expanded relations
        const subscriptions = await pb.collection('subscriptions').getFullList({
            filter: `user = "${locals.user.id}"`,
            expand: 'course,paidTo',
            sort: '-created'
        });

        // For each subscription, check user progress and find next lesson
        const subscriptionsWithProgress = await Promise.all(
            subscriptions.map(async (subscription) => {
                try {
                    // Check if user has progress for this course
                    const progressResult = await pb.collection('user_progress').getList(1, 1, {
                        filter: `user = "${locals.user.id}" && course = "${subscription.course}"`,
                        requestKey: null
                    });

                    let userProgress = null;
                    let nextLessonId = null;
                    let isEnrolled = false;

                    if (progressResult.items.length > 0) {
                        userProgress = progressResult.items[0];
                        isEnrolled = true;
                        nextLessonId = userProgress.current_lesson;
                    }

                    // If not enrolled or no current lesson, get the first lesson
                    if (!nextLessonId) {
                        try {
                            const firstLessonResult = await pb.collection('course_lessons').getList(1, 1, {
                                filter: `module = "${subscription.course}"`,
                                sort: 'order',
                                requestKey: null
                            });
                            
                            if (firstLessonResult.items.length > 0) {
                                nextLessonId = firstLessonResult.items[0].id;
                            }
                        } catch (err) {
                            console.log('No lessons found for course:', subscription.course);
                        }
                    }

                    return {
                        ...subscription,
                        userProgress,
                        isEnrolled,
                        nextLessonId
                    };
                } catch (err) {
                    console.log('Error fetching progress for subscription:', subscription.id);
                    return subscription;
                }
            })
        );

        // Calculate totals
        const totalSpent = subscriptions.reduce((sum, sub) => sum + (sub.amountPaid || 0), 0);
        const totalCommissions = subscriptions.reduce((sum, sub) => sum + (sub.referralCommission || 0), 0);

        return {
            user: locals.user,
            subscriptions: subscriptionsWithProgress,
            totalSpent: totalSpent,
            totalCommissions: totalCommissions,
            subscriptionCount: subscriptions.length
        };
    } catch (err) {
        console.error('Error fetching subscriptions:', err);
        throw error(500, 'Failed to load subscriptions');
    }
}
