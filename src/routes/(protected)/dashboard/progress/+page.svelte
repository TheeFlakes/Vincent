<script>
    import { currentUser, pb } from '$lib/pocketbase.js';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    
    let { data } = $props();
    
    // Use server-side data
    let user = data.user || $currentUser;
    let userProgress = $state(data.userProgress || []);
    let statistics = $state(data.statistics || {});
    
    // Create circular progress component
    function createCircularProgress(percentage, size = 120, strokeWidth = 8) {
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;
        const strokeDashoffset = circumference - (percentage / 100) * circumference;
        
        return {
            size,
            strokeWidth,
            radius,
            circumference,
            strokeDashoffset,
            center: size / 2
        };
    }
    
    // Format time ago
    function getTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return date.toLocaleDateString();
    }
    
    // Navigate to course
    function navigateToCourse(courseId) {
        goto(`/dashboard/courses/${courseId}`);
    }
    
    // Get progress color based on percentage
    function getProgressColor(percentage) {
        if (percentage >= 100) return '#10B981'; // green
        if (percentage >= 75) return '#3B82F6'; // blue
        if (percentage >= 50) return '#F59E0B'; // yellow
        if (percentage >= 25) return '#EF4444'; // red
        return '#6B7280'; // gray
    }
    
    // Calculate course progress chart data for mini charts
    function getCourseChartData(progress) {
        const totalLessons = progress.totalLessons || 1;
        const completedLessons = progress.completedLessonsCount || 0;
        const inProgressLessons = Math.min(1, totalLessons - completedLessons); // Current lesson if not completed
        const remainingLessons = Math.max(0, totalLessons - completedLessons - inProgressLessons);
        
        return [
            { label: 'Completed', value: completedLessons, color: '#10B981' },
            { label: 'In Progress', value: inProgressLessons, color: '#F59E0B' },
            { label: 'Remaining', value: remainingLessons, color: '#374151' }
        ];
    }
</script>

<svelte:head>
    <title>Progress Dashboard - Cashfluenced</title>
    <meta name="description" content="Track your learning progress across all courses" />
</svelte:head>

