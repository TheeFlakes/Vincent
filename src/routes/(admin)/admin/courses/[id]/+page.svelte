<script>
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    
    let { data } = $props();
    
    let course = $state(data.course);
    let lessons = $state(data.lessons);
    
    let loading = $state(false);
    let showLessonModal = $state(false);
    let editingLesson = $state(null);
    let lessonForm = $state({
        title: '',
        content: '',
        order: 1,
        duration: 0
    });
    
    let showDeleteModal = $state(false);
    let lessonToDelete = $state(null);
    
    // Format duration in minutes
    function formatDuration(minutes) {
        if (minutes < 60) {
            return `${minutes}m`;
        }
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
    
    // Open lesson modal for creating
    function openCreateModal() {
        editingLesson = null;
        lessonForm = {
            title: '',
            content: '',
            order: lessons.length + 1,
            duration: 0
        };
        showLessonModal = true;
    }
    
    // Open lesson modal for editing
    function openEditModal(lesson) {
        editingLesson = lesson;
        lessonForm = {
            title: lesson.title || '',
            content: lesson.content || '',
            order: lesson.order || 1,
            duration: lesson.duration || 0
        };
        showLessonModal = true;
    }
    
    // Save lesson (create or update)
    async function saveLesson() {
        loading = true;
        try {
            const action = editingLesson ? 'update' : 'create';
            const payload = {
                action,
                lessonData: {
                    ...lessonForm,
                    module: course.id
                }
            };
            
            if (editingLesson) {
                payload.lessonId = editingLesson.id;
            }
            
            const response = await fetch(`/admin/courses/${course.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (response.ok) {
                const result = await response.json();
                
                if (editingLesson) {
                    // Update existing lesson in list
                    const index = lessons.findIndex(l => l.id === editingLesson.id);
                    if (index !== -1) {
                        lessons[index] = result.lesson;
                    }
                } else {
                    // Add new lesson to list
                    lessons = [...lessons, result.lesson].sort((a, b) => a.order - b.order);
                }
                
                showLessonModal = false;
                editingLesson = null;
            } else {
                const error = await response.json();
                alert('Error saving lesson: ' + error.error);
            }
        } catch (error) {
            console.error('Error saving lesson:', error);
            alert('Error saving lesson');
        } finally {
            loading = false;
        }
    }
    
    // Open delete modal
    function openDeleteModal(lesson) {
        lessonToDelete = lesson;
        showDeleteModal = true;
    }
    
    // Delete lesson
    async function deleteLesson() {
        if (!lessonToDelete) return;
        
        loading = true;
        try {
            const response = await fetch(`/admin/courses/${course.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'delete',
                    lessonId: lessonToDelete.id
                })
            });
            
            if (response.ok) {
                // Remove lesson from list
                lessons = lessons.filter(l => l.id !== lessonToDelete.id);
                showDeleteModal = false;
                lessonToDelete = null;
            } else {
                const error = await response.json();
                alert('Error deleting lesson: ' + error.error);
            }
        } catch (error) {
            console.error('Error deleting lesson:', error);
            alert('Error deleting lesson');
        } finally {
            loading = false;
        }
    }
    
    // Go back to courses
    function goBack() {
        goto('/admin/courses');
    }
</script>

<svelte:head>
    <title>{course.title} - Course Management - Admin</title>
</svelte:head>

