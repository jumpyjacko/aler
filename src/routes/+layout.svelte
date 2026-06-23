<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
    import { resolve } from '$app/paths';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<nav class="sticky left-0 top-0 w-full flex flex-row px-8 py-2 justify-between bg-white">
    <a href="{resolve('/')}">aler</a>

    <div class="flex flex-row gap-4">
        <a href="{resolve('/')}">Home</a>
        <a href="{resolve('/rating')}">Rating</a>
        <a href="{resolve('/leaderboard')}">Leaderboard</a>
        <a href="{resolve('/statistics')}">Stats</a>
    </div>
</nav>

{@render children()}
