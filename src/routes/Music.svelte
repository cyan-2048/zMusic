<script>
	import Tabs from "../components/Tabs.svelte";
	import { push, pop, replace, location } from "svelte-spa-router";
	import { centerScroll, delay, last } from "../lib/helper";
	import { onMount, tick } from "svelte";
	import { music as page, music_lastFocused as lastFocused } from "./stores.js";
	import { albums, artists, fadeScaleIn, focusable, genres, sn, songs, tabby } from "../lib/shared";
	import ListItem from "../components/ListItem.svelte";
	import { hashAlbum } from "../lib/database";
	import AlbumItem from "../components/AlbumItem.svelte";

	const tabs = ["artists", "albums", "songs", "genres", "playlists"];

	let tabs_el;
	let busy = false;
	let main;

	let direction = null;

	async function focusLastFocused() {
		const { index, scrollTop } = $lastFocused[$page];
		const _main = this instanceof Element ? this : main;
		const el = _main.querySelector(`[tabindex="${index}"]`);
		if (el) {
			el.parentNode.scrollTop = scrollTop;
			el.focus();
			centerScroll(el, true);
		} else {
			sn.focus();
		}
	}

	onMount(async () => {
		tabs_el.replaceIndex($page);
		await tick();
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
	on:sn:navigatefailed={async function ({ detail: { direction: _direction } }) {
		if (busy) return;
		busy = true;

		if (_direction === "left" || _direction === "right") {
			let promise;
			direction = _direction;
			if (_direction === "left") {
				promise = tabs_el.previous();
				$page = $page === 0 ? 4 : $page - 1;
			} else {
				promise = tabs_el.next();
				$page = $page === 4 ? 0 : $page + 1;
			}
			await tick();
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
	<div class="content">
		{#if $page === 0}
			<!-- artists -->
			<div on:introstart={focusLastFocused} out:tabby|local={{ direction, go: false }} in:tabby={{ direction }}>
				{#each [...$artists.values()] as { name, cover }, i (name)}
					<ListItem {cover} tabindex={i}><span>{name ?? "Unknown Artist"}</span></ListItem>
				{/each}
			</div>
		{:else if $page === 1}
			<!-- albums -->
			<div on:introstart={focusLastFocused} out:tabby|local={{ direction, go: false }} in:tabby={{ direction }}>
				{#each [...$albums] as [hash], i (hash)}
					<AlbumItem {hash} on:click={() => push("/albums/" + hash)} tabindex={i} />
				{/each}
			</div>
		{:else if $page === 2}
			<!-- songs -->
			<div on:introstart={focusLastFocused} out:tabby|local={{ direction, go: false }} in:tabby={{ direction }}>
				{#each [...$songs.values()] as { hash, title, artist, ...obj }, i (hash)}
					<ListItem cover={hashAlbum({ ...obj, artist })} tabindex={i}>
						<span>
							{title}
						</span>
						<span>
							{artist}
						</span>
					</ListItem>
				{/each}
			</div>
		{:else if $page === 3}
			<!-- genres -->
			<div on:introstart={focusLastFocused} out:tabby|local={{ direction, go: false }} in:tabby={{ direction }}>
				{#each [...$genres.values()] as { name, cover }, i (name)}
					<ListItem {cover} tabindex={i}><span>{name}</span></ListItem>
				{/each}
			</div>
		{:else if $page === 4}
			<!-- playlists -->
			<div on:introstart={focusLastFocused} out:tabby|local={{ direction, go: false }} in:tabby={{ direction }}>
				<div data-focusable tabindex={0}>Not Implemented</div>
			</div>
		{/if}
	</div>
</main>

<style>
	.content {
		flex: 2;
		position: relative;
	}
	.content > * {
		position: absolute;
		left: 0;
		top: 0;
		overflow: auto;
		height: 100%;
		width: 100%;
	}
</style>
