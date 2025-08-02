<script>
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { currentUser } from '$lib/pocketbase.js';
	import { page } from '$app/stores';
	import Navbar from '$lib/components/Navbar.svelte';
	
	let { children, data } = $props();
	
	// Use server-side data first, fallback to store
	const user = $derived(data.user || $currentUser);
	
	// Check if current route is auth-related or protected
	const isAuthPage = $derived($page.route.id?.includes('(auth)') || false);
	const isProtectedPage = $derived($page.route.id?.includes('(protected)') || false);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if !isProtectedPage}
	<Navbar {user} {isAuthPage} />
{/if}

{@render children?.()}
