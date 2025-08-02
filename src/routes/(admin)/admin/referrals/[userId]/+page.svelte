<script>
    import { goto } from '$app/navigation';
    
    let { data } = $props();
    
    let user = data.user;
    let uplines = data.uplines;
    let downlines = data.downlines;
    
    // Format date
    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    // Navigate to user's referral tree
    function viewUserTree(userId) {
        goto(`/admin/referrals/${userId}`);
    }
    
    // Go back to users list
    function goBack() {
        goto('/admin/users');
    }
</script>

<svelte:head>
    <title>Referral Tree - {user.name || user.email} - Admin</title>
</svelte:head>

<div class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
        <div>
            <button
                onclick={goBack}
                class="flex items-center text-[#C392EC] hover:text-[#B580E1] transition-colors duration-200 mb-2"
            >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Back to Users
            </button>
            <h1 class="text-2xl font-bold text-[#F0F0F0]">Referral Tree</h1>
            <p class="mt-1 text-[#A0A0A0]">Viewing referral network for {user.name || user.email}</p>
        </div>
    </div>
    
    <!-- Current User Card -->
    <div class="bg-[#2B2B2B] rounded-xl border border-[#C392EC] p-6 mb-8">
        <div class="flex items-center justify-center">
            <div class="text-center">
                <div class="w-16 h-16 bg-[#C392EC] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span class="text-lg font-bold text-white">
                        {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </span>
                </div>
                <h2 class="text-xl font-bold text-[#F0F0F0] mb-2">{user.name || 'No name'}</h2>
                <p class="text-[#A0A0A0] mb-2">{user.email}</p>
                <div class="flex items-center justify-center space-x-4 text-sm">
                    <span class="text-[#A0A0A0]">
                        Joined: {formatDate(user.created)}
                    </span>
                    {#if user.referralCode}
                        <span class="bg-[#C392EC]/10 text-[#C392EC] px-2 py-1 rounded font-mono text-xs">
                            {user.referralCode}
                        </span>
                    {/if}
                </div>
            </div>
        </div>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Uplines (People who referred this user) -->
        <div class="bg-[#2B2B2B] rounded-xl border border-[#3B3B3B] p-6">
            <h3 class="text-lg font-semibold text-[#F0F0F0] mb-4 flex items-center">
                <svg class="w-5 h-5 mr-2 text-[#85D5C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path>
                </svg>
                Upline Chain ({uplines.length})
            </h3>
            
            {#if uplines.length > 0}
                <div class="space-y-3">
                    {#each uplines as uplineUser, index}
                        <div class="flex items-center justify-between p-3 bg-[#3B3B3B] rounded-lg hover:bg-[#4B4B4B] transition-colors duration-200">
                            <div class="flex items-center space-x-3">
                                <div class="w-8 h-8 bg-[#85D5C8] rounded-full flex items-center justify-center flex-shrink-0">
                                    <span class="text-sm font-medium text-[#1A1A1A]">
                                        {uplineUser.name?.charAt(0) || uplineUser.email?.charAt(0) || 'U'}
                                    </span>
                                </div>
                                <div>
                                    <p class="text-sm font-medium text-[#F0F0F0]">{uplineUser.name || 'No name'}</p>
                                    <p class="text-xs text-[#A0A0A0]">{uplineUser.email}</p>
                                </div>
                            </div>
                            <div class="flex items-center space-x-2">
                                <span class="text-xs text-[#A0A0A0] bg-[#85D5C8]/10 px-2 py-1 rounded">
                                    Level {index + 1}
                                </span>
                                <button
                                    onclick={() => viewUserTree(uplineUser.id)}
                                    class="text-[#85D5C8] hover:text-[#6BC4B6] transition-colors duration-200"
                                    title="View Tree"
                                >
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    {/each}
                </div>
            {:else}
                <div class="text-center py-8">
                    <svg class="mx-auto h-12 w-12 text-[#A0A0A0] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path>
                    </svg>
                    <h4 class="text-sm font-medium text-[#F0F0F0] mb-2">No Uplines</h4>
                    <p class="text-xs text-[#A0A0A0]">This user was not referred by anyone</p>
                </div>
            {/if}
        </div>
        
        <!-- Downlines (People this user referred) -->
        <div class="bg-[#2B2B2B] rounded-xl border border-[#3B3B3B] p-6">
            <h3 class="text-lg font-semibold text-[#F0F0F0] mb-4 flex items-center">
                <svg class="w-5 h-5 mr-2 text-[#C392EC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"></path>
                </svg>
                Direct Referrals ({downlines.length})
            </h3>
            
            {#if downlines.length > 0}
                <div class="space-y-3">
                    {#each downlines as downlineUser}
                        <div class="flex items-center justify-between p-3 bg-[#3B3B3B] rounded-lg hover:bg-[#4B4B4B] transition-colors duration-200">
                            <div class="flex items-center space-x-3">
                                <div class="w-8 h-8 bg-[#C392EC] rounded-full flex items-center justify-center flex-shrink-0">
                                    <span class="text-sm font-medium text-white">
                                        {downlineUser.name?.charAt(0) || downlineUser.email?.charAt(0) || 'U'}
                                    </span>
                                </div>
                                <div>
                                    <p class="text-sm font-medium text-[#F0F0F0]">{downlineUser.name || 'No name'}</p>
                                    <p class="text-xs text-[#A0A0A0]">{downlineUser.email}</p>
                                    <p class="text-xs text-[#A0A0A0]">Joined: {formatDate(downlineUser.created)}</p>
                                </div>
                            </div>
                            <div class="flex items-center space-x-2">
                                {#if downlineUser.role}
                                    <span class="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded">
                                        {downlineUser.role}
                                    </span>
                                {/if}
                                <button
                                    onclick={() => viewUserTree(downlineUser.id)}
                                    class="text-[#C392EC] hover:text-[#B580E1] transition-colors duration-200"
                                    title="View Tree"
                                >
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    {/each}
                </div>
            {:else}
                <div class="text-center py-8">
                    <svg class="mx-auto h-12 w-12 text-[#A0A0A0] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"></path>
                    </svg>
                    <h4 class="text-sm font-medium text-[#F0F0F0] mb-2">No Referrals</h4>
                    <p class="text-xs text-[#A0A0A0]">This user hasn't referred anyone yet</p>
                </div>
            {/if}
        </div>
    </div>
    
    <!-- Referral Stats -->
    <div class="mt-8 bg-[#2B2B2B] rounded-xl border border-[#3B3B3B] p-6">
        <h3 class="text-lg font-semibold text-[#F0F0F0] mb-4">Referral Statistics</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="text-center">
                <div class="text-2xl font-bold text-[#C392EC]">{downlines.length}</div>
                <div class="text-sm text-[#A0A0A0]">Direct Referrals</div>
            </div>
            <div class="text-center">
                <div class="text-2xl font-bold text-[#85D5C8]">{uplines.length}</div>
                <div class="text-sm text-[#A0A0A0]">Upline Levels</div>
            </div>
            <div class="text-center">
                <div class="text-2xl font-bold text-[#F0F0F0]">
                    {downlines.reduce((sum, d) => {
                        const created = new Date(d.created);
                        const thirtyDaysAgo = new Date();
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                        return created > thirtyDaysAgo ? sum + 1 : sum;
                    }, 0)}
                </div>
                <div class="text-sm text-[#A0A0A0]">Last 30 Days</div>
            </div>
            <div class="text-center">
                <div class="text-2xl font-bold text-[#F0F0F0]">
                    {user.referralCode ? '✓' : '✗'}
                </div>
                <div class="text-sm text-[#A0A0A0]">Has Referral Code</div>
            </div>
        </div>
    </div>
</div>