<main class="bg-[#1A1A1A] min-h-full">
    <div class="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-12">
        <!-- Header Section -->
        <div class="text-center mb-6 sm:mb-8 md:mb-12">
            <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#F0F0F0] mb-2 md:mb-4">
                Progress Dashboard
            </h1>
            <p class="text-sm sm:text-base md:text-lg text-[#A0A0A0]">
                Track your learning journey and course completion
            </p>
        </div>

        <!-- Statistics Overview -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <!-- Total Courses -->
            <div class="bg-[#2B2B2B] rounded-xl p-4 sm:p-6 border border-[#2B2B2B]">
                <div class="flex items-center gap-3 mb-3">
                    <div class="p-2 bg-[#C392EC]/10 rounded-lg">
                        <svg class="w-6 h-6 text-[#C392EC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                        </svg>
                    </div>
                    <div>
                        <p class="text-2xl font-bold text-[#F0F0F0]">{statistics.totalCourses}</p>
                        <p class="text-sm text-[#A0A0A0]">Enrolled Courses</p>
                    </div>
                </div>
            </div>

            <!-- Completed Courses -->
            <div class="bg-[#2B2B2B] rounded-xl p-4 sm:p-6 border border-[#2B2B2B]">
                <div class="flex items-center gap-3 mb-3">
                    <div class="p-2 bg-[#10B981]/10 rounded-lg">
                        <svg class="w-6 h-6 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <div>
                        <p class="text-2xl font-bold text-[#F0F0F0]">{statistics.completedCourses}</p>
                        <p class="text-sm text-[#A0A0A0]">Completed</p>
                    </div>
                </div>
            </div>

            <!-- In Progress -->
            <div class="bg-[#2B2B2B] rounded-xl p-4 sm:p-6 border border-[#2B2B2B]">
                <div class="flex items-center gap-3 mb-3">
                    <div class="p-2 bg-[#F59E0B]/10 rounded-lg">
                        <svg class="w-6 h-6 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <div>
                        <p class="text-2xl font-bold text-[#F0F0F0]">{statistics.inProgressCourses}</p>
                        <p class="text-sm text-[#A0A0A0]">In Progress</p>
                    </div>
                </div>
            </div>

            <!-- Average Completion -->
            <div class="bg-[#2B2B2B] rounded-xl p-4 sm:p-6 border border-[#2B2B2B]">
                <div class="flex items-center gap-3 mb-3">
                    <div class="p-2 bg-[#85D5C8]/10 rounded-lg">
                        <svg class="w-6 h-6 text-[#85D5C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                    </div>
                    <div>
                        <p class="text-2xl font-bold text-[#F0F0F0]">{statistics.averageCompletion}%</p>
                        <p class="text-sm text-[#A0A0A0]">Avg. Completion</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Overall Progress Chart -->
        <div class="mb-8">
            <div class="bg-[#2B2B2B] rounded-xl p-6 border border-[#2B2B2B]">
                <h2 class="text-xl font-bold text-[#F0F0F0] mb-6">Overall Progress</h2>
                <div class="flex flex-col lg:flex-row items-center gap-8">
                    <!-- Circular Progress Chart -->
                    <div class="flex-shrink-0">
                        {#if statistics.totalCourses > 0}
                            {@const progressData = createCircularProgress(statistics.averageCompletion, 200, 12)}
                            <div class="relative">
                                <svg width="{progressData.size}" height="{progressData.size}" class="transform -rotate-90">
                                    <!-- Background circle -->
                                    <circle
                                        cx="{progressData.center}"
                                        cy="{progressData.center}"
                                        r="{progressData.radius}"
                                        stroke="#374151"
                                        stroke-width="{progressData.strokeWidth}"
                                        fill="none"
                                        class="opacity-20"
                                    />
                                    <!-- Progress circle -->
                                    <circle
                                        cx="{progressData.center}"
                                        cy="{progressData.center}"
                                        r="{progressData.radius}"
                                        stroke="{getProgressColor(statistics.averageCompletion)}"
                                        stroke-width="{progressData.strokeWidth}"
                                        fill="none"
                                        stroke-linecap="round"
                                        stroke-dasharray="{progressData.circumference}"
                                        stroke-dashoffset="{progressData.strokeDashoffset}"
                                        class="transition-all duration-1000 ease-out"
                                    />
                                </svg>
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <div class="text-center">
                                        <p class="text-3xl font-bold text-[#F0F0F0]">{statistics.averageCompletion}%</p>
                                        <p class="text-sm text-[#A0A0A0]">Complete</p>
                                    </div>
                                </div>
                            </div>
                        {:else}
                            <div class="w-48 h-48 bg-[#374151]/20 rounded-full flex items-center justify-center">
                                <div class="text-center">
                                    <p class="text-lg text-[#A0A0A0]">No Courses</p>
                                    <p class="text-sm text-[#A0A0A0]">Enrolled Yet</p>
                                </div>
                            </div>
                        {/if}
                    </div>
                    
                    <!-- Progress Breakdown -->
                    <div class="flex-1 w-full">
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <!-- Completed -->
                            <div class="text-center p-4 bg-[#10B981]/10 rounded-lg border border-[#10B981]/20">
                                <div class="text-2xl font-bold text-[#10B981] mb-1">{statistics.completedCourses}</div>
                                <div class="text-sm text-[#10B981]">Completed</div>
                                <div class="text-xs text-[#A0A0A0] mt-1">
                                    {statistics.totalCourses > 0 ? Math.round((statistics.completedCourses / statistics.totalCourses) * 100) : 0}% of total
                                </div>
                            </div>
                            
                            <!-- In Progress -->
                            <div class="text-center p-4 bg-[#F59E0B]/10 rounded-lg border border-[#F59E0B]/20">
                                <div class="text-2xl font-bold text-[#F59E0B] mb-1">{statistics.inProgressCourses}</div>
                                <div class="text-sm text-[#F59E0B]">In Progress</div>
                                <div class="text-xs text-[#A0A0A0] mt-1">
                                    {statistics.totalCourses > 0 ? Math.round((statistics.inProgressCourses / statistics.totalCourses) * 100) : 0}% of total
                                </div>
                            </div>
                            
                            <!-- Not Started -->
                            <div class="text-center p-4 bg-[#6B7280]/10 rounded-lg border border-[#6B7280]/20">
                                <div class="text-2xl font-bold text-[#6B7280] mb-1">{statistics.notStartedCourses}</div>
                                <div class="text-sm text-[#6B7280]">Not Started</div>
                                <div class="text-xs text-[#A0A0A0] mt-1">
                                    {statistics.totalCourses > 0 ? Math.round((statistics.notStartedCourses / statistics.totalCourses) * 100) : 0}% of total
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Course Progress Details -->
        <div class="bg-[#2B2B2B] rounded-xl p-6 border border-[#2B2B2B]">
            <h2 class="text-xl font-bold text-[#F0F0F0] mb-6">Course Progress Details</h2>
            
            {#if userProgress.length === 0}
                <div class="text-center py-12">
                    <div class="p-4 bg-[#C392EC]/10 rounded-lg inline-block mb-4">
                        <svg class="w-12 h-12 text-[#C392EC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                        </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-[#F0F0F0] mb-2">No Courses Enrolled</h3>
                    <p class="text-[#A0A0A0] mb-4">Start your learning journey by enrolling in a course</p>
                    <button 
                        onclick={() => goto('/dashboard/courses')}
                        class="px-6 py-3 bg-[#C392EC] text-white rounded-lg font-medium hover:bg-[#C392EC]/90 transition-colors"
                    >
                        Browse Courses
                    </button>
                </div>
            {:else}
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {#each userProgress as progress}
                        {@const course = progress.expand?.course}
                        {@const chartData = getCourseChartData(progress)}
                        {@const progressPercent = progress.completion_percentage || 0}
                        
                        <div class="bg-[#1A1A1A] rounded-lg p-6 border border-[#3B3B3B] hover:border-[#C392EC]/30 transition-colors cursor-pointer"
                             onclick={() => navigateToCourse(course?.id)}>
                            <!-- Course Header -->
                            <div class="flex items-start justify-between mb-4">
                                <div class="flex-1">
                                    <h3 class="text-lg font-semibold text-[#F0F0F0] mb-1">{course?.title || 'Unknown Course'}</h3>
                                    <p class="text-sm text-[#A0A0A0]">Last accessed: {getTimeAgo(progress.last_accessed)}</p>
                                </div>
                                <div class="flex-shrink-0 ml-4">
                                    <div class="text-right">
                                        <div class="text-lg font-bold text-[#F0F0F0]">{progressPercent}%</div>
                                        <div class="text-xs text-[#A0A0A0]">Complete</div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Progress Bar -->
                            <div class="mb-4">
                                <div class="w-full bg-[#374151] rounded-full h-2">
                                    <div 
                                        class="h-2 rounded-full transition-all duration-500 ease-out"
                                        style="width: {progressPercent}%; background-color: {getProgressColor(progressPercent)}"
                                    ></div>
                                </div>
                            </div>
                            
                            <!-- Lessons Progress -->
                            <div class="flex items-center justify-between text-sm">
                                <div class="flex items-center gap-4">
                                    <span class="text-[#A0A0A0]">
                                        <span class="text-[#F0F0F0] font-medium">{progress.completedLessonsCount}</span> of 
                                        <span class="text-[#F0F0F0] font-medium">{progress.totalLessons}</span> lessons
                                    </span>
                                </div>
                                <div class="flex items-center gap-2">
                                    {#if progressPercent >= 100}
                                        <span class="px-2 py-1 bg-[#10B981]/10 text-[#10B981] text-xs rounded-full border border-[#10B981]/20">
                                            Completed
                                        </span>
                                    {:else if progressPercent > 0}
                                        <span class="px-2 py-1 bg-[#F59E0B]/10 text-[#F59E0B] text-xs rounded-full border border-[#F59E0B]/20">
                                            In Progress
                                        </span>
                                    {:else}
                                        <span class="px-2 py-1 bg-[#6B7280]/10 text-[#6B7280] text-xs rounded-full border border-[#6B7280]/20">
                                            Not Started
                                        </span>
                                    {/if}
                                </div>
                            </div>
                            
                            <!-- Mini Progress Chart -->
                            <div class="mt-4 pt-4 border-t border-[#3B3B3B]">
                                <div class="flex items-center gap-3 text-xs">
                                    <div class="flex items-center gap-1">
                                        <div class="w-3 h-3 bg-[#10B981] rounded-full"></div>
                                        <span class="text-[#A0A0A0]">{chartData[0].value} completed</span>
                                    </div>
                                    {#if chartData[1].value > 0}
                                        <div class="flex items-center gap-1">
                                            <div class="w-3 h-3 bg-[#F59E0B] rounded-full"></div>
                                            <span class="text-[#A0A0A0]">{chartData[1].value} current</span>
                                        </div>
                                    {/if}
                                    {#if chartData[2].value > 0}
                                        <div class="flex items-center gap-1">
                                            <div class="w-3 h-3 bg-[#374151] rounded-full"></div>
                                            <span class="text-[#A0A0A0]">{chartData[2].value} remaining</span>
                                        </div>
                                    {/if}
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</main>
