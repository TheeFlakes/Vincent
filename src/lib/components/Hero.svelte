<script lang="ts">
    // Only keeping the stats as they are being used in the hero section
    let stats = [
      { value: "4.9", label: "App Store rating" },
      { value: "5M+", label: "users worldwide since 2010" },
      { value: "20+", label: "years of experience" }
    ];
  </script>
  
  <main class="bg-[#1A1A1A]">
    <!-- ===== Hero Section ===== -->
    <section class="px-8 sm:px-12 md:px-16 lg:px-24 xl:px-32 py-24 mx-auto max-w-7xl mt-4">
      <div class="flex flex-col lg:flex-row items-center justify-between">
        
        <!-- ----- Left Column: Content & CTA ----- -->
        <div class="lg:w-1/2 lg:pr-12">
          <!-- Headline & Description -->
          <h1 class="text-4xl font-bold tracking-tight text-[#F0F0F0] sm:text-6xl">
            Build Your Faceless Income Stream
          </h1>
          <p class="mt-6 text-lg leading-8 text-[#A0A0A0]">
            Learn how to make money on social media without ever showing your face.
          </p>
          <div class="mt-8 flex gap-4">
            <a href="/signup" class="rounded-full bg-[#C392EC] px-6 py-3 text-lg font-semibold text-[#FFFFFF] shadow-sm hover:opacity-90">
              Start Your Faceless Journey
            </a>
            
          </div>
          
          <!-- Course Info Card -->
          <div class="mt-16 bg-[#2B2B2B] rounded-xl p-8 shadow-lg">
            <div class="flex items-start gap-4">
              <div class="p-3 bg-[#C392EC]/10 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-[#F0F0F0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-semibold text-[#F0F0F0]"> Ready to Build a Faceless Income Stream  Even as a Total Beginner?!</h3>
                <p class="mt-2 text-[#A0A0A0] leading-relaxed">
                  This is more than just a guide. It's your shortcut to financial freedom. No face, no followers needed. Learn step by step how to create content, monetize it, and grow a real faceless brand online. Join our creator network and start your journey to real digital income today!
                </p>
              </div>
            </div>
          </div>
        </div>
  
        <!-- ----- Right Column: Video & Decorative Elements ----- -->
        <div class="lg:w-1/2 mt-6 lg:mt-0">
          <div class="relative w-full aspect-square">
            <!-- Background & Decorative Shapes -->
            <div class="absolute inset-0 bg-[#85D5C8]/20 rounded-[3rem] -rotate-3"></div>
            
            <div class="absolute inset-0">
              <!-- Decorative Elements -->
              <div class="absolute -left-6 top-1/4 w-20 h-20 bg-[#C392EC]/60 rounded-full"></div>
              <div class="absolute bottom-4 right-4 w-24 h-24 bg-[#85D5C8]/60 rounded-2xl rotate-6"></div>
              <div class="absolute bottom-8 right-8 w-2 h-2 bg-[#F0F0F0] rounded-full"></div>
            </div>
  
            <!-- Main Image -->
            <div class="relative z-10 w-[90%] mx-auto mt-4">
              <img 
                src="/logo1.png"
                alt="Faceless Income Illustration"
                class="w-full h-[500px] object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
  