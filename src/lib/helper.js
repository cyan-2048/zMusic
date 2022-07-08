import scrollIntoView from "scroll-into-view";

export async function centerScroll(el, sync) {
	return new Promise((res) => {
		scrollIntoView(el, { time: sync ? 0 : 300, align: { left: 0 }, ease: (e) => e }, (type) =>
			res(type === "complete")
		);
	});
}

export function hashCode(_str, seed = 0) {
	const str = String(_str);
	let h1 = 0xdeadbeef ^ seed,
		h2 = 0x41c6ce57 ^ seed;
	for (let i = 0, ch; i < str.length; i++) {
		ch = str.charCodeAt(i);
		h1 = Math.imul(h1 ^ ch, 2654435761);
		h2 = Math.imul(h2 ^ ch, 1597334677);
	}
	h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
	h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
	return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

export function randomString() {
	const random = Math.random() * 100;
	return hashCode(random, random);
}

export const last = (e) => e[e.length - 1];

export function shuffleArray(iterable) {
	const clone = [].slice.call(iterable);
	const len = clone.length;
	for (let i = len - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[clone[i], clone[j]] = [clone[j], clone[i]];
	}
	return clone;
}

// human readable bytes
export function niceBytes(t) {
	var o = Math.floor(Math.log(t) / Math.log(1024));
	return 1 * (t / Math.pow(1024, o)).toFixed(2) + " " + ["B", "kB", "MB", "GB", "TB"][o];
}

export function cleanObject(obj) {
	const clone = { ...obj };
	for (const i in clone) {
		if (!clone[i]) delete clone[i];
	}
	return clone;
}
