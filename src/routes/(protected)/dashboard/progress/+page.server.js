import { pb } from '$lib/pocketbase.js';
import { error, redirect } from '@sveltejs/kit';

export async function load({ locals }) {
    // Check if user is authenticated
    if (!locals.user) {
        throw redirect(302, '/login');
    }

    try {
        // Fetch all user progress with expanded course and current lesson data
        const userProgressResult = await pb.collection('user_progress').getFullList({
            filter: `user = "${locals.user.id}"`,
            expand: 'course,current_lesson',
            sort: '-last_accessed',
            requestKey: null
        });

        // Fetch all enrolled courses with lessons count
        const enrolledCourseIds = userProgressResult.map(progress => progress.course);
        let coursesWithLessons = [];
        
        if (enrolledCourseIds.length > 0) {
            // Get courses with lesson counts
            const coursesResult = await pb.collection('courses').getFullList({
                filter: `id ~ "${enrolledCourseIds.join('|')}"`,
                requestKey: null
            });

            // For each course, get the total lesson count
            for (const course of coursesResult) {
                try {
                    // Try to get lessons count from course_lessons collection
                    const lessonsResult = await pb.collection('course_lessons').getList(1, 1, {
                        filter: `module = "${course.id}"`,
                        requestKey: null
                    });
                    
                    coursesWithLessons.push({
                        ...course,
                        totalLessons: lessonsResult.totalItems
                    });
                } catch (err) {
                    console.error(`Error fetching lessons for course ${course.id}:`, err);
                    // If course_lessons collection doesn't exist or has issues, try lessons collection as fallback
                    try {
                        const fallbackResult = await pb.collection('lessons').getList(1, 1, {
                            filter: `course = "${course.id}"`,
                            requestKey: null
                        });
                        
                        coursesWithLessons.push({
                            ...course,
                            totalLessons: fallbackResult.totalItems
                        });
                    } catch (fallbackErr) {
                        console.error(`Error fetching from fallback lessons collection for course ${course.id}:`, fallbackErr);
                        // If both collections fail, use 0
                        coursesWithLessons.push({
                            ...course,
                            totalLessons: 0
                        });
                    }
                }
            }
        }

        // Calculate overall progress statistics
        const totalCourses = userProgressResult.length;
        const completedCourses = userProgressResult.filter(p => p.completion_percentage >= 100).length;
        const inProgressCourses = userProgressResult.filter(p => p.completion_percentage > 0 && p.completion_percentage < 100).length;
        const notStartedCourses = userProgressResult.filter(p => p.completion_percentage === 0).length;
        
        // Calculate average completion percentage
        const averageCompletion = totalCourses > 0 
            ? Math.round(userProgressResult.reduce((sum, p) => sum + (p.completion_percentage || 0), 0) / totalCourses)
            : 0;

        // Get recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentActivity = userProgressResult.filter(p => 
            new Date(p.last_accessed) > sevenDaysAgo
        ).length;

        // Prepare progress data with course information
        const progressWithCourseData = userProgressResult.map(progress => {
            const courseData = coursesWithLessons.find(c => c.id === progress.course);
            
            // Safely parse completed_lessons JSON
            let completedLessons = 0;
            try {
                if (progress.completed_lessons && typeof progress.completed_lessons === 'string') {
                    const parsed = JSON.parse(progress.completed_lessons);
                    completedLessons = Array.isArray(parsed) ? parsed.length : 0;
                } else if (Array.isArray(progress.completed_lessons)) {
                    completedLessons = progress.completed_lessons.length;
                }
            } catch (err) {
                console.error('Error parsing completed_lessons:', err);
                completedLessons = 0;
            }
            
            return {
                ...progress,
                expand: {
                    course: courseData,
                    current_lesson: progress.expand?.current_lesson
                },
                completedLessonsCount: completedLessons,
                totalLessons: courseData?.totalLessons || 0,
                lastAccessedFormatted: new Date(progress.last_accessed).toLocaleDateString()
            };
        });

        return {
            user: locals.user,
            userProgress: progressWithCourseData,
            statistics: {
                totalCourses,
                completedCourses,
                inProgressCourses,
                notStartedCourses,
                averageCompletion,
                recentActivity
            }
        };
    } catch (err) {
        console.error('Error loading progress data:', err);
        throw error(500, 'Failed to load progress data');
    }
}
