<script>
    import { currentUser, pb } from '$lib/pocketbase.js';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    
    let { data } = $props();
    
    let user = $state(data.user || $currentUser);
    let course = $state(data.course);
    let lesson = $state(data.lesson);
    let lessons = $state(data.lessons || []);
    let totalLessons = $state(data.totalLessons || 0);
    let userProgress = $state(data.userProgress);
    
    let isUpdatingProgress = $state(false);
    let isLessonCompleted = $state(false);
    let showCompletionAnimation = $state(false);
    
    // Calculate lesson position
    let currentLessonIndex = $state(0);
    let nextLesson = $state(null);
    let previousLesson = $state(null);
    
    $effect(() => {
        currentLessonIndex = lessons.findIndex(l => l.id === lesson.id);
        nextLesson = currentLessonIndex < lessons.length - 1 ? lessons[currentLessonIndex + 1] : null;
        previousLesson = currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : null;
        
        // Check if current lesson is completed
        if (userProgress && userProgress.completed_lessons) {
            const completedLessons = Array.isArray(userProgress.completed_lessons) 
                ? userProgress.completed_lessons 
                : JSON.parse(userProgress.completed_lessons || '[]');
            isLessonCompleted = completedLessons.includes(lesson.id);
        }
    });
    
    // Mark lesson as completed
    async function markLessonCompleted() {
        if (isUpdatingProgress || isLessonCompleted) return;
        
        isUpdatingProgress = true;
        try {
            if (!userProgress) {
                // Create initial progress if it doesn't exist
                userProgress = await pb.collection('user_progress').create({
                    user: user.id,
                    course: course.id,
                    completed_lessons: [lesson.id],
                    current_lesson: lesson.id,
                    completion_percentage: Math.round((1 / totalLessons) * 100),
                    last_accessed: new Date().toISOString()
                });
            } else {
                // Update existing progress
                const completedLessons = Array.isArray(userProgress.completed_lessons) 
                    ? userProgress.completed_lessons 
                    : JSON.parse(userProgress.completed_lessons || '[]');
                
                if (!completedLessons.includes(lesson.id)) {
                    completedLessons.push(lesson.id);
                    const completionPercentage = Math.round((completedLessons.length / totalLessons) * 100);
                    
                    userProgress = await pb.collection('user_progress').update(userProgress.id, {
                        completed_lessons: completedLessons,
                        current_lesson: lesson.id,
                        completion_percentage: completionPercentage,
                        last_accessed: new Date().toISOString()
                    });
                }
            }
            
            isLessonCompleted = true;
            showCompletionAnimation = true;
            
            // Hide animation after 2 seconds
            setTimeout(() => {
                showCompletionAnimation = false;
            }, 2000);
            
        } catch (err) {
            console.error('Error updating progress:', err);
            alert('Failed to update progress. Please try again.');
        } finally {
            isUpdatingProgress = false;
        }
    }
    
    // Update current lesson without marking as completed
    async function updateCurrentLesson() {
        if (!userProgress) return;
        
        try {
            await pb.collection('user_progress').update(userProgress.id, {
                current_lesson: lesson.id,
                last_accessed: new Date().toISOString()
            });
        } catch (err) {
            console.error('Error updating current lesson:', err);
        }
    }
    
    // Navigate to lesson
    function goToLesson(lessonId) {
        goto(`/dashboard/courses/${course.id}/lessons/${lessonId}`);
    }
    
    // Navigate to course overview
    function goToCourse() {
        goto(`/dashboard/courses/${course.id}`);
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
        if (!userProgress || !userProgress.completed_lessons) return 0;
        const completedLessons = Array.isArray(userProgress.completed_lessons) 
            ? userProgress.completed_lessons 
            : JSON.parse(userProgress.completed_lessons || '[]');
        return Math.round((completedLessons.length / totalLessons) * 100);
    }
    
    // Check if lesson is completed
    function isLessonCompletedById(lessonId) {
        if (!userProgress || !userProgress.completed_lessons) return false;
        const completedLessons = Array.isArray(userProgress.completed_lessons) 
            ? userProgress.completed_lessons 
            : JSON.parse(userProgress.completed_lessons || '[]');
        return completedLessons.includes(lessonId);
    }
    
    // Update current lesson on mount
    onMount(() => {
        updateCurrentLesson();
    });
</script>

<svelte:head>
    <title>{lesson.title} - {course.title} - Cashfluenced</title>
</svelte:head>

