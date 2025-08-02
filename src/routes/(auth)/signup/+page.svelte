<script>
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { testPocketBaseConnection, validateReferralCode } from '$lib/pocketbase-utils.js';

    let loading = false;
    let connectionStatus = null;
    let referralCode = $state('');
    let referralValidation = $state(null);
    let validatingReferral = $state(false);
    
    // Debounce timer for referral validation
    let validationTimeout;
    
    onMount(async () => {
        // Test PocketBase connection on page load
        connectionStatus = await testPocketBaseConnection();
        
        // Get referral code from URL if present
        const urlParams = new URLSearchParams(window.location.search);
        const urlReferralCode = urlParams.get('ref');
        if (urlReferralCode) {
            referralCode = urlReferralCode;
            await validateReferralCodeAsync(urlReferralCode);
        }
    });
    
    // Validate referral code with debouncing
    async function validateReferralCodeAsync(code) {
        if (!code || code.trim().length < 3) {
            referralValidation = null;
            return;
        }
        
        validatingReferral = true;
        
        try {
            const result = await validateReferralCode(code.trim());
            referralValidation = result;
        } catch (error) {
            referralValidation = { valid: false, error: 'Validation failed' };
        } finally {
            validatingReferral = false;
        }
    }
    
    // Handle referral code input with debouncing
    function handleReferralInput(event) {
        referralCode = event.target.value;
        referralValidation = null;
        
        clearTimeout(validationTimeout);
        validationTimeout = setTimeout(() => {
            validateReferralCodeAsync(referralCode);
        }, 800);
    }
</script>

<svelte:head>
    <title>Sign Up - Cashfluenced</title>
</svelte:head>

