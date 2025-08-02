<script>
    import { goto } from '$app/navigation';
    
    let { data } = $props();
    
    let messages = $state(data.messages);
    let totalMessages = $state(data.totalMessages);
    let totalPages = $state(data.totalPages);
    let currentPage = $state(data.currentPage);
    let currentFilters = $state(data.currentFilters);
    
    let loading = $state(false);
    let statusFilter = $state(currentFilters.status);
    
    let showReplyModal = $state(false);
    let selectedMessage = $state(null);
    let replyText = $state('');
    
    // Format date
    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // Apply filters
    async function applyFilters() {
        const params = new URLSearchParams();
        if (statusFilter) params.set('status', statusFilter);
        params.set('page', '1');
        
        await goto(`/admin/support?${params.toString()}`);
    }
    
    // Clear filters
    async function clearFilters() {
        statusFilter = '';
        await goto('/admin/support');
    }
    
    // Pagination
    async function goToPage(pageNum) {
        const params = new URLSearchParams(window.location.search);
        params.set('page', pageNum.toString());
        await goto(`/admin/support?${params.toString()}`);
    }
    
    // Open reply modal
    function openReplyModal(message) {
        selectedMessage = message;
        replyText = message.adminReply || '';
        showReplyModal = true;
    }
    
    // Send reply
    async function sendReply() {
        if (!selectedMessage || !replyText.trim()) return;
        
        loading = true;
        try {
            const response = await fetch('/admin/support', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messageId: selectedMessage.id,
                    reply: replyText
                })
            });
            
            if (response.ok) {
                // Update the message in the list
                const index = messages.findIndex(m => m.id === selectedMessage.id);
                if (index !== -1) {
                    messages[index].adminReply = replyText;
                    messages[index].status = 'replied';
                }
                showReplyModal = false;
                selectedMessage = null;
                replyText = '';
            } else {
                const error = await response.json();
                alert('Error sending reply: ' + error.error);
            }
        } catch (error) {
            console.error('Error sending reply:', error);
            alert('Error sending reply');
        } finally {
            loading = false;
        }
    }
    
    // Get status badge classes
    function getStatusBadgeClass(status) {
        switch (status) {
            case 'pending':
                return 'bg-orange-500/10 text-orange-400';
            case 'replied':
                return 'bg-green-500/10 text-green-400';
            case 'closed':
                return 'bg-gray-500/10 text-gray-400';
            default:
                return 'bg-blue-500/10 text-blue-400';
        }
    }
</script>

<svelte:head>
    <title>Support Management - Admin</title>
</svelte:head>

