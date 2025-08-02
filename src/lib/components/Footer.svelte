<script lang="ts">
  // Footer component with social links, navigation, and contact information
  const currentYear = new Date().getFullYear();
  
  // Social media links
  const socialLinks = [
    { name: 'Facebook', href: '#', icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
    { name: 'Twitter', href: '#', icon: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' },
    { name: 'Instagram', href: '#', icon: 'M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.781c-.49 0-.928-.175-1.297-.49-.368-.315-.49-.753-.49-1.243 0-.49.122-.928.49-1.243.369-.315.807-.49 1.297-.49s.928.175 1.297.49c.368.315.49.753.49 1.243 0 .49-.122.928-.49 1.243-.369.315-.807.49-1.297.49z' },
    { name: 'LinkedIn', href: '#', icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' }
  ];
  
  // Footer navigation links
  const footerLinks = {
    company: [
      { name: 'About Us', href: '#about' },
      { name: 'Our Mission', href: '#mission' },
      { name: 'Careers', href: '#careers' },
      { name: 'Press', href: '#press' }
    ],
    programs: [
      { name: 'Digital Marketing', href: '#product' },
      { name: 'E-commerce', href: '#ecommerce' },
      { name: 'Social Media', href: '#social' },
      { name: 'Analytics', href: '#analytics' }
    ],
    support: [
      { name: 'Help Center', href: '#help' },
      { name: 'Contact Us', href: '#support' },
      { name: 'Privacy Policy', href: '#privacy' },
      { name: 'Terms of Service', href: '#terms' }
    ]
  };
  
  function handleFooterClick(e: MouseEvent, href: string) {
    e.preventDefault();
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
</script>

<footer class="bg-[#1A1A1A] border-t border-gray-800">
  <div class="max-w-7xl mx-auto px-8 sm:px-12 md:px-16 lg:px-24 xl:px-32 py-16">
    
    <!-- Main Footer Content -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
      
      <!-- Company Info & Logo -->
      <div class="lg:col-span-1">
        <div class="flex items-center mb-6">
          <img 
            src="/logo1.png" 
            alt="Cashfluenced" 
            class="h-20 w-auto"
          />
        </div>
        <p class="text-[#A0A0A0] text-sm leading-relaxed mb-6">
          Empowering individuals to achieve financial freedom through comprehensive digital marketing education and mentorship.
        </p>
        
        <!-- Social Media Links -->
        <div class="flex space-x-4">
          {#each socialLinks as social}
            <a 
              href={social.href}
              class="w-10 h-10 bg-[#2B2B2B] rounded-lg flex items-center justify-center text-[#A0A0A0] hover:text-[#C392EC] hover:bg-[#2B2B2B]/80 transition-all duration-200 group"
              aria-label={social.name}
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d={social.icon} />
              </svg>
            </a>
          {/each}
        </div>
      </div>
      
      <!-- Company Links -->
      <div>
        <h3 class="text-[#F0F0F0] font-semibold text-lg mb-6">Company</h3>
        <ul class="space-y-3">
          {#each footerLinks.company as link}
            <li>
              <a 
                href={link.href}
                onclick={(e) => handleFooterClick(e, link.href)}
                class="text-[#A0A0A0] hover:text-[#C392EC] transition-colors duration-200 text-sm"
              >
                {link.name}
              </a>
            </li>
          {/each}
        </ul>
      </div>
      
      <!-- Programs Links -->
      <div>
        <h3 class="text-[#F0F0F0] font-semibold text-lg mb-6">Programs</h3>
        <ul class="space-y-3">
          {#each footerLinks.programs as link}
            <li>
              <a 
                href={link.href}
                onclick={(e) => handleFooterClick(e, link.href)}
                class="text-[#A0A0A0] hover:text-[#C392EC] transition-colors duration-200 text-sm"
              >
                {link.name}
              </a>
            </li>
          {/each}
        </ul>
      </div>
      
      <!-- Support Links -->
      <div>
        <h3 class="text-[#F0F0F0] font-semibold text-lg mb-6">Support</h3>
        <ul class="space-y-3">
          {#each footerLinks.support as link}
            <li>
              <a 
                href={link.href}
                onclick={(e) => handleFooterClick(e, link.href)}
                class="text-[#A0A0A0] hover:text-[#C392EC] transition-colors duration-200 text-sm"
              >
                {link.name}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    </div>
    
    <!-- Newsletter Signup -->
    <div class="mt-12 pt-8 border-t border-gray-800">
      <div class="max-w-md">
        <h3 class="text-[#F0F0F0] font-semibold text-lg mb-3">Stay Updated</h3>
        <p class="text-[#A0A0A0] text-sm mb-4">
          Get the latest updates on new programs and exclusive offers.
        </p>
        <div class="flex gap-3">
          <input 
            type="email" 
            placeholder="Enter your email"
            class="flex-1 px-4 py-2 bg-[#2B2B2B] border border-gray-700 rounded-lg text-[#F0F0F0] placeholder-[#A0A0A0] focus:outline-none focus:border-[#C392EC] transition-colors duration-200"
          />
          <button class="px-6 py-2 bg-[#C392EC] text-white rounded-lg font-medium hover:opacity-90 transition-opacity duration-200">
            Subscribe
          </button>
        </div>
      </div>
    </div>
    
    <!-- Bottom Bar -->
    <div class="mt-12 pt-8 border-t border-gray-800">
      <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <p class="text-[#A0A0A0] text-sm">
          © {currentYear} Cashfluenced. All rights reserved.
        </p>
        <div class="flex items-center space-x-6 text-sm">
          <a href="#privacy" class="text-[#A0A0A0] hover:text-[#C392EC] transition-colors duration-200">
            Privacy Policy
          </a>
          <a href="#terms" class="text-[#A0A0A0] hover:text-[#C392EC] transition-colors duration-200">
            Terms of Service
          </a>
          <a href="#cookies" class="text-[#A0A0A0] hover:text-[#C392EC] transition-colors duration-200">
            Cookie Policy
          </a>
        </div>
      </div>
    </div>
  </div>
</footer>
