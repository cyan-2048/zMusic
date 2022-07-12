<script>
	import { fadeScaleIn, focusable, settings, songs } from "../lib/shared";
	import { onMount } from "svelte";
	import { link } from "svelte-spa-router";

	if (DEBUG) {
		window.changeSettings = (e) => ($settings = { ...$settings, ...e });
	}

	let state = 0;
</script>

<main in:fadeScaleIn>
	<div class="flex2">
		<div class="page1">
			<a href="/music" use:focusable use:link>Music</a>
			<main>
				<h1>Hello!</h1>
				<p>{JSON.stringify($settings, null, 2)}</p>
				<p>Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.</p>
			</main>
		</div>
		<div class="page2">add nowplaying and album history</div>
		<div class="page3">add new albums</div>
	</div>
</main>

<style>
	.flex2 {
		display: flex;
		height: 100%;
	}
	.flex2 > * {
		overflow: auto;
		flex-grow: 0;
		flex-shrink: 0;
	}
	.page1,
	.page2 {
		width: 220px;
	}
	.page3 {
		width: 240px;
	}
</style>
