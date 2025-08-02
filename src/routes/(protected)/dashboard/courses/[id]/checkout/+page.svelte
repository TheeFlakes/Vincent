<script>
    import { currentUser, pb } from '$lib/pocketbase.js';
    import { goto } from '$app/navigation';
    
    let { data } = $props();
    
    let user = $state(data.user || $currentUser);
    let course = $state(data.course);
    let isEnrolled = $state(data.isEnrolled);
    
    let isProcessing = $state(false);
    let paymentMethod = $state('card');
    let selectedPlan = $state('full');
    
    // Payment plans
    const paymentPlans = [
        {
            id: 'full',
            name: 'Full Payment',
            price: course.price,
            description: 'One-time payment for lifetime access',
            badge: 'Best Value',
            savings: null
        },
        {
            id: 'installment',
            name: '3-Month Plan',
            price: Math.ceil(course.price / 3),
            description: '3 monthly payments',
            badge: null,
            savings: null
        }
    ];
    
    // Calculate total for installment plan
    function getTotalPrice(planId) {
        const plan = paymentPlans.find(p => p.id === planId);
        if (planId === 'installment') {
            return plan.price * 3;
        }
        return plan.price;
    }
    
    // Format price
    function formatPrice(price) {
        return `$${price}`;
    }
    
    // Handle payment processing
    async function processPayment() {
        if (isProcessing) return;
        
        isProcessing = true;
        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Create enrollment record
            await pb.collection('user_progress').create({
                user: user.id,
                course: course.id,
                completed_lessons: [],
                current_lesson: null,
                completion_percentage: 0,
                last_accessed: new Date().toISOString()
            });
            
            // Redirect to course with success message
            goto(`/dashboard/courses/${course.id}?enrolled=true`);
            
        } catch (err) {
            console.error('Payment failed:', err);
            alert('Payment failed. Please try again.');
        } finally {
            isProcessing = false;
        }
    }
    
    // Go back to course
    function goBack() {
        goto(`/dashboard/courses/${course.id}`);
    }
    
    // Handle already enrolled case
    if (isEnrolled) {
        goto(`/dashboard/courses/${course.id}`);
    }
</script>

<svelte:head>
    <title>Checkout - {course.title} - Cashfluenced</title>
</svelte:head>

