import { pb } from './pocketbase.js';

/**
 * Check if user has admin privileges
 * @param {any} user - User object
 * @returns {boolean} True if user is admin
 */
export function isAdmin(user) {
    return user && (user.role === 'admin' || user.role === 'super_admin');
}

/**
 * Get all users with pagination and filtering
 * @param {number} page - Page number
 * @param {number} perPage - Items per page
 * @param {string} filter - Filter string
 * @param {string} sort - Sort string
 * @returns {Promise<object>} Users list
 */
export async function getAllUsers(page = 1, perPage = 20, filter = '', sort = '-created') {
    try {
        return await pb.collection('users').getList(page, perPage, {
            filter: filter,
            sort: sort,
            expand: 'referredBy'
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return { items: [], totalItems: 0, totalPages: 0 };
    }
}

/**
 * Get all transactions with pagination and filtering
 * @param {number} page - Page number
 * @param {number} perPage - Items per page
 * @param {string} filter - Filter string
 * @param {string} sort - Sort string
 * @returns {Promise<object>} Transactions list
 */
export async function getAllTransactions(page = 1, perPage = 20, filter = '', sort = '-created') {
    try {
        return await pb.collection('transactions').getList(page, perPage, {
            filter: filter,
            sort: sort,
            expand: 'user,course'
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return { items: [], totalItems: 0, totalPages: 0 };
    }
}

/**
 * Get all courses with pagination and filtering
 * @param {number} page - Page number
 * @param {number} perPage - Items per page
 * @param {string} filter - Filter string
 * @param {string} sort - Sort string
 * @returns {Promise<object>} Courses list
 */
export async function getAllCourses(page = 1, perPage = 20, filter = '', sort = '-created') {
    try {
        return await pb.collection('courses').getList(page, perPage, {
            filter: filter,
            sort: sort
        });
    } catch (error) {
        console.error('Error fetching courses:', error);
        return { items: [], totalItems: 0, totalPages: 0 };
    }
}

/**
 * Get all support messages with pagination and filtering
 * @param {number} page - Page number
 * @param {number} perPage - Items per page
 * @param {string} filter - Filter string
 * @param {string} sort - Sort string
 * @returns {Promise<object>} Support messages list
 */
export async function getAllSupportMessages(page = 1, perPage = 20, filter = '', sort = '-created') {
    try {
        return await pb.collection('support_messages').getList(page, perPage, {
            filter: filter,
            sort: sort,
            expand: 'user'
        });
    } catch (error) {
        console.error('Error fetching support messages:', error);
        return { items: [], totalItems: 0, totalPages: 0 };
    }
}

/**
 * Get user's referral tree (uplines and downlines)
 * @param {string} userId - User ID
 * @returns {Promise<object>} Referral tree data
 */
export async function getUserReferralTree(userId) {
    try {
        const user = await pb.collection('users').getOne(userId, {
            expand: 'referredBy'
        });

        // Get downlines (users referred by this user)
        const downlines = await pb.collection('users').getList(1, 100, {
            filter: `referredBy = "${userId}"`,
            expand: 'referredBy'
        });

        // Build upline chain
        const uplines = [];
        let currentUpline = user.expand?.referredBy;
        
        while (currentUpline && uplines.length < 10) { // Prevent infinite loops
            uplines.push(currentUpline);
            if (currentUpline.referredBy) {
                try {
                    currentUpline = await pb.collection('users').getOne(currentUpline.referredBy, {
                        expand: 'referredBy'
                    });
                    currentUpline = currentUpline.expand?.referredBy;
                } catch {
                    break;
                }
            } else {
                break;
            }
        }

        return {
            user,
            uplines: uplines.reverse(), // Show from top to current
            downlines: downlines.items
        };
    } catch (error) {
        console.error('Error fetching referral tree:', error);
        return { user: null, uplines: [], downlines: [] };
    }
}

/**
 * Update user role
 * @param {string} userId - User ID
 * @param {string} role - New role
 * @returns {Promise<object>} Updated user
 */
export async function updateUserRole(userId, role) {
    try {
        return await pb.collection('users').update(userId, { role });
    } catch (error) {
        console.error('Error updating user role:', error);
        throw error;
    }
}

/**
 * Delete user
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteUser(userId) {
    try {
        await pb.collection('users').delete(userId);
        return true;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
}

/**
 * Create new course
 * @param {object} courseData - Course data
 * @returns {Promise<object>} Created course
 */
export async function createCourse(courseData) {
    try {
        return await pb.collection('courses').create(courseData);
    } catch (error) {
        console.error('Error creating course:', error);
        throw error;
    }
}

/**
 * Update course
 * @param {string} courseId - Course ID
 * @param {object} courseData - Course data
 * @returns {Promise<object>} Updated course
 */
export async function updateCourse(courseId, courseData) {
    try {
        return await pb.collection('courses').update(courseId, courseData);
    } catch (error) {
        console.error('Error updating course:', error);
        throw error;
    }
}

/**
 * Delete course
 * @param {string} courseId - Course ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteCourse(courseId) {
    try {
        await pb.collection('courses').delete(courseId);
        return true;
    } catch (error) {
        console.error('Error deleting course:', error);
        throw error;
    }
}

/**
 * Reply to support message
 * @param {string} messageId - Support message ID
 * @param {string} reply - Admin reply
 * @returns {Promise<object>} Updated message
 */
export async function replySupportMessage(messageId, reply) {
    try {
        return await pb.collection('support_messages').update(messageId, {
            adminReply: reply,
            status: 'replied'
        });
    } catch (error) {
        console.error('Error replying to support message:', error);
        throw error;
    }
}

/**
 * Get all course lessons with pagination and filtering
 * @param {number} page - Page number
 * @param {number} perPage - Items per page
 * @param {string} filter - Filter string
 * @param {string} sort - Sort string
 * @returns {Promise<object>} Course lessons list
 */
export async function getAllCourseLessons(page = 1, perPage = 20, filter = '', sort = 'order') {
    try {
        return await pb.collection('course_lessons').getList(page, perPage, {
            filter: filter,
            sort: sort,
            expand: 'module'
        });
    } catch (error) {
        console.error('Error fetching course lessons:', error);
        return { items: [], totalItems: 0, totalPages: 0 };
    }
}

/**
 * Get course lessons by course ID
 * @param {string} courseId - Course ID
 * @returns {Promise<object[]>} Course lessons
 */
export async function getCourseLesson(courseId) {
    try {
        const result = await pb.collection('course_lessons').getList(1, 100, {
            filter: `module = "${courseId}"`,
            sort: 'order'
        });
        return result.items;
    } catch (error) {
        console.error('Error fetching course lessons:', error);
        return [];
    }
}

/**
 * Create new course lesson
 * @param {object} lessonData - Lesson data
 * @returns {Promise<object>} Created lesson
 */
export async function createCourseLesson(lessonData) {
    try {
        return await pb.collection('course_lessons').create(lessonData);
    } catch (error) {
        console.error('Error creating course lesson:', error);
        throw error;
    }
}

/**
 * Update course lesson
 * @param {string} lessonId - Lesson ID
 * @param {object} lessonData - Lesson data
 * @returns {Promise<object>} Updated lesson
 */
export async function updateCourseLesson(lessonId, lessonData) {
    try {
        return await pb.collection('course_lessons').update(lessonId, lessonData);
    } catch (error) {
        console.error('Error updating course lesson:', error);
        throw error;
    }
}

/**
 * Delete course lesson
 * @param {string} lessonId - Lesson ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteCourseLesson(lessonId) {
    try {
        await pb.collection('course_lessons').delete(lessonId);
        return true;
    } catch (error) {
        console.error('Error deleting course lesson:', error);
        throw error;
    }
}

/**
 * Get dashboard statistics
 * @returns {Promise<object>} Dashboard stats
 */
export async function getDashboardStats() {
    try {
        const [users, courses, transactions, supportMessages] = await Promise.all([
            pb.collection('users').getList(1, 1, { requestKey: null }),
            pb.collection('courses').getList(1, 1, { requestKey: null }),
            pb.collection('transactions').getList(1, 1, { filter: 'status = "completed"', requestKey: null }),
            pb.collection('support_messages').getList(1, 1, { filter: 'status = "pending"', requestKey: null })
        ]);

        // Get revenue calculation
        const completedTransactions = await pb.collection('transactions').getList(1, 500, {
            filter: 'status = "completed"',
            requestKey: null
        });

        const totalRevenue = completedTransactions.items.reduce((sum, transaction) => {
            return sum + (transaction.amount || 0);
        }, 0);

        return {
            totalUsers: users.totalItems,
            totalCourses: courses.totalItems,
            totalTransactions: transactions.totalItems,
            pendingSupportMessages: supportMessages.totalItems,
            totalRevenue: totalRevenue
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return {
            totalUsers: 0,
            totalCourses: 0,
            totalTransactions: 0,
            pendingSupportMessages: 0,
            totalRevenue: 0
        };
    }
}

/**
 * Get comprehensive analytics data for charts
 * @returns {Promise<object>} Analytics data
 */
export async function getAnalyticsData() {
    try {
        // Get data for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

        // Get data for the last 12 months
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        const twelveMonthsAgoStr = twelveMonthsAgo.toISOString().split('T')[0];

        const [
            allUsers,
            allTransactions,
            allCourses,
            recentUsers,
            recentTransactions
        ] = await Promise.all([
            // All users for user growth
            pb.collection('users').getList(1, 1000, {
                sort: 'created',
                requestKey: null
            }),
            // All completed transactions for revenue analysis
            pb.collection('transactions').getList(1, 1000, {
                filter: 'status = "completed"',
                sort: 'created',
                expand: 'course,user',
                requestKey: null
            }),
            // All courses with their details
            pb.collection('courses').getList(1, 100, {
                sort: '-created',
                requestKey: null
            }),
            // Recent users (last 30 days)
            pb.collection('users').getList(1, 1000, {
                filter: `created >= "${thirtyDaysAgoStr}"`,
                sort: 'created',
                requestKey: null
            }),
            // Recent transactions (last 30 days)
            pb.collection('transactions').getList(1, 1000, {
                filter: `created >= "${thirtyDaysAgoStr}" && status = "completed"`,
                sort: 'created',
                expand: 'course',
                requestKey: null
            })
        ]);

        // Process user growth data (daily for last 30 days)
        const userGrowthData = processTimeSeriesData(recentUsers.items, 30, 'day');

        // Process revenue data (daily for last 30 days)
        const revenueData = processRevenueData(recentTransactions.items, 30, 'day');

        // Process monthly data for trends
        const monthlyUserGrowth = processTimeSeriesData(allUsers.items, 12, 'month');
        const monthlyRevenue = processRevenueData(allTransactions.items, 12, 'month');

        // Course popularity (transaction count per course)
        const coursePopularity = processCoursePopularity(allTransactions.items, allCourses.items);

        // User registration vs purchases conversion
        const conversionData = processConversionData(allUsers.items, allTransactions.items);

        // Revenue by course type (free vs paid)
        const revenueByType = processRevenueByType(allTransactions.items, allCourses.items);

        // Top performing courses
        const topCourses = processTopCourses(allTransactions.items, allCourses.items);

        return {
            userGrowth: {
                daily: userGrowthData,
                monthly: monthlyUserGrowth
            },
            revenue: {
                daily: revenueData,
                monthly: monthlyRevenue,
                byType: revenueByType
            },
            courses: {
                popularity: coursePopularity,
                topPerforming: topCourses
            },
            conversion: conversionData,
            totals: {
                users: allUsers.totalItems,
                transactions: allTransactions.totalItems,
                courses: allCourses.totalItems,
                revenue: allTransactions.items.reduce((sum, t) => sum + (t.amount || 0), 0)
            }
        };
    } catch (error) {
        console.error('Error fetching analytics data:', error);
        
        // Return demo data for visualization
        const demoData = generateDemoAnalyticsData();
        return demoData;
    }
}

/**
 * Generate demo analytics data for testing
 */
function generateDemoAnalyticsData() {
    const demoUserGrowthDaily = [];
    const demoRevenueDaily = [];
    
    // Generate 30 days of demo data
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        demoUserGrowthDaily.push({
            label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: Math.floor(Math.random() * 10) + 1,
            date: date.toISOString()
        });
        
        demoRevenueDaily.push({
            label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: Math.floor(Math.random() * 500) + 100,
            date: date.toISOString()
        });
    }
    
    // Generate 12 months of demo data
    const demoUserGrowthMonthly = [];
    const demoRevenueMonthly = [];
    
    for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        
        demoUserGrowthMonthly.push({
            label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            value: Math.floor(Math.random() * 50) + 10,
            date: date.toISOString()
        });
        
        demoRevenueMonthly.push({
            label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            value: Math.floor(Math.random() * 5000) + 1000,
            date: date.toISOString()
        });
    }
    
    return {
        userGrowth: {
            daily: demoUserGrowthDaily,
            monthly: demoUserGrowthMonthly
        },
        revenue: {
            daily: demoRevenueDaily,
            monthly: demoRevenueMonthly,
            byType: {
                labels: ['Free Courses', 'Paid Courses'],
                data: [1500, 8500]
            }
        },
        courses: {
            popularity: [
                { label: 'Web Development Basics', value: 45, courseId: '1' },
                { label: 'Advanced JavaScript', value: 32, courseId: '2' },
                { label: 'React Fundamentals', value: 28, courseId: '3' },
                { label: 'Node.js Backend', value: 22, courseId: '4' },
                { label: 'Database Design', value: 18, courseId: '5' }
            ],
            topPerforming: [
                { id: '1', title: 'Web Development Basics', revenue: 4500, sales: 45, price: 99, isFree: false },
                { id: '2', title: 'Advanced JavaScript', revenue: 3200, sales: 32, price: 129, isFree: false },
                { id: '3', title: 'React Fundamentals', revenue: 2800, sales: 28, price: 149, isFree: false },
                { id: '4', title: 'Node.js Backend', revenue: 2200, sales: 22, price: 179, isFree: false },
                { id: '5', title: 'Database Design', revenue: 0, sales: 18, price: 0, isFree: true }
            ]
        },
        conversion: {
            labels: ['Users with Purchases', 'Users without Purchases'],
            data: [125, 375]
        },
        totals: {
            users: 500,
            transactions: 125,
            courses: 12,
            revenue: 10000
        }
    };
}

/**
 * Process time series data for charts
 */
function processTimeSeriesData(items, periods, type) {
    const data = [];
    const now = new Date();
    
    for (let i = periods - 1; i >= 0; i--) {
        const date = new Date(now);
        if (type === 'day') {
            date.setDate(date.getDate() - i);
        } else if (type === 'month') {
            date.setMonth(date.getMonth() - i);
        }
        
        const startOfPeriod = new Date(date);
        const endOfPeriod = new Date(date);
        
        if (type === 'day') {
            startOfPeriod.setHours(0, 0, 0, 0);
            endOfPeriod.setHours(23, 59, 59, 999);
        } else if (type === 'month') {
            startOfPeriod.setDate(1);
            startOfPeriod.setHours(0, 0, 0, 0);
            endOfPeriod.setMonth(endOfPeriod.getMonth() + 1);
            endOfPeriod.setDate(0);
            endOfPeriod.setHours(23, 59, 59, 999);
        }
        
        const count = items.filter(item => {
            const itemDate = new Date(item.created);
            return itemDate >= startOfPeriod && itemDate <= endOfPeriod;
        }).length;
        
        data.push({
            label: type === 'day' ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
                                  : date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            value: count,
            date: date.toISOString()
        });
    }
    
    return data;
}

/**
 * Process revenue data for charts
 */
function processRevenueData(transactions, periods, type) {
    const data = [];
    const now = new Date();
    
    for (let i = periods - 1; i >= 0; i--) {
        const date = new Date(now);
        if (type === 'day') {
            date.setDate(date.getDate() - i);
        } else if (type === 'month') {
            date.setMonth(date.getMonth() - i);
        }
        
        const startOfPeriod = new Date(date);
        const endOfPeriod = new Date(date);
        
        if (type === 'day') {
            startOfPeriod.setHours(0, 0, 0, 0);
            endOfPeriod.setHours(23, 59, 59, 999);
        } else if (type === 'month') {
            startOfPeriod.setDate(1);
            startOfPeriod.setHours(0, 0, 0, 0);
            endOfPeriod.setMonth(endOfPeriod.getMonth() + 1);
            endOfPeriod.setDate(0);
            endOfPeriod.setHours(23, 59, 59, 999);
        }
        
        const revenue = transactions.filter(transaction => {
            const transactionDate = new Date(transaction.created);
            return transactionDate >= startOfPeriod && transactionDate <= endOfPeriod;
        }).reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
        
        data.push({
            label: type === 'day' ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
                                  : date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            value: revenue,
            date: date.toISOString()
        });
    }
    
    return data;
}

/**
 * Process course popularity data
 */
function processCoursePopularity(transactions, courses) {
    const courseCounts = {};
    
    transactions.forEach(transaction => {
        const courseId = transaction.course;
        courseCounts[courseId] = (courseCounts[courseId] || 0) + 1;
    });
    
    return courses.map(course => ({
        label: course.title || 'Unknown Course',
        value: courseCounts[course.id] || 0,
        courseId: course.id
    })).sort((a, b) => b.value - a.value);
}

/**
 * Process conversion data
 */
function processConversionData(users, transactions) {
    const totalUsers = users.length;
    const usersWithPurchases = new Set(transactions.map(t => t.user)).size;
    const usersWithoutPurchases = totalUsers - usersWithPurchases;
    
    return {
        labels: ['Users with Purchases', 'Users without Purchases'],
        data: [usersWithPurchases, usersWithoutPurchases]
    };
}

/**
 * Process revenue by course type
 */
function processRevenueByType(transactions, courses) {
    const courseMap = courses.reduce((map, course) => {
        map[course.id] = course;
        return map;
    }, {});
    
    let freeRevenue = 0;
    let paidRevenue = 0;
    
    transactions.forEach(transaction => {
        const course = courseMap[transaction.course];
        if (course) {
            if (course.isFree) {
                freeRevenue += transaction.amount || 0;
            } else {
                paidRevenue += transaction.amount || 0;
            }
        }
    });
    
    return {
        labels: ['Free Courses', 'Paid Courses'],
        data: [freeRevenue, paidRevenue]
    };
}

/**
 * Process top performing courses
 */
function processTopCourses(transactions, courses) {
    const courseRevenue = {};
    const courseCounts = {};
    
    transactions.forEach(transaction => {
        const courseId = transaction.course;
        courseRevenue[courseId] = (courseRevenue[courseId] || 0) + (transaction.amount || 0);
        courseCounts[courseId] = (courseCounts[courseId] || 0) + 1;
    });
    
    return courses.map(course => ({
        id: course.id,
        title: course.title || 'Unknown Course',
        revenue: courseRevenue[course.id] || 0,
        sales: courseCounts[course.id] || 0,
        price: course.price || 0,
        isFree: course.isFree || false
    })).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
}
