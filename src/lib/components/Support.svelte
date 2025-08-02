<script lang="ts">
    import PocketBase from 'pocketbase';
    import { onMount } from 'svelte';

    const pb = new PocketBase('https://vin254.pockethost.io');
    
    let name = '';
    let email = '';
    let message = '';
    let showSuccess = false;
    let isSubmitting = false;

    async function handleSubmit() {
        console.log('Form submitted!', { name, email, message });
        
        // Check if all fields are filled
        if (!name || !email || !message) {
            alert('Please fill in all fields.');
            return;
        }
        
        isSubmitting = true;
        
        try {
            const data = { name, email, message };
            console.log('Sending data to PocketBase:', data);
            
            const record = await pb.collection('support').create(data);
            console.log('Message sent successfully:', record);
            
            // Reset form
            name = '';
            email = '';
            message = '';
            
            // Show success message
            showSuccess = true;
            setTimeout(() => showSuccess = false, 3000); // Hide after 3 seconds
            
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('There was an error submitting your message. Please try again.');
        } finally {
            isSubmitting = false;
        }
    }
</script>

<!-- Success Message -->
{#if showSuccess}
    <div class="fixed top-4 right-4 bg-[#85D5C8] text-[#1A1A1A] px-6 py-3 rounded-md shadow-lg z-50">
        Message sent successfully!
    </div>
{/if}

<main class="bg-[#1A1A1A]">
    <!-- ===== Support Section ===== -->
    <section id="support" class="px-4 sm:px-8 md:px-12 lg:px-24 xl:px-32 py-12 sm:py-16 lg:py-24 mx-auto max-w-7xl scroll-mt-20">
        <div class="flex flex-col lg:flex-row items-start justify-between">
            
            <!-- ----- Left Column: Contact Form ----- -->
            <div class="w-full lg:w-1/2 lg:pr-12">
                <!-- Section Label -->
                <span class="text-[#85D5C8] border-b-2 border-[#85D5C8] uppercase text-xs sm:text-sm font-semibold tracking-wide">
                    Get in touch
                </span>
                
                <!-- Section Heading -->
                <h2 class="mt-3 sm:mt-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-[#F0F0F0] leading-tight">
                    Contact <span class="text-[#C392EC]">Us</span>
                </h2>
                
                <!-- Section Description -->
                <p class="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg leading-relaxed text-[#A0A0A0]">
                    Have questions? We're here to help. Send us a message and we'll get back to you as soon as possible.
                </p>
                
                <!-- Contact Form -->
                <form class="mt-8 sm:mt-12 bg-[#2B2B2B] rounded-xl p-6 sm:p-8 shadow-lg border border-[#2B2B2B]">
                    <!-- Name Input -->
                    <div class="mb-6">
                        <label class="block font-semibold mb-2 text-[#F0F0F0] text-sm sm:text-base" for="name">
                            Name
                        </label>
                        <input 
                            bind:value={name}
                            type="text" 
                            class="w-full px-4 py-3 bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg text-[#F0F0F0] placeholder-[#A0A0A0] focus:outline-none focus:border-[#85D5C8] transition-colors duration-300" 
                            id="name" 
                            placeholder="Your name" 
                            required
                        />
                    </div>

                    <!-- Email Input -->
                    <div class="mb-6">
                        <label class="block font-semibold mb-2 text-[#F0F0F0] text-sm sm:text-base" for="email">
                            Email
                        </label>
                        <input 
                            bind:value={email}
                            type="email" 
                            class="w-full px-4 py-3 bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg text-[#F0F0F0] placeholder-[#A0A0A0] focus:outline-none focus:border-[#85D5C8] transition-colors duration-300" 
                            id="email"
                            placeholder="your.email@example.com" 
                            required
                        />
                    </div>

                    <!-- Message Input -->
                    <div class="mb-8">
                        <label class="block font-semibold mb-2 text-[#F0F0F0] text-sm sm:text-base" for="message">
                            Message
                        </label>
                        <textarea 
                            bind:value={message}
                            class="w-full px-4 py-3 bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg text-[#F0F0F0] placeholder-[#A0A0A0] focus:outline-none focus:border-[#85D5C8] transition-colors duration-300 resize-none" 
                            id="message"
                            rows="5"
                            placeholder="Tell us how we can help you..."
                            required
                        ></textarea>
                    </div>

                    <!-- Submit Button -->
                    <button type="button"
                            onclick={handleSubmit}
                            disabled={isSubmitting}
                            class="w-full bg-[#C392EC] text-[#FFFFFF] px-6 py-3 rounded-full font-semibold text-sm sm:text-base hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                        {#if isSubmitting}
                            Sending...
                        {:else}
                            Send Message
                        {/if}
                    </button>
                </form>
            </div>

            <!-- ----- Right Column: Contact Information & Decorative Elements ----- -->
            <div class="w-full lg:w-1/2 mt-8 lg:mt-0">
                <div class="relative w-full aspect-square max-w-md mx-auto lg:max-w-none">
                    <!-- Background & Decorative Shapes -->
                    <div class="absolute inset-0 bg-[#85D5C8]/20 rounded-[2rem] sm:rounded-[3rem] -rotate-3"></div>
                    
                    <div class="absolute inset-0">
                        <!-- Decorative Elements -->
                        <div class="absolute -left-4 sm:-left-6 top-1/4 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-[#C392EC]/60 rounded-full"></div>
                        <div class="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-[#85D5C8]/60 rounded-2xl rotate-6"></div>
                        <div class="absolute bottom-4 sm:bottom-6 md:bottom-8 right-4 sm:right-6 md:right-8 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#F0F0F0] rounded-full"></div>
                        <div class="absolute top-4 sm:top-6 md:top-8 right-6 sm:right-8 md:right-12 w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-[#C392EC] rounded-full"></div>
                    </div>

                    <!-- Contact Information Cards -->
                    <div class="relative z-10 w-[95%] sm:w-[90%] mx-auto mt-4 sm:mt-8">
                        <div class="bg-[#2B2B2B] rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg border border-[#2B2B2B]">
                            <h3 class="text-lg sm:text-xl lg:text-2xl font-bold text-[#F0F0F0] mb-6 sm:mb-8 text-center">Get Support</h3>
                            
                            <div class="space-y-6 sm:space-y-8">
                                <!-- Technical Support -->
                                <div class="flex items-start gap-4">
                                    <div class="p-3 bg-[#C392EC]/10 rounded-lg flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                            stroke-width="2" stroke="currentColor" class="h-5 w-5 sm:h-6 sm:w-6 text-[#C392EC]">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M14.25 9.75v-4.5m0 4.5h4.5m-4.5 0l6-6m-3 18c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 014.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 00-.38 1.21 12.035 12.035 0 007.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 011.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 01-2.25 2.25h-2.25z" />
                                        </svg>
                                    </div>
                                    <div class="min-w-0">
                                        <h4 class="text-base sm:text-lg font-semibold text-[#F0F0F0]">Technical Support</h4>
                                        <p class="text-sm sm:text-base text-[#A0A0A0] mt-1">customercashfluenced@gmail.com</p>
                                    </div>
                                </div>

                                <!-- Sales Questions -->
                                <div class="flex items-start gap-4">
                                    <div class="p-3 bg-[#85D5C8]/10 rounded-lg flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                            stroke-width="2" stroke="currentColor" class="h-5 w-5 sm:h-6 sm:w-6 text-[#85D5C8]">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                                        </svg>
                                    </div>
                                    <div class="min-w-0">
                                        <h4 class="text-base sm:text-lg font-semibold text-[#F0F0F0]">Sales Questions</h4>
                                        <p class="text-sm sm:text-base text-[#A0A0A0] mt-1">customercashfluenced@gmail.com</p>
                                    </div>
                                </div>

                                <!-- Press -->
                                <div class="flex items-start gap-4">
                                    <div class="p-3 bg-[#C392EC]/10 rounded-lg flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                            stroke-width="2" stroke="currentColor" class="h-5 w-5 sm:h-6 sm:w-6 text-[#C392EC]">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
                                        </svg>
                                    </div>
                                    <div class="min-w-0">
                                        <h4 class="text-base sm:text-lg font-semibold text-[#F0F0F0]">Press</h4>
                                        <p class="text-sm sm:text-base text-[#A0A0A0] mt-1">customercashfluenced@gmail.com</p>
                                    </div>
                                </div>

                                <!-- Bug Report -->
                                <div class="flex items-start gap-4">
                                    <div class="p-3 bg-[#85D5C8]/10 rounded-lg flex-shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                            stroke-width="2" stroke="currentColor" class="h-5 w-5 sm:h-6 sm:w-6 text-[#85D5C8]">
                                            <path stroke-linecap="round" stroke-linejoin="round"
                                                d="M12 12.75c1.148 0 2.278.08 3.383.237 1.037.146 1.866.966 1.866 2.013 0 3.728-2.35 6.75-5.25 6.75S6.75 18.728 6.75 15c0-1.046.83-1.867 1.866-2.013A24.204 24.204 0 0112 12.75zm0 0c2.883 0 5.647.508 8.207 1.44a23.91 23.91 0 01-1.152 6.06M12 12.75c-2.883 0-5.647.508-8.208 1.44.125 2.104.52 4.136 1.153 6.06M12 12.75a2.25 2.25 0 002.248-2.354M12 12.75a2.25 2.25 0 01-2.248-2.354M12 8.25c.995 0 1.971-.08 2.922-.236.403-.066.74-.358.795-.762a3.778 3.778 0 00-.399-2.25M12 8.25c-.995 0-1.97-.08-2.922-.236-.402-.066-.74-.358-.795-.762a3.734 3.734 0 01.4-2.253M12 8.25a2.25 2.25 0 00-2.248 2.146M12 8.25a2.25 2.25 0 012.248 2.146M8.683 5a6.032 6.032 0 01-1.155-1.002c.07-.63.27-1.222.574-1.747m.581 2.749A3.75 3.75 0 0115.318 5m0 0c.427-.283.815-.62 1.155-.999a4.471 4.471 0 00-.575-1.752M4.921 6a24.048 24.048 0 00-.392 3.314c1.668.546 3.416.914 5.223 1.082M19.08 6c.205 1.08.337 2.187.392 3.314a23.882 23.882 0 01-5.223 1.082" />
                                        </svg>
                                    </div>
                                    <div class="min-w-0">
                                        <h4 class="text-base sm:text-lg font-semibold text-[#F0F0F0]">Bug Report</h4>
                                        <p class="text-sm sm:text-base text-[#A0A0A0] mt-1">customercashfluenced@gmail.com</p>
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