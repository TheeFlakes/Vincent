<script lang="ts">
    // ======================
    // Types & Interfaces
    // ======================
    interface Course {
      name: string;
      description: string;
      price: string; // Use string for price to allow 'FREE' and '$29.99'
      features: string[];
      icon: string;
    }
  
    // ======================
    // ======================
    const courses: Course[] = [
      {
        name: 'Faceless Starter Pack',
        description: 'Your first step into the faceless income world.',
        price: 'FREE',
        icon: '🎁',
        features: [
          'Faceless niche ideas',
          'Tools & platforms to use',
          'Video content examples',
          'Bonus: Faceless Content Calendar Template'
        ]
      },
      {
        name: 'Faceless Freedom Course',
        description: 'Launch your faceless brand, step-by-step — from setup to monetization.',
        price: '$29.99',
        icon: '🚀',
        features: [
          'Full video tutorials: content creation, editing & automation',
          'Monetization strategies (affiliate, digital products, etc.)',
          'Faceless video script templates',
          'AI voiceover & captioning tools',
          'High-converting profile + bio formula'
        ]
      }
    ];
  </script>
  
  <!-- ====================== -->
  <!-- Component Template     -->
  <!-- ====================== -->
  
  <main class="bg-[#1A1A1A]">
    <!-- ===== Product Section ===== -->
    <section id="product" class="px-4 sm:px-8 md:px-12 lg:px-24 xl:px-32 py-12 sm:py-16 lg:py-24 mx-auto max-w-7xl scroll-mt-20">
      <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between">
        
        <!-- ----- Left Column: Content & Programs ----- -->
        <div class="w-full lg:w-1/2 lg:pr-12">
          <!-- Headline & Description -->
          <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#F0F0F0] leading-tight">
            Start Your Faceless Income Journey
          </h1>
          <p class="mt-4 sm:mt-6 text-base sm:text-lg leading-relaxed text-[#A0A0A0]">
            Choose the plan that fits your goals and unlock your faceless brand potential.
          </p>
          
          <!-- Courses Grid -->
          <div class="mt-8 sm:mt-12 space-y-4 sm:space-y-6">
            {#each courses as course}
              <div class="bg-[#2B2B2B] rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#2B2B2B] hover:border-[#85D5C8]/20">
                <div class="flex flex-col sm:flex-row sm:items-start gap-4">
                  <!-- Icon -->
                  <div class="p-2 sm:p-3 bg-[#C392EC]/10 rounded-lg self-start">
                    <span class="text-xl sm:text-2xl">{course.icon}</span>
                  </div>
                  
                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 sm:mb-2">
                      <h3 class="text-lg sm:text-xl font-semibold text-[#F0F0F0]">{course.name}</h3>
                      <span class="text-xl sm:text-2xl font-bold text-[#85D5C8]">{course.price}</span>
                    </div>
                    <p class="text-sm sm:text-base text-[#A0A0A0] mb-4 leading-relaxed">
                      {course.description}
                    </p>
                    
                    <!-- Features -->
                    <div class="grid grid-cols-1 gap-2 mb-4">
                      {#each course.features as feature}
                        <div class="flex items-start text-xs sm:text-sm text-[#A0A0A0]">
                          <svg class="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-[#85D5C8] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span class="leading-relaxed">{feature}</span>
                        </div>
                      {/each}
                    </div>
                    
                    <!-- CTA Button -->
                    <a 
                      href="/signup"
                      class="inline-block w-full sm:w-auto bg-[#C392EC] text-[#FFFFFF] px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold text-sm sm:text-base hover:opacity-90 transition-opacity duration-300 text-center"
                    >
                      {course.price === 'FREE' ? 'Get Free Access' : 'Start Earning Now'}
                    </a>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
  
        <!-- ----- Right Column: Decorative Elements & Stats ----- -->
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
  
            <!-- Stats Card -->
            <div class="relative z-10 w-[95%] sm:w-[90%] mx-auto mt-4 sm:mt-8">
              <div class="bg-[#2B2B2B] rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-[#2B2B2B]">
                <h3 class="text-lg sm:text-xl lg:text-2xl font-bold text-[#F0F0F0] mb-4 sm:mb-6 text-center">Why Choose Us?</h3>
                
                <div class="space-y-4 sm:space-y-6">
                  <div class="flex items-start gap-3 sm:gap-4">
                    <div class="p-2 sm:p-3 bg-[#85D5C8]/10 rounded-lg flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 sm:w-6 sm:h-6 text-[#85D5C8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div class="min-w-0">
                      <h4 class="text-base sm:text-lg font-semibold text-[#F0F0F0]">Proven Results</h4>
                      <p class="text-xs sm:text-sm text-[#A0A0A0] mt-1">Thousands of successful graduates</p>
                    </div>
                  </div>
                  
                  <div class="flex items-start gap-3 sm:gap-4">
                    <div class="p-2 sm:p-3 bg-[#C392EC]/10 rounded-lg flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 sm:w-6 sm:h-6 text-[#C392EC]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                      </svg>
                    </div>
                    <div class="min-w-0">
                      <h4 class="text-base sm:text-lg font-semibold text-[#F0F0F0]">Flexible Learning</h4>
                      <p class="text-xs sm:text-sm text-[#A0A0A0] mt-1">Learn at your own pace</p>
                    </div>
                  </div>
                  
                  <div class="flex items-start gap-3 sm:gap-4">
                    <div class="p-2 sm:p-3 bg-[#85D5C8]/10 rounded-lg flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 sm:w-6 sm:h-6 text-[#85D5C8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div class="min-w-0">
                      <h4 class="text-base sm:text-lg font-semibold text-[#F0F0F0]">Community Support</h4>
                      <p class="text-xs sm:text-sm text-[#A0A0A0] mt-1">Join our thriving community</p>
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