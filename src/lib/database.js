import { get } from "svelte/store";
import { albums, artists, genres, settings, songs } from "./shared";
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

async function loadMusic(storage, $settings, songs) {
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

			const isAlreadyThere = songs && songs instanceof Array && songs.find((a) => a.filename === filename);
			if (isAlreadyThere) {
				array.push(isAlreadyThere);
			} else if ($settings.nomedia && filename.endsWith(".nomedia")) nomedia.push(filename.slice(0, -8));
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
	const storages = PRODUCTION ? navigator.getDeviceStorages($settings.nomedia ? "sdcard" : "music") : [{}];
	const array = (await Promise.all(storages.map((storage) => loadMusic(storage, $settings)))).flat();
	array.sort(alphabeticalSort);
	DEBUG && console.log("loadData: " + (new Date() - start) / 1000 + "s");
	return array;
}

async function compareData(songs) {
	await settings.init;
	const start = new Date();
	DEBUG && console.log("comparing data");
	const $settings = get(settings);
	const storages = PRODUCTION ? navigator.getDeviceStorages($settings.nomedia ? "sdcard" : "music") : [{}];
	const array = (await Promise.all(storages.map((a) => loadMusic(a, $settings, songs)))).flat();
	array.sort(alphabeticalSort);
	DEBUG && console.log("compare data: " + (new Date() - start) / 1000 + "s");
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
	const map = {};
	const albums = [];

	const avoidNull = randomString();

	const len = songs.length;
	for (let i = 0; i < len; i++) {
		const song = songs[i];
		const hash = hashAlbum(song) || avoidNull;
		if (hash in map) {
			map[hash].push(song);
		} else map[hash] = [song];
	}

	Object.entries(map).forEach(([hash, songs]) => {
		if (hash === avoidNull) hash = null;
		const { artist, year, album: name, filename } = songs[0];
		albums.push({
			hash,
			songs: songs.map((e) => e.hash),
			name,
			year,
			artist: artist?.split(", ")[0] || null,
			filename,
		});
	});

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

async function updateStores(_songs) {
	await Promise.all([albums, genres, artists].map((a) => a.init));

	albums.set(siftAlbums(_songs));
	DEBUG && console.log("sifted albums:", get(albums));

	genres.set(siftGenres(_songs));
	DEBUG && console.log("sifted genres:", get(genres));

	artists.set(siftArtists(_songs));
	DEBUG && console.log("sifted artists:", get(artists));
}

export async function init(cb) {
	if (ready) return true;
	await songs.init;

	let _songs = get(songs);
	_songs = await (_songs.length === 0 ? loadData(_songs) : compareData(_songs));
	songs.set(_songs);

	DEBUG && console.log("songs:", _songs);
	updateStores(_songs);
}
