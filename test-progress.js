/**
 * Progress Testing Script
 * 
 * This script helps test the progress tracking functionality by creating
 * sample user progress data for testing purposes.
 * 
 * Usage:
 * 1. Update the credentials below with your admin account
 * 2. Run: node test-progress.js
 * 3. Check the progress page in your browser
 */

import PocketBase from 'pocketbase';

const pb = new PocketBase('https://vin254.pockethost.io');

// Sample progress data for testing
const sampleProgressData = [
    {
        completion_percentage: 75,
        completed_lessons: ['lesson1', 'lesson2', 'lesson3'],
        description: 'Faceless Income Mastery - 75% Complete'
    },
    {
        completion_percentage: 100,
        completed_lessons: ['lesson1', 'lesson2', 'lesson3', 'lesson4'],
        description: 'Digital Marketing Basics - Completed'
    },
    {
        completion_percentage: 25,
        completed_lessons: ['lesson1'],
        description: 'Advanced Affiliate Marketing - Just Started'
    },
    {
        completion_percentage: 50,
        completed_lessons: ['lesson1', 'lesson2'],
        description: 'E-commerce Fundamentals - Halfway Through'
    }
];

async function createSampleProgress() {
    try {
        console.log('🚀 Starting progress data creation...');
        
        // Authenticate (update with your admin credentials)
        console.log('⚠️  Note: Update admin credentials below');
        // await pb.collection('users').authWithPassword('admin@example.com', 'admin_password');
        console.log('❌ Please update admin credentials in this script first');
        return;
        
        console.log('✅ Authenticated as admin');
        
        // Get all courses
        const courses = await pb.collection('courses').getFullList();
        console.log(`📚 Found ${courses.length} courses`);
        
        // Get all users (except admin)
        const users = await pb.collection('users').getFullList({
            filter: 'email != "admin@example.com"'
        });
        console.log(`👥 Found ${users.length} users`);
        
        if (courses.length === 0 || users.length === 0) {
            console.log('❌ Need courses and users to create progress data');
            return;
        }
        
        // Create sample progress for each user
        for (const user of users) {
            console.log(`\n👤 Creating progress for user: ${user.email}`);
            
            // Randomly assign 2-3 courses to each user
            const userCourses = courses.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 2);
            
            for (let i = 0; i < userCourses.length; i++) {
                const course = userCourses[i];
                const progressData = sampleProgressData[i % sampleProgressData.length];
                
                try {
                    // Check if progress already exists
                    const existingProgress = await pb.collection('user_progress').getList(1, 1, {
                        filter: `user = "${user.id}" && course = "${course.id}"`
                    });
                    
                    if (existingProgress.items.length > 0) {
                        console.log(`   ⏭️  Progress already exists for course: ${course.title}`);
                        continue;
                    }
                    
                    // Get lessons for this course
                    const lessons = await pb.collection('lessons').getFullList({
                        filter: `course = "${course.id}"`,
                        sort: 'order'
                    });
                    
                    const totalLessons = lessons.length || 4; // Default to 4 if no lessons found
                    const completedCount = Math.floor((progressData.completion_percentage / 100) * totalLessons);
                    const completedLessons = lessons.slice(0, completedCount).map(l => l.id);
                    
                    // Create progress record
                    const progressRecord = await pb.collection('user_progress').create({
                        user: user.id,
                        course: course.id,
                        completed_lessons: JSON.stringify(completedLessons),
                        current_lesson: lessons[completedCount]?.id || null,
                        completion_percentage: progressData.completion_percentage,
                        last_accessed: new Date().toISOString()
                    });
                    
                    console.log(`   ✅ Created progress: ${course.title} - ${progressData.completion_percentage}%`);
                    
                } catch (error) {
                    console.error(`   ❌ Error creating progress for ${course.title}:`, error.message);
                }
            }
        }
        
        console.log('\n🎉 Sample progress data creation completed!');
        console.log('💡 Now you can test the progress dashboard at /dashboard/progress');
        
    } catch (error) {
        console.error('❌ Error creating sample progress:', error);
        console.log('💡 Make sure to:');
        console.log('   1. Update admin credentials in this script');
        console.log('   2. Ensure PocketBase instance is running');
        console.log('   3. Check that courses and users exist');
    }
}

async function showProgressStats() {
    try {
        console.log('\n📊 Current Progress Statistics:');
        
        const allProgress = await pb.collection('user_progress').getFullList({
            expand: 'user,course'
        });
        
        console.log(`Total Progress Records: ${allProgress.length}`);
        
        const completedCourses = allProgress.filter(p => p.completion_percentage >= 100).length;
        const inProgressCourses = allProgress.filter(p => p.completion_percentage > 0 && p.completion_percentage < 100).length;
        const notStartedCourses = allProgress.filter(p => p.completion_percentage === 0).length;
        
        console.log(`Completed Courses: ${completedCourses}`);
        console.log(`In Progress Courses: ${inProgressCourses}`);
        console.log(`Not Started Courses: ${notStartedCourses}`);
        
        if (allProgress.length > 0) {
            const avgCompletion = Math.round(
                allProgress.reduce((sum, p) => sum + (p.completion_percentage || 0), 0) / allProgress.length
            );
            console.log(`Average Completion: ${avgCompletion}%`);
        }
        
    } catch (error) {
        console.error('❌ Error getting progress stats:', error.message);
    }
}

// Main execution
async function main() {
    console.log('🧪 Progress Testing Script');
    console.log('==========================\n');
    
    await createSampleProgress();
    await showProgressStats();
}

main();
