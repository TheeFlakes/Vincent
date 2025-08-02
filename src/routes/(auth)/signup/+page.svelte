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
    <div class="flex items-center justify-center px-4 sm:px-8 md:px-12 lg:px-24 xl:px-32 py-12 sm:py-16 lg:py-24">
        <div class="w-full max-w-md">
            <!-- Header -->
            <div class="text-center mb-8">
                <h1 class="text-3xl sm:text-4xl font-bold text-[#F0F0F0] mb-4">
                    Start Your Journey
                </h1>
                <p class="text-base sm:text-lg text-[#A0A0A0]">
                    Create your account and begin building your faceless income stream
                </p>
            </div>

            <!-- Signup Form Card -->
            <div class="bg-[#2B2B2B] rounded-xl p-6 sm:p-8 shadow-lg border border-[#2B2B2B]">
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
                    <div class="space-y-4">
                        <div>
                            <label for="name" class="block text-sm font-medium text-[#F0F0F0] mb-2">
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
                            <label for="email" class="block text-sm font-medium text-[#F0F0F0] mb-2">
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
                            <label for="password" class="block text-sm font-medium text-[#F0F0F0] mb-2">
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
                            <label for="passwordConfirm" class="block text-sm font-medium text-[#F0F0F0] mb-2">
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
                            <label for="referralCode" class="block text-sm font-medium text-[#F0F0F0] mb-2">
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
    </div>
</main>
