<script>
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    let loading = false;
</script>

<svelte:head>
    <title>Login - Cashfluenced</title>
</svelte:head>

<main class="bg-[#1A1A1A] min-h-screen">
    <section class="px-4 sm:px-8 md:px-12 lg:px-24 xl:px-32 py-12 sm:py-16 lg:py-24 mx-auto max-w-7xl">
        <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 lg:gap-12">
            
            <!-- Left Column: Login Form -->
            <div class="w-full lg:w-1/2">
                <!-- Header -->
                <div class="mb-8 sm:mb-12">
                    <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#F0F0F0] leading-tight mb-4 sm:mb-6">
                        Welcome Back
                    </h1>
                    <p class="text-base sm:text-lg leading-relaxed text-[#A0A0A0]">
                        Continue your faceless income journey and unlock your earning potential.
                    </p>
                </div>

                <!-- Login Form Card -->
                <div class="bg-[#2B2B2B] rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#2B2B2B] hover:border-[#85D5C8]/20">
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
                        if (loading) {
                            return; // Prevent multiple submissions
                        }
                        
                        loading = true;
                        
                        return async ({ result, update }) => {
                            loading = false;
                            
                            if (result.type === 'redirect') {
                                // Force a full page navigation to ensure proper state
                                window.location.href = result.location;
                            } else if (result.type === 'failure') {
                                // Handle form errors
                                await update();
                            } else {
                                // Handle other result types
                                await update();
                            }
                        };
                    }}>
                        <div class="space-y-4 sm:space-y-6">
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
                                    autocomplete="current-password"
                                    required
                                    class="w-full px-4 py-3 bg-[#1A1A1A] border border-[#2B2B2B] rounded-lg text-[#F0F0F0] placeholder-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#85D5C8] focus:border-transparent transition-all duration-300"
                                    placeholder="Enter your password"
                                />
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
                                Signing in...
                            {:else}
                                Sign in
                            {/if}
                        </button>

                        <div class="text-center">
                            <a href="/signup" class="text-[#85D5C8] hover:text-[#85D5C8]/80 font-medium transition-colors duration-300">
                                Don't have an account? Sign up
                            </a>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Right Column: Decorative Elements & Benefits -->
            <div class="w-full lg:w-1/2 mt-8 lg:mt-0">
                <div class="relative w-full aspect-square max-w-md mx-auto lg:max-w-none">
                    <!-- Background & Decorative Shapes -->
                    <div class="absolute inset-0 bg-[#85D5C8]/20 rounded-[2rem] sm:rounded-[3rem] -rotate-3"></div>
                    
                    <div class="absolute inset-0">
                        <!-- Decorative Elements -->
                        <div class="absolute -left-4 sm:-left-6 top-1/4 w-12 h-12 sm:w-20 sm:h-20 bg-[#C392EC]/60 rounded-full"></div>
                        <div class="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 w-16 h-16 sm:w-24 sm:h-24 bg-[#85D5C8]/60 rounded-2xl rotate-6"></div>
                        <div class="absolute bottom-4 sm:bottom-8 right-4 sm:right-8 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#F0F0F0] rounded-full"></div>
                        <div class="absolute top-4 sm:top-8 right-6 sm:right-12 w-2 h-2 sm:w-3 sm:h-3 bg-[#C392EC] rounded-full"></div>
                    </div>

                    <!-- Benefits Card -->
                    <div class="relative z-10 w-[95%] sm:w-[90%] mx-auto mt-4 sm:mt-8">
                        <div class="bg-[#2B2B2B] rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-[#2B2B2B]">
                            <h3 class="text-lg sm:text-xl lg:text-2xl font-bold text-[#F0F0F0] mb-4 sm:mb-6 text-center">Welcome Back!</h3>
                            
                            <div class="space-y-4 sm:space-y-6">
                                <div class="flex items-start gap-3 sm:gap-4">
                                    <div class="p-2 sm:p-3 bg-[#85D5C8]/10 rounded-lg flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 sm:w-6 sm:h-6 text-[#85D5C8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div class="min-w-0">
                                        <h4 class="text-base sm:text-lg font-semibold text-[#F0F0F0]">Continue Learning</h4>
                                        <p class="text-xs sm:text-sm text-[#A0A0A0] mt-1">Pick up where you left off</p>
                                    </div>
                                </div>
                                
                                <div class="flex items-start gap-3 sm:gap-4">
                                    <div class="p-2 sm:p-3 bg-[#C392EC]/10 rounded-lg flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 sm:w-6 sm:h-6 text-[#C392EC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                    </div>
                                    <div class="min-w-0">
                                        <h4 class="text-base sm:text-lg font-semibold text-[#F0F0F0]">Track Progress</h4>
                                        <p class="text-xs sm:text-sm text-[#A0A0A0] mt-1">Monitor your growth</p>
                                    </div>
                                </div>
                                
                                <div class="flex items-start gap-3 sm:gap-4">
                                    <div class="p-2 sm:p-3 bg-[#85D5C8]/10 rounded-lg flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 sm:w-6 sm:h-6 text-[#85D5C8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    </div>
                                    <div class="min-w-0">
                                        <h4 class="text-base sm:text-lg font-semibold text-[#F0F0F0]">Earn More</h4>
                                        <p class="text-xs sm:text-sm text-[#A0A0A0] mt-1">Unlock new income streams</p>
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
