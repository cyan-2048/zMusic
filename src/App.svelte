<script>
	export let name = "cyan";
	import { settings, songs } from "./lib/shared";
	import { init } from "./lib/database";
	import { onMount } from "svelte";
	import resizeImage from "./lib/ImageResizer";

	window.changeSettings = (e) => ($settings = { ...$settings, ...e });
	window.resizeImage = resizeImage;

	let songs_len = null;

	onMount(async () => {
		await init();
		songs_len = $songs.length;
	});
</script>

<main>
	<h1>Hello {name}!</h1>
	<p>{JSON.stringify($settings, null, 2)}</p>
	<p>{songs_len}</p>
	<p>Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.</p>
</main>
