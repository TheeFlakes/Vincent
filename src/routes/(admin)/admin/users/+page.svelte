<script>
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    
    let { data } = $props();
    
    let users = $state(data.users);
    let totalUsers = $state(data.totalUsers);
    let totalPages = $state(data.totalPages);
    let currentPage = $state(data.currentPage);
    let currentFilters = $state(data.currentFilters);
    
    let loading = $state(false);
    let searchValue = $state(currentFilters.search);
    let roleFilter = $state(currentFilters.role);
    
    let showDeleteModal = $state(false);
    let userToDelete = $state(null);
    
    let showRoleModal = $state(false);
    let userToUpdateRole = $state(null);
    let newRole = $state('');
    
    // Format date
    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    // Apply filters
    async function applyFilters() {
        const params = new URLSearchParams();
        if (searchValue) params.set('search', searchValue);
        if (roleFilter) params.set('role', roleFilter);
        params.set('page', '1');
        
        await goto(`/admin/users?${params.toString()}`);
    }
    
    // Clear filters
    async function clearFilters() {
        searchValue = '';
        roleFilter = '';
        await goto('/admin/users');
    }
    
    // Pagination
    async function goToPage(pageNum) {
        const params = new URLSearchParams(window.location.search);
        params.set('page', pageNum.toString());
        await goto(`/admin/users?${params.toString()}`);
    }
    
    // Open role modal
    function openRoleModal(user) {
        userToUpdateRole = user;
        newRole = user.role || 'user';
        showRoleModal = true;
    }
    
    // Update user role
    async function updateRole() {
        if (!userToUpdateRole) return;
        
        loading = true;
        try {
            const response = await fetch('/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'updateRole',
                    userId: userToUpdateRole.id,
                    role: newRole
                })
            });
            
            if (response.ok) {
                // Update the user in the list
                const index = users.findIndex(u => u.id === userToUpdateRole.id);
                if (index !== -1) {
                    users[index].role = newRole;
                }
                showRoleModal = false;
                userToUpdateRole = null;
            } else {
                const error = await response.json();
                alert('Error updating role: ' + error.error);
            }
        } catch (error) {
            console.error('Error updating role:', error);
            alert('Error updating role');
        } finally {
            loading = false;
        }
    }
    
    // Open delete modal
    function openDeleteModal(user) {
        userToDelete = user;
        showDeleteModal = true;
    }
    
    // Delete user
    async function deleteUser() {
        if (!userToDelete) return;
        
        loading = true;
        try {
            const response = await fetch('/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'deleteUser',
                    userId: userToDelete.id
                })
            });
            
            if (response.ok) {
                // Remove user from list
                users = users.filter(u => u.id !== userToDelete.id);
                totalUsers--;
                showDeleteModal = false;
                userToDelete = null;
            } else {
                const error = await response.json();
                alert('Error deleting user: ' + error.error);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Error deleting user');
        } finally {
            loading = false;
        }
    }
    
    // View user referral tree
    function viewReferralTree(userId) {
        goto(`/admin/referrals/${userId}`);
    }
</script>

<svelte:head>
    <title>Users Management - Admin</title>
</svelte:head>

