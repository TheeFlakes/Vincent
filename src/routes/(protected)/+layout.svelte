<script>
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { logout } from '$lib/auth.js';
    import { currentUser } from '$lib/pocketbase.js';
    
    let { children, data } = $props();
    let sidebarOpen = $state(false);
    
    // Use server-side data first, fallback to store
    const user = $derived(data.user || $currentUser);
    
    // Get current route for active state
    const currentRoute = $derived($page.url.pathname);
    
    // Sidebar navigation items
    const navItems = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z'
        },
        {
            name: 'Courses',
            href: '/dashboard/courses',
            icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
        },
        {
            name: 'Progress',
            href: '/dashboard/progress',
            icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
        },
        {
            name: 'Subscriptions',
            href: '/dashboard/subscriptions',
            icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'
        },
        {
            name: 'Referrals',
            href: '/dashboard/referrals',
            icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
        },
        {
            name: 'Support',
            href: '/dashboard/support',
            icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        }
    ];
    
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
    
    function toggleSidebar() {
        sidebarOpen = !sidebarOpen;
    }
    
    function closeSidebar() {
        sidebarOpen = false;
    }
</script>

<div class="flex h-screen bg-[#1A1A1A]">
    <!-- Mobile sidebar overlay -->
    {#if sidebarOpen}
        <div 
            class="fixed inset-0 z-40 lg:hidden"
            onclick={closeSidebar}
        >
            <div class="absolute inset-0 bg-black/50"></div>
        </div>
    {/if}
    
    <!-- Sidebar -->
    <div class="fixed inset-y-0 left-0 z-50 w-64 bg-[#2B2B2B] border-r border-[#3B3B3B] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 {sidebarOpen ? 'translate-x-0' : '-translate-x-full'}">
        <div class="flex flex-col h-full">
            <!-- Sidebar header -->
            <div class="flex items-center justify-between h-16 px-4 border-b border-[#3B3B3B]">
                <a href="/dashboard" class="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                    <div class="w-8 h-8 bg-gradient-to-r from-[#C392EC] to-[#85D5C8] rounded-lg flex items-center justify-center">
                        <span class="text-white font-bold text-sm">C</span>
                    </div>
                    <span class="text-[#F0F0F0] font-semibold text-lg">Cashfluenced</span>
                </a>
                <button 
                    class="lg:hidden p-2 rounded-md text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#3B3B3B]"
                    onclick={closeSidebar}
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            
            <!-- User info -->
            <div class="p-4 border-b border-[#3B3B3B]">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-gradient-to-r from-[#C392EC] to-[#85D5C8] rounded-full flex items-center justify-center">
                        <span class="text-white font-semibold text-sm">
                            {(user?.username || user?.name || 'User').charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-[#F0F0F0] truncate">
                            {user?.username || user?.name || 'User'}
                        </p>
                        <p class="text-xs text-[#A0A0A0] truncate">
                            {user?.email || ''}
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- Navigation -->
            <nav class="flex-1 p-4">
                <ul class="space-y-2">
                    {#each navItems as item}
                        <li>
                            <a
                                href={item.href}
                                onclick={closeSidebar}
                                class="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 {
                                    currentRoute === item.href || (item.href !== '/dashboard' && currentRoute.startsWith(item.href))
                                        ? 'bg-[#C392EC]/10 text-[#C392EC] border border-[#C392EC]/20'
                                        : 'text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#3B3B3B]'
                                }"
                            >
                                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon}></path>
                                </svg>
                                {item.name}
                            </a>
                        </li>
                    {/each}
                </ul>
            </nav>
            
            <!-- Logout button -->
            <div class="p-4 border-t border-[#3B3B3B]">
                <button
                    onclick={handleLogout}
                    class="flex items-center w-full px-3 py-2 text-sm font-medium text-[#A0A0A0] rounded-lg hover:text-[#F0F0F0] hover:bg-[#3B3B3B] transition-colors duration-200"
                >
                    <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    Logout
                </button>
            </div>
        </div>
    </div>
    
    <!-- Main content area -->
    <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Mobile header -->
        <header class="lg:hidden bg-[#2B2B2B] border-b border-[#3B3B3B] px-4 py-3">
            <div class="flex items-center justify-between">
                <button
                    onclick={toggleSidebar}
                    class="p-2 rounded-md text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#3B3B3B]"
                >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
                
                <a href="/dashboard" class="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                    <div class="w-8 h-8 bg-gradient-to-r from-[#C392EC] to-[#85D5C8] rounded-lg flex items-center justify-center">
                        <span class="text-white font-bold text-sm">C</span>
                    </div>
                    <span class="text-[#F0F0F0] font-semibold">Cashfluenced</span>
                </a>
                
                <div class="w-10"></div> <!-- Spacer for centering -->
            </div>
        </header>
        
        <!-- Page content -->
        <main class="flex-1 overflow-auto">
            {@render children?.()}
        </main>
    </div>
</div>
