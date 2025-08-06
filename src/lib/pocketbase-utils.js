import { pb } from './pocketbase.js';

/**
 * Get user's transaction for a specific course
 * @param {string} userId - The user ID
 * @param {string} courseId - The course ID
 * @returns {Promise<object|null>} Transaction record or null
 */
export async function getUserCourseTransaction(userId, courseId) {
    try {
        const result = await pb.collection('transactions').getList(1, 1, {
            filter: `user = "${userId}" && course = "${courseId}"`,
            sort: '-created' // Get the most recent transaction
        });
        
        return result.items.length > 0 ? result.items[0] : null;
    } catch (error) {
        console.error('Error fetching user course transaction:', error);
        return null;
    }
}

// Simple cache for purchase checks
const purchaseCache = new Map();

/**
 * Check if user has successfully purchased a course (with caching)
 * @param {string} userId - The user ID
 * @param {string} courseId - The course ID
 * @returns {Promise<boolean>} True if user has completed transaction for the course
 */
export async function hasUserPurchasedCourse(userId, courseId) {
    // Simple in-memory cache to avoid repeated DB calls
    const cacheKey = `${userId}-${courseId}`;
    const cacheExpiry = 5 * 60 * 1000; // 5 minutes
    
    const cached = purchaseCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < cacheExpiry) {
        return cached.value;
    }
    
    try {
        const result = await pb.collection('transactions').getList(1, 1, {
            filter: `user = "${userId}" && course = "${courseId}" && status = "completed"`,
            requestKey: `purchase-check-${cacheKey}` // Prevent duplicate requests
        });
        
        const purchased = result.items.length > 0;
        
        // Cache the result
        purchaseCache.set(cacheKey, {
            value: purchased,
            timestamp: Date.now()
        });
        
        return purchased;
    } catch (error) {
        console.error('Error checking course purchase status:', error);
        return false;
    }
}

/**
 * Get all transactions for a user
 * @param {string} userId - The user ID
 * @param {number} page - Page number (default: 1)
 * @param {number} perPage - Items per page (default: 20)
 * @returns {Promise<object>} Transactions list
 */
export async function getUserTransactions(userId, page = 1, perPage = 20) {
    try {
        return await pb.collection('transactions').getList(page, perPage, {
            filter: `user = "${userId}"`,
            sort: '-created',
            expand: 'course'
        });
    } catch (error) {
        console.error('Error fetching user transactions:', error);
        return { items: [], totalItems: 0, totalPages: 0 };
    }
}

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
            message: 'Service temporarily unavailable. Please try again later.' 
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
            fields: 'id,username,email,referralCode',
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
                name: referringUser.username,
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

        // Get all commission transactions earned by this user
        let commissionTransactions = [];
        let totalEarnings = 0;
        
        try {
            commissionTransactions = await pb.collection('transactions').getFullList({
                filter: `user = "${userId}" && transaction_type = "commission"`,
                fields: 'id,amount,currency,commission_from_user,course,created,paid_at,original_transaction_ref',
                expand: 'commission_from_user,course',
                sort: '-created',
                requestKey: null
            });
            totalEarnings = commissionTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
        } catch (err) {
            console.error('Error fetching commission transactions:', err);
        }

        // Create detailed downline information with commissions
        const detailedDownlines = [];
        
        for (const referredUser of referredUsers) {
            // Get all purchases made by this downline
            const downlinePurchases = await pb.collection('transactions').getFullList({
                filter: `user = "${referredUser.id}" && status = "completed" && transaction_type != "commission"`,
                fields: 'id,amount,currency,course,created,paid_at,paystack_reference',
                expand: 'course',
                sort: '-created',
                requestKey: null
            }).catch(err => {
                console.error(`Error fetching purchases for user ${referredUser.id}:`, err);
                return [];
            });

            // Get commissions earned from this specific downline
            const commissionsFromThisUser = commissionTransactions.filter(
                tx => tx.commission_from_user === referredUser.id
            );

            const totalCommissionFromUser = commissionsFromThisUser.reduce(
                (sum, tx) => sum + (tx.amount || 0), 0
            );

            detailedDownlines.push({
                id: referredUser.id,
                name: referredUser.name,
                email: referredUser.email.substring(0, 3) + '***', // Partially hidden
                joinDate: new Date(referredUser.created).toLocaleDateString(),
                totalPurchases: downlinePurchases.length,
                totalSpent: downlinePurchases.reduce((sum, tx) => sum + (tx.amount || 0), 0),
                totalCommissionEarned: totalCommissionFromUser,
                purchases: downlinePurchases.map(purchase => ({
                    id: purchase.id,
                    amount: purchase.amount,
                    currency: purchase.currency || 'USD',
                    courseName: purchase.expand?.course?.title || 'Unknown Course',
                    purchaseDate: new Date(purchase.created).toLocaleDateString(),
                    commissionEarned: commissionsFromThisUser.find(
                        comm => comm.original_transaction_ref === purchase.paystack_reference
                    )?.amount || 0
                })),
                commissions: commissionsFromThisUser.map(comm => ({
                    id: comm.id,
                    amount: comm.amount,
                    currency: comm.currency || 'USD',
                    courseName: comm.expand?.course?.title || 'Unknown Course',
                    earnedDate: new Date(comm.created).toLocaleDateString(),
                    originalRef: comm.original_transaction_ref
                }))
            });
        }

        // Sort downlines by total commission earned (highest first)
        detailedDownlines.sort((a, b) => b.totalCommissionEarned - a.totalCommissionEarned);

        return {
            referralCode: user.referralCode,
            totalReferrals: referredUsers.length,
            totalEarnings: totalEarnings,
            referredUsers: referredUsers.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email.substring(0, 3) + '***', // Partially hidden
                joinDate: new Date(user.created).toLocaleDateString()
            })),
            detailedDownlines: detailedDownlines,
            recentCommissions: commissionTransactions.slice(0, 10).map(tx => ({
                id: tx.id,
                amount: tx.amount,
                currency: tx.currency || 'USD',
                fromUser: tx.expand?.commission_from_user?.name || 'Unknown',
                courseName: tx.expand?.course?.title || 'Unknown Course',
                earnedDate: new Date(tx.created).toLocaleDateString(),
                earnedTime: new Date(tx.created).toLocaleTimeString()
            }))
        };
    } catch (error) {
        console.error('Error fetching referral stats:', error);
        return {
            referralCode: '',
            totalReferrals: 0,
            totalEarnings: 0,
            referredUsers: [],
            detailedDownlines: [],
            recentCommissions: []
        };
    }
}
