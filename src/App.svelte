<script>
	import { settings } from "./lib/shared";
	import { init } from "./lib/database";
	import { onMount } from "svelte";

	import Router, { location } from "svelte-spa-router";
	import Home from "./routes/Home.svelte";
	import Music from "./routes/Music.svelte";
	import Album from "./routes/Album.svelte";
	import Genre from "./routes/Genre.svelte";

	window.addEventListener("keydown", (e) => {
		if ($location !== "/") return;
		const { target, key } = e;
		if (key === "Backspace" && (!("value" in target) || target.value === "")) e.preventDefault();
	});

	if (DEBUG) {
		window.changeSettings = (e) => ($settings = { ...$settings, ...e });
	}

	let ready = false;
	onMount(async () => {
		await init();
		ready = true;
	});

	const routes = {
		"/": Home,
		"/music/:page?": Music,
		"/music/albums/:hash": Album,
		"/music/genres/:hash": Genre,
	};
</script>

{#if ready}
	<Router {routes} />
{/if}
