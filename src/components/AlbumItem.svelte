<script>
	import { albums } from "../lib/shared";

	export let type = 0; // [grid, list]
	export let subtext = 0; // [artist, year]
	export let hash = null;
	export let tabindex = 0;

	let src = null,
		alt = null;

	const album = $albums.get(hash);

	if (album) {
		alt = album.name;
	}
</script>

<main data-focusable on:click {tabindex} class:grid={type === 0}>
	<img {src} alt={alt || "​"} />
	<div class="text">
		<span>{album.name ?? "Unknown Album"}</span>
		<span>{(subtext === 0 ? album.artist : album.year) || ""}</span>
	</div>
</main>

<style>
	main,
	span {
		overflow: hidden;
	}
	img {
		font-size: 10px;
	}
	.grid {
		height: 142px;
		width: 113px;
		padding: 1px;
		display: inline-flex;
		flex-direction: column;
	}
	.grid img {
		width: 103px;
		height: 103px;
	}
	.grid .text {
		padding: 4px;
	}
	.grid span {
		white-space: nowrap;
		text-overflow: ellipsis;
		line-height: 1.2;
	}
	.grid span:first-child {
		font-size: 12px;
	}
	.grid span:last-child {
		font-size: 10px;
	}
	.text {
		display: flex;
		flex-direction: column;
	}
	span:last-child {
		color: grey;
	}
</style>
