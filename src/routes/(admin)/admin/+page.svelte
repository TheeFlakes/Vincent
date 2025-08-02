<script>
    import { onMount } from 'svelte';
    import Chart from '$lib/components/Chart.svelte';
    
    let { data } = $props();
    
    let stats = $state(data.stats || {});
    let analytics = $state(data.analytics || {
        userGrowth: { daily: [], monthly: [] },
        revenue: { daily: [], monthly: [], byType: { labels: [], data: [] } },
        courses: { popularity: [], topPerforming: [] },
        conversion: { labels: [], data: [] },
        totals: { users: 0, transactions: 0, courses: 0, revenue: 0 }
    });
    let loading = $state(false);
    let selectedPeriod = $state('daily');
    
    // Format currency
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }
    
    // Format number
    function formatNumber(num) {
        return new Intl.NumberFormat('en-US').format(num);
    }
    
    // Format percentage
    function formatPercentage(num, total) {
        if (total === 0) return '0%';
        return ((num / total) * 100).toFixed(1) + '%';
    }
    
    // Refresh analytics data
    async function refreshAnalytics() {
        loading = true;
        try {
            const response = await fetch('/admin/api/analytics');
            if (response.ok) {
                const newAnalytics = await response.json();
                analytics = newAnalytics;
            }
        } catch (error) {
            console.error('Error refreshing analytics:', error);
        } finally {
            loading = false;
        }
    }
    
    // Chart data generators
    let userGrowthChartData = $derived({
        labels: (selectedPeriod === 'daily' ? (analytics.userGrowth?.daily || []) : (analytics.userGrowth?.monthly || [])).map(d => d.label),
        datasets: [{
            label: 'New Users',
            data: (selectedPeriod === 'daily' ? (analytics.userGrowth?.daily || []) : (analytics.userGrowth?.monthly || [])).map(d => d.value),
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true
        }]
    });
    
    let revenueChartData = $derived({
        labels: (selectedPeriod === 'daily' ? (analytics.revenue?.daily || []) : (analytics.revenue?.monthly || [])).map(d => d.label),
        datasets: [{
            label: 'Revenue',
            data: (selectedPeriod === 'daily' ? (analytics.revenue?.daily || []) : (analytics.revenue?.monthly || [])).map(d => d.value),
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true
        }]
    });
    
    let coursePopularityData = $derived({
        labels: (analytics.courses?.popularity || []).slice(0, 5).map(c => c.label),
        datasets: [{
            label: 'Course Purchases',
            data: (analytics.courses?.popularity || []).slice(0, 5).map(c => c.value),
            backgroundColor: [
                '#C392EC',
                '#3B82F6',
                '#10B981',
                '#F59E0B',
                '#EF4444'
            ],
            borderWidth: 0
        }]
    });
    
    let conversionData = $derived({
        labels: analytics.conversion?.labels || [],
        datasets: [{
            label: 'Users',
            data: analytics.conversion?.data || [],
            backgroundColor: [
                '#10B981',
                '#6B7280'
            ],
            borderWidth: 0
        }]
    });
    
    let revenueByTypeData = $derived({
        labels: analytics.revenue?.byType?.labels || [],
        datasets: [{
            label: 'Revenue',
            data: analytics.revenue?.byType?.data || [],
            backgroundColor: [
                '#3B82F6',
                '#C392EC'
            ],
            borderWidth: 0
        }]
    });
    
    // Calculate conversion rate
    let conversionRate = $derived((analytics.conversion?.data || []).length > 0 
        ? ((analytics.conversion.data[0] || 0) / ((analytics.conversion.data[0] || 0) + (analytics.conversion.data[1] || 0)) * 100).toFixed(1)
        : '0');
    
    onMount(() => {
        // Auto-refresh every 5 minutes
        const interval = setInterval(refreshAnalytics, 5 * 60 * 1000);
        return () => clearInterval(interval);
    });
</script>

<svelte:head>
    <title>Admin Dashboard - Analytics</title>
</svelte:head>

