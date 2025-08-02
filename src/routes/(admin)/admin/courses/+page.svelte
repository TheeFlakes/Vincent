<script>
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    
    let { data } = $props();
    
    let courses = $state(data.courses);
    let totalCourses = $state(data.totalCourses);
    let totalPages = $state(data.totalPages);
    let currentPage = $state(data.currentPage);
    let currentFilters = $state(data.currentFilters);
    
    let loading = $state(false);
    let searchValue = $state(currentFilters.search);
    let isFreeFilter = $state(currentFilters.isFree);
    
    let showCourseModal = $state(false);
    let editingCourse = $state(null);
    let courseForm = $state({
        title: '',
        description: '',
        price: 0,
        isFree: false,
        thumbnail: null
    });
    
    let showDeleteModal = $state(false);
    let courseToDelete = $state(null);
    
    // Format date
    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    // Format currency
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }
    
    // Apply filters
    async function applyFilters() {
        const params = new URLSearchParams();
        if (searchValue) params.set('search', searchValue);
        if (isFreeFilter) params.set('isFree', isFreeFilter);
        params.set('page', '1');
        
        await goto(`/admin/courses?${params.toString()}`);
    }
    
    // Clear filters
    async function clearFilters() {
        searchValue = '';
        isFreeFilter = '';
        await goto('/admin/courses');
    }
    
    // Pagination
    async function goToPage(pageNum) {
        const params = new URLSearchParams(window.location.search);
        params.set('page', pageNum.toString());
        await goto(`/admin/courses?${params.toString()}`);
    }
    
    // Open course modal for creating
    function openCreateModal() {
        editingCourse = null;
        courseForm = {
            title: '',
            description: '',
            price: 0,
            isFree: false,
            thumbnail: null
        };
        showCourseModal = true;
    }
    
    // Open course modal for editing
    function openEditModal(course) {
        editingCourse = course;
        courseForm = {
            title: course.title || '',
            description: course.description || '',
            price: course.price || 0,
            isFree: course.isFree || false,
            thumbnail: null
        };
        showCourseModal = true;
    }
    
    // Save course (create or update)
    async function saveCourse() {
        loading = true;
        try {
            const action = editingCourse ? 'update' : 'create';
            const formData = new FormData();
            
            formData.append('action', action);
            formData.append('title', courseForm.title);
            formData.append('description', courseForm.description);
            formData.append('price', courseForm.price.toString());
            formData.append('isFree', courseForm.isFree.toString());
            
            if (courseForm.thumbnail) {
                formData.append('thumbnail', courseForm.thumbnail);
            }
            
            if (editingCourse) {
                formData.append('courseId', editingCourse.id);
            }
            
            const response = await fetch('/admin/courses', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const result = await response.json();
                
                if (editingCourse) {
                    // Update existing course in list
                    const index = courses.findIndex(c => c.id === editingCourse.id);
                    if (index !== -1) {
                        courses[index] = result.course;
                    }
                } else {
                    // Add new course to list
                    courses = [result.course, ...courses];
                    totalCourses++;
                }
                
                showCourseModal = false;
                editingCourse = null;
            } else {
                const error = await response.json();
                alert('Error saving course: ' + error.error);
            }
        } catch (error) {
            console.error('Error saving course:', error);
            alert('Error saving course');
        } finally {
            loading = false;
        }
    }
    
    // Open delete modal
    function openDeleteModal(course) {
        courseToDelete = course;
        showDeleteModal = true;
    }
    
    // Delete course
    async function deleteCourse() {
        if (!courseToDelete) return;
        
        loading = true;
        try {
            const response = await fetch('/admin/courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'delete',
                    courseId: courseToDelete.id
                })
            });
            
            if (response.ok) {
                // Remove course from list
                courses = courses.filter(c => c.id !== courseToDelete.id);
                totalCourses--;
                showDeleteModal = false;
                courseToDelete = null;
            } else {
                const error = await response.json();
                alert('Error deleting course: ' + error.error);
            }
        } catch (error) {
            console.error('Error deleting course:', error);
            alert('Error deleting course');
        } finally {
            loading = false;
        }
    }
    
    // View course details
    function viewCourse(courseId) {
        goto(`/admin/courses/${courseId}`);
    }
</script>

<svelte:head>
    <title>Courses Management - Admin</title>
</svelte:head>

