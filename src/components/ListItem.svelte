<script>
	import { onMount } from "svelte";

	export let tabindex,
		cover = null;

	let src = null;

	onMount(async () => {
		if (cover) {
			//do shit
		}
	});
</script>

<main data-focusable {tabindex}>
	<img {src} />
	<div>
		<slot />
	</div>
</main>

<style>
	main {
		display: flex;
		height: 48px;
		padding: 1px;
	}
	img {
		width: 38px;
		height: 38px;
		object-fit: contain;
		object-position: center;
	}
	div {
		flex: 2;
		display: flex;
		flex-direction: column;
		justify-content: center;
		white-space: nowrap;
		overflow: hidden;
		padding-left: 6px;
	}
	div > :global(*) {
		overflow: hidden;
		text-overflow: ellipsis;
	}
	div > :global(*:nth-child(2)) {
		font-size: 12px;
		color: grey;
	}
</style>