<div class="p-6">
    <!-- Header -->
    <div class="mb-8">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold text-[#F0F0F0]">Analytics Dashboard</h1>
                <p class="mt-1 text-[#A0A0A0]">Comprehensive insights into your business performance</p>
            </div>
            <div class="flex items-center gap-3">
                <!-- Period Selector -->
                <select 
                    bind:value={selectedPeriod}
                    class="bg-[#3B3B3B] border border-[#4B4B4B] rounded-lg px-3 py-2 text-[#F0F0F0] text-sm focus:outline-none focus:border-[#C392EC]"
                >
                    <option value="daily">Last 30 Days</option>
                    <option value="monthly">Last 12 Months</option>
                </select>
                
                <button
                    onclick={refreshAnalytics}
                    disabled={loading}
                    class="bg-[#C392EC] hover:bg-[#B580E1] disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                >
                    <svg class="w-4 h-4 {loading ? 'animate-spin' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Refresh
                </button>
            </div>
        </div>
    </div>
    
    <!-- Key Metrics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <!-- Total Revenue -->
        <div class="bg-[#2B2B2B] rounded-xl p-6 border border-[#3B3B3B]">
            <div class="flex items-center">
                <div class="p-3 bg-green-500/10 rounded-lg">
                    <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                    </svg>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-[#A0A0A0]">Total Revenue</p>
                    <p class="text-2xl font-bold text-[#F0F0F0]">{formatCurrency(analytics.totals?.revenue || 0)}</p>
                </div>
            </div>
        </div>
        
        <!-- Total Users -->
        <div class="bg-[#2B2B2B] rounded-xl p-6 border border-[#3B3B3B]">
            <div class="flex items-center">
                <div class="p-3 bg-blue-500/10 rounded-lg">
                    <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                    </svg>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-[#A0A0A0]">Total Users</p>
                    <p class="text-2xl font-bold text-[#F0F0F0]">{formatNumber(analytics.totals?.users || 0)}</p>
                </div>
            </div>
        </div>
        
        <!-- Total Courses -->
        <div class="bg-[#2B2B2B] rounded-xl p-6 border border-[#3B3B3B]">
            <div class="flex items-center">
                <div class="p-3 bg-purple-500/10 rounded-lg">
                    <svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-[#A0A0A0]">Total Courses</p>
                    <p class="text-2xl font-bold text-[#F0F0F0]">{formatNumber(analytics.totals?.courses || 0)}</p>
                </div>
            </div>
        </div>
        
        <!-- Total Transactions -->
        <div class="bg-[#2B2B2B] rounded-xl p-6 border border-[#3B3B3B]">
            <div class="flex items-center">
                <div class="p-3 bg-yellow-500/10 rounded-lg">
                    <svg class="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-[#A0A0A0]">Transactions</p>
                    <p class="text-2xl font-bold text-[#F0F0F0]">{formatNumber(analytics.totals?.transactions || 0)}</p>
                </div>
            </div>
        </div>
        
        <!-- Conversion Rate -->
        <div class="bg-[#2B2B2B] rounded-xl p-6 border border-[#3B3B3B]">
            <div class="flex items-center">
                <div class="p-3 bg-red-500/10 rounded-lg">
                    <svg class="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                    </svg>
                </div>
                <div class="ml-4">
                    <p class="text-sm font-medium text-[#A0A0A0]">Conversion Rate</p>
                    <p class="text-2xl font-bold text-[#F0F0F0]">{conversionRate}%</p>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- User Growth Chart -->
        <div class="bg-[#2B2B2B] rounded-xl p-6 border border-[#3B3B3B]">
            <h3 class="text-lg font-semibold text-[#F0F0F0] mb-4">User Growth</h3>
            <Chart 
                type="line" 
                data={userGrowthChartData}
                height="300px"
                options={{
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }}
            />
        </div>
        
        <!-- Revenue Chart -->
        <div class="bg-[#2B2B2B] rounded-xl p-6 border border-[#3B3B3B]">
            <h3 class="text-lg font-semibold text-[#F0F0F0] mb-4">Revenue Trends</h3>
            <Chart 
                type="line" 
                data={revenueChartData}
                height="300px"
                options={{
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '$' + value.toLocaleString();
                                }
                            }
                        }
                    }
                }}
            />
        </div>
    </div>
    
    <!-- Secondary Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <!-- Course Popularity -->
        <div class="bg-[#2B2B2B] rounded-xl p-6 border border-[#3B3B3B]">
            <h3 class="text-lg font-semibold text-[#F0F0F0] mb-4">Top Courses by Sales</h3>
            <Chart 
                type="doughnut" 
                data={coursePopularityData}
                height="250px"
                options={{
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }}
            />
        </div>
        
        <!-- User Conversion -->
        <div class="bg-[#2B2B2B] rounded-xl p-6 border border-[#3B3B3B]">
            <h3 class="text-lg font-semibold text-[#F0F0F0] mb-4">User Conversion</h3>
            <Chart 
                type="pie" 
                data={conversionData}
                height="250px"
                options={{
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }}
            />
        </div>
        
        <!-- Revenue by Course Type -->
        <div class="bg-[#2B2B2B] rounded-xl p-6 border border-[#3B3B3B]">
            <h3 class="text-lg font-semibold text-[#F0F0F0] mb-4">Revenue by Course Type</h3>
            <Chart 
                type="bar" 
                data={revenueByTypeData}
                height="250px"
                options={{
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '$' + value.toLocaleString();
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }}
            />
        </div>
    </div>
    
    <!-- Top Performing Courses Table -->
    <div class="bg-[#2B2B2B] rounded-xl p-6 border border-[#3B3B3B]">
        <h3 class="text-lg font-semibold text-[#F0F0F0] mb-4">Top Performing Courses</h3>
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead>
                    <tr class="border-b border-[#3B3B3B]">
                        <th class="text-left py-3 px-4 text-[#A0A0A0] font-medium">Course</th>
                        <th class="text-left py-3 px-4 text-[#A0A0A0] font-medium">Revenue</th>
                        <th class="text-left py-3 px-4 text-[#A0A0A0] font-medium">Sales</th>
                        <th class="text-left py-3 px-4 text-[#A0A0A0] font-medium">Price</th>
                        <th class="text-left py-3 px-4 text-[#A0A0A0] font-medium">Type</th>
                    </tr>
                </thead>
                <tbody>
                    {#each (analytics.courses?.topPerforming || []) as course (course.id)}
                        <tr class="border-b border-[#3B3B3B] hover:bg-[#3B3B3B]/50">
                            <td class="py-3 px-4 text-[#F0F0F0]">{course.title}</td>
                            <td class="py-3 px-4 text-[#10B981] font-medium">{formatCurrency(course.revenue)}</td>
                            <td class="py-3 px-4 text-[#F0F0F0]">{formatNumber(course.sales)}</td>
                            <td class="py-3 px-4 text-[#F0F0F0]">{formatCurrency(course.price)}</td>
                            <td class="py-3 px-4">
                                <span class="px-2 py-1 rounded-full text-xs font-medium {course.isFree ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}">
                                    {course.isFree ? 'Free' : 'Paid'}
                                </span>
                            </td>
                        </tr>
                    {:else}
                        <tr>
                            <td colspan="5" class="py-8 px-4 text-center text-[#A0A0A0]">
                                No course data available yet
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
    
    <!-- Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Quick Actions Panel -->
        <div class="bg-[#2B2B2B] rounded-xl p-6 border border-[#3B3B3B]">
            <h2 class="text-lg font-semibold text-[#F0F0F0] mb-4">Quick Actions</h2>
            <div class="space-y-3">
                <a
                    href="/admin/users"
                    class="flex items-center p-3 bg-[#3B3B3B] hover:bg-[#4B4B4B] rounded-lg transition-colors duration-200 group"
                >
                    <div class="p-2 bg-blue-500/10 rounded-lg">
                        <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium text-[#F0F0F0] group-hover:text-blue-400">Manage Users</p>
                        <p class="text-xs text-[#A0A0A0]">View and edit user accounts</p>
                    </div>
                </a>
                
                <a
                    href="/admin/courses"
                    class="flex items-center p-3 bg-[#3B3B3B] hover:bg-[#4B4B4B] rounded-lg transition-colors duration-200 group"
                >
                    <div class="p-2 bg-green-500/10 rounded-lg">
                        <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium text-[#F0F0F0] group-hover:text-green-400">Manage Courses</p>
                        <p class="text-xs text-[#A0A0A0]">Create and edit courses</p>
                    </div>
                </a>
                
                <a
                    href="/admin/support"
                    class="flex items-center p-3 bg-[#3B3B3B] hover:bg-[#4B4B4B] rounded-lg transition-colors duration-200 group"
                >
                    <div class="p-2 bg-orange-500/10 rounded-lg">
                        <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <div class="ml-3">
                        <p class="text-sm font-medium text-[#F0F0F0] group-hover:text-orange-400">Handle Support</p>
                        <p class="text-xs text-[#A0A0A0]">Reply to user messages</p>
                    </div>
                </a>
            </div>
        </div>
        
        <!-- Recent Activity Panel -->
        <div class="bg-[#2B2B2B] rounded-xl p-6 border border-[#3B3B3B]">
            <h2 class="text-lg font-semibold text-[#F0F0F0] mb-4">System Overview</h2>
            <div class="space-y-4">
                <div class="flex items-center justify-between">
                    <span class="text-sm text-[#A0A0A0]">System Status</span>
                    <span class="flex items-center text-sm text-green-400">
                        <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        Online
                    </span>
                </div>
                
                <div class="flex items-center justify-between">
                    <span class="text-sm text-[#A0A0A0]">Database</span>
                    <span class="flex items-center text-sm text-green-400">
                        <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        Connected
                    </span>
                </div>
                
                <div class="flex items-center justify-between">
                    <span class="text-sm text-[#A0A0A0]">Payment Gateway</span>
                    <span class="flex items-center text-sm text-green-400">
                        <div class="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        Active
                    </span>
                </div>
                
                <div class="pt-4 border-t border-[#3B3B3B]">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm text-[#A0A0A0]">Storage Usage</span>
                        <span class="text-sm text-[#F0F0F0]">7%</span>
                    </div>
                    <div class="w-full bg-[#3B3B3B] rounded-full h-2">
                        <div class="bg-[#C392EC] h-2 rounded-full transition-all duration-300" style="width: 67%"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