<div class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-4">
            <button
                onclick={goBack}
                class="text-[#A0A0A0] hover:text-[#F0F0F0] transition-colors duration-200"
                title="Back to Courses"
            >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
            </button>
            <div>
                <h1 class="text-2xl font-bold text-[#F0F0F0]">{course.title}</h1>
                <p class="mt-1 text-[#A0A0A0]">Manage course lessons</p>
            </div>
        </div>
        <button
            onclick={openCreateModal}
            class="bg-[#C392EC] hover:bg-[#B580E1] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
        >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add Lesson
        </button>
    </div>
    
    <!-- Course Info -->
    <div class="bg-[#2B2B2B] rounded-xl p-6 mb-6 border border-[#3B3B3B]">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                <h3 class="text-sm font-medium text-[#A0A0A0] mb-2">Description</h3>
                <p class="text-[#F0F0F0]">{course.description || 'No description'}</p>
            </div>
            <div>
                <h3 class="text-sm font-medium text-[#A0A0A0] mb-2">Price</h3>
                <p class="text-[#F0F0F0]">
                    {course.isFree ? 'Free' : `$${course.price || 0}`}
                </p>
            </div>
            <div>
                <h3 class="text-sm font-medium text-[#A0A0A0] mb-2">Total Lessons</h3>
                <p class="text-[#F0F0F0]">{lessons.length}</p>
            </div>
        </div>
    </div>
    
    <!-- Lessons List -->
    <div class="space-y-4">
        {#if lessons.length === 0}
            <div class="text-center py-12">
                <svg class="w-12 h-12 text-[#4B4B4B] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
                <p class="text-[#A0A0A0] text-lg mb-2">No lessons yet</p>
                <p class="text-[#606060] mb-4">Create your first lesson to get started</p>
                <button
                    onclick={openCreateModal}
                    class="bg-[#C392EC] hover:bg-[#B580E1] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                    Add First Lesson
                </button>
            </div>
        {:else}
            {#each lessons as lesson (lesson.id)}
                <div class="bg-[#2B2B2B] rounded-xl p-6 border border-[#3B3B3B] hover:border-[#4B4B4B] transition-colors duration-200">
                    <div class="flex items-start justify-between">
                        <div class="flex-1">
                            <div class="flex items-center gap-3 mb-2">
                                <span class="bg-[#C392EC] text-white text-xs px-2 py-1 rounded-full font-medium">
                                    #{lesson.order}
                                </span>
                                <h3 class="text-lg font-semibold text-[#F0F0F0]">{lesson.title}</h3>
                            </div>
                            <p class="text-[#A0A0A0] mb-3 line-clamp-2">{lesson.content}</p>
                            <div class="flex items-center gap-4 text-sm text-[#A0A0A0]">
                                <span>Duration: {formatDuration(lesson.duration)}</span>
                            </div>
                        </div>
                        <div class="flex items-center space-x-2 ml-4">
                            <button
                                onclick={() => openEditModal(lesson)}
                                class="text-[#C392EC] hover:text-[#B580E1] transition-colors duration-200"
                                title="Edit Lesson"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                            </button>
                            <button
                                onclick={() => openDeleteModal(lesson)}
                                class="text-red-400 hover:text-red-300 transition-colors duration-200"
                                title="Delete Lesson"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            {/each}
        {/if}
    </div>
</div>

<!-- Lesson Create/Edit Modal -->
{#if showLessonModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onclick={() => showLessonModal = false}>
        <div class="bg-[#2B2B2B] rounded-lg p-6 w-full max-w-2xl mx-4" onclick={(e) => e.stopPropagation()}>
            <h3 class="text-lg font-semibold text-[#F0F0F0] mb-4">
                {editingLesson ? 'Edit Lesson' : 'Create New Lesson'}
            </h3>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-[#F0F0F0] mb-2">Lesson Title</label>
                    <input
                        type="text"
                        bind:value={lessonForm.title}
                        placeholder="Enter lesson title..."
                        class="w-full bg-[#3B3B3B] border border-[#4B4B4B] rounded-lg px-3 py-2 text-[#F0F0F0] placeholder-[#A0A0A0] focus:outline-none focus:border-[#C392EC]"
                        required
                    />
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-[#F0F0F0] mb-2">Content</label>
                    <textarea
                        bind:value={lessonForm.content}
                        placeholder="Enter lesson content..."
                        rows="6"
                        class="w-full bg-[#3B3B3B] border border-[#4B4B4B] rounded-lg px-3 py-2 text-[#F0F0F0] placeholder-[#A0A0A0] focus:outline-none focus:border-[#C392EC] resize-none"
                        required
                    ></textarea>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-[#F0F0F0] mb-2">Order</label>
                        <input
                            type="number"
                            bind:value={lessonForm.order}
                            min="1"
                            class="w-full bg-[#3B3B3B] border border-[#4B4B4B] rounded-lg px-3 py-2 text-[#F0F0F0] focus:outline-none focus:border-[#C392EC]"
                        />
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-[#F0F0F0] mb-2">Duration (minutes)</label>
                        <input
                            type="number"
                            bind:value={lessonForm.duration}
                            min="0"
                            class="w-full bg-[#3B3B3B] border border-[#4B4B4B] rounded-lg px-3 py-2 text-[#F0F0F0] focus:outline-none focus:border-[#C392EC]"
                        />
                    </div>
                </div>
            </div>
            
            <div class="flex justify-end space-x-3 mt-6">
                <button
                    onclick={() => showLessonModal = false}
                    class="px-4 py-2 text-[#A0A0A0] hover:text-[#F0F0F0] transition-colors duration-200"
                >
                    Cancel
                </button>
                <button
                    onclick={saveLesson}
                    disabled={loading || !lessonForm.title || !lessonForm.content}
                    class="bg-[#C392EC] hover:bg-[#B580E1] disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                    {loading ? 'Saving...' : (editingLesson ? 'Update Lesson' : 'Create Lesson')}
                </button>
            </div>
        </div>
    </div>
{/if}

<!-- Delete Confirmation Modal -->
{#if showDeleteModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onclick={() => showDeleteModal = false}>
        <div class="bg-[#2B2B2B] rounded-lg p-6 w-full max-w-md mx-4" onclick={(e) => e.stopPropagation()}>
            <h3 class="text-lg font-semibold text-[#F0F0F0] mb-4">Delete Lesson</h3>
            <p class="text-[#A0A0A0] mb-4">
                Are you sure you want to delete: <span class="text-[#F0F0F0] font-medium">{lessonToDelete?.title}</span>?
            </p>
            <p class="text-red-400 text-sm mb-4">This action cannot be undone.</p>
            
            <div class="flex justify-end space-x-3">
                <button
                    onclick={() => showDeleteModal = false}
                    class="px-4 py-2 text-[#A0A0A0] hover:text-[#F0F0F0] transition-colors duration-200"
                >
                    Cancel
                </button>
                <button
                    onclick={deleteLesson}
                    disabled={loading}
                    class="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                    {loading ? 'Deleting...' : 'Delete Lesson'}
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
</style>
