// Sample course data seeding script for PocketBase
// This script helps populate your PocketBase instance with sample course data

import PocketBase from 'pocketbase';

const pb = new PocketBase('https://vin254.pockethost.io');

// Sample courses data
const sampleCourses = [
    {
        title: "Faceless Income Mastery",
        description: "Learn how to build multiple streams of faceless income using proven digital strategies. This comprehensive course covers everything from identifying profitable niches to scaling your income streams without showing your face online.",
        thumbnail: "", // You can upload and set this manually in PocketBase admin
        isFree: false,
        price: 97
    },
    {
        title: "Free Introduction to Digital Marketing",
        description: "Get started with digital marketing fundamentals. Learn the basics of online marketing, social media strategies, and content creation in this free introductory course.",
        thumbnail: "",
        isFree: true,
        price: 0
    },
    {
        title: "Advanced Affiliate Marketing",
        description: "Master advanced affiliate marketing techniques to scale your earnings. Discover high-converting strategies, automation tools, and traffic generation methods that top affiliates use.",
        thumbnail: "",
        isFree: false,
        price: 197
    },
    {
        title: "Social Media Automation",
        description: "Automate your social media presence to generate passive income. Learn how to use tools and systems to create, schedule, and optimize content across multiple platforms.",
        thumbnail: "",
        isFree: false,
        price: 67
    },
    {
        title: "Email Marketing Funnel",
        description: "Build high-converting email funnels that sell on autopilot. Master the art of email sequences, list building, and creating automated sales funnels that work 24/7.",
        thumbnail: "",
        isFree: false,
        price: 297
    },
    {
        title: "Free Content Creation Basics",
        description: "Learn the fundamentals of creating engaging content for social media and blogs. This free course covers content planning, creation tools, and basic design principles.",
        thumbnail: "",
        isFree: true,
        price: 0
    }
];

// Sample lessons for each course
const sampleLessons = [
    // Faceless Income Mastery lessons
    {
        title: "Introduction to Faceless Marketing",
        content: "Welcome to the course! In this lesson, we'll cover what faceless marketing is and why it's so powerful.",
        order: 1,
        duration: 15
    },
    {
        title: "Finding Your Profitable Niche",
        content: "Learn how to identify and validate profitable niches for your faceless business.",
        order: 2,
        duration: 25
    },
    {
        title: "Setting Up Your Digital Presence",
        content: "Create your online presence without showing your face - websites, social profiles, and more.",
        order: 3,
        duration: 30
    },
    
    // Free Introduction to Digital Marketing lessons
    {
        title: "Digital Marketing Overview",
        content: "An overview of digital marketing channels and strategies.",
        order: 1,
        duration: 20
    },
    {
        title: "Social Media Basics",
        content: "Understanding different social media platforms and their audiences.",
        order: 2,
        duration: 18
    }
];

async function seedData() {
    try {
        console.log('Starting data seeding...');
        
        // You'll need to authenticate as an admin first
        // Replace these with your admin credentials
        // await pb.admins.authWithPassword('your-admin-email', 'your-admin-password');
        
        console.log('Creating courses...');
        const createdCourses = [];
        
        for (const courseData of sampleCourses) {
            try {
                const course = await pb.collection('courses').create(courseData);
                createdCourses.push(course);
                console.log(`Created course: ${course.title}`);
            } catch (error) {
                console.error(`Error creating course ${courseData.title}:`, error);
            }
        }
        
        console.log('Creating lessons...');
        // Create lessons for the first course
        if (createdCourses.length > 0) {
            const firstCourse = createdCourses[0];
            const firstCourseLessons = sampleLessons.slice(0, 3);
            
            for (const lessonData of firstCourseLessons) {
                try {
                    const lesson = await pb.collection('course_lessons').create({
                        ...lessonData,
                        module: firstCourse.id
                    });
                    console.log(`Created lesson: ${lesson.title}`);
                } catch (error) {
                    console.error(`Error creating lesson ${lessonData.title}:`, error);
                }
            }
            
            // Create lessons for the second course (free course)
            if (createdCourses.length > 1) {
                const secondCourse = createdCourses[1];
                const secondCourseLessons = sampleLessons.slice(3, 5);
                
                for (const lessonData of secondCourseLessons) {
                    try {
                        const lesson = await pb.collection('course_lessons').create({
                            ...lessonData,
                            module: secondCourse.id
                        });
                        console.log(`Created lesson: ${lesson.title}`);
                    } catch (error) {
                        console.error(`Error creating lesson ${lessonData.title}:`, error);
                    }
                }
            }
        }
        
        console.log('Data seeding completed!');
        
    } catch (error) {
        console.error('Error seeding data:', error);
    }
}

// Uncomment the line below to run the seeding script
// seedData();

export { sampleCourses, sampleLessons, seedData };
