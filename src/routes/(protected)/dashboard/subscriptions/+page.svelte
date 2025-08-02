<script>
    import { currentUser, pb } from '$lib/pocketbase.js';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    
    let { data } = $props();
    
    // Use server-side data
    let user = data.user || $currentUser;
    let subscriptions = $state(data.subscriptions || []);
    let totalSpent = $state(data.totalSpent || 0);
    let totalCommissions = $state(data.totalCommissions || 0);
    let subscriptionCount = $state(data.subscriptionCount || 0);
    
    let loading = $state(false);
    let error = $state(null);
    
    // Format currency
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }
    
    // Format date
    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    // Get subscription status
    function getSubscriptionStatus(subscription) {
        if (subscription.amountPaid > 0) {
            return { status: 'Active', color: 'text-green-400' };
        }
        return { status: 'Pending', color: 'text-yellow-400' };
    }
    
    // Get course thumbnail URL
    function getCourseImage(course) {
        if (course?.thumbnail) {
            return pb.files.getUrl(course, course.thumbnail, { thumb: '300x200' });
        }
        return '/static/placeholder-course.jpg'; // fallback image
    }

    // Handle starting or continuing a course
    async function startOrContinueCourse(subscription) {
        if (!subscription.nextLessonId) {
            // No lessons available, go to course page
            goto(`/dashboard/courses/${subscription.course}`);
            return;
        }

        if (subscription.isEnrolled) {
            // User is already enrolled, go to current/next lesson
            goto(`/dashboard/courses/${subscription.course}/lessons/${subscription.nextLessonId}`);
        } else {
            // User needs to be enrolled first, try to auto-enroll them
            try {
                await pb.collection('user_progress').create({
                    user: user.id,
                    course: subscription.course,
                    completed_lessons: [],
                    current_lesson: subscription.nextLessonId,
                    completion_percentage: 0,
                    last_accessed: new Date().toISOString()
                });

                // Navigate to first lesson
                goto(`/dashboard/courses/${subscription.course}/lessons/${subscription.nextLessonId}`);
            } catch (err) {
                console.error('Auto-enrollment failed:', err);
                // Fallback to course page
                goto(`/dashboard/courses/${subscription.course}`);
            }
        }
    }

    // Get action button text and style
    function getActionButton(subscription) {
        if (!subscription.nextLessonId) {
            return {
                text: 'View Course',
                icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
                bgClass: 'bg-[#C392EC]/10 hover:bg-[#C392EC]/20',
                textClass: 'text-[#C392EC]'
            };
        }

        if (subscription.isEnrolled && subscription.userProgress?.completion_percentage > 0) {
            return {
                text: 'Continue Learning',
                icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M13 16h-1.586a1 1 0 01-.707-.293l-2.414-2.414a1 1 0 00-.707-.293H7',
                bgClass: 'bg-[#85D5C8]/10 hover:bg-[#85D5C8]/20',
                textClass: 'text-[#85D5C8]'
            };
        }

        return {
            text: 'Start Learning',
            icon: 'M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M13 16h-1.586a1 1 0 01-.707-.293l-2.414-2.414a1 1 0 00-.707-.293H7',
            bgClass: 'bg-[#85D5C8]/10 hover:bg-[#85D5C8]/20',
            textClass: 'text-[#85D5C8]'
        };
    }
</script>

<svelte:head>
    <title>My Subscriptions - Cashfluenced</title>
    <meta name="description" content="Manage your course subscriptions and track your learning progress" />
</svelte:head>

