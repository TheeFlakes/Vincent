import { pb } from './pocketbase.js';

/**
 * Test PocketBase connection
 * @returns {Promise<object>} Connection status
 */
export async function testPocketBaseConnection() {
    try {
        // Try to get the health status
        const response = await fetch(`${pb.baseUrl}/api/health`);
        if (response.ok) {
            return { 
                connected: true, 
                message: 'PocketBase is running and accessible' 
            };
        } else {
            return { 
                connected: false, 
                message: `PocketBase responded with status ${response.status}` 
            };
        }
    } catch (error) {
        return { 
            connected: false, 
            message: 'Unable to connect to PocketBase. Make sure it is running on https://vin254.pockethost.io' 
        };
    }
}

/**
 * Check if PocketBase collections are properly configured
 * @returns {Promise<object>} Configuration status
 */
export async function checkPocketBaseConfig() {
    try {
        // Try to list collections to see if 'users' collection exists
        const collections = await pb.collections.getList();
        const usersCollection = collections.items.find(c => c.name === 'users');
        
        if (!usersCollection) {
            return {
                configured: false,
                message: 'Users collection not found. Please create a "users" collection in PocketBase admin.'
            };
        }
        
        if (!usersCollection.options?.allowEmailAuth) {
            return {
                configured: false,
                message: 'Users collection is not configured for email authentication. Please enable it in PocketBase admin.'
            };
        }
        
        return {
            configured: true,
            message: 'PocketBase is properly configured'
        };
    } catch (error) {
        return {
            configured: false,
            message: 'Unable to check PocketBase configuration. Make sure you have admin access.'
        };
    }
}

/**
 * Get user progress for a specific course
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @returns {Promise<object|null>} User progress data or null if not found
 */
export async function getUserProgress(userId, courseId) {
    try {
        const result = await pb.collection('user_progress').getList(1, 1, {
            filter: `user = "${userId}" && course = "${courseId}"`,
            expand: 'course,current_lesson'
        });
        
        return result.items[0] || null;
    } catch (error) {
        console.error('Error fetching user progress:', error);
        return null;
    }
}

/**
 * Update user progress for a course
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @param {object} progressData - Progress data to update
 * @returns {Promise<object|null>} Updated progress record
 */
export async function updateUserProgress(userId, courseId, progressData) {
    try {
        // First try to find existing progress
        const existingProgress = await getUserProgress(userId, courseId);
        
        if (existingProgress) {
            // Update existing record
            return await pb.collection('user_progress').update(existingProgress.id, {
                ...progressData,
                last_accessed: new Date().toISOString()
            });
        } else {
            // Create new progress record
            return await pb.collection('user_progress').create({
                user: userId,
                course: courseId,
                completed_lessons: JSON.stringify([]),
                completion_percentage: 0,
                last_accessed: new Date().toISOString(),
                ...progressData
            });
        }
    } catch (error) {
        console.error('Error updating user progress:', error);
        return null;
    }
}

/**
 * Calculate completion percentage based on completed lessons
 * @param {Array} completedLessons - Array of completed lesson IDs
 * @param {number} totalLessons - Total number of lessons in the course
 * @returns {number} Completion percentage (0-100)
 */
export function calculateCompletionPercentage(completedLessons, totalLessons) {
    if (totalLessons === 0) return 0;
    return Math.round((completedLessons.length / totalLessons) * 100);
}

/**
 * Mark a lesson as completed for a user
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @param {string} lessonId - Lesson ID to mark as completed
 * @param {number} totalLessons - Total number of lessons in the course
 * @returns {Promise<object|null>} Updated progress record
 */
