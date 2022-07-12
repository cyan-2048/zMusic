<script>
	import { onMount, tick } from "svelte";
	import { location } from "svelte-spa-router";

	import { pop } from "svelte-spa-router/Router.svelte";
	import { get } from "svelte/store";
	import Tabs from "../components/Tabs.svelte";
	import { last } from "../lib/helper";
	import { albums, fadeScaleIn, sn, songs } from "../lib/shared";

	// export let params = {}; // seems broken on KaiOS
	export let review = null;

	let selected = 0;
	let tabs_el;
	let busy = false;
	let _songs = [];
	let hash = null;

	onMount(async () => {
		hash = last($location.split("/"));
		_songs = $albums
			.get(hash === "null" ? null : hash)
			?.songs.map((a) => $songs.get(a))
			.filter((a) => a)
			.sort((a, b) => {
				const _a = a.track || 0;
				const _b = b.track || 0;
				return _a - _b;
			});
		await tick();
		sn.focus();
	});
</script>

<svelte:window
	on:keydown={async function ({ key }) {
		if (busy) return;
		busy = true;
		if (key === "Backspace") {
			await pop();
		}
		busy = false;
	}}
	on:sn:navigatefailed={async function ({ detail: { direction } }) {
		if (busy) return;
		busy = true;

		if (review !== null) {
			if (direction === "right" || direction === "left") {
				let promise;
				if (direction === "right") {
					promise = tabs_el.next();
				} else {
					promise = tabs_el.previous();
				}
				await promise;
				await tick();
				sn.focus();
			}
		} else {
		}

		busy = false;
	}}
/>

<main bind:this={tabs_el} in:fadeScaleIn>
	<Tabs bind:this={tabs_el} tabs={review !== null ? ["songs", "review"] : ["songs"]} />
	<div>
		{#each _songs as { title, hash, track }, i}
			<div data-focusable data-hash={hash} tabindex={i}>{track}. {title}</div>
		{/each}
	</div>
</main>
