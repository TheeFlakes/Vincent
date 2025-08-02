<script>
    import { currentUser, pb } from '$lib/pocketbase.js';
    import { enhance } from '$app/forms';
    import { invalidateAll } from '$app/navigation';
    import { onMount, onDestroy } from 'svelte';
    
    let { data, form } = $props();
    
    // Use server-side data
    let user = data.user || $currentUser;
    let supportMessages = $state(data.supportMessages || []);
    
    let loading = $state(false);
    let messageText = $state('');
    let showSuccess = $state(false);
    let showError = $state(false);
    let errorMessage = $state('');
    
    // Real-time subscription management
    let subscriptionActive = $state(false);
    let newMessageIds = $state(new Set()); // Track newly received messages
    let connectionStatus = $state('disconnected'); // 'connecting', 'connected', 'disconnected', 'error'
    
    // Mark message as seen after a delay
    function markMessageAsSeen(messageId) {
        setTimeout(() => {
            newMessageIds.delete(messageId);
            newMessageIds = new Set(newMessageIds);
        }, 3000);
    }
    
    // Handle form responses
    $effect(() => {
        if (form?.success) {
            showSuccess = true;
            messageText = '';
            setTimeout(() => {
                showSuccess = false;
            }, 3000);
            // Don't invalidateAll since we'll get real-time updates
        } else if (form?.error) {
            showError = true;
            errorMessage = form.error;
            setTimeout(() => {
                showError = false;
                errorMessage = '';
            }, 5000);
        }
    });
    
    // Real-time subscription setup
    onMount(async () => {
        connectionStatus = 'connecting';
        
        try {
            // Ensure we're authenticated before subscribing
            if (!pb.authStore.isValid || !user?.id) {
                console.warn('User not authenticated, skipping real-time subscription');
                connectionStatus = 'error';
                return;
            }
            
            // Subscribe to support_messages changes for current user
            await pb.collection('support_messages').subscribe('*', function (e) {
                console.log('Support message event:', e.action, e.record);
                
                // Only process messages for the current user
                if (e.record.sender === user.id) {
                    if (e.action === 'create') {
                        // Add new message to the beginning of the array
                        supportMessages = [e.record, ...supportMessages];
                        // Don't mark as new if it's just created by the user
                        // (it will already be optimistically added by the form)
                        if (e.record.adminReply && e.record.adminReply.trim()) {
                            newMessageIds.add(e.record.id);
                            newMessageIds = new Set(newMessageIds);
                            markMessageAsSeen(e.record.id);
                        }
                    } else if (e.action === 'update') {
                        // Update existing message
                        const index = supportMessages.findIndex(msg => msg.id === e.record.id);
                        if (index !== -1) {
                            const oldMessage = supportMessages[index];
                            supportMessages[index] = e.record;
                            supportMessages = [...supportMessages]; // Trigger reactivity
                            
                            // Check if admin reply was added
                            if (!oldMessage.adminReply && e.record.adminReply && e.record.adminReply.trim()) {
                                newMessageIds.add(e.record.id);
                                newMessageIds = new Set(newMessageIds);
                                markMessageAsSeen(e.record.id);
                            }
                        }
                    } else if (e.action === 'delete') {
                        // Remove deleted message
                        supportMessages = supportMessages.filter(msg => msg.id !== e.record.id);
                        newMessageIds.delete(e.record.id);
                        newMessageIds = new Set(newMessageIds);
                    }
                }
            }, {
                filter: `sender = "${user.id}"`,
                expand: '' // Don't expand any relations to keep it lightweight
            });
            
            subscriptionActive = true;
            connectionStatus = 'connected';
            console.log('Real-time support subscription active for user:', user.id);
        } catch (err) {
            console.error('Failed to setup real-time subscription:', err);
            subscriptionActive = false;
            connectionStatus = 'error';
        }
    });
    
    onDestroy(() => {
        if (subscriptionActive) {
            // Unsubscribe from support_messages
            pb.collection('support_messages').unsubscribe('*');
            console.log('Real-time support subscription cleaned up');
        }
    });
    
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
    
    // Get status badge class
    function getStatusBadgeClass(status) {
        switch (status) {
            case 'pending':
                return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'replied':
                return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'resolved':
                return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'closed':
                return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
            default:
                return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    }
    
    // Get status icon
    function getStatusIcon(status) {
        switch (status) {
            case 'pending':
                return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z';
            case 'replied':
                return 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z';
            case 'resolved':
                return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
            case 'closed':
                return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z';
            default:
                return 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
        }
    }
    
    // Character count for message
    let characterCount = $derived(messageText.length);
    let isMessageValid = $derived(messageText.trim().length > 0 && messageText.trim().length <= 1000);
</script>

<svelte:head>
    <title>Support - Cashfluenced</title>
    <meta name="description" content="Get help and support for your Cashfluenced account" />
</svelte:head>

<main class="bg-[#1A1A1A] min-h-full">
    <div class="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-12">
        <!-- Header Section -->
        <div class="text-center mb-6 sm:mb-8 md:mb-12">
            <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#F0F0F0] mb-2 md:mb-4">
                Support Center
            </h1>
            <p class="text-sm sm:text-base md:text-lg text-[#A0A0A0]">
                Get help with your account or ask questions about our platform
            </p>
            
            <!-- Real-time Status Indicator -->
            <div class="flex items-center justify-center gap-2 mt-4">
                <div class="flex items-center gap-2 px-3 py-1 rounded-full 
                    {connectionStatus === 'connected' ? 'bg-green-500/10 border border-green-500/20' : 
                     connectionStatus === 'connecting' ? 'bg-yellow-500/10 border border-yellow-500/20' :
                     connectionStatus === 'error' ? 'bg-red-500/10 border border-red-500/20' :
                     'bg-gray-500/10 border border-gray-500/20'}">
                    <div class="w-2 h-2 rounded-full 
                        {connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' : 
                         connectionStatus === 'connecting' ? 'bg-yellow-400 animate-spin' :
                         connectionStatus === 'error' ? 'bg-red-400' :
                         'bg-gray-400'}"></div>
                    <span class="text-xs font-medium 
                        {connectionStatus === 'connected' ? 'text-green-400' : 
                         connectionStatus === 'connecting' ? 'text-yellow-400' :
                         connectionStatus === 'error' ? 'text-red-400' :
                         'text-gray-400'}">
                        {connectionStatus === 'connected' ? 'Real-time updates active' : 
                         connectionStatus === 'connecting' ? 'Connecting to real-time updates...' :
                         connectionStatus === 'error' ? 'Connection failed' :
                         'Disconnected'}
                    </span>
                </div>
            </div>
        </div>

        <!-- Success/Error Messages -->
        {#if showSuccess}
            <div class="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div class="flex items-center gap-3">
                    <svg class="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p class="text-green-400 font-medium">Message sent successfully! We'll get back to you soon.</p>
                </div>
            </div>
        {/if}

        {#if showError}
            <div class="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div class="flex items-center gap-3">
                    <svg class="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p class="text-red-400 font-medium">{errorMessage}</p>
                </div>
            </div>
        {/if}

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <!-- Create New Message Form -->
            <div class="lg:col-span-1">
                <div class="bg-[#2B2B2B] rounded-xl p-4 sm:p-6 shadow-lg border border-[#2B2B2B] sticky top-6">
                    <div class="flex items-center gap-3 mb-4 sm:mb-6">
                        <div class="p-2 sm:p-3 bg-[#C392EC]/10 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 sm:w-6 sm:h-6 text-[#C392EC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <div>
                            <h2 class="text-lg sm:text-xl font-bold text-[#F0F0F0]">New Support Message</h2>
                            <p class="text-xs sm:text-sm text-[#A0A0A0] mt-1">Describe your issue or question</p>
                        </div>
                    </div>

                    <form method="POST" action="?/createMessage" use:enhance={() => {
                        loading = true;
                        return async ({ update }) => {
                            await update();
                            loading = false;
                        };
                    }}>
                        <div class="space-y-4">
                            <div>
                                <label for="message" class="block text-sm font-medium text-[#F0F0F0] mb-2">
                                    Your Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    bind:value={messageText}
                                    rows="6"
                                    class="w-full px-4 py-3 bg-[#1A1A1A] border border-[#3B3B3B] rounded-lg text-[#F0F0F0] placeholder-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#C392EC] focus:border-transparent resize-none text-sm sm:text-base"
                                    placeholder="Describe your issue, ask a question, or provide feedback..."
                                    required
                                ></textarea>
                                <div class="flex justify-between items-center mt-2">
                                    <p class="text-xs text-[#A0A0A0]">
                                        {characterCount}/1000 characters
                                    </p>
                                    {#if characterCount > 1000}
                                        <p class="text-xs text-red-400">Message too long</p>
                                    {/if}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !isMessageValid}
                                class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#C392EC] text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#B580E1] text-sm sm:text-base"
                            >
                                {#if loading}
                                    <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Sending...
                                {:else}
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                    Send Message
                                {/if}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Message History -->
            <div class="lg:col-span-2">
                <div class="bg-[#2B2B2B] rounded-xl p-4 sm:p-6 shadow-lg border border-[#2B2B2B]">
                    <div class="flex items-center gap-3 mb-4 sm:mb-6">
                        <div class="p-2 sm:p-3 bg-[#85D5C8]/10 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 sm:w-6 sm:h-6 text-[#85D5C8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                        </div>
                        <div>
                            <h2 class="text-lg sm:text-xl font-bold text-[#F0F0F0]">Message History</h2>
                            <p class="text-xs sm:text-sm text-[#A0A0A0] mt-1">Your past conversations with support</p>
                        </div>
                    </div>

                    {#if supportMessages.length === 0}
                        <div class="text-center py-8 sm:py-12">
                            <div class="p-4 bg-[#C392EC]/10 rounded-lg inline-block mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 sm:w-12 sm:h-12 text-[#C392EC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h3 class="text-lg sm:text-xl font-semibold text-[#F0F0F0] mb-2">No Messages Yet</h3>
                            <p class="text-sm sm:text-base text-[#A0A0A0] mb-4">
                                You haven't sent any support messages yet. Use the form on the left to get started.
                            </p>
                        </div>
                    {:else}
                        <div class="space-y-4 sm:space-y-6">
                            {#each supportMessages as message, index}
                                <div class="bg-[#1A1A1A] rounded-lg p-4 sm:p-6 border border-[#3B3B3B] {newMessageIds.has(message.id) ? 'ring-2 ring-[#85D5C8]/50 bg-[#85D5C8]/5' : ''}">
                                    <!-- Message Header -->
                                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4">
                                        <div class="flex items-center gap-3">
                                            {#if newMessageIds.has(message.id)}
                                                <div class="flex items-center gap-2">
                                                    <div class="w-2 h-2 bg-[#85D5C8] rounded-full animate-pulse"></div>
                                                    <span class="text-xs font-medium text-[#85D5C8]">New Update</span>
                                                </div>
                                            {/if}
                                            <span class="px-2 sm:px-3 py-1 text-xs font-medium rounded-full border {getStatusBadgeClass(message.status)}">
                                                <div class="flex items-center gap-1.5">
                                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="{getStatusIcon(message.status)}"></path>
                                                    </svg>
                                                    {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                                                </div>
                                            </span>
                                            <span class="text-xs sm:text-sm text-[#A0A0A0]">
                                                #{message.id.slice(-8)}
                                            </span>
                                        </div>
                                        <span class="text-xs sm:text-sm text-[#A0A0A0]">
                                            {formatDate(message.created)}
                                        </span>
                                    </div>

                                    <!-- Your Message -->
                                    <div class="mb-4">
                                        <div class="flex items-start gap-3">
                                            <div class="w-8 h-8 bg-[#C392EC] rounded-full flex items-center justify-center flex-shrink-0">
                                                <span class="text-white text-sm font-medium">
                                                    {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                                                </span>
                                            </div>
                                            <div class="flex-1 min-w-0">
                                                <div class="flex items-center gap-2 mb-1">
                                                    <span class="text-sm font-medium text-[#F0F0F0]">You</span>
                                                    <span class="text-xs text-[#A0A0A0]">{formatDate(message.created)}</span>
                                                </div>
                                                <div class="bg-[#2B2B2B] rounded-lg p-3 sm:p-4">
                                                    <p class="text-sm sm:text-base text-[#F0F0F0] leading-relaxed whitespace-pre-wrap">{message.message}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Admin Reply -->
                                    {#if message.adminReply && message.adminReply.trim()}
                                        <div class="border-t border-[#3B3B3B] pt-4">
                                            <div class="flex items-start gap-3">
                                                <div class="w-8 h-8 bg-[#85D5C8] rounded-full flex items-center justify-center flex-shrink-0">
                                                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                    </svg>
                                                </div>
                                                <div class="flex-1 min-w-0">
                                                    <div class="flex items-center gap-2 mb-1">
                                                        <span class="text-sm font-medium text-[#85D5C8]">Support Team</span>
                                                        <span class="text-xs text-[#A0A0A0]">{formatDate(message.updated)}</span>
                                                    </div>
                                                    <div class="bg-[#85D5C8]/10 border border-[#85D5C8]/20 rounded-lg p-3 sm:p-4">
                                                        <p class="text-sm sm:text-base text-[#F0F0F0] leading-relaxed whitespace-pre-wrap">{message.adminReply}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    {/if}
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
</main>
