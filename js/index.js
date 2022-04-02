localforage.setDriver([localforage.LOCALSTORAGE, localforage.INDEXEDDB]);

let cachedImages = {},
	sift = [],
	settings = {};

// we toggle wakelock on files because it's slow when closed....
const wakeLockToggle = (() => {
	let lock = null;

	return {
		lock: function () {
			if (lock === null) lock = navigator.requestWakeLock("screen");
		},
		unlock: function () {
			if (lock !== null) {
				lock.unlock();
			}
		},
		status: function () {
			return lock === null ? "off" : "on";
		},
	};
})();

const unix_epoch = () => new Date().getTime(),
	last = (e) => e[e.length - 1];
function hashCode(r) {
	var n,
		t = 0;
	if (0 === r.length) return t;
	for (n = 0; n < r.length; n++) (t = (t << 5) - t + r.charCodeAt(n)), (t |= 0);
	return Array.from(t.toString())
		.map((r) => "ledoshcyan"[r])
		.join("");
}

function getMusic() {
	return new Promise((res, err) => {
		const storages = navigator.getDeviceStorages("music");
		let array = [],
			scanned = 0,
			time = unix_epoch();

		function terminate() {
			console.log(array);
			console.log("search ended: " + (unix_epoch() - time) / 1000 + "s");
			res(array);
		}

		storages.forEach((a, i) => {
			let cursor = a.enumerate();
			cursor.onsuccess = function () {
				if (!this.result) {
					scanned++;
					if (scanned == storages.length) terminate();
					return;
				}
				const filename = this.result.name;
				if (/.mp3$/.test(filename)) {
					getTags(this.result).then(
						(a) => {
							let obj = a;
							obj.storage = i;
							obj.filename = filename;
							if (obj.title && obj.artist && obj.album && settings.strictID3) array.push(obj);
							if (!settings.strictID3) {
								if (!obj.artist) obj.artist = "Unknown Artist";
								if (!obj.title) obj.title = last(filename.split("/"));
								if (!obj.album) obj.album = "Unknown Album";
								array.push(obj);
							}
							this.continue();
						},
						(e) => {
							console.error(e);
							let obj = { storage: i, filename };
							if (!settings.strictID3) {
								obj.artist = "Unknown Artist";
								obj.title = last(filename.split("/"));
								obj.album = "Unknown Album";
								array.push(obj);
							}
							this.continue();
						}
					);
				} else this.continue();
			};
			cursor.onerror = function () {
				console.error("No file found: " + this.error);
			};
		});
	});
}

function getFile(filename) {
	wakeLockToggle.lock();
	return new Promise((res, err) => {
		let get = navigator.getDeviceStorage("sdcard").get(filename);
		get.onsuccess = function () {
			wakeLockToggle.unlock();
			res(this.result);
		};
		get.onerror = function (e) {
			wakeLockToggle.unlock();
			err(e);
		};
	});
}
// only get tags that are actually going to be used
// to avoid memory leaks
function getTags(file) {
	return new Promise((res, err) => {
		parseAudio(
			file,
			(e) => {
				let obj = {},
					keys = ["album", "artist", "title", "genre", "tracknum", "year"];
				Object.keys(e).forEach((a) => {
					if (keys.includes(a)) obj[a == "tracknum" ? "track" : a] = e[a];
				});
				res(obj);
			},
			err
		);
	});
}

function getImage(hash, filename) {
	return new Promise((res, err) => {
		localforage
			.getItem("album-" + hash)
			.then((a) => {
				function updateCSS() {
					document.getElementById("cache").innerHTML += `.album-${hash} {background-image:url(${cachedImages["album-" + hash]})}`;
				}
				if (a == null) {
					function toBlob(canvas) {
						canvas.toBlob(
							(blob) => {
								cachedImages["album-" + hash] = URL.createObjectURL(blob);
								updateCSS();
								localforage.setItem("album-" + hash, blob, () => res(cachedImages["album-" + hash]));
							},
							"image/jpeg",
							0.7
						);
					}
					getFile(filename).then((a) => {
						parseAudio(a, (e) => resizer(e.picture).then(toBlob, err), err);
					});
				} else {
					if (!cachedImages["album-" + hash]) {
						cachedImages["album-" + hash] = URL.createObjectURL(a);
						updateCSS();
					}
					res(cachedImages["album-" + hash]);
				}
			})
			.catch(err);
	});
}

function showLoading() {
	console.warn("loading...");
}

function reloadLibrary() {
	console.log("the library is being reloaded");
}

function init() {
	let { album, artist, year, filename } = sift[0];
	getImage(hashCode(album + artist + year), filename).then((a) => (document.body.style.backgroundImage = `url(${a})`));
}

localforage
	.ready()
	.then(() => {
		localforage.getItem("cached-songs").then((a) => {
			if (a == null) {
				showLoading();
				getMusic().then((array) => {
					sift = array;
					localforage.setItem("cached-songs", array, reloadLibrary);
					init();
				});
			} else {
				let storages_len = navigator.getDeviceStorages("sdcard").length;
				sift = a;
				// if storage medium is gone we get rid of it
				sift = sift.filter((a) => a.storage < storages_len);
				init();
				getMusic().then((array) => {
					let found = newItems(sift, array),
						missing = notItems(sift, array);

					if (missing.length > 0 || found.length > 0) {
						showLoading();
						if (found.length > 0) {
							sift = sift.concat(found);
						}
						if (missing.length > 0) {
							sift = sift.filter((a) => missing.find((e) => e.filename == a.filename));
						}
						reloadLibrary();
					}
				});
			}
		});
		localforage.getItem("settings").then((a) => {
			let defSet = {
				resizeImage: true,
				strictID3: false,
			};
			if (a == null) {
				localforage.setItem("settings", defSet);
				settings = defSet;
			} else {
				settings = a;
			}
		});
	})
	.catch(function (e) {
		console.error(e);
		alert(e);
	});

function resizer(blob, _width, _height) {
	let time = unix_epoch();
	return new Promise((res, err) => {
		try {
			let img = new Image(),
				url = URL.createObjectURL(blob);
			img.src = url;
			img.onload = () => {
				URL.revokeObjectURL(url);
				let MAX_WIDTH = _width || 230,
					MAX_HEIGHT = _height || 230,
					width = img.width,
					height = img.height;

				// Change the resizing logic
				if (width > height) {
					if (width > MAX_WIDTH) {
						height = height * (MAX_WIDTH / width);
						width = MAX_WIDTH;
					}
				} else {
					if (height > MAX_HEIGHT) {
						width = width * (MAX_HEIGHT / height);
						height = MAX_HEIGHT;
					}
				}

				let canvas = document.createElement("canvas");
				canvas.width = width;
				canvas.height = height;
				let ctx = canvas.getContext("2d");
				ctx.drawImage(img, 0, 0, width, height);
				console.log("image resize ended: " + (unix_epoch() - time) + "ms");
				res(canvas);
			};
		} catch (e) {
			err(e);
		}
	});
}
// returns an array of items not found in the other array
// should only be used for array of objects
function newItems(a, b) {
	let string = a.map((a) => JSON.stringify(a));
	return b.filter((el) => string.indexOf(JSON.stringify(el)) == -1);
}
// returns items that are missing
function notItems(a, b) {
	let string = b.map((a) => JSON.stringify(a));
	return a.filter((el) => string.indexOf(JSON.stringify(el)) == -1);
}
