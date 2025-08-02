<script>
    import { currentUser } from '$lib/pocketbase.js';
    import { onMount } from 'svelte';
    
    let { data } = $props();
    
    let user = data.user || $currentUser;
    let referralStats = $state(data.referralStats || {});
    let copied = $state(false);
    
    // Generate referral link
    $: referralLink = typeof window !== 'undefined' 
        ? `${window.location.origin}/signup?ref=${referralStats.referralCode}`
        : '';
    
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
</script>

<svelte:head>
    <title>Referrals - Cashfluenced</title>
    <meta name="description" content="Share your referral code and earn commissions" />
</svelte:head>

<main class="bg-[#1A1A1A] min-h-full">
    <div class="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-12">
        <!-- Header Section -->
        <div class="text-center mb-6 sm:mb-8 md:mb-12">
            <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#F0F0F0] mb-2 md:mb-4">
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

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
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
                        <p class="text-sm text-[#A0A0A0]">Share this code with others to earn commissions</p>
                    </div>
                </div>

                <div class="space-y-4">
                    <!-- Referral Code Display -->
                    <div>
                        <label class="block text-sm font-medium text-[#F0F0F0] mb-2">
                            Referral Code
                        </label>
                        <div class="flex items-center gap-2">
                            <div class="flex-1 px-4 py-3 bg-[#1A1A1A] border border-[#3B3B3B] rounded-lg">
                                <span class="text-[#F0F0F0] font-mono text-lg tracking-wider">
                                    {referralStats.referralCode || 'Loading...'}
                                </span>
                            </div>
                            <button
                                onclick={copyReferralCode}
                                class="px-4 py-3 bg-[#85D5C8]/10 text-[#85D5C8] border border-[#85D5C8]/20 rounded-lg hover:bg-[#85D5C8] hover:text-white transition-all duration-200"
                                title="Copy referral code"
                            >
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Referral Link -->
                    <div>
                        <label class="block text-sm font-medium text-[#F0F0F0] mb-2">
                            Referral Link
                        </label>
                        <div class="flex items-center gap-2">
                            <div class="flex-1 px-4 py-3 bg-[#1A1A1A] border border-[#3B3B3B] rounded-lg overflow-hidden">
                                <span class="text-[#A0A0A0] text-sm break-all">
                                    {referralLink || 'Loading...'}
                                </span>
                            </div>
                            <button
                                onclick={copyReferralLink}
                                class="px-4 py-3 bg-[#85D5C8]/10 text-[#85D5C8] border border-[#85D5C8]/20 rounded-lg hover:bg-[#85D5C8] hover:text-white transition-all duration-200"
                                title="Copy referral link"
                            >
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Referral Statistics -->
            <div class="bg-[#2B2B2B] rounded-xl p-6 border border-[#2B2B2B]">
                <div class="flex items-center gap-3 mb-6">
                    <div class="p-3 bg-[#10B981]/10 rounded-lg">
                        <svg class="w-6 h-6 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-xl font-bold text-[#F0F0F0]">Referral Statistics</h2>
                        <p class="text-sm text-[#A0A0A0]">Track your referral performance</p>
                    </div>
                </div>

                <div class="space-y-4">
                    <!-- Total Referrals -->
                    <div class="text-center p-4 bg-[#1A1A1A] rounded-lg border border-[#3B3B3B]">
                        <div class="text-2xl font-bold text-[#10B981] mb-1">
                            {referralStats.totalReferrals || 0}
                        </div>
                        <div class="text-sm text-[#A0A0A0]">Total Referrals</div>
                    </div>

                    <!-- Earnings Placeholder -->
                    <div class="text-center p-4 bg-[#1A1A1A] rounded-lg border border-[#3B3B3B]">
                        <div class="text-2xl font-bold text-[#F59E0B] mb-1">$0.00</div>
                        <div class="text-sm text-[#A0A0A0]">Total Earnings</div>
                        <div class="text-xs text-[#A0A0A0] mt-1">(Coming Soon)</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Referred Users List -->
        <div class="bg-[#2B2B2B] rounded-xl p-6 border border-[#2B2B2B]">
            <h2 class="text-xl font-bold text-[#F0F0F0] mb-6">Your Referrals</h2>
            
            {#if referralStats.referredUsers && referralStats.referredUsers.length > 0}
                <div class="space-y-4">
                    {#each referralStats.referredUsers as referredUser}
                        <div class="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-lg border border-[#3B3B3B]">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 bg-[#C392EC] rounded-full flex items-center justify-center">
                                    <span class="text-white font-medium">
                                        {referredUser.name?.charAt(0)?.toUpperCase() || '?'}
                                    </span>
                                </div>
                                <div>
                                    <div class="text-[#F0F0F0] font-medium">{referredUser.name}</div>
                                    <div class="text-[#A0A0A0] text-sm">{referredUser.email}</div>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="text-[#A0A0A0] text-sm">Joined</div>
                                <div class="text-[#F0F0F0] text-sm">{referredUser.joinDate}</div>
                            </div>
                        </div>
                    {/each}
                </div>
            {:else}
                <div class="text-center py-12">
                    <div class="p-4 bg-[#C392EC]/10 rounded-lg inline-block mb-4">
                        <svg class="w-12 h-12 text-[#C392EC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-[#F0F0F0] mb-2">No Referrals Yet</h3>
                    <p class="text-[#A0A0A0] mb-4">
                        Start sharing your referral code to build your network
                    </p>
                </div>
            {/if}
        </div>

        <!-- How it Works Section -->
        <div class="mt-8 bg-[#2B2B2B] rounded-xl p-6 border border-[#2B2B2B]">
            <h2 class="text-xl font-bold text-[#F0F0F0] mb-6">How Referrals Work</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="text-center">
                    <div class="p-3 bg-[#C392EC]/10 rounded-lg inline-block mb-4">
                        <svg class="w-8 h-8 text-[#C392EC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                        </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-[#F0F0F0] mb-2">Share Your Code</h3>
                    <p class="text-[#A0A0A0] text-sm">
                        Share your unique referral code or link with friends and family
                    </p>
                </div>
                
                <div class="text-center">
                    <div class="p-3 bg-[#10B981]/10 rounded-lg inline-block mb-4">
                        <svg class="w-8 h-8 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                        </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-[#F0F0F0] mb-2">They Join</h3>
                    <p class="text-[#A0A0A0] text-sm">
                        When someone uses your code to sign up, they become your referral
                    </p>
                </div>
                
                <div class="text-center">
                    <div class="p-3 bg-[#F59E0B]/10 rounded-lg inline-block mb-4">
                        <svg class="w-8 h-8 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                        </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-[#F0F0F0] mb-2">Earn Commissions</h3>
                    <p class="text-[#A0A0A0] text-sm">
                        Earn commissions when your referrals make purchases (Coming Soon)
                    </p>
                </div>
            </div>
        </div>
    </div>
</main>
