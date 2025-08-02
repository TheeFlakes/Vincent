<script>
    import { currentUser, pb } from '$lib/pocketbase.js';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    
    let { data } = $props();
    
    // Use server-side data with proper reactive state
    let user = $state(data.user || $currentUser);
    let courses = $state(data.courses || []);
    let totalCourses = $state(data.totalCourses || 0);
    let currentFilters = $state(data.currentFilters || { search: '', filter: 'all', sort: 'newest' });
    
    let loading = $state(false);
    let error = $state(null);
    let searchValue = $state(currentFilters.search);
    let filterType = $state(currentFilters.filter);
    let sortBy = $state(currentFilters.sort);
    
    // Update reactive state when data prop changes
    $effect(() => {
        courses = data.courses || [];
        totalCourses = data.totalCourses || 0;
        currentFilters = data.currentFilters || { search: '', filter: 'all', sort: 'newest' };
        searchValue = currentFilters.search;
        filterType = currentFilters.filter;
        sortBy = currentFilters.sort;
    });
    
    // Filter options
    const filterOptions = [
        { value: 'all', label: 'All Courses' },
        { value: 'free', label: 'Free Courses' },
        { value: 'paid', label: 'Paid Courses' }
    ];
    
    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' }
    ];
    
    // Update URL and fetch courses
    async function updateFilters(newSearch = searchValue, newFilter = filterType, newSort = sortBy) {
        const url = new URL($page.url);
        
        // Update search params
        if (newSearch.trim()) {
            url.searchParams.set('search', newSearch);
        } else {
            url.searchParams.delete('search');
        }
        
        if (newFilter !== 'all') {
            url.searchParams.set('filter', newFilter);
        } else {
            url.searchParams.delete('filter');
        }
        
        if (newSort !== 'newest') {
            url.searchParams.set('sort', newSort);
        } else {
            url.searchParams.delete('sort');
        }
        
        // Navigate to update URL and trigger load function
        await goto(url.toString(), { replaceState: true });
    }
    
    // Handle search form submission
    function handleSearch(event) {
        event.preventDefault();
        updateFilters(searchValue, filterType, sortBy);
    }
    
    // Handle filter change
    function handleFilterChange(newFilter) {
        filterType = newFilter;
        updateFilters(searchValue, filterType, sortBy);
    }
    
    // Handle sort change
    function handleSortChange(event) {
        sortBy = event.target.value;
        updateFilters(searchValue, filterType, sortBy);
    }
    
    // Clear all filters
    function clearFilters() {
        searchValue = '';
        filterType = 'all';
        sortBy = 'newest';
        updateFilters('', 'all', 'newest');
    }
    
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
    
    // Navigate to course detail (placeholder)
    function viewCourse(courseId) {
        // Navigate to course detail page
        goto(`/dashboard/courses/${courseId}`);
    }
    
    // Truncate text
    function truncate(text, length = 100) {
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    }
    
    // Get progress color based on percentage
    function getProgressColor(percentage) {
        if (percentage >= 100) return '#10B981'; // green
        if (percentage >= 75) return '#3B82F6'; // blue
        if (percentage >= 50) return '#F59E0B'; // yellow
        if (percentage >= 25) return '#EF4444'; // red
        return '#6B7280'; // gray
    }
    
    // Get progress status text and styling
    function getProgressStatus(course) {
        if (!course.isEnrolled) return null;
        
        const percentage = course.userProgress?.completion_percentage || 0;
        if (percentage >= 100) return { text: 'Completed', class: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20' };
        if (percentage > 0) return { text: `${percentage}% Complete`, class: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20' };
        return { text: 'Enrolled', class: 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20' };
    }
</script>

<svelte:head>
    <title>Browse Courses - Cashfluenced</title>
</svelte:head>

<main class="bg-[#1A1A1A] min-h-full">
    <div class="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-12 lg:py-16">
        <!-- Header -->
        <div class="mb-8 md:mb-12">
            <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-[#F0F0F0] mb-2 md:mb-4">
                Browse Courses
            </h1>
            <p class="text-sm sm:text-base md:text-lg text-[#A0A0A0]">
                Discover and learn from our comprehensive course library
            </p>
            <p class="text-sm text-[#A0A0A0] mt-2">
                {totalCourses} course{totalCourses !== 1 ? 's' : ''} available
            </p>
        </div>

        <!-- Search and Filters Section -->
        <div class="bg-[#2B2B2B] rounded-xl p-6 mb-8 border border-[#2B2B2B]">
            <!-- Search Bar -->
            <form onsubmit={handleSearch} class="mb-6">
                <div class="relative">
                    <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A0A0A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <input 
                        bind:value={searchValue}
                        type="text" 
                        placeholder="Search courses by title or description..." 
                        class="w-full pl-10 pr-4 py-3 bg-[#1A1A1A] border border-[#3B3B3B] rounded-lg text-[#F0F0F0] placeholder-[#A0A0A0] focus:outline-none focus:border-[#C392EC] focus:ring-1 focus:ring-[#C392EC]"
                    >
                    <button 
                        type="submit"
                        class="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-[#C392EC] text-white rounded-md text-sm hover:bg-[#C392EC]/80 transition-colors"
                    >
                        Search
                    </button>
                </div>
            </form>

            <!-- Filter and Sort Controls -->
            <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <!-- Filter Buttons -->
                <div class="flex flex-wrap gap-2">
                    {#each filterOptions as option}
                        <button
                            onclick={() => handleFilterChange(option.value)}
                            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {
                                filterType === option.value 
                                    ? 'bg-[#C392EC] text-white' 
                                    : 'bg-[#1A1A1A] text-[#A0A0A0] hover:bg-[#3B3B3B] hover:text-[#F0F0F0]'
                            }"
                        >
                            {option.label}
                        </button>
                    {/each}
                </div>

                <!-- Sort Dropdown and Clear Filters -->
                <div class="flex items-center gap-3">
                    <select 
                        bind:value={sortBy}
                        onchange={handleSortChange}
                        class="px-3 py-2 bg-[#1A1A1A] border border-[#3B3B3B] rounded-lg text-[#F0F0F0] text-sm focus:outline-none focus:border-[#C392EC] focus:ring-1 focus:ring-[#C392EC]"
                    >
                        {#each sortOptions as option}
                            <option value={option.value}>{option.label}</option>
                        {/each}
                    </select>
                    
                    {#if searchValue || filterType !== 'all' || sortBy !== 'newest'}
                        <button
                            onclick={clearFilters}
                            class="px-3 py-2 text-sm text-[#A0A0A0] hover:text-[#F0F0F0] transition-colors"
                        >
                            Clear All
                        </button>
                    {/if}
                </div>
            </div>
        </div>

        {#if loading}
            <!-- Loading State -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {#each Array(6) as _}
                    <div class="bg-[#2B2B2B] rounded-xl p-6 shadow-lg border border-[#2B2B2B] animate-pulse">
                        <div class="bg-[#3B3B3B] rounded-lg h-48 mb-4"></div>
                        <div class="space-y-3">
                            <div class="bg-[#3B3B3B] h-4 rounded"></div>
                            <div class="bg-[#3B3B3B] h-3 rounded w-3/4"></div>
                            <div class="bg-[#3B3B3B] h-3 rounded w-1/2"></div>
                        </div>
                    </div>
                {/each}
            </div>
        {:else if error}
            <!-- Error State -->
            <div class="bg-[#2B2B2B] rounded-xl p-6 md:p-8 shadow-lg border border-[#2B2B2B] text-center">
                <div class="p-4 bg-red-500/10 rounded-lg inline-block mb-4">
                    <svg class="w-6 h-6 md:w-8 md:h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5l-6.928-12c-.77-.833-2.732-.833-3.464 0l-6.928 12c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                </div>
                <h2 class="text-lg md:text-xl text-[#F0F0F0] font-semibold mb-2">Error loading courses</h2>
                <p class="text-sm md:text-base text-[#A0A0A0] mb-4">{error}</p>
                <button 
                    onclick={() => window.location.reload()}
                    class="px-4 py-2 bg-[#C392EC] text-white rounded-lg hover:bg-[#C392EC]/80 transition-colors text-sm md:text-base"
                >
                    Retry
                </button>
            </div>
        {:else if courses.length === 0}
            <!-- Empty State -->
            <div class="bg-[#2B2B2B] rounded-xl p-8 md:p-12 shadow-lg border border-[#2B2B2B] text-center">
                <div class="p-4 bg-[#C392EC]/10 rounded-lg inline-block mb-4">
                    <svg class="w-8 h-8 text-[#C392EC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>
                </div>
                <h2 class="text-xl md:text-2xl text-[#F0F0F0] font-semibold mb-2">No courses found</h2>
                <p class="text-base text-[#A0A0A0] mb-6">
                    {#if searchValue || filterType !== 'all'}
                        Try adjusting your search criteria or filters.
                    {:else}
                        No courses are currently available.
                    {/if}
                </p>
                {#if searchValue || filterType !== 'all' || sortBy !== 'newest'}
                    <button
                        onclick={clearFilters}
                        class="px-6 py-3 bg-[#C392EC] text-white rounded-lg hover:bg-[#C392EC]/80 transition-colors font-medium"
                    >
                        Clear All Filters
                    </button>
                {/if}
            </div>
        {:else}
            <!-- Courses Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {#each courses as course (course.id)}
                    <div class="bg-[#2B2B2B] rounded-xl overflow-hidden shadow-lg border border-[#2B2B2B] hover:border-[#C392EC]/30 transition-all duration-300 group cursor-pointer"
                         onclick={() => viewCourse(course.id)}>
                        <!-- Course thumbnail -->
                        <div class="relative h-48 bg-gradient-to-br from-[#C392EC]/20 to-[#85D5C8]/20 flex items-center justify-center overflow-hidden">
                            {#if course.thumbnail}
                                <img 
                                    src={pb.files.getUrl(course, course.thumbnail)}
                                    alt={course.title}
                                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            {:else}
                                <svg class="w-16 h-16 text-[#C392EC]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                </svg>
                            {/if}
                            
                            <!-- Price badge -->
                            <div class="absolute top-3 right-3">
                                <span class="px-3 py-1 text-sm font-bold rounded-lg border {getPriceBadgeClass(course)}">
                                    {formatPrice(course)}
                                </span>
                            </div>
                        </div>
                        
                        <!-- Course content -->
                        <div class="p-6">
                            <h3 class="text-lg font-bold text-[#F0F0F0] mb-2 group-hover:text-[#C392EC] transition-colors">
                                {course.title}
                            </h3>
                            <p class="text-sm text-[#A0A0A0] mb-4 leading-relaxed">
                                {truncate(course.description, 120)}
                            </p>
                            
                            <!-- Course meta -->
                            <div class="flex items-center justify-between text-xs text-[#A0A0A0]">
                                <div class="flex items-center gap-1">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1V8a1 1 0 011-1h3z"></path>
                                    </svg>
                                    Course
                                </div>
                                <div class="flex items-center gap-1">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    {new Date(course.created).toLocaleDateString()}
                                </div>
                            </div>
                            
                            <!-- Progress Information (if enrolled) -->
                            {#if course.isEnrolled && course.userProgress}
                                {@const progressPercent = course.userProgress.completion_percentage || 0}
                                {@const progressStatus = getProgressStatus(course)}
                                
                                <div class="mt-3">
                                    <!-- Progress status badge -->
                                    <div class="flex items-center justify-between mb-2">
                                        <span class="px-2 py-1 text-xs font-medium rounded-full border {progressStatus.class}">
                                            {progressStatus.text}
                                        </span>
                                        <span class="text-xs text-[#A0A0A0]">
                                            {progressPercent}%
                                        </span>
                                    </div>
                                    
                                    <!-- Progress bar -->
                                    <div class="w-full bg-[#374151] rounded-full h-1.5">
                                        <div 
                                            class="h-1.5 rounded-full transition-all duration-500 ease-out"
                                            style="width: {progressPercent}%; background-color: {getProgressColor(progressPercent)}"
                                        ></div>
                                    </div>
                                </div>
                            {/if}
                            
                            <!-- View course button -->
                            <div class="mt-4 pt-4 border-t border-[#3B3B3B]">
                                <button class="w-full px-4 py-2 bg-[#C392EC]/10 text-[#C392EC] rounded-lg font-medium text-sm hover:bg-[#C392EC] hover:text-white transition-all duration-200 group-hover:bg-[#C392EC] group-hover:text-white">
                                    View Course Details
                                </button>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</main>
