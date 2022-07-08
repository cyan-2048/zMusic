import localforage from "localforage";
import { writable } from "svelte/store";

export const self = new Promise((res) => {
	const { mozApps } = navigator;
	if (!mozApps) return res(null);
	mozApps.getSelf().onsuccess = function () {
		res(this.result);
	};
});

export { fetch } from "./fetch";

if (!PRODUCTION) {
	window.localforage = localforage;
	window._fetch = fetch;
}

export const zMusicInstance = localforage.createInstance({ name: "zMusic" });

function writableLF(name, defaultValue, checkUpdate = false, instance = null) {
	if (!instance) instance = zMusicInstance;
	let fromStorage = null;
	function _check() {
		if (fromStorage) {
			for (const key in defaultValue) {
				if (!(key in fromStorage)) {
					fromStorage[key] = defaultValue[key];
				}
			}
			for (const key in fromStorage) {
				if (!(key in defaultValue)) {
					delete fromStorage[key];
				}
			}
			instance.setItem(name, fromStorage);
			return fromStorage;
		} else {
			return { ...defaultValue };
		}
	}

	const _writable = writable(null);

	const init = (async () => {
		fromStorage = await instance.getItem(name);
		_writable.set((checkUpdate ? _check() : fromStorage) || defaultValue);
		_writable.subscribe((n) => {
			instance.setItem(name, n);
		});
	})();

	return { ..._writable, init };
}

export const settings = writableLF(
	"settings",
	{
		resizeImage: true,
		strictID3: false,
		// artistImage: true,
		// artistImageAPI: "spotify",
		repeat: 0, // [no-repeat, repeat-one, repeat-all]
		seek: 10,
		// scrobble: false,
		// nowplay: false,
		nomedia: true,
		timer: false,
		timerAmount: 60,
		// bio: true,
	},
	true
);
export const history = writableLF("history", {
	albums: [],
	queue: [],
	time: 0,
	new: [],
	index: 0,
});

export const ArtistImageInstance = localforage.createInstance({ name: "artistimages" });
export const AlbumImageInstance = localforage.createInstance({ name: "albumimages" });
export const MusicInstance = localforage.createInstance({ name: "formusicfiles" });

export const songs = writableLF("songs", [], false, MusicInstance);
export const albums = writable([]);
export const genres = writable([]);
export const artists = writable([]);