<div class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
        <div>
            <h1 class="text-2xl font-bold text-[#F0F0F0]">Courses Management</h1>
            <p class="mt-1 text-[#A0A0A0]">Create and manage course content</p>
        </div>
        <button
            onclick={openCreateModal}
            class="bg-[#C392EC] hover:bg-[#B580E1] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
        >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Create Course
        </button>
    </div>
    
    <!-- Filters -->
    <div class="bg-[#2B2B2B] rounded-xl p-6 mb-6 border border-[#3B3B3B]">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label class="block text-sm font-medium text-[#F0F0F0] mb-2">Search Courses</label>
                <input
                    type="text"
                    bind:value={searchValue}
                    placeholder="Search by title or description..."
                    class="w-full bg-[#3B3B3B] border border-[#4B4B4B] rounded-lg px-3 py-2 text-[#F0F0F0] placeholder-[#A0A0A0] focus:outline-none focus:border-[#C392EC]"
                    onkeydown={(e) => e.key === 'Enter' && applyFilters()}
                />
            </div>
            
            <div>
                <label class="block text-sm font-medium text-[#F0F0F0] mb-2">Price Type</label>
                <select
                    bind:value={isFreeFilter}
                    class="w-full bg-[#3B3B3B] border border-[#4B4B4B] rounded-lg px-3 py-2 text-[#F0F0F0] focus:outline-none focus:border-[#C392EC]"
                >
                    <option value="">All Courses</option>
                    <option value="true">Free Courses</option>
                    <option value="false">Paid Courses</option>
                </select>
            </div>
            
            <div class="flex items-end gap-2">
                <button
                    onclick={applyFilters}
                    class="bg-[#C392EC] hover:bg-[#B580E1] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                    Apply Filters
                </button>
                <button
                    onclick={clearFilters}
                    class="bg-[#3B3B3B] hover:bg-[#4B4B4B] text-[#F0F0F0] px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                    Clear
                </button>
            </div>
        </div>
    </div>
    
    <!-- Courses Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {#each courses as course}
            <div class="bg-[#2B2B2B] rounded-xl border border-[#3B3B3B] overflow-hidden">
                <div class="p-6">
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-[#F0F0F0] mb-2">{course.title}</h3>
                            <p class="text-sm text-[#A0A0A0] line-clamp-3">{course.description || 'No description'}</p>
                        </div>
                        <div class="ml-4 flex flex-col items-end">
                            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {
                                course.isFree 
                                    ? 'bg-green-500/10 text-green-400' 
                                    : 'bg-[#C392EC]/10 text-[#C392EC]'
                            }">
                                {course.isFree ? 'Free' : formatCurrency(course.price || 0)}
                            </span>
                            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 {
                                course.isPublished 
                                    ? 'bg-blue-500/10 text-blue-400' 
                                    : 'bg-orange-500/10 text-orange-400'
                            }">
                                {course.isPublished ? 'Published' : 'Draft'}
                            </span>
                        </div>
                    </div>
                    
                    <div class="text-xs text-[#A0A0A0] mb-4">
                        Created: {formatDate(course.created)}
                    </div>
                    
                    <div class="flex items-center justify-between">
                        <button
                            onclick={() => viewCourse(course.id)}
                            class="text-[#85D5C8] hover:text-[#6BC4B6] text-sm font-medium transition-colors duration-200"
                        >
                            View Details
                        </button>
                        <div class="flex items-center space-x-2">
                            <button
                                onclick={() => viewCourse(course.id)}
                                class="text-[#C392EC] hover:text-[#B580E1] transition-colors duration-200"
                                title="View Lessons"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                </svg>
                            </button>
                            <button
                                onclick={() => openEditModal(course)}
                                class="text-[#C392EC] hover:text-[#B580E1] transition-colors duration-200"
                                title="Edit Course"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                            </button>
                            <button
                                onclick={() => openDeleteModal(course)}
                                class="text-red-400 hover:text-red-300 transition-colors duration-200"
                                title="Delete Course"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        {/each}
    </div>
    
    <!-- Pagination -->
    {#if totalPages > 1}
        <div class="flex items-center justify-between">
            <div class="text-sm text-[#A0A0A0]">
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalCourses)} of {totalCourses} courses
            </div>
            <div class="flex items-center space-x-2">
                <button
                    onclick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    class="px-3 py-2 rounded-lg bg-[#3B3B3B] text-[#F0F0F0] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4B4B4B] transition-colors duration-200"
                >
                    Previous
                </button>
                
                {#each Array.from({length: Math.min(5, totalPages)}, (_, i) => i + Math.max(1, currentPage - 2)) as pageNum}
                    {#if pageNum <= totalPages}
                        <button
                            onclick={() => goToPage(pageNum)}
                            class="px-3 py-2 rounded-lg transition-colors duration-200 {
                                pageNum === currentPage 
                                    ? 'bg-[#C392EC] text-white' 
                                    : 'bg-[#3B3B3B] text-[#F0F0F0] hover:bg-[#4B4B4B]'
                            }"
                        >
                            {pageNum}
                        </button>
                    {/if}
                {/each}
                
                <button
                    onclick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    class="px-3 py-2 rounded-lg bg-[#3B3B3B] text-[#F0F0F0] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4B4B4B] transition-colors duration-200"
                >
                    Next
                </button>
            </div>
        </div>
    {/if}
</div>

<!-- Course Create/Edit Modal -->
{#if showCourseModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onclick={() => showCourseModal = false}>
        <div class="bg-[#2B2B2B] rounded-lg p-6 w-full max-w-md mx-4" onclick={(e) => e.stopPropagation()}>
            <h3 class="text-lg font-semibold text-[#F0F0F0] mb-4">
                {editingCourse ? 'Edit Course' : 'Create New Course'}
            </h3>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-[#F0F0F0] mb-2">Course Title</label>
                    <input
                        type="text"
                        bind:value={courseForm.title}
                        placeholder="Enter course title..."
                        class="w-full bg-[#3B3B3B] border border-[#4B4B4B] rounded-lg px-3 py-2 text-[#F0F0F0] placeholder-[#A0A0A0] focus:outline-none focus:border-[#C392EC]"
                        required
                    />
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-[#F0F0F0] mb-2">Description</label>
                    <textarea
                        bind:value={courseForm.description}
                        placeholder="Enter course description..."
                        rows="3"
                        class="w-full bg-[#3B3B3B] border border-[#4B4B4B] rounded-lg px-3 py-2 text-[#F0F0F0] placeholder-[#A0A0A0] focus:outline-none focus:border-[#C392EC] resize-none"
                        required
                    ></textarea>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-[#F0F0F0] mb-2">Course Thumbnail</label>
                    <input
                        type="file"
                        accept="image/*"
                        onchange={(e) => courseForm.thumbnail = e.target.files[0]}
                        class="w-full bg-[#3B3B3B] border border-[#4B4B4B] rounded-lg px-3 py-2 text-[#F0F0F0] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#C392EC] file:text-white hover:file:bg-[#B580E1] focus:outline-none focus:border-[#C392EC]"
                    />
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-[#F0F0F0] mb-2">Price ($)</label>
                        <input
                            type="number"
                            bind:value={courseForm.price}
                            min="0"
                            step="0.01"
                            disabled={courseForm.isFree}
                            class="w-full bg-[#3B3B3B] border border-[#4B4B4B] rounded-lg px-3 py-2 text-[#F0F0F0] disabled:opacity-50 focus:outline-none focus:border-[#C392EC]"
                        />
                    </div>
                    
                    <div class="flex flex-col justify-end">
                        <label class="flex items-center">
                            <input
                                type="checkbox"
                                bind:checked={courseForm.isFree}
                                onchange={() => { if (courseForm.isFree) courseForm.price = 0; }}
                                class="mr-2 text-[#C392EC] bg-[#3B3B3B] border-[#4B4B4B] rounded focus:ring-[#C392EC]"
                            />
                            <span class="text-sm text-[#F0F0F0]">Free Course</span>
                        </label>
                    </div>
                </div>
            </div>
            
            <div class="flex justify-end space-x-3 mt-6">
                <button
                    onclick={() => showCourseModal = false}
                    class="px-4 py-2 text-[#A0A0A0] hover:text-[#F0F0F0] transition-colors duration-200"
                >
                    Cancel
                </button>
                <button
                    onclick={saveCourse}
                    disabled={loading || !courseForm.title}
                    class="bg-[#C392EC] hover:bg-[#B580E1] disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                    {loading ? 'Saving...' : (editingCourse ? 'Update Course' : 'Create Course')}
                </button>
            </div>
        </div>
    </div>
{/if}

<!-- Delete Confirmation Modal -->
{#if showDeleteModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onclick={() => showDeleteModal = false}>
        <div class="bg-[#2B2B2B] rounded-lg p-6 w-full max-w-md mx-4" onclick={(e) => e.stopPropagation()}>
            <h3 class="text-lg font-semibold text-[#F0F0F0] mb-4">Delete Course</h3>
            <p class="text-[#A0A0A0] mb-4">
                Are you sure you want to delete: <span class="text-[#F0F0F0] font-medium">{courseToDelete?.title}</span>?
            </p>
            <p class="text-red-400 text-sm mb-4">This action cannot be undone and will remove all associated lessons and user progress.</p>
            
            <div class="flex justify-end space-x-3">
                <button
                    onclick={() => showDeleteModal = false}
                    class="px-4 py-2 text-[#A0A0A0] hover:text-[#F0F0F0] transition-colors duration-200"
                >
                    Cancel
                </button>
                <button
                    onclick={deleteCourse}
                    disabled={loading}
                    class="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                    {loading ? 'Deleting...' : 'Delete Course'}
                </button>
            </div>
        </div>
    </div>
{/if}