export async function markLessonCompleted(userId, courseId, lessonId, totalLessons) {
    try {
        const progress = await getUserProgress(userId, courseId);
        
        let completedLessons = [];
        if (progress && progress.completed_lessons) {
            completedLessons = JSON.parse(progress.completed_lessons);
        }
        
        // Add lesson if not already completed
        if (!completedLessons.includes(lessonId)) {
            completedLessons.push(lessonId);
        }
        
        const completionPercentage = calculateCompletionPercentage(completedLessons, totalLessons);
        
        return await updateUserProgress(userId, courseId, {
            completed_lessons: JSON.stringify(completedLessons),
            current_lesson: lessonId,
            completion_percentage: completionPercentage
        });
    } catch (error) {
        console.error('Error marking lesson as completed:', error);
        return null;
    }
}

/**
 * Get progress statistics for a user across all courses
 * @param {string} userId - User ID
 * @returns {Promise<object>} Progress statistics
 */
export async function getUserProgressStats(userId) {
    try {
        const allProgress = await pb.collection('user_progress').getFullList({
            filter: `user = "${userId}"`,
            expand: 'course'
        });
        
        const totalCourses = allProgress.length;
        const completedCourses = allProgress.filter(p => p.completion_percentage >= 100).length;
        const inProgressCourses = allProgress.filter(p => p.completion_percentage > 0 && p.completion_percentage < 100).length;
        const notStartedCourses = allProgress.filter(p => p.completion_percentage === 0).length;
        
        const averageCompletion = totalCourses > 0 
            ? Math.round(allProgress.reduce((sum, p) => sum + (p.completion_percentage || 0), 0) / totalCourses)
            : 0;
        
        // Recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentActivity = allProgress.filter(p => 
            new Date(p.last_accessed) > sevenDaysAgo
        ).length;
        
        return {
            totalCourses,
            completedCourses,
            inProgressCourses,
            notStartedCourses,
            averageCompletion,
            recentActivity
        };
    } catch (error) {
        console.error('Error fetching user progress stats:', error);
        return {
            totalCourses: 0,
            completedCourses: 0,
            inProgressCourses: 0,
            notStartedCourses: 0,
            averageCompletion: 0,
            recentActivity: 0
        };
    }
}

/**
 * Validate if a referral code exists and is valid
 * @param {string} referralCode - Referral code to validate
 * @returns {Promise<object>} Validation result with user info if valid
 */
export async function validateReferralCode(referralCode) {
    try {
        if (!referralCode || referralCode.trim().length === 0) {
            return { valid: false, error: 'Referral code is required' };
        }

        const result = await pb.collection('users').getList(1, 1, {
            filter: `referralCode = "${referralCode.trim()}"`,
            fields: 'id,name,email,referralCode',
            requestKey: null
        });

        if (result.items.length === 0) {
            return { 
                valid: false, 
                error: 'Invalid referral code. Please check with the person who referred you.' 
            };
        }

        const referringUser = result.items[0];
        return { 
            valid: true, 
            referringUser: {
                id: referringUser.id,
                name: referringUser.name,
                email: referringUser.email.substring(0, 3) + '***' // Partially hidden email
            }
        };
    } catch (error) {
        console.error('Error validating referral code:', error);
        return { 
            valid: false, 
            error: 'Unable to validate referral code. Please try again.' 
        };
    }
}

/**
 * Get referral statistics for a user
 * @param {string} userId - User ID
 * @returns {Promise<object>} Referral statistics
 */
export async function getReferralStats(userId) {
    try {
        // Get users referred by this user
        const referredUsers = await pb.collection('users').getFullList({
            filter: `referredBy = "${userId}"`,
            fields: 'id,name,email,created',
            sort: '-created'
        });

        // Get the user's own referral code
        const user = await pb.collection('users').getOne(userId, {
            fields: 'referralCode'
        });

        return {
            referralCode: user.referralCode,
            totalReferrals: referredUsers.length,
            referredUsers: referredUsers.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email.substring(0, 3) + '***', // Partially hidden
                joinDate: new Date(user.created).toLocaleDateString()
            }))
        };
    } catch (error) {
        console.error('Error fetching referral stats:', error);
        return {
            referralCode: '',
            totalReferrals: 0,
            referredUsers: []
        };
    }
}
