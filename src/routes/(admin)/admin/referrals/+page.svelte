<script>
    import { goto } from '$app/navigation';
    
    let { data } = $props();
    
    let users = $state(data.users);
    let totalUsers = $state(data.totalUsers);
    let totalPages = $state(data.totalPages);
    let currentPage = $state(data.currentPage);
    
    // Format date
    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    // Pagination
    async function goToPage(pageNum) {
        await goto(`/admin/referrals?page=${pageNum}`);
    }
    
    // View user's referral tree
    function viewReferralTree(userId) {
        goto(`/admin/referrals/${userId}`);
    }
    
    // Calculate totals
    const totalReferrals = $derived(users.reduce((sum, user) => sum + user.directReferrals, 0));
    const topReferrers = $derived(
        users.filter(u => u.directReferrals > 0).sort((a, b) => b.directReferrals - a.directReferrals).slice(0, 5)
    );
</script>

<svelte:head>
    <title>Referrals Overview - Admin</title>
</svelte:head>

<div class="p-6">
    <!-- Header -->
    <div class="mb-6">
        <h1 class="text-2xl font-bold text-[#F0F0F0]">Referrals Overview</h1>
        <p class="mt-1 text-[#A0A0A0]">Monitor referral network and performance</p>
    </div>
    
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-[#2B2B2B] rounded-xl p-6 border border-[#3B3B3B]">
            <div class="flex items-center">
                <div class="p-3 bg-blue-500/10 rounded-lg">
                    <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                    </svg>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-[#A0A0A0]">Total Users</p>
                    <p class="text-2xl font-bold text-[#F0F0F0]">{totalUsers}</p>
                </div>
            </div>
        </div>
        
        <div class="bg-[#2B2B2B] rounded-xl p-6 border border-[#3B3B3B]">
            <div class="flex items-center">
                <div class="p-3 bg-[#C392EC]/10 rounded-lg">
                    <svg class="w-6 h-6 text-[#C392EC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-[#A0A0A0]">Total Referrals</p>
                    <p class="text-2xl font-bold text-[#F0F0F0]">{totalReferrals}</p>
                </div>
            </div>
        </div>
        
        <div class="bg-[#2B2B2B] rounded-xl p-6 border border-[#3B3B3B]">
            <div class="flex items-center">
                <div class="p-3 bg-[#85D5C8]/10 rounded-lg">
                    <svg class="w-6 h-6 text-[#85D5C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                    </svg>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-[#A0A0A0]">Active Referrers</p>
                    <p class="text-2xl font-bold text-[#F0F0F0]">{users.filter(u => u.directReferrals > 0).length}</p>
                </div>
            </div>
        </div>
        
        <div class="bg-[#2B2B2B] rounded-xl p-6 border border-[#3B3B3B]">
            <div class="flex items-center">
                <div class="p-3 bg-green-500/10 rounded-lg">
                    <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-[#A0A0A0]">Avg Referrals</p>
                    <p class="text-2xl font-bold text-[#F0F0F0]">
                        {totalUsers > 0 ? (totalReferrals / totalUsers).toFixed(1) : '0.0'}
                    </p>
                </div>
            </div>
        </div>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Top Referrers -->
        <div class="bg-[#2B2B2B] rounded-xl border border-[#3B3B3B] p-6">
            <h3 class="text-lg font-semibold text-[#F0F0F0] mb-4">Top Referrers</h3>
            {#if topReferrers.length > 0}
                <div class="space-y-3">
                    {#each topReferrers as user, index}
                        <div class="flex items-center justify-between p-3 bg-[#3B3B3B] rounded-lg">
                            <div class="flex items-center space-x-3">
                                <div class="w-8 h-8 bg-[#C392EC] rounded-full flex items-center justify-center flex-shrink-0">
                                    <span class="text-sm font-medium text-white">
                                        {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                                    </span>
                                </div>
                                <div>
                                    <p class="text-sm font-medium text-[#F0F0F0]">{user.name || 'No name'}</p>
                                    <p class="text-xs text-[#A0A0A0]">{user.email}</p>
                                </div>
                            </div>
                            <div class="flex items-center space-x-2">
                                <span class="bg-[#C392EC]/10 text-[#C392EC] px-2 py-1 rounded text-sm font-medium">
                                    {user.directReferrals}
                                </span>
                                <button
                                    onclick={() => viewReferralTree(user.id)}
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
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    <h4 class="text-sm font-medium text-[#F0F0F0] mb-2">No Active Referrers</h4>
                    <p class="text-xs text-[#A0A0A0]">No users have made referrals yet</p>
                </div>
            {/if}
        </div>
        
        <!-- All Users Table -->
        <div class="lg:col-span-2 bg-[#2B2B2B] rounded-xl border border-[#3B3B3B] overflow-hidden">
            <div class="p-6 border-b border-[#3B3B3B]">
                <h3 class="text-lg font-semibold text-[#F0F0F0]">All Users</h3>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-[#3B3B3B]">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">User</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Referrals</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Joined</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-[#3B3B3B]">
                        {#each users as user}
                            <tr class="hover:bg-[#3B3B3B] transition-colors duration-200">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex items-center">
                                        <div class="flex-shrink-0 h-8 w-8">
                                            <div class="h-8 w-8 rounded-full bg-[#C392EC] flex items-center justify-center">
                                                <span class="text-xs font-medium text-white">
                                                    {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                                                </span>
                                            </div>
                                        </div>
                                        <div class="ml-3">
                                            <div class="text-sm font-medium text-[#F0F0F0]">{user.name || 'No name'}</div>
                                            <div class="text-sm text-[#A0A0A0]">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {
                                        user.directReferrals > 0 ? 'bg-[#C392EC]/10 text-[#C392EC]' : 'bg-gray-500/10 text-gray-400'
                                    }">
                                        {user.directReferrals}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-[#A0A0A0]">
                                    {formatDate(user.created)}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">
                                    <button
                                        onclick={() => viewReferralTree(user.id)}
                                        class="text-[#85D5C8] hover:text-[#6BC4B6] transition-colors duration-200"
                                        title="View Referral Tree"
                                    >
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
            
            <!-- Pagination -->
            {#if totalPages > 1}
                <div class="px-6 py-4 border-t border-[#3B3B3B] flex items-center justify-between">
                    <div class="text-sm text-[#A0A0A0]">
                        Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalUsers)} of {totalUsers} users
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
    </div>
</div>
