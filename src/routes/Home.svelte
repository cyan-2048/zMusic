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
	<a href="/music" use:focusable use:link>Music</a>
	<main>
		<h1>Hello!</h1>
		<p>{JSON.stringify($settings, null, 2)}</p>
		<p>Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.</p>
	</main>
</main>

<style>
</style>
