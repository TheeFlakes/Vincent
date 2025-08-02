<script>
    import { currentUser, pb } from '$lib/pocketbase.js';
    import { onMount } from 'svelte';
    
    let { data } = $props();
    
    // Use server-side data first, fallback to store
    let user = data.user || $currentUser;
    let userDetails = user; // Start with basic user data immediately
    let loading = false; // Set loading to false immediately
    let error = null;
    
    // Fetch detailed user information in background
    onMount(async () => {
        console.log('Dashboard mounted, user:', user);
        
        if (user?.id) {
            try {
                console.log('Fetching user details for ID:', user.id);
                const record = await pb.collection('users').getOne(user.id, {
                    expand: 'referredBy',
                });
                console.log('User details fetched successfully:', record);
                userDetails = record; // Update with detailed data when available
            } catch (error) {
                console.error('Error fetching user details:', error);
                console.log('Error details:', error.message, error.status);
                // Keep using basic user data if detailed fetch fails
            }
        } else {
            console.log('No user ID available, using basic user data');
        }
    });
</script>

<svelte:head>
    <title>Dashboard - Cashfluenced</title>
</svelte:head>

<main class="bg-[#1A1A1A] min-h-full">
    <div class="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-12 lg:py-16">
        <div class="text-center mb-8 md:mb-12">
            <h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#F0F0F0] mb-2 md:mb-4">
                Welcome back, {userDetails?.username || user?.name || 'User'}!
            </h1>
            <p class="text-sm sm:text-base md:text-lg text-[#A0A0A0]">
                Track your faceless income journey and manage your account
            </p>
        </div>

        {#if userDetails || user}
            <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                <!-- Profile Information Card -->
                <div class="lg:col-span-2 xl:col-span-2 bg-[#2B2B2B] rounded-xl p-4 sm:p-6 md:p-8 shadow-lg border border-[#2B2B2B]">
                    <div class="flex flex-col sm:flex-row items-start gap-3 md:gap-4 mb-4 md:mb-6">
                        <div class="p-2 md:p-3 bg-[#C392EC]/10 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 md:w-6 md:h-6 text-[#C392EC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <div class="flex-1">
                            <h2 class="text-lg sm:text-xl md:text-2xl font-bold text-[#F0F0F0]">Profile Information</h2>
                            <p class="text-sm md:text-base text-[#A0A0A0] mt-1">Your account details and information</p>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                        <div class="flex items-start gap-2 md:gap-3">
                            <svg class="w-3 h-3 md:w-4 md:h-4 text-[#85D5C8] flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <div class="min-w-0 flex-1">
                                <span class="text-xs md:text-sm text-[#A0A0A0] block">Username:</span>
                                <p class="text-sm md:text-base text-[#F0F0F0] font-medium truncate">{(userDetails || user)?.username || (userDetails || user)?.name || 'Not provided'}</p>
                            </div>
                        </div>
                        
                        <div class="flex items-start gap-2 md:gap-3">
                            <svg class="w-3 h-3 md:w-4 md:h-4 text-[#85D5C8] flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <div class="min-w-0 flex-1">
                                <span class="text-xs md:text-sm text-[#A0A0A0] block">Email:</span>
                                <p class="text-sm md:text-base text-[#F0F0F0] font-medium truncate">{(userDetails || user)?.email}</p>
                            </div>
                        </div>
                        
                        <div class="flex items-start gap-2 md:gap-3">
                            <svg class="w-3 h-3 md:w-4 md:h-4 text-[#85D5C8] flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <div class="min-w-0 flex-1">
                                <span class="text-xs md:text-sm text-[#A0A0A0] block">Role:</span>
                                <p class="text-sm md:text-base text-[#F0F0F0] font-medium capitalize">{(userDetails || user)?.role || 'User'}</p>
                            </div>
                        </div>
                        
                        <div class="flex items-start gap-2 md:gap-3">
                            <svg class="w-3 h-3 md:w-4 md:h-4 text-[#85D5C8] flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <div class="min-w-0 flex-1">
                                <span class="text-xs md:text-sm text-[#A0A0A0] block">Referral Code:</span>
                                <p class="text-sm md:text-base text-[#F0F0F0] font-medium font-mono">{(userDetails || user)?.referralCode || 'Not set'}</p>
                            </div>
                        </div>
                        
                        <div class="flex items-start gap-2 md:gap-3">
                            <svg class="w-3 h-3 md:w-4 md:h-4 text-[#85D5C8] flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <div class="min-w-0 flex-1">
                                <span class="text-xs md:text-sm text-[#A0A0A0] block">Member since:</span>
                                <p class="text-sm md:text-base text-[#F0F0F0] font-medium">{new Date((userDetails || user)?.created).toLocaleDateString()}</p>
                            </div>
                        </div>
                        
                        <div class="flex items-start gap-2 md:gap-3">
                            <svg class="w-3 h-3 md:w-4 md:h-4 text-[#85D5C8] flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <div class="min-w-0 flex-1">
                                <span class="text-xs md:text-sm text-[#A0A0A0] block">Referred By:</span>
                                <p class="text-sm md:text-base text-[#F0F0F0] font-medium">{userDetails?.expand?.referredBy?.username || 'Direct signup'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Wallet & Earnings Card -->
                <div class="bg-[#2B2B2B] rounded-xl p-4 sm:p-6 md:p-8 shadow-lg border border-[#2B2B2B]">
                    <div class="flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
                        <div class="p-2 md:p-3 bg-[#85D5C8]/10 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 md:w-6 md:h-6 text-[#85D5C8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <div>
                            <h2 class="text-lg sm:text-xl md:text-2xl font-bold text-[#F0F0F0]">Financial Overview</h2>
                            <p class="text-sm md:text-base text-[#A0A0A0] mt-1">Your earnings and balance</p>
                        </div>
                    </div>
                    
                    <div class="space-y-4 md:space-y-6">
                        <div class="bg-[#1A1A1A] rounded-lg p-3 md:p-4">
                            <div class="flex items-center gap-2 md:gap-3 mb-2">
                                <svg class="w-4 h-4 md:w-5 md:h-5 text-[#85D5C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                </svg>
                                <span class="text-xs md:text-sm text-[#A0A0A0]">Wallet Balance</span>
                            </div>
                            <p class="text-xl md:text-2xl lg:text-3xl font-bold text-[#85D5C8]">${(userDetails || user)?.walletBalance || 0}</p>
                        </div>
                        
                        <div class="bg-[#1A1A1A] rounded-lg p-3 md:p-4">
                            <div class="flex items-center gap-2 md:gap-3 mb-2">
                                <svg class="w-4 h-4 md:w-5 md:h-5 text-[#C392EC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                                </svg>
                                <span class="text-xs md:text-sm text-[#A0A0A0]">Commissions Earned</span>
                            </div>
                            <p class="text-xl md:text-2xl lg:text-3xl font-bold text-[#C392EC]">${(userDetails || user)?.commissionsEarned || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="mt-8 md:mt-12">
                <h2 class="text-xl sm:text-2xl md:text-3xl font-bold text-[#F0F0F0] mb-4 md:mb-6">Quick Actions</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <!-- Browse Courses -->
                    <a href="/dashboard/courses" class="group bg-[#2B2B2B] rounded-xl p-4 sm:p-6 shadow-lg border border-[#2B2B2B] hover:border-[#C392EC]/30 transition-all duration-300">
                        <div class="flex items-center gap-3 md:gap-4">
                            <div class="p-2 md:p-3 bg-[#C392EC]/10 rounded-lg group-hover:bg-[#C392EC]/20 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 md:w-6 md:h-6 text-[#C392EC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div>
                                <h3 class="text-base sm:text-lg font-semibold text-[#F0F0F0] group-hover:text-[#C392EC] transition-colors">Browse Courses</h3>
                                <p class="text-xs sm:text-sm text-[#A0A0A0] mt-1">Explore available courses</p>
                            </div>
                        </div>
                    </a>

                    <!-- View Subscriptions -->
                    <a href="/dashboard/subscriptions" class="group bg-[#2B2B2B] rounded-xl p-4 sm:p-6 shadow-lg border border-[#2B2B2B] hover:border-[#85D5C8]/30 transition-all duration-300">
                        <div class="flex items-center gap-3 md:gap-4">
                            <div class="p-2 md:p-3 bg-[#85D5C8]/10 rounded-lg group-hover:bg-[#85D5C8]/20 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 md:w-6 md:h-6 text-[#85D5C8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 class="text-base sm:text-lg font-semibold text-[#F0F0F0] group-hover:text-[#85D5C8] transition-colors">My Subscriptions</h3>
                                <p class="text-xs sm:text-sm text-[#A0A0A0] mt-1">Manage your course subscriptions</p>
                            </div>
                        </div>
                    </a>

                    <!-- Support -->
                    <a href="/dashboard/support" class="group bg-[#2B2B2B] rounded-xl p-4 sm:p-6 shadow-lg border border-[#2B2B2B] hover:border-[#F4C430]/30 transition-all duration-300">
                        <div class="flex items-center gap-3 md:gap-4">
                            <div class="p-2 md:p-3 bg-[#F4C430]/10 rounded-lg group-hover:bg-[#F4C430]/20 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 md:w-6 md:h-6 text-[#F4C430]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 class="text-base sm:text-lg font-semibold text-[#F0F0F0] group-hover:text-[#F4C430] transition-colors">Get Support</h3>
                                <p class="text-xs sm:text-sm text-[#A0A0A0] mt-1">Contact support team</p>
                            </div>
                        </div>
                    </a>

                    <!-- Profile Settings -->
                    <a href="/dashboard/profile" class="group bg-[#2B2B2B] rounded-xl p-4 sm:p-6 shadow-lg border border-[#2B2B2B] hover:border-[#FF6B6B]/30 transition-all duration-300">
                        <div class="flex items-center gap-3 md:gap-4">
                            <div class="p-2 md:p-3 bg-[#FF6B6B]/10 rounded-lg group-hover:bg-[#FF6B6B]/20 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 md:w-6 md:h-6 text-[#FF6B6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <h3 class="text-base sm:text-lg font-semibold text-[#F0F0F0] group-hover:text-[#FF6B6B] transition-colors">Profile Settings</h3>
                                <p class="text-xs sm:text-sm text-[#A0A0A0] mt-1">Update your profile information</p>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        {:else}
            <div class="bg-[#2B2B2B] rounded-xl p-6 md:p-8 shadow-lg border border-[#2B2B2B] text-center">
                <div class="p-4 bg-red-500/10 rounded-lg inline-block mb-4">
                    <svg class="w-6 h-6 md:w-8 md:h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5l-6.928-12c-.77-.833-2.732-.833-3.464 0l-6.928 12c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                </div>
                <h2 class="text-lg md:text-xl text-[#F0F0F0] font-semibold mb-2">Unable to load dashboard</h2>
                <p class="text-sm md:text-base text-[#A0A0A0] mb-4">There was an error loading your information.</p>
                <button 
                    onclick={() => window.location.reload()}
                    class="px-4 py-2 bg-[#C392EC] text-white rounded-lg hover:bg-[#C392EC]/80 transition-colors text-sm md:text-base"
                >
                    Retry
                </button>
            </div>
        {/if}
    </div>
</main>
