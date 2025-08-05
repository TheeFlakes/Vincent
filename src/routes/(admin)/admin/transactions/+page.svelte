<script>
    import { goto } from '$app/navigation';
    
    let { data } = $props();
    
    let transactions = $state(data.transactions);
    let totalTransactions = $state(data.totalTransactions);
    let totalPages = $state(data.totalPages);
    let currentPage = $state(data.currentPage);
    let currentFilters = $state(data.currentFilters);
    
    let searchValue = $state(currentFilters.search);
    let statusFilter = $state(currentFilters.status);
    
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
    
    // Format currency
    function formatCurrency(amount, currency = 'USD') {
        const currencyCode = currency.toUpperCase();
        
        // Handle different currencies
        let locale = 'en-US';
        if (currencyCode === 'NGN') {
            locale = 'en-NG';
        } else if (currencyCode === 'GBP') {
            locale = 'en-GB';
        } else if (currencyCode === 'EUR') {
            locale = 'en-EU';
        }
        
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currencyCode
        }).format(amount);
    }
    
    // Apply filters
    async function applyFilters() {
        const params = new URLSearchParams();
        if (searchValue) params.set('search', searchValue);
        if (statusFilter) params.set('status', statusFilter);
        params.set('page', '1');
        
        await goto(`/admin/transactions?${params.toString()}`);
    }
    
    // Clear filters
    async function clearFilters() {
        searchValue = '';
        statusFilter = '';
        await goto('/admin/transactions');
    }
    
    // Pagination
    async function goToPage(pageNum) {
        const params = new URLSearchParams(window.location.search);
        params.set('page', pageNum.toString());
        await goto(`/admin/transactions?${params.toString()}`);
    }
    
    // Get status badge classes
    function getStatusBadgeClass(status) {
        switch (status) {
            case 'completed':
                return 'bg-green-500/10 text-green-400';
            case 'pending':
                return 'bg-orange-500/10 text-orange-400';
            case 'failed':
                return 'bg-red-500/10 text-red-400';
            case 'expired':
                return 'bg-gray-500/10 text-gray-400';
            default:
                return 'bg-blue-500/10 text-blue-400';
        }
    }
    
    // Calculate total revenue
    const totalRevenue = $derived(
        transactions
            .filter(t => t.status === 'completed')
            .reduce((sum, t) => sum + (t.amount || 0), 0)
    );
</script>

<svelte:head>
    <title>Transactions Management - Admin</title>
</svelte:head>

