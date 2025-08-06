<script>
    import { currentUser } from '$lib/pocketbase.js';
    import { onMount } from 'svelte';
    
    let { data } = $props();
    
    let user = data.user || $currentUser;
    let referralStats = $state(data.referralStats || {});
    let copied = $state(false);
    let selectedTab = $state('overview'); // 'overview', 'downlines', 'commissions'
    let selectedDownline = $state(null);
    
    // Format currency
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }
    
    // Generate referral link using $derived
    let referralLink = $derived(
        typeof window !== 'undefined' 
            ? `${window.location.origin}/signup?ref=${referralStats.referralCode}`
            : ''
    );
    
    // Copy referral link to clipboard
    async function copyReferralLink() {
        try {
            await navigator.clipboard.writeText(referralLink);
            copied = true;
            setTimeout(() => {
                copied = false;
            }, 3000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }
    
    // Copy referral code to clipboard
    async function copyReferralCode() {
        try {
            await navigator.clipboard.writeText(referralStats.referralCode);
            copied = true;
            setTimeout(() => {
                copied = false;
            }, 3000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }
    
    // Format date for display
    function formatDateTime(dateStr, timeStr = null) {
        if (timeStr) {
            return `${dateStr} at ${timeStr}`;
        }
        return dateStr;
    }
    
    // Get commission rate display
    function getCommissionRate(originalAmount, commissionAmount) {
        if (!originalAmount || originalAmount === 0) return '0%';
        return `${Math.round((commissionAmount / originalAmount) * 100)}%`;
    }
</script>

<svelte:head>
    <title>Referrals - Cashfluenced</title>
    <meta name="description" content="Share your referral code and earn commissions" />
</svelte:head>

<main class="bg-[#1A1A1A] min-h-full">
    <div class="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-12">
        <!-- Header Section -->
        <div class="text-center mb-6 sm:mb-8">
            <h1 class="text-2xl sm:text-3xl md:text-4xl font-bold text-[#F0F0F0] mb-2 md:mb-4">
                Referral Program
            </h1>
            <p class="text-sm sm:text-base md:text-lg text-[#A0A0A0]">
                Share your referral code and earn commissions when others join
            </p>
        </div>

        <!-- Copy Success Message -->
        {#if copied}
            <div class="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div class="flex items-center gap-3">
                    <svg class="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p class="text-green-400 font-medium">Copied to clipboard!</p>
                </div>
            </div>
        {/if}

        <!-- Quick Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div class="bg-[#2B2B2B] rounded-xl p-6 border border-[#2B2B2B]">
                <div class="flex items-center gap-3 mb-2">
                    <div class="p-2 bg-[#10B981]/10 rounded-lg">
                        <svg class="w-5 h-5 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                    </div>
                    <h3 class="text-lg font-bold text-[#F0F0F0]">Total Referrals</h3>
                </div>
                <p class="text-2xl font-bold text-[#10B981]">{referralStats.totalReferrals || 0}</p>
            </div>

            <div class="bg-[#2B2B2B] rounded-xl p-6 border border-[#2B2B2B]">
                <div class="flex items-center gap-3 mb-2">
                    <div class="p-2 bg-[#F59E0B]/10 rounded-lg">
                        <svg class="w-5 h-5 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                        </svg>
                    </div>
                    <h3 class="text-lg font-bold text-[#F0F0F0]">Total Earnings</h3>
                </div>
                <p class="text-2xl font-bold text-[#F59E0B]">{formatCurrency(referralStats.totalEarnings || 0)}</p>
            </div>

            <div class="bg-[#2B2B2B] rounded-xl p-6 border border-[#2B2B2B]">
                <div class="flex items-center gap-3 mb-2">
                    <div class="p-2 bg-[#C392EC]/10 rounded-lg">
                        <svg class="w-5 h-5 text-[#C392EC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                    </div>
                    <h3 class="text-lg font-bold text-[#F0F0F0]">Avg per Referral</h3>
                </div>
                <p class="text-2xl font-bold text-[#C392EC]">
                    {referralStats.totalReferrals > 0 ? formatCurrency((referralStats.totalEarnings || 0) / referralStats.totalReferrals) : '$0.00'}
                </p>
            </div>
        </div>

        <!-- Tab Navigation -->
        <div class="mb-6">
            <div class="flex flex-wrap gap-2 bg-[#2B2B2B] p-2 rounded-lg">
                <button
                    onclick={() => selectedTab = 'overview'}
                    class="px-4 py-2 rounded-md text-sm font-medium transition-colors {selectedTab === 'overview' 
                        ? 'bg-[#C392EC] text-white' 
                        : 'text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#3B3B3B]'}"
                >
                    Overview
                </button>
                <button
                    onclick={() => selectedTab = 'downlines'}
                    class="px-4 py-2 rounded-md text-sm font-medium transition-colors {selectedTab === 'downlines' 
                        ? 'bg-[#C392EC] text-white' 
                        : 'text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#3B3B3B]'}"
                >
                    Downlines ({referralStats.detailedDownlines?.length || 0})
                </button>
                <button
                    onclick={() => selectedTab = 'commissions'}
                    class="px-4 py-2 rounded-md text-sm font-medium transition-colors {selectedTab === 'commissions' 
                        ? 'bg-[#C392EC] text-white' 
                        : 'text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#3B3B3B]'}"
                >
                    Commission History
                </button>
            </div>
        </div>

        <!-- Tab Content -->
        {#if selectedTab === 'overview'}
            <!-- Overview Tab -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                <!-- Your Referral Code -->
                <div class="bg-[#2B2B2B] rounded-xl p-6 border border-[#2B2B2B]">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="p-3 bg-[#C392EC]/10 rounded-lg">
                            <svg class="w-6 h-6 text-[#C392EC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
                            </svg>
                        </div>
                        <div>
                            <h2 class="text-xl font-bold text-[#F0F0F0]">Your Referral Code</h2>
                            <p class="text-sm text-[#A0A0A0]">Share this code to earn 10% commissions</p>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <!-- Referral Code Display -->
                        <div>
                            <label class="block text-sm font-medium text-[#F0F0F0] mb-2">Referral Code</label>
                            <div class="flex gap-2">
                                <input
                                    type="text"
                                    value={referralStats.referralCode || ''}
                                    readonly
                                    class="flex-1 bg-[#1A1A1A] border border-[#3B3B3B] rounded-lg px-3 py-2 text-[#F0F0F0] font-mono"
                                />
                                <button
                                    onclick={copyReferralCode}
                                    class="px-4 py-2 bg-[#C392EC] text-white rounded-lg hover:bg-[#C392EC]/80 transition-colors"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>

                        <!-- Referral Link -->
                        <div>
                            <label class="block text-sm font-medium text-[#F0F0F0] mb-2">Referral Link</label>
                            <div class="flex gap-2">
                                <input
                                    type="text"
                                    value={referralLink}
                                    readonly
                                    class="flex-1 bg-[#1A1A1A] border border-[#3B3B3B] rounded-lg px-3 py-2 text-[#F0F0F0] text-sm"
                                />
                                <button
                                    onclick={copyReferralLink}
                                    class="px-4 py-2 bg-[#85D5C8] text-[#1A1A1A] rounded-lg hover:bg-[#85D5C8]/80 transition-colors"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Commissions -->
                <div class="bg-[#2B2B2B] rounded-xl p-6 border border-[#2B2B2B]">
                    <h2 class="text-xl font-bold text-[#F0F0F0] mb-6">Recent Commissions</h2>
                    
                    {#if referralStats.recentCommissions && referralStats.recentCommissions.length > 0}
                        <div class="space-y-3">
                            {#each referralStats.recentCommissions.slice(0, 5) as commission}
                                <div class="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-lg border border-[#3B3B3B]">
                                    <div class="flex-1">
                                        <div class="text-[#F0F0F0] font-medium">{formatCurrency(commission.amount)}</div>
                                        <div class="text-sm text-[#A0A0A0]">From {commission.fromUser}</div>
                                        <div class="text-xs text-[#A0A0A0]">{commission.courseName}</div>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-sm text-[#85D5C8]">{commission.earnedDate}</div>
                                        <div class="text-xs text-[#A0A0A0]">{commission.earnedTime}</div>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {:else}
                        <div class="text-center py-8">
                            <div class="p-3 bg-[#F59E0B]/10 rounded-lg inline-block mb-4">
                                <svg class="w-8 h-8 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                                </svg>
                            </div>
                            <h3 class="text-lg font-semibold text-[#F0F0F0] mb-2">No Commissions Yet</h3>
                            <p class="text-[#A0A0A0] mb-4">Start sharing your referral code to earn commissions!</p>
                        </div>
                    {/if}
                </div>
            </div>

        {:else if selectedTab === 'downlines'}
            <!-- Downlines Tab -->
            <div class="bg-[#2B2B2B] rounded-xl p-6 border border-[#2B2B2B]">
                <h2 class="text-xl font-bold text-[#F0F0F0] mb-6">Your Downlines & Commissions</h2>
                
                {#if referralStats.detailedDownlines && referralStats.detailedDownlines.length > 0}
                    <div class="space-y-4">
                        {#each referralStats.detailedDownlines as downline}
                            <div class="bg-[#1A1A1A] rounded-lg p-6 border border-[#3B3B3B]">
                                <!-- Downline Header -->
                                <div class="flex items-center justify-between mb-4">
                                    <div class="flex items-center gap-3">
                                        <div class="w-12 h-12 bg-[#C392EC] rounded-full flex items-center justify-center">
                                            <span class="text-white font-medium text-lg">
                                                {downline.name?.charAt(0)?.toUpperCase() || '?'}
                                            </span>
                                        </div>
                                        <div>
                                            <div class="text-[#F0F0F0] font-bold text-lg">{downline.name}</div>
                                            <div class="text-[#A0A0A0] text-sm">{downline.email}</div>
                                            <div class="text-[#A0A0A0] text-xs">Joined {downline.joinDate}</div>
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-[#85D5C8] font-bold text-xl">
                                            {formatCurrency(downline.totalCommissionEarned)}
                                        </div>
                                        <div class="text-[#A0A0A0] text-sm">Total Commission</div>
                                    </div>
                                </div>

                                <!-- Downline Stats -->
                                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <div class="bg-[#2B2B2B] rounded-lg p-3">
                                        <div class="text-[#F0F0F0] font-bold">{downline.totalPurchases}</div>
                                        <div class="text-[#A0A0A0] text-sm">Purchases</div>
                                    </div>
                                    <div class="bg-[#2B2B2B] rounded-lg p-3">
                                        <div class="text-[#F0F0F0] font-bold">{formatCurrency(downline.totalSpent)}</div>
                                        <div class="text-[#A0A0A0] text-sm">Total Spent</div>
                                    </div>
                                    <div class="bg-[#2B2B2B] rounded-lg p-3">
                                        <div class="text-[#85D5C8] font-bold">{formatCurrency(downline.totalCommissionEarned)}</div>
                                        <div class="text-[#A0A0A0] text-sm">Your Earnings</div>
                                    </div>
                                    <div class="bg-[#2B2B2B] rounded-lg p-3">
                                        <div class="text-[#C392EC] font-bold">
                                            {downline.totalSpent > 0 ? getCommissionRate(downline.totalSpent, downline.totalCommissionEarned) : '10%'}
                                        </div>
                                        <div class="text-[#A0A0A0] text-sm">Avg Rate</div>
                                    </div>
                                </div>

                                <!-- Purchase History -->
                                {#if downline.purchases && downline.purchases.length > 0}
                                    <div>
                                        <h4 class="text-[#F0F0F0] font-medium mb-3">Purchase History</h4>
                                        <div class="space-y-2">
                                            {#each downline.purchases as purchase}
                                                <div class="flex items-center justify-between p-3 bg-[#2B2B2B] rounded-lg">
                                                    <div class="flex-1">
                                                        <div class="text-[#F0F0F0] font-medium">{purchase.courseName}</div>
                                                        <div class="text-sm text-[#A0A0A0]">
                                                            {formatCurrency(purchase.amount)} â€¢ {purchase.purchaseDate}
                                                        </div>
                                                    </div>
                                                    <div class="text-right">
                                                        <div class="text-[#85D5C8] font-medium">
                                                            +{formatCurrency(purchase.commissionEarned)}
                                                        </div>
                                                        <div class="text-xs text-[#A0A0A0]">Your Commission</div>
                                                    </div>
                                                </div>
                                            {/each}
                                        </div>
                                    </div>
                                {:else}
                                    <div class="text-center py-4">
                                        <p class="text-[#A0A0A0]">No purchases yet</p>
                                    </div>
                                {/if}
                            </div>
                        {/each}
                    </div>
                {:else}
                    <div class="text-center py-12">
                        <div class="p-4 bg-[#10B981]/10 rounded-lg inline-block mb-4">
                            <svg class="w-12 h-12 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold text-[#F0F0F0] mb-2">No Referrals Yet</h3>
                        <p class="text-[#A0A0A0] mb-6">Share your referral code to start building your downline and earning commissions!</p>
                        <button
                            onclick={copyReferralCode}
                            class="px-6 py-3 bg-[#C392EC] text-white rounded-lg hover:bg-[#C392EC]/80 transition-colors"
                        >
                            Copy Referral Code
                        </button>
                    </div>
                {/if}
            </div>

        {:else if selectedTab === 'commissions'}
            <!-- Commission History Tab -->
            <div class="bg-[#2B2B2B] rounded-xl p-6 border border-[#2B2B2B]">
                <h2 class="text-xl font-bold text-[#F0F0F0] mb-6">Commission History</h2>
                
                {#if referralStats.recentCommissions && referralStats.recentCommissions.length > 0}
                    <div class="space-y-3">
                        {#each referralStats.recentCommissions as commission}
                            <div class="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-lg border border-[#3B3B3B]">
                                <div class="flex items-center gap-4">
                                    <div class="w-10 h-10 bg-[#85D5C8]/10 rounded-lg flex items-center justify-center">
                                        <svg class="w-5 h-5 text-[#85D5C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                                        </svg>
                                    </div>
                                    <div class="flex-1">
                                        <div class="text-[#F0F0F0] font-bold text-lg">{formatCurrency(commission.amount)}</div>
                                        <div class="text-sm text-[#A0A0A0]">
                                            Commission from <span class="text-[#85D5C8]">{commission.fromUser}</span>
                                        </div>
                                        <div class="text-sm text-[#A0A0A0]">{commission.courseName}</div>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <div class="text-[#F0F0F0] font-medium">{commission.earnedDate}</div>
                                    <div class="text-sm text-[#A0A0A0]">{commission.earnedTime}</div>
                                    <div class="text-xs text-[#85D5C8]">10% Commission</div>
                                </div>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <div class="text-center py-12">
                        <div class="p-4 bg-[#F59E0B]/10 rounded-lg inline-block mb-4">
                            <svg class="w-12 h-12 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold text-[#F0F0F0] mb-2">No Commissions Yet</h3>
                        <p class="text-[#A0A0A0] mb-6">Commissions will appear here when your referrals make purchases.</p>
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</main>