<div class="p-6">
    <!-- Header -->
    <div class="mb-6">
        <h1 class="text-2xl font-bold text-[#F0F0F0]">Support Management</h1>
        <p class="mt-1 text-[#A0A0A0]">Manage and respond to user support messages</p>
    </div>
    
    <!-- Filters -->
    <div class="bg-[#2B2B2B] rounded-xl p-6 mb-6 border border-[#3B3B3B]">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label class="block text-sm font-medium text-[#F0F0F0] mb-2">Status Filter</label>
                <select
                    bind:value={statusFilter}
                    class="w-full bg-[#3B3B3B] border border-[#4B4B4B] rounded-lg px-3 py-2 text-[#F0F0F0] focus:outline-none focus:border-[#C392EC]"
                >
                    <option value="">All Messages</option>
                    <option value="pending">Pending</option>
                    <option value="replied">Replied</option>
                    <option value="closed">Closed</option>
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
    
    <!-- Messages List -->
    <div class="space-y-4 mb-6">
        {#each messages as message}
            <div class="bg-[#2B2B2B] rounded-xl border border-[#3B3B3B] p-6">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center space-x-4">
                        <div class="flex-shrink-0">
                            <div class="w-10 h-10 bg-[#C392EC] rounded-full flex items-center justify-center">
                                <span class="text-sm font-medium text-white">
                                    {message.expand?.user?.name?.charAt(0) || message.expand?.user?.email?.charAt(0) || 'U'}
                                </span>
                            </div>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold text-[#F0F0F0]">{message.subject}</h3>
                            <p class="text-sm text-[#A0A0A0]">
                                From: {message.expand?.user?.name || message.expand?.user?.email || 'Unknown User'}
                            </p>
                            <p class="text-xs text-[#A0A0A0]">{formatDate(message.created)}</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {getStatusBadgeClass(message.status)}">
                            {message.status || 'pending'}
                        </span>
                        <button
                            onclick={() => openReplyModal(message)}
                            class="bg-[#C392EC] hover:bg-[#B580E1] text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200"
                        >
                            {message.adminReply ? 'Edit Reply' : 'Reply'}
                        </button>
                    </div>
                </div>
                
                <!-- Original Message -->
                <div class="bg-[#3B3B3B] rounded-lg p-4 mb-4">
                    <h4 class="text-sm font-medium text-[#F0F0F0] mb-2">User Message:</h4>
                    <p class="text-sm text-[#A0A0A0] whitespace-pre-wrap">{message.message}</p>
                </div>
                
                <!-- Admin Reply -->
                {#if message.adminReply}
                    <div class="bg-[#C392EC]/10 border border-[#C392EC]/20 rounded-lg p-4">
                        <h4 class="text-sm font-medium text-[#C392EC] mb-2">Admin Reply:</h4>
                        <p class="text-sm text-[#F0F0F0] whitespace-pre-wrap">{message.adminReply}</p>
                    </div>
                {/if}
            </div>
        {/each}
        
        {#if messages.length === 0}
            <div class="text-center py-12">
                <svg class="mx-auto h-12 w-12 text-[#A0A0A0] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                <h3 class="text-lg font-medium text-[#F0F0F0] mb-2">No messages found</h3>
                <p class="text-[#A0A0A0]">No support messages match your current filters.</p>
            </div>
        {/if}
    </div>
    
    <!-- Pagination -->
    {#if totalPages > 1}
        <div class="flex items-center justify-between">
            <div class="text-sm text-[#A0A0A0]">
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalMessages)} of {totalMessages} messages
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

<!-- Reply Modal -->
{#if showReplyModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onclick={() => showReplyModal = false}>
        <div class="bg-[#2B2B2B] rounded-lg p-6 w-full max-w-2xl mx-4" onclick={(e) => e.stopPropagation()}>
            <h3 class="text-lg font-semibold text-[#F0F0F0] mb-4">
                {selectedMessage?.adminReply ? 'Edit Reply' : 'Reply to Support Message'}
            </h3>
            
            {#if selectedMessage}
                <!-- Original Message Display -->
                <div class="bg-[#3B3B3B] rounded-lg p-4 mb-4">
                    <h4 class="text-sm font-medium text-[#F0F0F0] mb-2">Original Message:</h4>
                    <p class="text-sm text-[#A0A0A0] whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
                
                <!-- Reply Input -->
                <div class="mb-4">
                    <label class="block text-sm font-medium text-[#F0F0F0] mb-2">Your Reply</label>
                    <textarea
                        bind:value={replyText}
                        placeholder="Type your reply to the user..."
                        rows="6"
                        class="w-full bg-[#3B3B3B] border border-[#4B4B4B] rounded-lg px-3 py-2 text-[#F0F0F0] placeholder-[#A0A0A0] focus:outline-none focus:border-[#C392EC] resize-none"
                    ></textarea>
                </div>
            {/if}
            
            <div class="flex justify-end space-x-3">
                <button
                    onclick={() => showReplyModal = false}
                    class="px-4 py-2 text-[#A0A0A0] hover:text-[#F0F0F0] transition-colors duration-200"
                >
                    Cancel
                </button>
                <button
                    onclick={sendReply}
                    disabled={loading || !replyText.trim()}
                    class="bg-[#C392EC] hover:bg-[#B580E1] disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                    {loading ? 'Sending...' : 'Send Reply'}
                </button>
            </div>
        </div>
    </div>
{/if}