<main class="bg-[#1A1A1A] min-h-full">
    <!-- Progress bar -->
    <div class="bg-[#2B2B2B] border-b border-[#3B3B3B]">
        <div class="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-3">
            <div class="flex items-center justify-between mb-2">
                <button 
                    onclick={goToCourse}
                    class="flex items-center gap-2 text-[#A0A0A0] hover:text-[#F0F0F0] transition-colors"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                    {course.title}
                </button>
                <span class="text-sm text-[#A0A0A0]">
                    {getProgressPercentage()}% Complete
                </span>
            </div>
            <div class="w-full bg-[#3B3B3B] rounded-full h-2">
                <div 
                    class="bg-[#85D5C8] h-2 rounded-full transition-all duration-500" 
                    style="width: {getProgressPercentage()}%"
                ></div>
            </div>
        </div>
    </div>
    
    <div class="flex h-[calc(100vh-120px)]">
        <!-- Lesson Content -->
        <div class="flex-1 flex flex-col">
            <!-- Lesson Header -->
            <div class="bg-[#2B2B2B] px-6 py-4 border-b border-[#3B3B3B]">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-xl font-bold text-[#F0F0F0] mb-1">{lesson.title}</h1>
                        <div class="flex items-center gap-4 text-sm text-[#A0A0A0]">
                            <span>Lesson {lesson.order || currentLessonIndex + 1} of {totalLessons}</span>
                            {#if lesson.duration}
                                <span>{formatDuration(lesson.duration)}</span>
                            {/if}
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        {#if isLessonCompleted}
                            <div class="flex items-center gap-2 px-3 py-1 bg-[#85D5C8]/10 text-[#85D5C8] rounded-lg border border-[#85D5C8]/20">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                Completed
                            </div>
                        {:else}
                            <button
                                onclick={markLessonCompleted}
                                disabled={isUpdatingProgress}
                                class="px-4 py-2 bg-[#85D5C8] text-[#1A1A1A] rounded-lg font-medium hover:bg-[#85D5C8]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {#if isUpdatingProgress}
                                    <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Updating...
                                {:else}
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    Mark Complete
                                {/if}
                            </button>
                        {/if}
                    </div>
                </div>
            </div>
            
            <!-- Lesson Content Area -->
            <div class="flex-1 overflow-y-auto p-6">
                <div class="max-w-4xl mx-auto">
                    <!-- Lesson Content -->
                    <div class="bg-[#2B2B2B] rounded-xl p-8 border border-[#2B2B2B]">
                        <div class="prose prose-invert max-w-none">
                            {#if lesson.content}
                                <div class="text-[#F0F0F0] leading-relaxed whitespace-pre-wrap">
                                    {lesson.content}
                                </div>
                            {:else}
                                <div class="text-center py-12">
                                    <div class="p-4 bg-[#C392EC]/10 rounded-lg inline-block mb-4">
                                        <svg class="w-8 h-8 text-[#C392EC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                        </svg>
                                    </div>
                                    <h3 class="text-xl font-bold text-[#F0F0F0] mb-2">Lesson Content Coming Soon</h3>
                                    <p class="text-[#A0A0A0]">This lesson content is being prepared and will be available shortly.</p>
                                </div>
                            {/if}
                        </div>
                    </div>
                    
                    <!-- Navigation -->
                    <div class="flex items-center justify-between mt-8">
                        <div>
                            {#if previousLesson}
                                <button
                                    onclick={() => goToLesson(previousLesson.id)}
                                    class="flex items-center gap-2 px-4 py-2 bg-[#2B2B2B] text-[#F0F0F0] rounded-lg hover:bg-[#3B3B3B] transition-colors border border-[#3B3B3B]"
                                >
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                                    </svg>
                                    Previous
                                </button>
                            {/if}
                        </div>
                        
                        <div>
                            {#if nextLesson}
                                <button
                                    onclick={() => goToLesson(nextLesson.id)}
                                    class="flex items-center gap-2 px-4 py-2 bg-[#C392EC] text-white rounded-lg hover:bg-[#C392EC]/80 transition-colors"
                                >
                                    Next
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                    </svg>
                                </button>
                            {:else if isLessonCompleted}
                                <button
                                    onclick={goToCourse}
                                    class="flex items-center gap-2 px-4 py-2 bg-[#85D5C8] text-[#1A1A1A] rounded-lg hover:bg-[#85D5C8]/80 transition-colors font-medium"
                                >
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    Course Complete!
                                </button>
                            {/if}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Lesson Sidebar -->
        <div class="w-80 bg-[#2B2B2B] border-l border-[#3B3B3B] overflow-y-auto">
            <div class="p-6">
                <h2 class="text-lg font-bold text-[#F0F0F0] mb-4">Course Content</h2>
                <div class="space-y-2">
                    {#each lessons as lessonItem, index}
                        <button
                            onclick={() => goToLesson(lessonItem.id)}
                            class="w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left {
                                lessonItem.id === lesson.id 
                                    ? 'bg-[#C392EC]/10 border border-[#C392EC]/30' 
                                    : 'bg-[#1A1A1A] hover:bg-[#3B3B3B] border border-[#3B3B3B]'
                            }"
                        >
                            <div class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium {
                                isLessonCompletedById(lessonItem.id) 
                                    ? 'bg-[#85D5C8] text-[#1A1A1A]' 
                                    : lessonItem.id === lesson.id 
                                        ? 'bg-[#C392EC] text-white' 
                                        : 'bg-[#3B3B3B] text-[#A0A0A0]'
                            }">
                                {#if isLessonCompletedById(lessonItem.id)}
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                {:else}
                                    {lessonItem.order || index + 1}
                                {/if}
                            </div>
                            <div class="flex-1 min-w-0">
                                <h3 class="font-medium text-[#F0F0F0] text-sm truncate">{lessonItem.title}</h3>
                                {#if lessonItem.duration}
                                    <p class="text-xs text-[#A0A0A0]">{formatDuration(lessonItem.duration)}</p>
                                {/if}
                            </div>
                        </button>
                    {/each}
                </div>
            </div>
        </div>
    </div>
    
    <!-- Completion Animation -->
    {#if showCompletionAnimation}
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div class="bg-[#2B2B2B] rounded-xl p-8 border border-[#85D5C8]/30 text-center">
                <div class="w-16 h-16 bg-[#85D5C8] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-[#1A1A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h3 class="text-xl font-bold text-[#F0F0F0] mb-2">Lesson Completed!</h3>
                <p class="text-[#A0A0A0]">Great job! You're making progress.</p>
            </div>
        </div>
    {/if}
</main>
