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
    
    // Admin sidebar navigation items
    const adminNavItems = [
        {
            name: 'Dashboard',
            href: '/admin',
            icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z'
        },
        {
            name: 'Users',
            href: '/admin/users',
            icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
        },
        {
            name: 'Courses',
            href: '/admin/courses',
            icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
        },
        {
            name: 'Transactions',
            href: '/admin/transactions',
            icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'
        },
        {
            name: 'Support',
            href: '/admin/support',
            icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        },
        {
            name: 'Referrals',
            href: '/admin/referrals',
            icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
        },
        {
            name: 'Analytics',
            href: '/admin/analytics',
            icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
        }
    ];

    function toggleSidebar() {
        sidebarOpen = !sidebarOpen;
    }

    function isActiveRoute(href) {
        if (href === '/admin') {
            return currentRoute === '/admin';
        }
        return currentRoute.startsWith(href);
    }

    // Handle logout
    async function handleLogout() {
        try {
            const response = await fetch('/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            });
            
            logout();
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout error:', error);
            logout();
            window.location.href = '/login';
        }
    }
</script>

<svelte:head>
    <title>Admin Dashboard - Cashfluenced</title>
</svelte:head>

<div class="min-h-screen bg-[#1A1A1A] flex">
    <!-- Sidebar -->
    <div class="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div class="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-[#2B2B2B] border-r border-[#3B3B3B]">
            <!-- Logo -->
            <div class="flex items-center flex-shrink-0 px-4">
                <a href="/admin" class="flex items-center space-x-3">
                    <div class="w-8 h-8 bg-[#C392EC] rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                    </div>
                    <div>
                        <h1 class="text-[#F0F0F0] text-lg font-bold">Admin Panel</h1>
                        <p class="text-[#A0A0A0] text-sm">Cashfluenced</p>
                    </div>
                </a>
            </div>

            <!-- Navigation -->
            <nav class="mt-8 flex-1">
                <div class="px-2 space-y-1">
                    {#each adminNavItems as item}
                        <a
                            href={item.href}
                            class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 {isActiveRoute(item.href) 
                                ? 'bg-[#C392EC] text-white' 
                                : 'text-[#A0A0A0] hover:bg-[#3B3B3B] hover:text-[#F0F0F0]'}"
                        >
                            <svg
                                class="mr-3 h-5 w-5 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon}></path>
                            </svg>
                            {item.name}
                        </a>
                    {/each}
                </div>
            </nav>

            <!-- User info and logout -->
            <div class="flex-shrink-0 border-t border-[#3B3B3B] p-4">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-[#85D5C8] rounded-full flex items-center justify-center">
                            <span class="text-sm font-medium text-[#1A1A1A]">
                                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'A'}
                            </span>
                        </div>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium text-[#F0F0F0]">{user?.name || user?.email}</p>
                        <p class="text-xs text-[#A0A0A0] capitalize">{user?.role || 'Admin'}</p>
                    </div>
                </div>
                <button
                    onclick={handleLogout}
                    class="mt-3 w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                    Sign Out
                </button>
            </div>
        </div>
    </div>

    <!-- Mobile sidebar -->
    <div class="lg:hidden">
        {#if sidebarOpen}
            <!-- Mobile sidebar overlay -->
            <div 
                class="fixed inset-0 flex z-40"
                onclick={toggleSidebar}
                role="button"
                tabindex="0"
                onkeydown={(e) => e.key === 'Escape' && toggleSidebar()}
                aria-label="Close sidebar overlay"
            >
                <div class="fixed inset-0 bg-black bg-opacity-50"></div>
                <div class="relative flex-1 flex flex-col max-w-xs w-full bg-[#2B2B2B] border-r border-[#3B3B3B]">
                    <!-- Mobile sidebar content (same as desktop) -->
                    <div class="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
                        <div class="flex items-center flex-shrink-0 px-4">
                            <a href="/admin" class="flex items-center space-x-3">
                                <div class="w-8 h-8 bg-[#C392EC] rounded-lg flex items-center justify-center">
                                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h1 class="text-[#F0F0F0] text-lg font-bold">Admin Panel</h1>
                                    <p class="text-[#A0A0A0] text-sm">Cashfluenced</p>
                                </div>
                            </a>
                        </div>

                        <nav class="mt-8 flex-1">
                            <div class="px-2 space-y-1">
                                {#each adminNavItems as item}
                                    <a
                                        href={item.href}
                                        onclick={toggleSidebar}
                                        class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 {isActiveRoute(item.href) 
                                            ? 'bg-[#C392EC] text-white' 
                                            : 'text-[#A0A0A0] hover:bg-[#3B3B3B] hover:text-[#F0F0F0]'}"
                                    >
                                        <svg
                                            class="mr-3 h-5 w-5 flex-shrink-0"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon}></path>
                                        </svg>
                                        {item.name}
                                    </a>
                                {/each}
                            </div>
                        </nav>

                        <div class="flex-shrink-0 border-t border-[#3B3B3B] p-4">
                            <div class="flex items-center">
                                <div class="flex-shrink-0">
                                    <div class="w-8 h-8 bg-[#85D5C8] rounded-full flex items-center justify-center">
                                        <span class="text-sm font-medium text-[#1A1A1A]">
                                            {user?.name?.charAt(0) || user?.email?.charAt(0) || 'A'}
                                        </span>
                                    </div>
                                </div>
                                <div class="ml-3">
                                    <p class="text-sm font-medium text-[#F0F0F0]">{user?.name || user?.email}</p>
                                    <p class="text-xs text-[#A0A0A0] capitalize">{user?.role || 'Admin'}</p>
                                </div>
                            </div>
                            <button
                                onclick={handleLogout}
                                class="mt-3 w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        {/if}
    </div>

    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <!-- Mobile header -->
        <header class="lg:hidden bg-[#2B2B2B] border-b border-[#3B3B3B] px-4 py-3">
            <div class="flex items-center justify-between">
                <button
                    onclick={toggleSidebar}
                    class="p-2 rounded-md text-[#A0A0A0] hover:text-[#F0F0F0] hover:bg-[#3B3B3B]"
                    aria-label="Open sidebar menu"
                >
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
                
                <h1 class="text-[#F0F0F0] text-lg font-semibold">Admin Panel</h1>
                
                <div class="w-8"></div> <!-- Spacer for centering -->
            </div>
        </header>
        
        <!-- Page content -->
        <main class="flex-1 overflow-y-auto focus:outline-none">
            {@render children?.()}
        </main>
    </div>
</div>
