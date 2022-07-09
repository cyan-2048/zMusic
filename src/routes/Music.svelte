<script>
	import Tabs from "../components/Tabs.svelte";
	import { push, pop, replace, location } from "svelte-spa-router";
	import { last, promiseState } from "../lib/helper";
	import { onMount } from "svelte";
	import { fade } from "svelte/transition";
	import { music as page } from "./stores.js";
	import { fadeScale } from "../lib/shared";

	const tabs = ["artists", "albums", "songs", "genres", "playlists"];

	let tabs_el;

	let promise = Promise.resolve();

	onMount(() => {
		tabs_el.replaceIndex($page);
		replace("/music/" + tabs[$page]);

		const onkeydown = async ({ key }) => {
			if (!(await promiseState(promise))) return;

			if (key === "ArrowLeft") {
				await (promise = tabs_el.previous());
				$page = $page === 0 ? 4 : $page - 1;
				replace("/music/" + tabs[$page]);
			}
			if (key === "ArrowRight") {
				await (promise = tabs_el.next());
				$page = $page === 4 ? 0 : $page + 1;
				replace("/music/" + tabs[$page]);
			}
			if (key === "Backspace") {
				pop();
			}
		};

		window.addEventListener("keydown", onkeydown);

		return () => {
			window.removeEventListener("keydown", onkeydown);
		};
	});
</script>

<main transition:fadeScale>
	<Tabs bind:this={tabs_el} {tabs} />
</main>
