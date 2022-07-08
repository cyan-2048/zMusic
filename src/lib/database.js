import { get } from "svelte/store";
import { albums, artists, genres, settings, songs as $songs } from "./shared";
import parseAudio from "./audio-parser";
import { cleanObject, hashCode, last, randomString } from "./helper";
import my_music from "../../private/my music.json";

let ready = false;

function hashAudio({ title, artist, album, filename }) {
	return hashCode("" + title + artist + album + filename);
}

function createMusicObject(obj) {
	return { ...obj, hash: hashAudio(obj) };
}

function alphabeticalSort(a, b) {
	const toCompare = "name" in a ? "name" : "title";
	if (a[toCompare] === null) return -1;
	if (b[toCompare] === null) return 1;
	return a[toCompare].localeCompare(b[toCompare]);
}

async function loadMusic(storage, $settings) {
	const nomedia = [];
	const array = [];
	if (!PRODUCTION) return my_music;
	return new Promise((res) => {
		const cursor = storage.enumerate();
		cursor.onsuccess = async function () {
			if (!cursor.result) {
				return res($settings.nomedia ? array.filter((a) => !nomedia.find((e) => a.filename.startsWith(e))) : array);
			}
			const filename = cursor.result.name;
			if ($settings.nomedia && filename.endsWith(".nomedia")) nomedia.push(filename.slice(0, -8));
			else if (filename.endsWith(".mp3") && (!$settings.nomedia || !nomedia.find((e) => filename.startsWith(e)))) {
				try {
					const { picture, rated, played, ...obj } = await parseAudio(cursor.result);
					const { artist = null, title = null, album = null } = cleanObject(obj);
					if (!$settings.strictID3) {
						array.push(createMusicObject({ ...obj, title, artist, album, filename }));
					} else if (artist && title && album) {
						array.push(createMusicObject(obj));
					}
				} catch (e) {
					console.error("audio parser:", e);
					if (!$settings.strictID3) {
						array.push(createMusicObject({ title: last(filename.split("/")), artist: null, album: null, filename }));
					}
				}
			}
			cursor.continue();
		};
		cursor.onerror = (e) => console.error("file cursor:", e);
	});
}

async function loadData() {
	await settings.init;
	DEBUG && console.log("loadData start");
	const start = new Date();
	const $settings = get(settings);
	const storages = navigator.mozApps ? navigator.getDeviceStorages($settings.nomedia ? "sdcard" : "music") : [{}];
	const array = (await Promise.all(storages.map((storage) => loadMusic(storage, $settings)))).flat();
	array.sort(alphabeticalSort);
	DEBUG && console.log("loadData: " + (new Date() - start) / 1000 + "s");
	return array;
}

function isAlpha(string) {
	const first = String(string).charAt(0);
	if (!isNaN(first)) return false;
	return "0".localeCompare(first) < 0;
}

export function hashAlbum({ album, artist, year }) {
	if (album === null) return null;
	return hashCode("" + album + (artist ? artist.split(", ")[0] : null), +(year || ""));
}

function siftAlbums(songs) {
	const set = [];
	const albums = [];

	const len = songs.length;
	for (let i = 0; i < len; i++) {
		const song = songs[i];
		const hash = hashAlbum(song);
		if (set.includes(hash)) continue;
		const { album: name, artist, year, filename } = song;
		set.push(hash);
		// idk not sure if
		// searching from an array of string is faster than array of objects
		albums.push({ name, artist, year, hash, filename });
	}
	albums.sort(alphabeticalSort);
	return albums;
}

function siftGenres(songs) {
	const map = {};
	const genres = [];

	const len = songs.length;
	for (let i = 0; i < len; i++) {
		const song = songs[i];
		const { genre } = song;
		if (!genre) continue;
		if (genre in map) {
			map[genre].push(song);
		} else {
			map[genre] = [song];
		}
	}

	Object.entries(map).forEach(([name, songs]) => {
		const albums = [...new Set(songs.map(hashAlbum))];
		genres.push({ name, albums, cover: albums[0] || null });
	});

	genres.sort(alphabeticalSort);
	return genres;
}

function siftArtists(songs) {
	const map = {};
	const artists = [];

	const avoidNull = randomString();

	const len = songs.length;
	for (let i = 0; i < len; i++) {
		const song = songs[i];
		const { artist } = song;

		const name = artist?.split(", ")[0] || avoidNull;

		if (name in map) {
			map[name].push(song);
		} else {
			map[name] = [song];
		}
	}

	Object.entries(map).forEach(([name, songs]) => {
		if (name === avoidNull) name = null;
		const albums = [...new Set(songs.map(hashAlbum))];
		artists.push({ name, albums, cover: albums[0] });
	});

	artists.sort(alphabeticalSort);
	return artists;
}

export async function init(cb) {
	if (ready) return true;
	await Promise.all([$songs, albums].map((a) => a.init));

	let songs = get($songs);
	if (songs.length === 0) {
		songs = await loadData();
		$songs.set(songs);
	}
	DEBUG && console.log("songs:", songs);

	albums.set(siftAlbums(songs));
	DEBUG && console.log("sifted albums:", get(albums));

	genres.set(siftGenres(songs));
	DEBUG && console.log("sifted genres:", get(genres));

	artists.set(siftArtists(songs));
	DEBUG && console.log("sifted artists:", get(artists));
}