<main class="bg-[#1A1A1A] min-h-full">
    <div class="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-12">
        <!-- Header Section -->
        <div class="text-center mb-6 sm:mb-8 md:mb-12">
            <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#F0F0F0] mb-2 md:mb-4">
                My Subscriptions
            </h1>
            <p class="text-sm sm:text-base md:text-lg text-[#A0A0A0]">
                Track your course subscriptions and learning progress
            </p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 sm:mb-8 md:mb-12">
            <!-- Total Subscriptions -->
            <div class="bg-[#2B2B2B] rounded-xl p-4 sm:p-6 shadow-lg border border-[#2B2B2B]">
                <div class="flex items-center gap-3">
                    <div class="p-2 sm:p-3 bg-[#C392EC]/10 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 sm:w-6 sm:h-6 text-[#C392EC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <div>
                        <p class="text-lg sm:text-xl md:text-2xl font-bold text-[#F0F0F0]">{subscriptionCount}</p>
                        <p class="text-xs sm:text-sm text-[#A0A0A0]">Total Courses</p>
                    </div>
                </div>
            </div>

            <!-- Total Spent -->
            <div class="bg-[#2B2B2B] rounded-xl p-4 sm:p-6 shadow-lg border border-[#2B2B2B]">
                <div class="flex items-center gap-3">
                    <div class="p-2 sm:p-3 bg-[#85D5C8]/10 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 sm:w-6 sm:h-6 text-[#85D5C8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                    </div>
                    <div>
                        <p class="text-lg sm:text-xl md:text-2xl font-bold text-[#F0F0F0]">{formatCurrency(totalSpent)}</p>
                        <p class="text-xs sm:text-sm text-[#A0A0A0]">Total Spent</p>
                    </div>
                </div>
            </div>

            <!-- Total Commissions -->
            <div class="bg-[#2B2B2B] rounded-xl p-4 sm:p-6 shadow-lg border border-[#2B2B2B]">
                <div class="flex items-center gap-3">
                    <div class="p-2 sm:p-3 bg-[#F4C430]/10 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 sm:w-6 sm:h-6 text-[#F4C430]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <p class="text-lg sm:text-xl md:text-2xl font-bold text-[#F0F0F0]">{formatCurrency(totalCommissions)}</p>
                        <p class="text-xs sm:text-sm text-[#A0A0A0]">Commissions Earned</p>
                    </div>
                </div>
            </div>

            <!-- Average per Course -->
            <div class="bg-[#2B2B2B] rounded-xl p-4 sm:p-6 shadow-lg border border-[#2B2B2B]">
                <div class="flex items-center gap-3">
                    <div class="p-2 sm:p-3 bg-[#FF6B6B]/10 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 sm:w-6 sm:h-6 text-[#FF6B6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <div>
                        <p class="text-lg sm:text-xl md:text-2xl font-bold text-[#F0F0F0]">
                            {subscriptionCount > 0 ? formatCurrency(totalSpent / subscriptionCount) : '$0.00'}
                        </p>
                        <p class="text-xs sm:text-sm text-[#A0A0A0]">Avg per Course</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Subscriptions List -->
        {#if loading}
            <div class="text-center py-8 sm:py-12">
                <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#C392EC]"></div>
                <p class="mt-4 text-[#A0A0A0]">Loading subscriptions...</p>
            </div>
        {:else if error}
            <div class="text-center py-8 sm:py-12">
                <div class="p-3 bg-red-500/10 rounded-lg inline-block mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-[#F0F0F0] mb-2">Error Loading Subscriptions</h3>
                <p class="text-[#A0A0A0]">{error}</p>
            </div>
        {:else if subscriptions.length === 0}
            <div class="text-center py-12 sm:py-16 md:py-20">
                <div class="p-4 bg-[#C392EC]/10 rounded-lg inline-block mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 sm:w-16 sm:h-16 text-[#C392EC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>
                <h3 class="text-xl sm:text-2xl md:text-3xl font-bold text-[#F0F0F0] mb-4">No Subscriptions Yet</h3>
                <p class="text-sm sm:text-base text-[#A0A0A0] mb-6 sm:mb-8 max-w-md mx-auto">
                    You haven't subscribed to any courses yet. Browse our course catalog to start your learning journey!
                </p>
                <a href="/dashboard/courses" class="inline-flex items-center gap-2 rounded-full bg-[#C392EC] px-6 py-3 text-sm sm:text-base font-semibold text-white shadow-sm hover:opacity-90 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Browse Courses
                </a>
            </div>
        {:else}
            <div class="space-y-4 md:space-y-6">
                {#each subscriptions as subscription, index}
                    {@const statusInfo = getSubscriptionStatus(subscription)}
                    {@const actionBtn = getActionButton(subscription)}
                    <div class="bg-[#2B2B2B] rounded-xl shadow-lg border border-[#2B2B2B] overflow-hidden hover:border-[#C392EC]/30 transition-colors">
                        <!-- Mobile Layout (sm and below) -->
                        <div class="block sm:hidden p-4">
                            <div class="flex items-start gap-3 mb-3">
                                <div class="w-16 h-12 bg-[#3B3B3B] rounded-lg flex-shrink-0 overflow-hidden">
                                    {#if subscription.expand?.course?.thumbnail}
                                        <img 
                                            src={getCourseImage(subscription.expand.course)} 
                                            alt={subscription.expand?.course?.title || 'Course'} 
                                            class="w-full h-full object-cover"
                                        />
                                    {:else}
                                        <div class="w-full h-full flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-[#A0A0A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </div>
                                    {/if}
                                </div>
                                <div class="flex-1 min-w-0">
                                    <h3 class="text-base font-semibold text-[#F0F0F0] truncate">
                                        {subscription.expand?.course?.title || 'Course Title'}
                                    </h3>
                                    <p class="text-sm text-[#A0A0A0] mt-1">
                                        Subscribed {formatDate(subscription.created)}
                                    </p>
                                </div>
                                <span class="px-2 py-1 text-xs font-medium rounded-full bg-[#C392EC]/10 {statusInfo.color}">
                                    {statusInfo.status}
                                </span>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span class="text-[#A0A0A0] block">Amount Paid</span>
                                    <span class="text-[#F0F0F0] font-medium">{formatCurrency(subscription.amountPaid)}</span>
                                </div>
                                <div>
                                    <span class="text-[#A0A0A0] block">Commission</span>
                                    <span class="text-[#85D5C8] font-medium">{formatCurrency(subscription.referralCommission)}</span>
                                </div>
                            </div>
                            
                            <div class="mt-3 pt-3 border-t border-[#3B3B3B]">
                                <button 
                                    onclick={() => startOrContinueCourse(subscription)} 
                                    class="inline-flex items-center gap-1 text-sm {actionBtn.textClass} hover:opacity-80 transition-opacity"
                                >
                                    {actionBtn.text}
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <!-- Desktop Layout (sm and above) -->
                        <div class="hidden sm:block p-6">
                            <div class="flex items-center gap-4 md:gap-6">
                                <!-- Course Image -->
                                <div class="w-20 h-16 md:w-24 md:h-18 lg:w-28 lg:h-20 bg-[#3B3B3B] rounded-lg flex-shrink-0 overflow-hidden">
                                    {#if subscription.expand?.course?.thumbnail}
                                        <img 
                                            src={getCourseImage(subscription.expand.course)} 
                                            alt={subscription.expand?.course?.title || 'Course'} 
                                            class="w-full h-full object-cover"
                                        />
                                    {:else}
                                        <div class="w-full h-full flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-[#A0A0A0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </div>
                                    {/if}
                                </div>

                                <!-- Course Info -->
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-start justify-between gap-4">
                                        <div class="min-w-0 flex-1">
                                            <h3 class="text-lg md:text-xl font-semibold text-[#F0F0F0] truncate">
                                                {subscription.expand?.course?.title || 'Course Title'}
                                            </h3>
                                            <p class="text-sm md:text-base text-[#A0A0A0] mt-1">
                                                Subscribed {formatDate(subscription.created)}
                                            </p>
                                            {#if subscription.isEnrolled && subscription.userProgress}
                                                <div class="mt-3">
                                                    <div class="flex items-center gap-3">
                                                        <div class="flex-1 bg-[#3B3B3B] rounded-full h-2">
                                                            <div 
                                                                class="bg-[#85D5C8] h-2 rounded-full transition-all duration-300" 
                                                                style="width: {subscription.userProgress.completion_percentage || 0}%"
                                                            ></div>
                                                        </div>
                                                        <span class="text-sm text-[#A0A0A0] font-medium">{subscription.userProgress.completion_percentage || 0}% complete</span>
                                                    </div>
                                                </div>
                                            {/if}
                                        </div>
                                        <span class="px-3 py-1 text-sm font-medium rounded-full bg-[#C392EC]/10 {statusInfo.color} flex-shrink-0">
                                            {statusInfo.status}
                                        </span>
                                    </div>
                                </div>

                                <!-- Payment Info -->
                                <div class="hidden md:flex flex-col items-end gap-1 flex-shrink-0">
                                    <span class="text-lg font-bold text-[#F0F0F0]">{formatCurrency(subscription.amountPaid)}</span>
                                    <span class="text-sm text-[#85D5C8]">+{formatCurrency(subscription.referralCommission)} commission</span>
                                </div>

                                <!-- Action Button -->
                                <div class="flex-shrink-0">
                                    <button 
                                        onclick={() => startOrContinueCourse(subscription)}
                                        class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium {actionBtn.textClass} {actionBtn.bgClass} rounded-lg transition-colors"
                                    >
                                        <span class="hidden sm:inline">{actionBtn.text}</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{actionBtn.icon}" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <!-- Mobile Payment Info (shown on md and below) -->
                            <div class="md:hidden mt-4 pt-4 border-t border-[#3B3B3B] flex justify-between text-sm">
                                <div>
                                    <span class="text-[#A0A0A0] block">Amount Paid</span>
                                    <span class="text-[#F0F0F0] font-medium">{formatCurrency(subscription.amountPaid)}</span>
                                </div>
                                <div class="text-right">
                                    <span class="text-[#A0A0A0] block">Commission</span>
                                    <span class="text-[#85D5C8] font-medium">{formatCurrency(subscription.referralCommission)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>

            <!-- Load More Button (if needed for pagination) -->
            <!-- 
            <div class="text-center mt-8">
                <button class="px-6 py-3 text-sm font-medium text-[#C392EC] bg-[#C392EC]/10 rounded-lg hover:bg-[#C392EC]/20 transition-colors">
                    Load More Subscriptions
                </button>
            </div>
            -->
        {/if}
    </div>
</main>
