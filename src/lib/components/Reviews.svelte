<script lang="ts">
  import { onMount } from 'svelte';
  interface Review {
    name: string;
    avatar: string;
    text: string;
    date: string;
    rating: number;
    category: string;
  }

  // Expanded review data
  const reviews: Review[] = [
    {
      name: 'ajhar997786',
      avatar: '🧑‍💻',
      text: 'Ease of use',
      date: 'Jun 8, 2023',
      rating: 5,
      category: 'Ease of use'
    },
    {
      name: 'delightfuldelectablycb4176549f',
      avatar: '👩‍🎨',
      text: 'Functionality',
      date: 'May 22, 2023',
      rating: 4,
      category: 'Functionality'
    },
    {
      name: 'laoluangtrip',
      avatar: '🧔',
      text: 'Ease of use',
      date: 'Apr 26, 2023',
      rating: 5,
      category: 'Ease of use'
    },
    {
      name: 'Priya K.',
      avatar: '👩‍💼',
      text: 'The faceless content calendar template alone is worth it!',
      date: 'Apr 10, 2023',
      rating: 5,
      category: 'Resources'
    },
    {
      name: 'Sam T.',
      avatar: '🧑‍🔬',
      text: 'Great support and clear instructions.',
      date: 'Mar 30, 2023',
      rating: 4,
      category: 'Support'
    },
    {
      name: 'Linda M.',
      avatar: '👩‍💻',
      text: 'I love the flexibility of the course.',
      date: 'Mar 15, 2023',
      rating: 5,
      category: 'Flexibility'
    },
    {
      name: 'Omar R.',
      avatar: '🧑‍🏫',
      text: 'Perfect for beginners!',
      date: 'Feb 28, 2023',
      rating: 5,
      category: 'Beginner Friendly'
    }
  ];

  // Star breakdown (example data)
  const starStats = [
    { stars: 5, percent: 76 },
    { stars: 4, percent: 6 },
    { stars: 3, percent: 2 },
    { stars: 2, percent: 0 },
    { stars: 1, percent: 16 }
  ];
  const totalReviews = 51;
  const avgRating = 4.3;

  // Animation logic
  let visibleStart = 0;
  let visibleReviews: Review[] = reviews.slice(0, 3);
  let interval: any;

  function updateVisibleReviews() {
    visibleStart = (visibleStart + 1) % reviews.length;
    // If at the end, wrap around
    visibleReviews = [
      reviews[visibleStart],
      reviews[(visibleStart + 1) % reviews.length],
      reviews[(visibleStart + 2) % reviews.length]
    ];
  }

  onMount(() => {
    interval = setInterval(() => {
      updateVisibleReviews();
    }, 2500);
    return () => clearInterval(interval);
  });
</script>

