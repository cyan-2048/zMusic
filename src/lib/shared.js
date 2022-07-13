import localforage from "localforage";
import { quintInOut } from "svelte/easing";
import { get, readable, writable } from "svelte/store";
import { mountDirection } from "../routes/stores";

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
		title: "music+video",
	},
	true
);
export const history = writableLF("history", {
	albums: [],
	queue: [],
	time: 0,
	index: 0,
});

export const ArtistImageInstance = localforage.createInstance({ name: "artistimages" });
export const AlbumImageInstance = localforage.createInstance({ name: "albumimages" });

export const songs = writableLF("songs", new Map());
export const albums = writable(new Map());
export const genres = writable(new Map());
export const artists = writable(new Map());

export const bio = writableLF("bio", new Map());
export const review = writableLF("review", new Map());
export const newAlbums = writable("newAlbums", new Map());

import sn from "./spatial_navigation";
sn.init();
sn.add({
	id: "default",
	selector: "[data-focusable]",
	defaultElement: "[data-lastfocused]",
});

export { sn };

/**
 * @param {Element} node /// ugggg why am i not using typescript
 */
export function fadeScaleIn(node) {
	let addedClass = null;
	return {
		delay: 0,
		duration: 250,
		tick: (t, u) => {
			if (addedClass === null) {
				addedClass = get(mountDirection) === 0 ? "backIn" : "forwardIn";
				node.classList.add(addedClass);
			}
		},
	};
}

/*
export function fadeScaleOut(node) {
	let addedClass = null;
	return {
		delay: 0,
		duration: 250,
		tick: (t, u) => {
			if (addedClass === null) {
				addedClass = get(mountDirection) === 0 ? "backOut" : "forwardOut";
				node.classList.add(addedClass);
			}
		},
	};
}
*/

export function focusable(node) {
	node.setAttribute("data-focusable", "");
	node.tabIndex = "0";
}

export function tabby(node, { direction = null, go = true }) {
	let classAdded = null;
	return {
		delay: 0,
		duration: direction ? 250 : 0,
		tick(t) {
			if (classAdded === null) {
				if (direction !== null) {
					classAdded = `tab${go ? "In" : "Out"}-${direction}`;
					node.classList.add(classAdded);
				}
			}
		},
	};
}
