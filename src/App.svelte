<script>
	import { settings } from "./lib/shared";
	import { init } from "./lib/database";
	import { onMount } from "svelte";

	import "./assets/global.css";

	import Router, { location } from "svelte-spa-router";
	import Home from "./routes/Home.svelte";
	import Music from "./routes/Music.svelte";
	import Album from "./routes/Album.svelte";
	import Genre from "./routes/Genre.svelte";
	import localforage from "localforage";
	import { mountDirection } from "./routes/stores";
	import Settings from "./routes/Settings.svelte";

	if (DEBUG) {
		window.changeSettings = (e) => ($settings = { ...$settings, ...e });
	}

	let ready = false;

	async function load() {
		ready = false;
		await localforage.ready();
		await init();
		ready = true;
	}

	onMount(load);

	const routes = {
		"/": Home,
		"/music/": Music,
		"/albums/:hash": Album,
		"/genres/:hash": Genre,
		"/settings/": Settings,
	};
</script>

<svelte:window
	on:keydown={async (e) => {
		const { key, target } = e;
		$mountDirection = key === "Backspace" ? 0 : 1;
		if ($location !== "/") {
			if (key === "Backspace" && (!("value" in target) || target.value === "")) e.preventDefault();
		}
	}}
/>
{#if ready}
	<Router {routes} />
{:else}
	<main>Loading...</main>
{/if}
