<script>
    import Hero from '$lib/components/Hero.svelte';
    import Product from '$lib/components/Product.svelte';
    import Aboutus from '$lib/components/Aboutus.svelte';
    import Reviews from '$lib/components/Reviews.svelte';
    import Support from '$lib/components/Support.svelte';
    import StatCard from '$lib/components/StatCard.svelte';
</script>

<svelte:head>
    <title>Cashfluenced - Build Your Faceless Income Stream</title>
    <meta name="description" content="Learn how to make money on social media without ever showing your face. Join our creator network and start your journey to real digital income today!" />
</svelte:head>

<main class="bg-[#1A1A1A]">
    <section id="home" aria-labelledby="hero-heading">
        <Hero />
    </section>
    
    <section id="services" aria-labelledby="services-heading">
        <Product />
    </section>
    
    <section id="about" aria-labelledby="about-heading">
        <Aboutus />
    </section>
    
    <section id="reviews" aria-labelledby="reviews-heading">
        <Reviews />
    </section>
    
    <section id="stats" aria-labelledby="stats-heading">
        <StatCard />
    </section>
    
    <section id="support" aria-labelledby="contact-heading">
        <Support />
    </section>
</main>