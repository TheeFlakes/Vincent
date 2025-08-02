import PocketBase from 'pocketbase';

const pb = new PocketBase('https://vin254.pockethost.io');

async function testCourse() {
    try {
        console.log('Testing course ID: 2m173p6771d1ol2');
        
        // Try to fetch the course without authentication
        const course = await pb.collection('courses').getOne('2m173p6771d1ol2');
        console.log('Course found:', course);
        
        // Try to fetch lessons for this course
        const lessons = await pb.collection('course_lessons').getList(1, 50, {
            filter: `module = "2m173p6771d1ol2"`,
            sort: 'order'
        });
        console.log('Lessons found:', lessons.items.length);
        
    } catch (error) {
        console.error('Error:', error);
        if (error.status === 404) {
            console.log('Course not found - this is likely the issue!');
        }
    }
}

testCourse();
