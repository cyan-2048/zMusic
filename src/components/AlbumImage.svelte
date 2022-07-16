<script>
	import { albums } from "../lib/shared";

	export let size = 32;
	export let cover = null;

	let alt = "",
		src = null;

	const album = $albums.get(cover);
	if (album) {
		alt = album.name;
	} else cover = null;
</script>

<img {alt} width={size} height={size} {src} />

<style>
	img {
		object-fit: contain;
		object-position: center;
		overflow: hidden;
		font-size: 10px;
	}
</style>