<main class="bg-[#1A1A1A] min-h-screen">
    <section class="px-4 sm:px-8 md:px-12 lg:px-24 xl:px-32 py-12 sm:py-16 lg:py-24 mx-auto max-w-7xl">
        <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 lg:gap-12">
            
            <!-- Left Column: Signup Form -->
            <div class="w-full lg:w-1/2">
                <!-- Header -->
                <div class="mb-8 sm:mb-12">
                    <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#F0F0F0] leading-tight mb-4 sm:mb-6">
                        Start Your Journey
                    </h1>
                    <p class="text-base sm:text-lg leading-relaxed text-[#A0A0A0]">
                        Create your account and begin building your faceless income stream today.
                    </p>
                </div>

                <!-- Signup Form Card -->
                <!-- Signup Form Card -->
                <div class="bg-[#2B2B2B] rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#2B2B2B] hover:border-[#85D5C8]/20">
                    {#if connectionStatus && !connectionStatus.connected}
                        <div class="bg-[#C392EC]/10 border border-[#C392EC]/20 text-[#C392EC] px-4 py-3 rounded-lg mb-6">
                            <div class="flex items-start gap-3">
                                <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"></path>
                                </svg>
                                <div>
                                    <strong>Connection Issue:</strong> {connectionStatus.message}
                                    <br>
                                    <small class="text-[#A0A0A0]">Please follow the instructions in POCKETBASE_SETUP.md to set up PocketBase.</small>
                                </div>
                            </div>
                        </div>
                    {/if}
                    
                    {#if $page.form?.error}
                        <div class="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6">
                            <div class="flex items-start gap-3">
                                <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <span>{$page.form.error}</span>
                            </div>
                        </div>
                    {/if}
                    
                    <form method="POST" class="space-y-6" use:enhance={() => {
                        loading = true;
                        return async ({ update }) => {
                            loading = false;
                            await update();
                        };
                    }}>
                        <div class="space-y-4 sm:space-y-6">
                            <div>
                                <label for="name" class="block text-sm sm:text-base font-medium text-[#F0F0F0] mb-2">
                                    Full Name
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autocomplete="name"
                                    required
                                    class="w-full px-4 py-3 bg-[#1A1A1A] border border-[#2B2B2B] rounded-lg text-[#F0F0F0] placeholder-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#85D5C8] focus:border-transparent transition-all duration-300"
                                    placeholder="Enter your full name"
                                    value={$page.form?.name || ''}
                                />
                            </div>
                            
                            <div>
                                <label for="email" class="block text-sm sm:text-base font-medium text-[#F0F0F0] mb-2">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autocomplete="email"
                                    required
                                    class="w-full px-4 py-3 bg-[#1A1A1A] border border-[#2B2B2B] rounded-lg text-[#F0F0F0] placeholder-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#85D5C8] focus:border-transparent transition-all duration-300"
                                    placeholder="Enter your email"
                                    value={$page.form?.email || ''}
                                />
                            </div>
                            
                            <div>
                                <label for="password" class="block text-sm sm:text-base font-medium text-[#F0F0F0] mb-2">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autocomplete="new-password"
                                    required
                                    class="w-full px-4 py-3 bg-[#1A1A1A] border border-[#2B2B2B] rounded-lg text-[#F0F0F0] placeholder-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#85D5C8] focus:border-transparent transition-all duration-300"
                                    placeholder="Create a password"
                                />
                            </div>
                            
                            <div>
                                <label for="passwordConfirm" class="block text-sm sm:text-base font-medium text-[#F0F0F0] mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    id="passwordConfirm"
                                    name="passwordConfirm"
                                    type="password"
                                    autocomplete="new-password"
                                    required
                                    class="w-full px-4 py-3 bg-[#1A1A1A] border border-[#2B2B2B] rounded-lg text-[#F0F0F0] placeholder-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#85D5C8] focus:border-transparent transition-all duration-300"
                                    placeholder="Confirm your password"
                                />
                            </div>
                            
                            <div>
                                <label for="referralCode" class="block text-sm sm:text-base font-medium text-[#F0F0F0] mb-2">
                                    Referral Code <span class="text-red-400">*</span>
                                </label>
                                <div class="relative">
                                    <input
                                        id="referralCode"
                                        name="referralCode"
                                        type="text"
                                        autocomplete="off"
                                        required
                                        class="w-full px-4 py-3 bg-[#1A1A1A] border border-[#2B2B2B] rounded-lg text-[#F0F0F0] placeholder-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#85D5C8] focus:border-transparent transition-all duration-300 {referralValidation?.valid === true ? 'border-green-500' : referralValidation?.valid === false ? 'border-red-500' : ''}"
                                        placeholder="Enter referral code (required)"
                                        bind:value={referralCode}
                                        on:input={handleReferralInput}
                                    />
                                    
                                    <!-- Validation Icons -->
                                    <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                                        {#if validatingReferral}
                                            <svg class="w-5 h-5 text-[#A0A0A0] animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                            </svg>
                                        {:else if referralValidation?.valid === true}
                                            <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                        {:else if referralValidation?.valid === false}
                                            <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                        {/if}
                                    </div>
                                </div>
                                
                                <!-- Validation Messages -->
                                {#if referralValidation?.valid === true && referralValidation.referringUser}
                                    <div class="mt-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                        <div class="flex items-center gap-2 text-green-400 text-sm">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                            Valid referral code! Referred by: <strong>{referralValidation.referringUser.name}</strong>
                                        </div>
                                    </div>
                                {:else if referralValidation?.valid === false}
                                    <div class="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                        <div class="flex items-center gap-2 text-red-400 text-sm">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                            {referralValidation.error}
                                        </div>
                                    </div>
                                {:else}
                                    <p class="text-xs text-[#A0A0A0] mt-1">
                                        A referral code is required to create an account. Contact an existing member for a referral code.
                                    </p>
                                {/if}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            class="w-full bg-[#C392EC] text-[#FFFFFF] px-6 py-3 rounded-full font-semibold text-base hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {#if loading}
                                <svg class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                </svg>
                                Creating account...
                            {:else}
                                Sign up
                            {/if}
                        </button>

                        <div class="text-center">
                            <a href="/login" class="text-[#85D5C8] hover:text-[#85D5C8]/80 font-medium transition-colors duration-300">
                                Already have an account? Sign in
                            </a>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Right Column: Decorative Elements & Features -->
            <div class="w-full lg:w-1/2 mt-8 lg:mt-0">
                <div class="relative w-full aspect-square max-w-md mx-auto lg:max-w-none">
                    <!-- Background & Decorative Shapes -->
                    <div class="absolute inset-0 bg-[#C392EC]/20 rounded-[2rem] sm:rounded-[3rem] rotate-3"></div>
                    
                    <div class="absolute inset-0">
                        <!-- Decorative Elements -->
                        <div class="absolute -right-4 sm:-right-6 top-1/4 w-12 h-12 sm:w-20 sm:h-20 bg-[#85D5C8]/60 rounded-full"></div>
                        <div class="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 w-16 h-16 sm:w-24 sm:h-24 bg-[#C392EC]/60 rounded-2xl -rotate-6"></div>
                        <div class="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#F0F0F0] rounded-full"></div>
                        <div class="absolute top-4 sm:top-8 left-6 sm:left-12 w-2 h-2 sm:w-3 sm:h-3 bg-[#85D5C8] rounded-full"></div>
                    </div>

                    <!-- Features Card -->
                    <div class="relative z-10 w-[95%] sm:w-[90%] mx-auto mt-4 sm:mt-8">
                        <div class="bg-[#2B2B2B] rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-[#2B2B2B]">
                            <h3 class="text-lg sm:text-xl lg:text-2xl font-bold text-[#F0F0F0] mb-4 sm:mb-6 text-center">Join Today & Get</h3>
                            
                            <div class="space-y-4 sm:space-y-6">
                                <div class="flex items-start gap-3 sm:gap-4">
                                    <div class="p-2 sm:p-3 bg-[#C392EC]/10 rounded-lg flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 sm:w-6 sm:h-6 text-[#C392EC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253z" />
                                        </svg>
                                    </div>
                                    <div class="min-w-0">
                                        <h4 class="text-base sm:text-lg font-semibold text-[#F0F0F0]">Free Starter Pack</h4>
                                        <p class="text-xs sm:text-sm text-[#A0A0A0] mt-1">Essential tools and templates</p>
                                    </div>
                                </div>
                                
                                <div class="flex items-start gap-3 sm:gap-4">
                                    <div class="p-2 sm:p-3 bg-[#85D5C8]/10 rounded-lg flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 sm:w-6 sm:h-6 text-[#85D5C8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div class="min-w-0">
                                        <h4 class="text-base sm:text-lg font-semibold text-[#F0F0F0]">Community Access</h4>
                                        <p class="text-xs sm:text-sm text-[#A0A0A0] mt-1">Connect with like-minded creators</p>
                                    </div>
                                </div>
                                
                                <div class="flex items-start gap-3 sm:gap-4">
                                    <div class="p-2 sm:p-3 bg-[#C392EC]/10 rounded-lg flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 sm:w-6 sm:h-6 text-[#C392EC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                    </div>
                                    <div class="min-w-0">
                                        <h4 class="text-base sm:text-lg font-semibold text-[#F0F0F0]">Expert Guidance</h4>
                                        <p class="text-xs sm:text-sm text-[#A0A0A0] mt-1">Step-by-step tutorials</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</main>