<div class="p-6">
    <!-- Header -->
    <div class="mb-6">
        <h1 class="text-2xl font-bold text-[#F0F0F0]">Transactions Management</h1>
        <p class="mt-1 text-[#A0A0A0]">View and manage all payment transactions</p>
    </div>
    
    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-[#2B2B2B] rounded-xl p-4 border border-[#3B3B3B]">
            <div class="flex items-center">
                <div class="p-2 bg-green-500/10 rounded-lg">
                    <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm font-medium text-[#A0A0A0]">Completed</p>
                    <p class="text-lg font-bold text-[#F0F0F0]">
                        {transactions.filter(t => t.status === 'completed').length}
                    </p>
                </div>
            </div>
        </div>
        
        <div class="bg-[#2B2B2B] rounded-xl p-4 border border-[#3B3B3B]">
            <div class="flex items-center">
                <div class="p-2 bg-orange-500/10 rounded-lg">
                    <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm font-medium text-[#A0A0A0]">Pending</p>
                    <p class="text-lg font-bold text-[#F0F0F0]">
                        {transactions.filter(t => t.status === 'pending').length}
                    </p>
                </div>
            </div>
        </div>
        
        <div class="bg-[#2B2B2B] rounded-xl p-4 border border-[#3B3B3B]">
            <div class="flex items-center">
                <div class="p-2 bg-red-500/10 rounded-lg">
                    <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm font-medium text-[#A0A0A0]">Failed</p>
                    <p class="text-lg font-bold text-[#F0F0F0]">
                        {transactions.filter(t => t.status === 'failed').length}
                    </p>
                </div>
            </div>
        </div>
        
        <div class="bg-[#2B2B2B] rounded-xl p-4 border border-[#3B3B3B]">
            <div class="flex items-center">
                <div class="p-2 bg-[#C392EC]/10 rounded-lg">
                    <svg class="w-5 h-5 text-[#C392EC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm font-medium text-[#A0A0A0]">Revenue</p>
                    <p class="text-lg font-bold text-[#F0F0F0]">{formatCurrency(totalRevenue)}</p>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Filters -->
    <div class="bg-[#2B2B2B] rounded-xl p-6 mb-6 border border-[#3B3B3B]">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label class="block text-sm font-medium text-[#F0F0F0] mb-2">Search</label>
                <input
                    type="text"
                    bind:value={searchValue}
                    placeholder="Search by user email or course..."
                    class="w-full bg-[#3B3B3B] border border-[#4B4B4B] rounded-lg px-3 py-2 text-[#F0F0F0] placeholder-[#A0A0A0] focus:outline-none focus:border-[#C392EC]"
                    onkeydown={(e) => e.key === 'Enter' && applyFilters()}
                />
            </div>
            
            <div>
                <label class="block text-sm font-medium text-[#F0F0F0] mb-2">Status Filter</label>
                <select
                    bind:value={statusFilter}
                    class="w-full bg-[#3B3B3B] border border-[#4B4B4B] rounded-lg px-3 py-2 text-[#F0F0F0] focus:outline-none focus:border-[#C392EC]"
                >
                    <option value="">All Statuses</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="expired">Expired</option>
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
    
    <!-- Transactions Table -->
    <div class="bg-[#2B2B2B] rounded-xl border border-[#3B3B3B] overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-[#3B3B3B]">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Transaction</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">User</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Course</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Amount</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Date</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[#3B3B3B]">
                    {#each transactions as transaction}
                        <tr class="hover:bg-[#3B3B3B] transition-colors duration-200">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div>
                                    <div class="text-sm font-medium text-[#F0F0F0] font-mono">
                                        {transaction.id.substring(0, 8)}...
                                    </div>
                                    {#if transaction.paystack_reference}
                                        <div class="text-xs text-[#A0A0A0] font-mono">
                                            Paystack: {transaction.paystack_reference.substring(0, 20)}...
                                        </div>
                                    {:else}
                                        <div class="text-xs text-[#A0A0A0]">
                                            Manual/Legacy
                                        </div>
                                    {/if}
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <div class="flex-shrink-0 h-8 w-8">
                                        <div class="h-8 w-8 rounded-full bg-[#C392EC] flex items-center justify-center">
                                            <span class="text-xs font-medium text-white">
                                                {transaction.expand?.user?.name?.charAt(0) || transaction.expand?.user?.email?.charAt(0) || 'U'}
                                            </span>
                                        </div>
                                    </div>
                                    <div class="ml-3">
                                        <div class="text-sm font-medium text-[#F0F0F0]">
                                            {transaction.expand?.user?.name || 'No name'}
                                        </div>
                                        <div class="text-sm text-[#A0A0A0]">
                                            {transaction.expand?.user?.email || 'No email'}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-[#F0F0F0]">
                                    {transaction.expand?.course?.title || 'Unknown Course'}
                                </div>
                                <div class="text-sm text-[#A0A0A0]">
                                    {transaction.expand?.course?.isFree ? 'Free Course' : 'Paid Course'}
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-[#F0F0F0]">
                                    {formatCurrency(transaction.amount || 0, transaction.currency)}
                                </div>
                                <div class="text-sm text-[#A0A0A0]">
                                    {(transaction.currency || 'USD').toUpperCase()}
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {getStatusBadgeClass(transaction.status)}">
                                    {transaction.status || 'unknown'}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-[#A0A0A0]">
                                {formatDate(transaction.created)}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
        
        {#if transactions.length === 0}
            <div class="text-center py-12">
                <svg class="mx-auto h-12 w-12 text-[#A0A0A0] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                <h3 class="text-lg font-medium text-[#F0F0F0] mb-2">No transactions found</h3>
                <p class="text-[#A0A0A0]">No transactions match your current filters.</p>
            </div>
        {/if}
    </div>
    
    <!-- Pagination -->
    {#if totalPages > 1}
        <div class="mt-6 flex items-center justify-between">
            <div class="text-sm text-[#A0A0A0]">
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalTransactions)} of {totalTransactions} transactions
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
