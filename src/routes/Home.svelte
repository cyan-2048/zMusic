<script>
	import { fadeScaleIn, focusable, settings, sn, songs } from "../lib/shared";
	import { onMount } from "svelte";
	import { link } from "svelte-spa-router";
	import scrollIntoView from "scroll-into-view";
	import { children } from "svelte/internal";
	import { quintInOut } from "svelte/easing";

	let state = 0,
		title = null,
		tabs_container = null;

	function decideTranslateX(state, title) {
		if (!title) return null;
		const width = title.offsetWidth;
		if (window.innerWidth > width) return null;
		const map = [null, width / 4, width / 2 - 10][state];
		if (map === null) return null;
		return `translateX(-${map + "px"})`;
	}

	$: transform = decideTranslateX(state, title);

	onMount(() => {
		for (let index = 1; index < 4; index++) {
			sn.add({
				id: "page" + index,
				selector: `.page${index} [data-focusable]`,
				restrict: "self-only",
				rememberSource: true,
			});
		}
		sn.disable("default");
		sn.focus("page1");
		return () => {
			for (let index = 1; index < 4; index++) {
				sn.remove("page" + index);
			}
			sn.enable("default");
		};
	});

	let busy = false;
</script>

<svelte:window
	on:sn:navigatefailed={async function ({ detail: { direction } }) {
		if (busy) return;
		busy = true;

		if ((direction === "left" && state > 0) || (direction === "right" && state < 2)) {
			if (direction === "left") {
				state -= 1;
			} else {
				state += 1;
			}
			await new Promise((res) =>
				scrollIntoView(
					tabs_container.children[state],
					{
						time: 300,
						align: {
							left: 0,
							top: 0,
						},
						isScrollable: () => true,
						easing: quintInOut,
					},
					res
				)
			);
			sn.focus("page" + (state + 1));
		}

		busy = false;
	}}
/>

<main in:fadeScaleIn>
	<div style:transform bind:this={title} class="title">{$settings.title}</div>
	<div class="another_wrap_bruh">
		<div bind:this={tabs_container} class="flex2">
			<div class="page1">
				<a href="/music" use:focusable use:link>music</a>
				<a href="/videos" use:focusable use:link={{ disabled: true }}>videos</a>
				<a href="/settings" use:focusable use:link>settings</a>
			</div>
			<div class="page2">
				<p use:focusable>add nowplaying and album history</p>
			</div>
			<div class="page3"><p use:focusable>add new albums</p></div>
		</div>
	</div>
</main>

<style>
	main {
		overflow: -moz-hidden-unscrollable;
		overflow: clip;
	}
	.title {
		position: absolute;
		top: 18px;
		font-size: 70px;
		font-weight: lighter;
		left: 14px;
		height: 70px;
		color: var(--accent, grey);
		transition: transform 0.5s;
		z-index: -5;
		display: block;
		line-height: 70px;
	}
	.flex2 {
		display: flex;
		height: 100%;
		width: -moz-fit-content;
		width: fit-content;
	}
	.flex2 > * {
		overflow: auto;
		flex-grow: 0;
		flex-shrink: 0;
		padding: 10px;
		padding-top: 62px;
	}
	.another_wrap_bruh {
		width: 100vw;
		height: 100vh;
		position: fixed;
		top: 0;
		left: 0;
		overflow: hidden;
	}
	.page1,
	.page2 {
		width: 220px;
	}
	.page3 {
		width: 240px;
	}
</style>
