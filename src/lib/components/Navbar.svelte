<script>
	import { logout } from '$lib/auth.js';
	
	let { user, isAuthPage } = $props();
	
	// Mobile menu state
	let mobileMenuOpen = $state(false);
	
	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}
	
	// Close mobile menu when clicking outside
	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
	
	// Handle logout
	async function handleLogout() {
		try {
			// First, make a request to the logout endpoint to clear server-side session
			const response = await fetch('/logout', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				}
			});
			
			// Clear client-side auth
			logout();
			
			// Force page reload to ensure all state is cleared
			window.location.href = '/login';
		} catch (error) {
			console.error('Logout error:', error);
			// Even if there's an error, clear client auth and redirect
			logout();
			window.location.href = '/login';
		}
	}
	
	// Navigation links
	const navLinks = [
		{ href: '#home', label: 'Home' },
		{ href: '#about', label: 'About' },
		{ href: '#services', label: 'Product' },
		{ href: '#reviews', label: 'Reviews' },
		{ href: '#support', label: 'Support' }
	];
</script>

{#if !isAuthPage}
	<!-- Navigation bar for non-auth pages -->
	<nav class="bg-[#1A1A1A] shadow-lg sticky top-0 z-50">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between h-16">
				<!-- Logo/Brand -->
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<a href={user ? '/dashboard' : '/'} class="text-[#F0F0F0] text-xl font-bold hover:text-[#C392EC] transition-colors duration-200">
							Cashfluenced
						</a>
					</div>
				</div>
				
				{#if user}
					<!-- Authenticated user menu -->
					<div class="flex items-center space-x-4">
						<span class="text-[#A0A0A0] hidden sm:block text-sm">
							Welcome, {user.name || user.email}
						</span>
						<button
							onclick={handleLogout}
							class="bg-[#C392EC] hover:bg-[#B580E1] text-white px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105"
						>
							Logout
						</button>
					</div>
				{:else}
					<!-- Logged out navigation -->
					<div class="flex items-center">
						<!-- Desktop Navigation Links -->
						<div class="hidden lg:flex space-x-6 mr-6">
							{#each navLinks as link}
								<a 
									href={link.href} 
									class="text-[#A0A0A0] hover:text-[#F0F0F0] px-3 py-2 text-sm font-medium transition-colors duration-200 relative group"
								>
									{link.label}
									<span class="absolute bottom-0 left-0 w-0 h-0.5 bg-[#C392EC] transition-all duration-300 group-hover:w-full"></span>
								</a>
							{/each}
						</div>
						
						<!-- Auth Buttons (Desktop) -->
						<div class="hidden lg:flex items-center space-x-2">
							<a
								href="/login"
								class="text-[#A0A0A0] hover:text-[#F0F0F0] px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
							>
								Login
							</a>
							<a
								href="/signup"
								class="bg-[#C392EC] hover:bg-[#B580E1] text-white px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105"
							>
								Sign Up
							</a>
						</div>
						
						<!-- Mobile menu button -->
						<div class="lg:hidden">
							<button
								onclick={toggleMobileMenu}
								class="text-[#A0A0A0] hover:text-[#F0F0F0] focus:outline-none focus:text-[#F0F0F0] p-2 rounded-md transition-colors duration-200"
								aria-label="Toggle menu"
								aria-expanded={mobileMenuOpen}
							>
								<svg class="h-6 w-6 fill-current transition-transform duration-300" class:rotate-90={mobileMenuOpen} viewBox="0 0 24 24">
									{#if mobileMenuOpen}
										<path fill-rule="evenodd" d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"/>
									{:else}
										<path fill-rule="evenodd" d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"/>
									{/if}
								</svg>
							</button>
						</div>
					</div>
				{/if}
			</div>
		</div>
		
		<!-- Mobile menu overlay -->
		{#if mobileMenuOpen && !user}
			<div 
				class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
				onclick={closeMobileMenu}
				aria-hidden="true"
			></div>
		{/if}
		
		<!-- Mobile menu -->
		{#if mobileMenuOpen && !user}
			<div class="lg:hidden bg-[#2B2B2B] border-t border-[#3A3A3A] shadow-xl relative z-50">
				<div class="px-4 py-6 space-y-4">
					<!-- Mobile Navigation Links -->
					<div class="space-y-2">
						{#each navLinks as link}
							<a 
								href={link.href} 
								onclick={closeMobileMenu} 
								class="block text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#3A3A3A] px-4 py-3 text-base font-medium transition-all duration-200 rounded-md"
							>
								{link.label}
							</a>
						{/each}
					</div>
					
					<!-- Mobile Auth Buttons -->
					<div class="pt-6 border-t border-[#3A3A3A] space-y-3">
						<a
							href="/login"
							onclick={closeMobileMenu}
							class="block text-center text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#3A3A3A] px-4 py-3 rounded-md text-base font-medium transition-all duration-200"
						>
							Login
						</a>
						<a
							href="/signup"
							onclick={closeMobileMenu}
							class="block text-center bg-[#C392EC] hover:bg-[#B580E1] text-white px-6 py-3 rounded-full text-base font-medium transition-all duration-300 transform hover:scale-105"
						>
							Sign Up
						</a>
					</div>
				</div>
			</div>
		{/if}
	</nav>
{/if}

<style>
	/* Custom scrollbar for mobile menu if needed */
	.mobile-menu-content {
		scrollbar-width: thin;
		scrollbar-color: #C392EC #2B2B2B;
	}
	
	.mobile-menu-content::-webkit-scrollbar {
		width: 4px;
	}
	
	.mobile-menu-content::-webkit-scrollbar-track {
		background: #2B2B2B;
	}
	
	.mobile-menu-content::-webkit-scrollbar-thumb {
		background-color: #C392EC;
		border-radius: 2px;
	}
</style>
