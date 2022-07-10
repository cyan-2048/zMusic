<script>
	import Tabs from "../components/Tabs.svelte";
	import { push, pop, replace, location } from "svelte-spa-router";
	import { last } from "../lib/helper";
	import { onMount } from "svelte";
	import { music as page, music_hash as lastHash } from "./stores.js";
	import { albums, artists, fadeScaleIn, fadeScaleOut, focusable, genres, songs } from "../lib/shared";

	const tabs = ["artists", "albums", "songs", "genres", "playlists"];

	let tabs_el;
	let busy = false;

	let direction = null;

	onMount(() => {
		tabs_el.replaceIndex($page);
		replace("/music/" + tabs[$page]);
	});
</script>

<svelte:window
	on:keydown={async function ({ key }) {
		if (busy) return;
		busy = true;

		if (key === "ArrowLeft") {
			await tabs_el.previous();
			$page = $page === 0 ? 4 : $page - 1;
			replace("/music/" + tabs[$page]);
		}
		if (key === "ArrowRight") {
			await tabs_el.next();
			$page = $page === 4 ? 0 : $page + 1;
			replace("/music/" + tabs[$page]);
		}
		if (key === "Backspace") {
			pop();
		}
		busy = false;
	}}
/>

<main class="flex" in:fadeScaleIn out:fadeScaleOut>
	<Tabs bind:this={tabs_el} {tabs} />
	{#if $page === 0}
		<!-- artists -->
		<div>
			{#each $artists as item}
				<div use:focusable>{item.name ?? "Unknown Artist"}</div>
			{/each}
		</div>
	{:else if $page === 1}
		<!-- albums -->
		<div>
			{#each $albums as item}
				<div use:focusable>{item.name ?? "Unknown Album"}</div>
			{/each}
		</div>
	{:else if $page === 2}
		<!-- songs -->
		<div>
			{#each $songs as item}
				<div use:focusable>{item.title}</div>
			{/each}
		</div>
	{:else if $page === 3}
		<!-- genres -->
		<div>
			{#each $genres as item}
				<div use:focusable>{item.name}</div>
			{/each}
		</div>
	{:else if $page === 4}
		<!-- playlists -->
		<div>
			<div use:focusable>Not Implemented</div>
		</div>
	{/if}
</main>

<style>
	main > div {
		flex: 2;
		overflow: auto;
	}
</style>