<main class="bg-[#1A1A1A]">
  <!-- ===== Reviews Section ===== -->
  <section id="reviews" class="px-4 sm:px-8 md:px-12 lg:px-24 xl:px-32 py-12 sm:py-16 lg:py-24 mx-auto max-w-7xl scroll-mt-20">
    <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between">
      
      <!-- ----- Left Column: Content & Reviews ----- -->
      <div class="w-full lg:w-1/2 lg:pr-12">
        <!-- Headline & Description -->
        <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#F0F0F0] leading-tight">
          What Our Students Say
        </h1>
        <p class="mt-4 sm:mt-6 text-base sm:text-lg leading-relaxed text-[#A0A0A0]">
          Real reviews from real students who transformed their lives with faceless income.
        </p>
        
        <!-- Filter Controls -->
        <div class="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <select class="bg-[#2B2B2B] text-[#F0F0F0] rounded-lg px-4 py-2.5 border border-[#2B2B2B] focus:border-[#85D5C8] transition-colors duration-300">
            <option>Newest</option>
            <option>Oldest</option>
            <option>Highest rating</option>
            <option>Lowest rating</option>
          </select>
          <select class="bg-[#2B2B2B] text-[#F0F0F0] rounded-lg px-4 py-2.5 border border-[#2B2B2B] focus:border-[#85D5C8] transition-colors duration-300">
            <option>All categories</option>
            <option>Ease of use</option>
            <option>Functionality</option>
            <option>Resources</option>
            <option>Support</option>
            <option>Flexibility</option>
            <option>Beginner Friendly</option>
          </select>
        </div>
        
        <!-- Reviews List -->
        <div class="mt-8 sm:mt-12 space-y-4 sm:space-y-6">
          <div class="overflow-hidden relative">
            {#each visibleReviews as review (review.name + review.date)}
              <div class="bg-[#2B2B2B] rounded-xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#2B2B2B] hover:border-[#85D5C8]/20 mb-4 sm:mb-6">
                <!-- Header with rating and date -->
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    {#each Array(5) as _, i}
                      <svg class="w-4 h-4 {i < review.rating ? 'text-[#85D5C8]' : 'text-gray-600'}" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z"/>
                      </svg>
                    {/each}
                  </div>
                  <div class="inline-block bg-[#85D5C8]/10 text-[#85D5C8] px-3 py-1 rounded-full text-xs font-medium">
                    {review.category}
                  </div>
                </div>
                
                <!-- Review text -->
                <blockquote class="text-base sm:text-lg text-[#F0F0F0] leading-relaxed mb-4 font-medium">
                  "{review.text}"
                </blockquote>
                
                <!-- Footer with name and date -->
                <div class="flex items-center justify-between pt-3 border-t border-[#1A1A1A]">
                  <h3 class="text-sm sm:text-base font-semibold text-[#A0A0A0]">{review.name}</h3>
                  <span class="text-xs sm:text-sm text-[#A0A0A0]">{review.date}</span>
                </div>
              </div>
            {/each}
          </div>
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

          <!-- Rating Stats Card -->
          <div class="relative z-10 w-[95%] sm:w-[90%] mx-auto mt-4 sm:mt-8">
            <div class="bg-[#2B2B2B] rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-[#2B2B2B]">
              <h3 class="text-lg sm:text-xl lg:text-2xl font-bold text-[#F0F0F0] mb-4 sm:mb-6 text-center">Review Summary</h3>
              
              <!-- Overall Rating -->
              <div class="text-center mb-6">
                <div class="text-4xl sm:text-5xl font-bold text-[#85D5C8] mb-2">{avgRating}</div>
                <div class="flex items-center justify-center mb-2">
                  {#each Array(5) as _, i}
                    <svg class="w-5 h-5 sm:w-6 sm:h-6 {i < Math.round(avgRating) ? 'text-[#85D5C8]' : 'text-gray-600'}" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z"/>
                    </svg>
                  {/each}
                </div>
                <div class="text-[#A0A0A0] text-sm sm:text-base">{totalReviews} reviews</div>
              </div>
              
              <!-- Star Breakdown -->
              <div class="space-y-2 sm:space-y-3">
                {#each starStats as stat}
                  <div class="flex items-center gap-2 sm:gap-3">
                    <span class="text-[#F0F0F0] text-sm w-3">{stat.stars}</span>
                    <svg class="w-3 h-3 sm:w-4 sm:h-4 text-[#85D5C8]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.967z"/>
                    </svg>
                    <div class="flex-1 bg-[#1A1A1A] rounded-full h-1.5 sm:h-2 mx-2">
                      <div class="bg-[#85D5C8] h-1.5 sm:h-2 rounded-full transition-all duration-300" style="width: {stat.percent}%"></div>
                    </div>
                    <span class="text-[#A0A0A0] text-xs sm:text-sm w-8 sm:w-10 text-right">{stat.percent}%</span>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  
  <!-- Call to Action -->
  <div class="text-center px-4 sm:px-8 md:px-12 lg:px-24 xl:px-32 pb-12 sm:pb-16 lg:pb-24">
    <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F0F0F0] mb-4 sm:mb-6">
      Join 50,000+ creators already earning without showing their face.
    </h2>
    <a 
      href="/signup"
      class="inline-block bg-[#C392EC] text-[#FFFFFF] px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg hover:opacity-90 transition-opacity duration-300"
    >
      Start Your Journey Today
    </a>
  </div>
</main>

<style>
  /* Removed unused .review-animate class */
</style> 