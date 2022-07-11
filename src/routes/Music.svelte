<script>
	import Tabs from "../components/Tabs.svelte";
	import { push, pop, replace, location } from "svelte-spa-router";
	import { centerScroll, delay, last } from "../lib/helper";
	import { onMount, tick } from "svelte";
	import { music as page, music_lastFocused as lastFocused } from "./stores.js";
	import { albums, artists, fadeScaleIn, focusable, genres, sn, songs } from "../lib/shared";

	const tabs = ["artists", "albums", "songs", "genres", "playlists"];

	let tabs_el;
	let busy = false;
	let main;

	let direction = null;

	async function focusLastFocused() {
		const { index, scrollTop } = $lastFocused[$page];
		const el = main.querySelector(`[tabindex="${index}"]`);
		if (el) {
			el.parentNode.scrollTop = scrollTop;
			el.focus();
		}
	}

	onMount(async () => {
		tabs_el.replaceIndex($page);
		focusLastFocused();
	});
</script>

<svelte:window
	on:sn:willunfocus={async (e) => {
		const { nextElement: next, native } = e.detail;
		await centerScroll(next);
		$lastFocused[$page].index = next.tabIndex;
		$lastFocused[$page].scrollTop = next.parentNode.scrollTop;
	}}
	on:sn:navigatefailed={async function ({ detail: { direction } }) {
		if (busy) return;
		busy = true;

		if (direction === "left" || direction === "right") {
			let promise;
			if (direction === "left") {
				promise = tabs_el.previous();
				$page = $page === 0 ? 4 : $page - 1;
			} else {
				promise = tabs_el.next();
				$page = $page === 4 ? 0 : $page + 1;
			}
			await tick();
			await focusLastFocused();
			await promise;
			sn.focus();
		}

		busy = false;
	}}
	on:keydown={async function ({ key, target }) {
		if (busy) return;
		busy = true;
		if (key === "Backspace") {
			await pop();
		}
		if (key === "Enter") {
			target.click();
		}
		busy = false;
	}}
/>

<main bind:this={main} class="flex" in:fadeScaleIn>
	<Tabs bind:this={tabs_el} {tabs} />
	{#if $page === 0}
		<!-- artists -->
		<div>
			{#each [...$artists.values()] as item, i (item.name)}
				<div data-focusable tabindex={i}>{item.name ?? "Unknown Artist"}</div>
			{/each}
		</div>
	{:else if $page === 1}
		<!-- albums -->
		<div>
			{#each [...$albums.values()] as { hash, name }, i (hash)}
				<div data-focusable on:click={() => push("/albums/" + hash)} tabindex={i}>{name ?? "Unknown Album"}</div>
			{/each}
		</div>
	{:else if $page === 2}
		<!-- songs -->
		<div>
			{#each [...$songs.values()] as item, i (item.hash)}
				<div data-focusable tabindex={i}>{item.title}</div>
			{/each}
		</div>
	{:else if $page === 3}
		<!-- genres -->
		<div>
			{#each [...$genres.values()] as { name }, i (name)}
				<div data-focusable on:click={() => push("/genres/" + name)} tabindex={i}>
					{name}
				</div>
			{/each}
		</div>
	{:else if $page === 4}
		<!-- playlists -->
		<div>
			<div data-focusable tabindex={0}>Not Implemented</div>
		</div>
	{/if}
</main>

<style>
	main > div {
		flex: 2;
		overflow: auto;
	}
</style>