<div class="p-6">
    <!-- Header -->
    <div class="mb-6">
        <h1 class="text-2xl font-bold text-[#F0F0F0]">Users Management</h1>
        <p class="mt-1 text-[#A0A0A0]">Manage user accounts and permissions</p>
    </div>
    
    <!-- Filters -->
    <div class="bg-[#2B2B2B] rounded-xl p-6 mb-6 border border-[#3B3B3B]">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label class="block text-sm font-medium text-[#F0F0F0] mb-2">Search Users</label>
                <input
                    type="text"
                    bind:value={searchValue}
                    placeholder="Search by name or email..."
                    class="w-full bg-[#3B3B3B] border border-[#4B4B4B] rounded-lg px-3 py-2 text-[#F0F0F0] placeholder-[#A0A0A0] focus:outline-none focus:border-[#C392EC]"
                    onkeydown={(e) => e.key === 'Enter' && applyFilters()}
                />
            </div>
            
            <div>
                <label class="block text-sm font-medium text-[#F0F0F0] mb-2">Role Filter</label>
                <select
                    bind:value={roleFilter}
                    class="w-full bg-[#3B3B3B] border border-[#4B4B4B] rounded-lg px-3 py-2 text-[#F0F0F0] focus:outline-none focus:border-[#C392EC]"
                >
                    <option value="">All Roles</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                </select>
            </div>
            
            <div class="flex items-end gap-2">
                <button
                    onclick={applyFilters}
                    class="bg-[#C392EC] hover:bg-[#B580E1] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                    Apply Filters
                </button>
                <button
                    onclick={clearFilters}
                    class="bg-[#3B3B3B] hover:bg-[#4B4B4B] text-[#F0F0F0] px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                    Clear
                </button>
            </div>
        </div>
    </div>
    
    <!-- Users Table -->
    <div class="bg-[#2B2B2B] rounded-xl border border-[#3B3B3B] overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-[#3B3B3B]">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">User</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Role</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Joined</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Referral Code</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[#3B3B3B]">
                    {#each users as user}
                        <tr class="hover:bg-[#3B3B3B] transition-colors duration-200">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <div class="flex-shrink-0 h-10 w-10">
                                        <div class="h-10 w-10 rounded-full bg-[#C392EC] flex items-center justify-center">
                                            <span class="text-sm font-medium text-white">
                                                {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                                            </span>
                                        </div>
                                    </div>
                                    <div class="ml-4">
                                        <div class="text-sm font-medium text-[#F0F0F0]">{user.name || 'No name'}</div>
                                        <div class="text-sm text-[#A0A0A0]">{user.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full {
                                    user.role === 'admin' || user.role === 'super_admin' 
                                        ? 'bg-[#C392EC]/10 text-[#C392EC]' 
                                        : 'bg-blue-500/10 text-blue-400'
                                }">
                                    {user.role || 'user'}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-[#A0A0A0]">
                                {formatDate(user.created)}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-[#F0F0F0] font-mono">
                                {user.referralCode || 'N/A'}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">
                                <div class="flex items-center space-x-2">
                                    <button
                                        onclick={() => viewReferralTree(user.id)}
                                        class="text-[#85D5C8] hover:text-[#6BC4B6] transition-colors duration-200"
                                        title="View Referral Tree"
                                    >
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                        </svg>
                                    </button>
                                    <button
                                        onclick={() => openRoleModal(user)}
                                        class="text-[#C392EC] hover:text-[#B580E1] transition-colors duration-200"
                                        title="Edit Role"
                                    >
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                        </svg>
                                    </button>
                                    <button
                                        onclick={() => openDeleteModal(user)}
                                        class="text-red-400 hover:text-red-300 transition-colors duration-200"
                                        title="Delete User"
                                    >
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
    
    <!-- Pagination -->
    {#if totalPages > 1}
        <div class="mt-6 flex items-center justify-between">
            <div class="text-sm text-[#A0A0A0]">
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalUsers)} of {totalUsers} users
            </div>
            <div class="flex items-center space-x-2">
                <button
                    onclick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    class="px-3 py-2 rounded-lg bg-[#3B3B3B] text-[#F0F0F0] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4B4B4B] transition-colors duration-200"
                >
                    Previous
                </button>
                
                {#each Array.from({length: Math.min(5, totalPages)}, (_, i) => i + Math.max(1, currentPage - 2)) as pageNum}
                    {#if pageNum <= totalPages}
                        <button
                            onclick={() => goToPage(pageNum)}
                            class="px-3 py-2 rounded-lg transition-colors duration-200 {
                                pageNum === currentPage 
                                    ? 'bg-[#C392EC] text-white' 
                                    : 'bg-[#3B3B3B] text-[#F0F0F0] hover:bg-[#4B4B4B]'
                            }"
                        >
                            {pageNum}
                        </button>
                    {/if}
                {/each}
                
                <button
                    onclick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    class="px-3 py-2 rounded-lg bg-[#3B3B3B] text-[#F0F0F0] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4B4B4B] transition-colors duration-200"
                >
                    Next
                </button>
            </div>
        </div>
    {/if}
</div>

<!-- Role Update Modal -->
{#if showRoleModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onclick={() => showRoleModal = false}>
        <div class="bg-[#2B2B2B] rounded-lg p-6 w-full max-w-md mx-4" onclick={(e) => e.stopPropagation()}>
            <h3 class="text-lg font-semibold text-[#F0F0F0] mb-4">Update User Role</h3>
            <p class="text-[#A0A0A0] mb-4">
                Updating role for: <span class="text-[#F0F0F0] font-medium">{userToUpdateRole?.name || userToUpdateRole?.email}</span>
            </p>
            
            <div class="mb-4">
                <label class="block text-sm font-medium text-[#F0F0F0] mb-2">New Role</label>
                <select
                    bind:value={newRole}
                    class="w-full bg-[#3B3B3B] border border-[#4B4B4B] rounded-lg px-3 py-2 text-[#F0F0F0] focus:outline-none focus:border-[#C392EC]"
                >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                </select>
            </div>
            
            <div class="flex justify-end space-x-3">
                <button
                    onclick={() => showRoleModal = false}
                    class="px-4 py-2 text-[#A0A0A0] hover:text-[#F0F0F0] transition-colors duration-200"
                >
                    Cancel
                </button>
                <button
                    onclick={updateRole}
                    disabled={loading}
                    class="bg-[#C392EC] hover:bg-[#B580E1] disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                    {loading ? 'Updating...' : 'Update Role'}
                </button>
            </div>
        </div>
    </div>
{/if}

<!-- Delete Confirmation Modal -->
{#if showDeleteModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onclick={() => showDeleteModal = false}>
        <div class="bg-[#2B2B2B] rounded-lg p-6 w-full max-w-md mx-4" onclick={(e) => e.stopPropagation()}>
            <h3 class="text-lg font-semibold text-[#F0F0F0] mb-4">Delete User</h3>
            <p class="text-[#A0A0A0] mb-4">
                Are you sure you want to delete: <span class="text-[#F0F0F0] font-medium">{userToDelete?.name || userToDelete?.email}</span>?
            </p>
            <p class="text-red-400 text-sm mb-4">This action cannot be undone.</p>
            
            <div class="flex justify-end space-x-3">
                <button
                    onclick={() => showDeleteModal = false}
                    class="px-4 py-2 text-[#A0A0A0] hover:text-[#F0F0F0] transition-colors duration-200"
                >
                    Cancel
                </button>
                <button
                    onclick={deleteUser}
                    disabled={loading}
                    class="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                    {loading ? 'Deleting...' : 'Delete User'}
                </button>
            </div>
        </div>
    </div>
{/if}
