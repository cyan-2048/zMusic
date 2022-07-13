<script>
	import { pop } from "svelte-spa-router";

	import { fadeScaleIn, settings } from "../lib/shared";

	let busy = false;
</script>

<svelte:window
	on:keydown={async function ({ key }) {
		if (busy) return;
		busy = true;

		if (key === "Backspace") await pop();

		busy = false;
	}}
/>

<main in:fadeScaleIn>
	<h1>Hello!</h1>
	<p>{JSON.stringify($settings, null, 2)}</p>
	<p>Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.</p>
</main>