<main class="bg-[#1A1A1A] min-h-full">
    <div class="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-12 lg:py-16">
        <!-- Back button -->
        <button 
            onclick={goBack}
            class="flex items-center gap-2 text-[#A0A0A0] hover:text-[#F0F0F0] transition-colors mb-6"
        >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Course
        </button>

        <div class="max-w-4xl mx-auto">
            <!-- Header -->
            <div class="text-center mb-8">
                <h1 class="text-2xl sm:text-3xl font-bold text-[#F0F0F0] mb-2">
                    Complete Your Purchase
                </h1>
                <p class="text-[#A0A0A0]">
                    Secure checkout for {course.title}
                </p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <!-- Payment Form -->
                <div class="lg:col-span-2">
                    <!-- Payment Plans -->
                    <div class="bg-[#2B2B2B] rounded-xl p-6 mb-6 border border-[#2B2B2B]">
                        <h2 class="text-xl font-bold text-[#F0F0F0] mb-4">Choose Your Plan</h2>
                        <div class="space-y-4">
                            {#each paymentPlans as plan}
                                <label class="block">
                                    <input 
                                        type="radio" 
                                        bind:group={selectedPlan} 
                                        value={plan.id}
                                        class="sr-only"
                                    >
                                    <div class="p-4 rounded-lg border transition-all cursor-pointer {
                                        selectedPlan === plan.id 
                                            ? 'border-[#C392EC] bg-[#C392EC]/5' 
                                            : 'border-[#3B3B3B] hover:border-[#C392EC]/50'
                                    }">
                                        <div class="flex items-center justify-between">
                                            <div class="flex items-center gap-3">
                                                <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center {
                                                    selectedPlan === plan.id 
                                                        ? 'border-[#C392EC] bg-[#C392EC]' 
                                                        : 'border-[#3B3B3B]'
                                                }">
                                                    {#if selectedPlan === plan.id}
                                                        <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                                        </svg>
                                                    {/if}
                                                </div>
                                                <div>
                                                    <div class="flex items-center gap-2">
                                                        <h3 class="font-bold text-[#F0F0F0]">{plan.name}</h3>
                                                        {#if plan.badge}
                                                            <span class="px-2 py-1 text-xs font-medium bg-[#85D5C8]/10 text-[#85D5C8] rounded-full border border-[#85D5C8]/20">
                                                                {plan.badge}
                                                            </span>
                                                        {/if}
                                                    </div>
                                                    <p class="text-sm text-[#A0A0A0]">{plan.description}</p>
                                                </div>
                                            </div>
                                            <div class="text-right">
                                                <div class="text-xl font-bold text-[#C392EC]">
                                                    {formatPrice(plan.price)}
                                                    {#if plan.id === 'installment'}
                                                        <span class="text-sm text-[#A0A0A0]">/month</span>
                                                    {/if}
                                                </div>
                                                {#if plan.id === 'installment'}
                                                    <div class="text-sm text-[#A0A0A0]">
                                                        {formatPrice(getTotalPrice(plan.id))} total
                                                    </div>
                                                {/if}
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            {/each}
                        </div>
                    </div>

                    <!-- Payment Method -->
                    <div class="bg-[#2B2B2B] rounded-xl p-6 mb-6 border border-[#2B2B2B]">
                        <h2 class="text-xl font-bold text-[#F0F0F0] mb-4">Payment Method</h2>
                        <div class="space-y-4">
                            <label class="block">
                                <input 
                                    type="radio" 
                                    bind:group={paymentMethod} 
                                    value="card"
                                    class="sr-only"
                                >
                                <div class="p-4 rounded-lg border transition-all cursor-pointer {
                                    paymentMethod === 'card' 
                                        ? 'border-[#C392EC] bg-[#C392EC]/5' 
                                        : 'border-[#3B3B3B] hover:border-[#C392EC]/50'
                                }">
                                    <div class="flex items-center gap-3">
                                        <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center {
                                            paymentMethod === 'card' 
                                                ? 'border-[#C392EC] bg-[#C392EC]' 
                                                : 'border-[#3B3B3B]'
                                        }">
                                            {#if paymentMethod === 'card'}
                                                <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                                </svg>
                                            {/if}
                                        </div>
                                        <div class="flex items-center gap-3">
                                            <svg class="w-6 h-6 text-[#F0F0F0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                                            </svg>
                                            <span class="font-medium text-[#F0F0F0]">Credit/Debit Card</span>
                                        </div>
                                    </div>
                                </div>
                            </label>

                            <label class="block">
                                <input 
                                    type="radio" 
                                    bind:group={paymentMethod} 
                                    value="paypal"
                                    class="sr-only"
                                >
                                <div class="p-4 rounded-lg border transition-all cursor-pointer {
                                    paymentMethod === 'paypal' 
                                        ? 'border-[#C392EC] bg-[#C392EC]/5' 
                                        : 'border-[#3B3B3B] hover:border-[#C392EC]/50'
                                }">
                                    <div class="flex items-center gap-3">
                                        <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center {
                                            paymentMethod === 'paypal' 
                                                ? 'border-[#C392EC] bg-[#C392EC]' 
                                                : 'border-[#3B3B3B]'
                                        }">
                                            {#if paymentMethod === 'paypal'}
                                                <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                                </svg>
                                            {/if}
                                        </div>
                                        <div class="flex items-center gap-3">
                                            <div class="w-6 h-6 bg-[#0070ba] rounded flex items-center justify-center">
                                                <span class="text-white text-xs font-bold">P</span>
                                            </div>
                                            <span class="font-medium text-[#F0F0F0]">PayPal</span>
                                        </div>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- Card Details (only show if card is selected) -->
                    {#if paymentMethod === 'card'}
                        <div class="bg-[#2B2B2B] rounded-xl p-6 mb-6 border border-[#2B2B2B]">
                            <h2 class="text-xl font-bold text-[#F0F0F0] mb-4">Card Details</h2>
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-[#F0F0F0] mb-2">Card Number</label>
                                    <input 
                                        type="text" 
                                        placeholder="1234 5678 9012 3456"
                                        class="w-full px-4 py-3 bg-[#1A1A1A] border border-[#3B3B3B] rounded-lg text-[#F0F0F0] placeholder-[#A0A0A0] focus:outline-none focus:border-[#C392EC] focus:ring-1 focus:ring-[#C392EC]"
                                    >
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-[#F0F0F0] mb-2">Expiry Date</label>
                                        <input 
                                            type="text" 
                                            placeholder="MM/YY"
                                            class="w-full px-4 py-3 bg-[#1A1A1A] border border-[#3B3B3B] rounded-lg text-[#F0F0F0] placeholder-[#A0A0A0] focus:outline-none focus:border-[#C392EC] focus:ring-1 focus:ring-[#C392EC]"
                                        >
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-[#F0F0F0] mb-2">CVV</label>
                                        <input 
                                            type="text" 
                                            placeholder="123"
                                            class="w-full px-4 py-3 bg-[#1A1A1A] border border-[#3B3B3B] rounded-lg text-[#F0F0F0] placeholder-[#A0A0A0] focus:outline-none focus:border-[#C392EC] focus:ring-1 focus:ring-[#C392EC]"
                                        >
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-[#F0F0F0] mb-2">Cardholder Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="John Doe"
                                        class="w-full px-4 py-3 bg-[#1A1A1A] border border-[#3B3B3B] rounded-lg text-[#F0F0F0] placeholder-[#A0A0A0] focus:outline-none focus:border-[#C392EC] focus:ring-1 focus:ring-[#C392EC]"
                                    >
                                </div>
                            </div>
                        </div>
                    {/if}
                </div>

                <!-- Order Summary -->
                <div class="lg:col-span-1">
                    <div class="bg-[#2B2B2B] rounded-xl p-6 border border-[#2B2B2B] sticky top-6">
                        <h2 class="text-xl font-bold text-[#F0F0F0] mb-4">Order Summary</h2>
                        
                        <!-- Course Info -->
                        <div class="mb-6">
                            <div class="flex gap-4">
                                <div class="w-16 h-16 bg-gradient-to-br from-[#C392EC]/20 to-[#85D5C8]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    {#if course.thumbnail}
                                        <img 
                                            src={pb.files.getUrl(course, course.thumbnail)}
                                            alt={course.title}
                                            class="w-full h-full object-cover rounded-lg"
                                        />
                                    {:else}
                                        <svg class="w-8 h-8 text-[#C392EC]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                        </svg>
                                    {/if}
                                </div>
                                <div class="flex-1">
                                    <h3 class="font-bold text-[#F0F0F0] text-sm mb-1">{course.title}</h3>
                                    <p class="text-xs text-[#A0A0A0] line-clamp-2">{course.description}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Pricing -->
                        <div class="space-y-3 mb-6">
                            <div class="flex justify-between items-center">
                                <span class="text-[#A0A0A0]">
                                    {paymentPlans.find(p => p.id === selectedPlan)?.name}
                                </span>
                                <span class="text-[#F0F0F0] font-medium">
                                    {formatPrice(paymentPlans.find(p => p.id === selectedPlan)?.price)}
                                    {#if selectedPlan === 'installment'}
                                        <span class="text-sm text-[#A0A0A0]">/month</span>
                                    {/if}
                                </span>
                            </div>
                            
                            {#if selectedPlan === 'installment'}
                                <div class="flex justify-between items-center text-sm">
                                    <span class="text-[#A0A0A0]">Total (3 payments)</span>
                                    <span class="text-[#A0A0A0]">{formatPrice(getTotalPrice(selectedPlan))}</span>
                                </div>
                            {/if}
                            
                            <div class="border-t border-[#3B3B3B] pt-3">
                                <div class="flex justify-between items-center">
                                    <span class="font-bold text-[#F0F0F0]">
                                        {selectedPlan === 'installment' ? 'First Payment' : 'Total'}
                                    </span>
                                    <span class="font-bold text-[#C392EC] text-lg">
                                        {formatPrice(paymentPlans.find(p => p.id === selectedPlan)?.price)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Features -->
                        <div class="mb-6">
                            <h4 class="font-medium text-[#F0F0F0] mb-3">What's included:</h4>
                            <ul class="space-y-2 text-sm text-[#A0A0A0]">
                                <li class="flex items-center gap-2">
                                    <svg class="w-4 h-4 text-[#85D5C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    Lifetime access to course content
                                </li>
                                <li class="flex items-center gap-2">
                                    <svg class="w-4 h-4 text-[#85D5C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    Progress tracking
                                </li>
                                <li class="flex items-center gap-2">
                                    <svg class="w-4 h-4 text-[#85D5C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    Mobile-friendly access
                                </li>
                                <li class="flex items-center gap-2">
                                    <svg class="w-4 h-4 text-[#85D5C8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    30-day money-back guarantee
                                </li>
                            </ul>
                        </div>

                        <!-- Checkout Button -->
                        <button
                            onclick={processPayment}
                            disabled={isProcessing}
                            class="w-full px-6 py-4 bg-[#C392EC] text-white rounded-lg font-bold text-lg hover:bg-[#C392EC]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {#if isProcessing}
                                <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing Payment...
                            {:else}
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                </svg>
                                Complete Purchase
                            {/if}
                        </button>

                        <!-- Security Note -->
                        <div class="mt-4 text-center">
                            <p class="text-xs text-[#A0A0A0] flex items-center justify-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                </svg>
                                Secure SSL encrypted payment
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</main>
