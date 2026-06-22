<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<nav class="sticky left-0 top-0 w-full flex flex-row px-8 py-2 justify-between">
    <a href="/">aler</a>

    <div class="flex flex-row gap-4">
        <a href="/">Home</a>
        <a href="/rating">Rating</a>
        <a href="/leaderboard">Leaderboard</a>
        <a href="/statistics">Stats</a>
    </div>
</nav>

{@render children()}
