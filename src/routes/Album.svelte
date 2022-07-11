<script>
	import { onMount } from "svelte";
	import { location } from "svelte-spa-router";

	import { pop } from "svelte-spa-router/Router.svelte";
	import { get } from "svelte/store";
	import Tabs from "../components/Tabs.svelte";
	import { last } from "../lib/helper";
	import { albums, fadeScaleIn, sn, songs } from "../lib/shared";

	const hash = last($location.split("/"));

	let selected = 0;
	let tabs_el;
	let busy = false;

	onMount(() => sn.focus());

	const _songs =
		$albums
			.get(hash === "null" ? null : hash)
			?.songs.map((a) => $songs.get(a))
			.sort((a, b) => {
				const _a = a.track || 0;
				const _b = b.track || 0;
				return _a - _b;
			}) || [];
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
/>

<!--

-->
<main bind:this={tabs_el} in:fadeScaleIn>
	<Tabs tabs={["songs", "review"]} />
	<div>
		{#each _songs as { title, hash, track }, i}
			<div data-focusable data-hash={hash} tabindex={i}>{track}. {title}</div>
		{/each}
	</div>
</main>
