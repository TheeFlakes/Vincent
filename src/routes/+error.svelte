<script>
    import { page } from '$app/stores';
</script>

<svelte:head>
    <title>Error - Vincent</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-[#1A1A1A] py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 text-center">
        <div>
            <h1 class="text-6xl font-bold text-red-600">{$page.status}</h1>
            <h2 class="mt-6 text-3xl font-extrabold text-[#F0F0F0]">
                {#if $page.status === 404}
                    Page Not Found
                {:else if $page.status === 403}
                    Access Denied
                {:else if $page.status === 401}
                    Unauthorized
                {:else}
                    Something went wrong
                {/if}
            </h2>
            <p class="mt-2 text-[#A0A0A0]">
                {$page.error?.message || 'An unexpected error occurred'}
            </p>
        </div>
        
        <div class="flex flex-col space-y-4">
            {#if $page.status === 401 || $page.status === 403}
                <a
                    href="/login"
                    class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#C392EC] hover:bg-[#B580E1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C392EC]"
                >
                    Go to Login
                </a>
            {/if}
            
            <a
                href="/"
                class="w-full flex justify-center py-2 px-4 border border-[#2B2B2B] rounded-md shadow-sm text-sm font-medium text-[#F0F0F0] bg-[#2B2B2B] hover:bg-[#3A3A3A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#85D5C8]"
            >
                Go Home
            </a>
            
            <button
                onclick={() => history.back()}
                class="w-full flex justify-center py-2 px-4 border border-[#2B2B2B] rounded-md shadow-sm text-sm font-medium text-[#F0F0F0] bg-[#2B2B2B] hover:bg-[#3A3A3A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#85D5C8]"
            >
                Go Back
            </button>
        </div>
    </div>
</div>
