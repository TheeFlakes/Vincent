<script>
    import { currentUser, pb } from '$lib/pocketbase.js';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    
    let { data } = $props();
    
    let user = $state(data.user || $currentUser);
    let course = $state(data.course);
    let lessons = $state(data.lessons || []);
    let totalLessons = $state(data.totalLessons || 0);
    let userProgress = $state(data.userProgress);
    let isEnrolled = $state(data.isEnrolled || false);
    
    let isEnrolling = $state(false);
    let showEnrollmentSuccess = $state(false);
    let showPaymentSuccess = $state(false);
    let pageLoading = $state(false);
    
    // Helper function to safely parse completed lessons
    function safeParseCompletedLessons(completedLessons) {
        try {
            if (!completedLessons) return [];
            if (Array.isArray(completedLessons)) return completedLessons;
            if (typeof completedLessons === 'string') {
                if (completedLessons.trim() === '') return [];
                return JSON.parse(completedLessons);
            }
            return [];
        } catch (error) {
            console.warn('Failed to parse completed lessons:', error, 'Input was:', completedLessons);
            return [];
        }
    }
    
    // Update reactive state when data prop changes
    $effect(() => {
        console.log('Course data received:', data);
        if (data) {
            course = data.course;
            lessons = data.lessons || [];
            totalLessons = data.totalLessons || 0;
            userProgress = data.userProgress;
            isEnrolled = data.isEnrolled || false;
            
            // Debug enrollment status
            console.log('Course details:', {
                title: course?.title,
                isFree: course?.isFree,
                price: course?.price,
                isEnrolled: isEnrolled,
                userProgress: userProgress,
                paymentStatus: userProgress?.payment_status,
                stripeSessionId: userProgress?.stripe_session_id
            });
            
            // Debug userProgress structure
            if (userProgress) {
                console.log('User progress received:', userProgress);
                console.log('Completed lessons field:', userProgress.completed_lessons);
                console.log('Type of completed lessons:', typeof userProgress.completed_lessons);
            }
        }
    });
    
    // Check for enrollment success from URL params
    $effect(() => {
        const enrolled = $page.url.searchParams.get('enrolled');
        const sessionId = $page.url.searchParams.get('session_id');
        
        if (enrolled === 'true') {
            showEnrollmentSuccess = true;
            
            // If there's also a session_id, it means payment was successful
            if (sessionId) {
                showPaymentSuccess = true;
            }
            
            // Clear the parameters
            const url = new URL($page.url);
            url.searchParams.delete('enrolled');
            url.searchParams.delete('session_id');
            goto(url.toString(), { replaceState: true });
        }
    });
    
    // Format price display
    function formatPrice(course) {
        if (course.isFree) {
            return 'Free';
        }
        return `$${course.price}`;
    }
    
    // Get price badge class
    function getPriceBadgeClass(course) {
        if (course.isFree) {
            return 'bg-green-500/10 text-green-400 border-green-500/20';
        }
        return 'bg-[#C392EC]/10 text-[#C392EC] border-[#C392EC]/20';
    }
    
    // Handle course enrollment (for free courses)
    async function handleEnroll() {
        if (isEnrolling || !course.isFree) return;
        
        isEnrolling = true;
        try {
            // Create enrollment record for free course
            userProgress = await pb.collection('user_progress').create({
                user: user.id,
                course: course.id,
                completed_lessons: [],
                current_lesson: null,
                completion_percentage: 0,
                last_accessed: new Date().toISOString()
            });
            
            isEnrolled = true;
            showEnrollmentSuccess = true;
            
        } catch (err) {
            console.error('Enrollment failed:', err);
            alert('Failed to enroll in course. Please try again.');
        } finally {
            isEnrolling = false;
        }
    }
    
    // Start course or continue learning
    function startCourse() {
        if (lessons.length > 0) {
            // Find the current lesson or start from the first one
            let targetLessonId = lessons[0].id;
            
            if (userProgress && userProgress.current_lesson) {
                // Continue from where user left off
                targetLessonId = userProgress.current_lesson;
            }
            
            goto(`/dashboard/courses/${course.id}/lessons/${targetLessonId}`);
        }
    }
    
    // Go to checkout for paid courses
    function goToCheckout() {
        goto(`/dashboard/courses/${course.id}/checkout`);
    }
    
    // Format duration
    function formatDuration(minutes) {
        if (minutes < 60) {
            return `${minutes} min`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
    
    // Calculate progress percentage
    function getProgressPercentage() {
        if (!userProgress) return 0;
        const completedLessons = safeParseCompletedLessons(userProgress.completed_lessons);
        return Math.round((completedLessons.length / totalLessons) * 100);
    }
    
    // Check if lesson is completed
    function isLessonCompleted(lessonId) {
        if (!userProgress) return false;
        const completedLessons = safeParseCompletedLessons(userProgress.completed_lessons);
        return completedLessons.includes(lessonId);
    }
    
    // Get total course duration
    function getTotalDuration() {
        return lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0);
    }
    
    // Go back to courses
    function goBack() {
        goto('/dashboard/courses');
    }
</script>

<svelte:head>
    <title>{course?.title || 'Course'} - Cashfluenced</title>
</svelte:head>

<main class="bg-[#1A1A1A] min-h-full">
    {#if !course}
        <!-- Loading State -->
        <div class="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-12 lg:py-16">
            <div class="animate-pulse">
                <div class="bg-[#2B2B2B] h-8 w-32 rounded mb-6"></div>
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div class="lg:col-span-2">
                        <div class="bg-[#2B2B2B] rounded-xl p-6 mb-6">
                            <div class="h-6 bg-[#3B3B3B] rounded mb-4"></div>
                            <div class="h-4 bg-[#3B3B3B] rounded w-3/4 mb-2"></div>
                            <div class="h-4 bg-[#3B3B3B] rounded w-1/2"></div>
                        </div>
                    </div>
                    <div>
                        <div class="bg-[#2B2B2B] rounded-xl p-6">
                            <div class="h-6 bg-[#3B3B3B] rounded mb-4"></div>
                            <div class="h-10 bg-[#3B3B3B] rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {:else}
    <div class="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-12 lg:py-16">
        <!-- Back button -->
        <button 
            onclick={goBack}
            class="flex items-center gap-2 text-[#A0A0A0] hover:text-[#F0F0F0] transition-colors mb-6"
        >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Courses
        </button>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Course Content -->
            <div class="lg:col-span-2">
                <!-- Course Header -->
                <div class="bg-[#2B2B2B] rounded-xl p-6 mb-6 border border-[#2B2B2B]">
                    <div class="mb-4">
                        <div class="flex items-center gap-3 mb-3">
                            <span class="px-3 py-1 text-sm font-bold rounded-lg border {getPriceBadgeClass(course)}">
                                {formatPrice(course)}
                            </span>
                            <span class="text-sm text-[#A0A0A0]">
                                {new Date(course.created).toLocaleDateString()}
                            </span>
                        </div>
                        <h1 class="text-2xl sm:text-3xl font-bold text-[#F0F0F0] mb-3">
                            {course.title}
                        </h1>
                        <p class="text-base text-[#A0A0A0] leading-relaxed">
                            {course.description}
                        </p>
                    </div>

                    <!-- Course Stats -->
                    <div class="flex flex-wrap gap-6 text-sm text-[#A0A0A0] mb-6">
                        <div class="flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            {totalLessons} Lesson{totalLessons !== 1 ? 's' : ''}
                        </div>
                        <div class="flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            {formatDuration(getTotalDuration())} Total
                        </div>
                        <div class="flex items-center gap-2">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                            </svg>
                            Self-paced
                        </div>
                    </div>

                    <!-- Progress Bar (for enrolled users) -->
                    {#if isEnrolled && userProgress}
                        <div class="mb-6 p-4 bg-[#1A1A1A] rounded-lg border border-[#3B3B3B]">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-sm font-medium text-[#F0F0F0]">Your Progress</span>
                                <span class="text-sm text-[#85D5C8] font-medium">{getProgressPercentage()}%</span>
                            </div>
                            <div class="w-full bg-[#3B3B3B] rounded-full h-2">
                                <div 
                                    class="bg-[#85D5C8] h-2 rounded-full transition-all duration-500" 
                                    style="width: {getProgressPercentage()}%"
                                ></div>
                            </div>
                            <p class="text-xs text-[#A0A0A0] mt-2">
                                {safeParseCompletedLessons(userProgress.completed_lessons).length} of {totalLessons} lessons completed
                            </p>
                        </div>
                    {/if}

                    <!-- Action Button -->
                    <div class="flex gap-3">
                        {#if isEnrolled}
                            <!-- User is enrolled - show continue/start learning -->
                            <button 
                                onclick={startCourse}
                                class="px-6 py-3 bg-[#C392EC] text-white rounded-lg font-medium hover:bg-[#C392EC]/80 transition-colors flex items-center gap-2"
                            >
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10V9a2 2 0 012-2h2a2 2 0 012 2v1M9 10H7a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2h-2"></path>
                                </svg>
                                {userProgress && getProgressPercentage() > 0 ? 'Continue Learning' : 'Start Learning'}
                            </button>
                        {:else if course.isFree}
                            <!-- Free course, not enrolled - show enroll button -->
                            <button 
                                onclick={handleEnroll}
                                disabled={isEnrolling}
                                class="px-6 py-3 bg-[#85D5C8] text-[#1A1A1A] rounded-lg font-medium hover:bg-[#85D5C8]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {#if isEnrolling}
                                    <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Enrolling...
                                {:else}
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                    </svg>
                                    Enroll for Free
                                {/if}
                            </button>
                        {:else}
                            <!-- Paid course, not enrolled - show purchase button -->
                            <button 
                                onclick={goToCheckout}
                                class="px-6 py-3 bg-[#C392EC] text-white rounded-lg font-medium hover:bg-[#C392EC]/80 transition-colors flex items-center gap-2"
                            >
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 2.5M7 13l2.5 2.5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z"></path>
                                </svg>
                                Purchase Now - {formatPrice(course)}
                            </button>
                        {/if}
                    </div>
                </div>

                <!-- Course Lessons -->
                <div class="bg-[#2B2B2B] rounded-xl p-6 border border-[#2B2B2B]">
                    <h2 class="text-xl font-bold text-[#F0F0F0] mb-4">Course Content</h2>
                    
                    {#if lessons.length === 0}
                        <p class="text-[#A0A0A0] text-center py-8">
                            Course content is being prepared. Check back soon!
                        </p>
                    {:else}
                        <div class="space-y-3">
                            {#each lessons as lesson, index}
                                <div class="flex items-center gap-4 p-4 bg-[#1A1A1A] rounded-lg border border-[#3B3B3B] hover:border-[#C392EC]/30 transition-colors">
                                    <div class="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium {
                                        isLessonCompleted(lesson.id) 
                                            ? 'bg-[#85D5C8]/10 text-[#85D5C8]' 
                                            : 'bg-[#C392EC]/10 text-[#C392EC]'
                                    }">
                                        {#if isLessonCompleted(lesson.id)}
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                            </svg>
                                        {:else}
                                            {lesson.order || index + 1}
                                        {/if}
                                    </div>
                                    <div class="flex-1">
                                        <h3 class="font-medium text-[#F0F0F0] mb-1">{lesson.title}</h3>
                                        {#if lesson.duration}
                                            <p class="text-sm text-[#A0A0A0]">{formatDuration(lesson.duration)}</p>
                                        {/if}
                                    </div>
                                    {#if isEnrolled || course.isFree}
                                        <button 
                                            onclick={() => goto(`/dashboard/courses/${course.id}/lessons/${lesson.id}`)}
                                            class="p-2 text-[#C392EC] hover:bg-[#C392EC]/10 rounded-lg transition-colors"
                                            aria-label="Start lesson"
                                        >
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10V9a2 2 0 012-2h2a2 2 0 012 2v1M9 10H7a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2h-2"></path>
                                            </svg>
                                        </button>
                                    {:else}
                                        <svg class="w-5 h-5 text-[#A0A0A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                        </svg>
                                    {/if}
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Sidebar -->
            <div class="lg:col-span-1">
                <!-- Course Image -->
                <div class="bg-[#2B2B2B] rounded-xl overflow-hidden mb-6 border border-[#2B2B2B]">
                    <div class="aspect-video bg-gradient-to-br from-[#C392EC]/20 to-[#85D5C8]/20 flex items-center justify-center">
                        {#if course.thumbnail}
                            <img 
                                src={pb.files.getUrl(course, course.thumbnail)}
                                alt={course.title}
                                class="w-full h-full object-cover"
                            />
                        {:else}
                            <svg class="w-16 h-16 text-[#C392EC]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                            </svg>
                        {/if}
                    </div>
                </div>

                <!-- Course Info -->
                <div class="bg-[#2B2B2B] rounded-xl p-6 border border-[#2B2B2B]">
                    <h3 class="text-lg font-bold text-[#F0F0F0] mb-4">Course Information</h3>
                    <div class="space-y-4">
                        <div class="flex justify-between items-center">
                            <span class="text-[#A0A0A0]">Price</span>
                            <span class="font-bold {course.isFree ? 'text-green-400' : 'text-[#C392EC]'}">
                                {formatPrice(course)}
                            </span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-[#A0A0A0]">Lessons</span>
                            <span class="text-[#F0F0F0]">{totalLessons}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-[#A0A0A0]">Duration</span>
                            <span class="text-[#F0F0F0]">
                                {formatDuration(lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0))}
                            </span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-[#A0A0A0]">Access</span>
                            <span class="text-[#F0F0F0]">Lifetime</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-[#A0A0A0]">Level</span>
                            <span class="text-[#F0F0F0]">All Levels</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    {/if}

    <!-- Enrollment Success Modal -->
    {#if showEnrollmentSuccess}
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div class="bg-[#2B2B2B] rounded-xl p-8 border border-[#85D5C8]/30 text-center max-w-md mx-4">
                <div class="w-16 h-16 bg-[#85D5C8] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-[#1A1A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-bold text-[#F0F0F0] mb-2">
                    {showPaymentSuccess ? 'Payment Successful!' : 'Welcome to the Course!'}
                </h3>
                <p class="text-[#A0A0A0] mb-6">
                    {#if showPaymentSuccess}
                        Your payment has been processed and you now have full access to {course.title}. Ready to start learning?
                    {:else}
                        You've successfully enrolled in {course.title}. Ready to start learning?
                    {/if}
                </p>
                <div class="flex gap-3">
                    <button
                        onclick={() => { showEnrollmentSuccess = false; showPaymentSuccess = false; }}
                        class="flex-1 px-4 py-2 bg-[#2B2B2B] text-[#F0F0F0] rounded-lg hover:bg-[#3B3B3B] transition-colors border border-[#3B3B3B]"
                    >
                        Later
                    </button>
                    <button
                        onclick={() => { showEnrollmentSuccess = false; showPaymentSuccess = false; startCourse(); }}
                        class="flex-1 px-4 py-2 bg-[#C392EC] text-white rounded-lg hover:bg-[#C392EC]/80 transition-colors"
                    >
                        Start Learning
                    </button>
                </div>
            </div>
        </div>
    {/if}
</main>
