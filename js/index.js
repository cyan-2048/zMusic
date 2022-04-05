localforage.setDriver([localforage.INDEXEDDB, localforage.LOCALSTORAGE]);

let cachedImages = {},
	api_keys = {},
	sift = [], // or songs
	settings = {},
	genres = [],
	artists = [],
	albums = [];

const unix_epoch = () => new Date().getTime(),
	last = (e) => e[e.length - 1];

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
							if (!settings.strictID3) {
								obj.artist = obj.artist || "Unknown Artist";
								obj.title = obj.title || last(filename.split("/"));
								obj.album = obj.album || "Unknown Album";
								obj.id = hashCode(obj.title + obj.artist + obj.album);
								array.push(obj);
							} else if (obj.title && obj.artist && obj.album) {
								obj.id = hashCode(obj.title + obj.artist + obj.album);
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
								obj.id = hashCode(obj.title + obj.artist + obj.album);
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
// get album image
function getImage(hash, filename) {
	return new Promise((res, err) => {
		function updateCSS() {
			document.getElementById("cache").innerHTML += `.album-${hash} {background-image:url(${cachedImages["album-" + hash]})}`;
		}
		if (hash == "eollayyos") {
			if (!cachedImages["album-" + hash]) {
				cachedImages["album-" + hash] = "/css/112.png";
				updateCSS();
			}
			res(cachedImages["album-" + hash]);
		}
		localforage
			.getItem("album-" + hash)
			.then((a) => {
				if (a == null) {
					function toBlob(canvas) {
						canvas.toBlob(
							(blob) => {
								cachedImages["album-" + hash] = URL.createObjectURL(blob);
								updateCSS();
								localforage.setItem("album-" + hash, blob, () => res(cachedImages["album-" + hash]));
							},
							"image/jpeg",
							0.9
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
// we interupt user when needed
function showLoading() {
	console.warn("loading...");
}

function init() {
	// if we ran but the page just reloaded,
	// it means the app will be unstable...
	if (sessionStorage.running) window.close();
	console.log("sorting!!!");
	sift.sort((a, b) => a.title.localeCompare(b.title));

	genres = sift
		.map((a) => a.genre)
		.filter((el, i, s) => {
			if (!el) return;
			return s.indexOf(el) === i;
		})
		.sort((a, b) => a.localeCompare(b))
		.map((a) => {
			let obj = sift.find((e) => e.genre == a) || {};
			return { name: a, picture: hashCode((obj.album || "Unknown Album") + (obj.artist || "Unknown Artist").split(", ")[0] + obj.year || ""), filename: obj.filename };
		});

	artists = sift
		.map((a) => (a.artist.includes(", ") ? a.artist.split(", ") : a).artist)
		.flat()
		.filter((el, i, s) => {
			if (!el) return;
			return s.indexOf(el) === i;
		})
		.sort((a, b) => a.localeCompare(b))
		.map((a) => {
			let obj = sift.find((e) => e.artist.includes(a)) || {};
			return { name: a, picture: hashCode((obj.album || "Unknown Album") + (obj.artist || "Unknown Artist").split(", ")[0] + obj.year || ""), filename: obj.filename };
		});

	albums = sift
		.map((a) => a.album)
		.filter((el, i, s) => {
			if (!el) return;
			return s.indexOf(el) === i;
		})
		.sort((a, b) => a.localeCompare(b))
		.map((a) => {
			let obj = sift.find((e) => e.album.includes(a)) || {};
			return {
				name: a,
				picture: hashCode((obj.album || "Unknown Album") + (obj.artist || "Unknown Artist").split(", ")[0] + obj.year || ""),
				filename: obj.filename,
				artist: obj.artist,
			};
		});

	setTimeout(() => {
		// temp
		let _player = (e) => document.getElementById("player_" + e);
		location.hash = "player";
		player.queue = sift.map((a) => a.id);
		let audio = player.audio;
		audio.ontimeupdate = function () {
			if (document.visibilityState == "visible") {
				let { time, song } = player,
					prog = _player("progress");
				prog.setAttribute("style", `--progress:${time.progress}%;`);
				if (song.title.length < 12) prog.innerText = time.current + " - " + time.remain;
			}
		};
		player.onplayevent = () => {
			console.log("onplaying");
			let { songs, index, picture, song } = player;
			_player("progress").innerText = "";
			_player("progress").removeAttribute("style");
			_player("artist").innerText = song.artist;
			_player("title").innerText = song.title;
			_player("album").innerText = song.album;
			getImage(picture, song.filename).then((a) => (_player("image").src = a));
			_player("queue").innerText = ((songs[index + 1] || {}).title || "") + "\n" + ((songs[index + 2] || {}).title || "");

			getArtistImage(song.artist)
				.then((a) => {
					if (player.song.artist == song.artist) {
						document.getElementById("player").style.backgroundImage = `url(${a})`;
					}
				})
				.catch((e) => (document.getElementById("player").style.backgroundImage = `none`));
		};
		player.play();
	}, 2000);
	sessionStorage.running = true;
}

window.onkeydown = (e) => {
	let { key } = e,
		hash = location.hash.replace("#", "");
	if (hash == "player") {
		({
			Enter: () => player.toggle(),
			ArrowLeft: () => player.playPrevious(),
			ArrowRight: () => player.playNext(),
			ArrowUp: () => player.volumeUp(),
			ArrowDown: () => player.volumeDown(),
			SoftRight: () => window.close(),
		}[key]());
	}
};

// getting artist and genre are too similar
function getAG(type, name) {
	let songs = sift.filter((a) => a[type] == name);
	return {
		songs,
		albums: songs
			.map((a) => a.album)
			.filter((el, i, s) => {
				if (!el) return;
				return s.indexOf(el) === i;
			})
			.map((a) => {
				let obj = songs.find((e) => e.album.includes(a) && e[type].includes(name)) || {};
				return {
					name: a,
					picture: hashCode((obj.album || "Unknown Album") + (obj.artist || "Unknown Artist").split(", ")[0] + obj.year || ""),
					filename: obj.filename,
					artist: obj.artist,
				};
			}),
	};
}
// returns the albums and songs of a genre
function getGenre(name) {
	return getAG("genre", name);
}
// returns the albums and songs of an artist
function getArtist(name) {
	return getAG("artist", name);
}
// return songs of an album
function getAlbum(hash) {
	let album = albums.find((a) => a.picture == hash);
	if (!album) return null;
	return {
		songs: sift
			.filter((obj) => hash == hashCode((obj.album || "Unknown Album") + (obj.artist || "Unknown Artist").split(", ")[0] + obj.year || ""))
			.sort((a, b) => a.track - b.track),
	};
}
// we don't cache bio so that we don't get memory leaks...
function getBio(type, name) {
	return new Promise((res, err) => {
		let hash = hashCode(type + JSON.stringify(name));
		localforage
			.getItem("bio-" + hash)
			.then((a) => {
				if (a !== null) {
					res(a);
				} else {
					let en = (e) => encodeURIComponent(e);
					fetch(
						`http://cyan-socials.herokuapp.com/scrobble/?type=${type}` +
							(type == "artist" ? `&artist=${en(name)}` : `&artist=${en(name.artist)}&album=${en(name.album)}`) +
							(api_keys.lastfm ? `&api_key=${api_keys.lastfm}` : "")
					)
						.then((a) => a.json())
						.then((a) => {
							if (a.error) return err(a);
							let result = a.body;
							localforage.setItem("bio-" + hash, result);
							res(result);
						})
						.catch(err);
				}
			})
			.catch(err);
	});
}

function getArtistImage(name) {
	return new Promise((res, err) => {
		let hash = hashCode(name);
		if (hash == "nhydlhhoo") return err({ error: "no artist" });
		function imageToBlob(url) {
			fetch(url)
				.then((re) => re.blob())
				.then((re) => {
					if (re.type.includes("application/json")) {
						return err(JSON.parse(blob2text(re)));
					}
					let url = URL.createObjectURL(re);
					cachedImages["artist-" + hash] = url;
					localforage.setItem("artist-" + hash, re, () => res(url));
				})
				.catch(err);
		}
		localforage.getItem("artist-" + hash).then((a) => {
			if (a == null) {
				let api = settings.artistImageAPI;
				if (api == "deezer") {
					let xmlhttp = new XMLHttpRequest({ mozSystem: true });
					let url = "https://api.deezer.com/artist/" + encodeURIComponent(name);
					xmlhttp.onreadystatechange = function () {
						if (this.readyState == 4 && this.status == 200) {
							let result = JSON.parse(this.responseText);
							if (!result.picture_medium) return err("no image");
							imageToBlob(result.picture_medium);
						}
					};
					xmlhttp.open("GET", url, true);
					xmlhttp.send();
				} else if (api == "spotify") {
					imageToBlob("http://cyan-socials.herokuapp.com/spotify/?q=" + encodeURIComponent(name));
				}
			} else {
				if (!cachedImages["artist-" + hash]) cachedImages["artist-" + hash] = URL.createObjectURL(a);
				res(cachedImages["artist-" + hash]);
			}
		});
	});
}

// list of symbols
const symbols = "1234567890-={}'\"~!@#$%^&*()_+[]:;|`/?.,<>\\";

function fullReload() {
	showLoading();
	getMusic().then((array) => {
		sift = array;
		localforage.setItem("cached-songs", array, init);
	});
}

function ready() {
	localforage.getItem("cached-songs").then((a) => {
		if (a == null) fullReload();
		else {
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
						console.log("new songs :", found.length);
						sift = sift.concat(found);
					}
					if (missing.length > 0) {
						console.log("missing songs :", missing.length);
						sift = sift.filter((a) => missing.find((e) => e.filename == a.filename));
					}
					localforage.setItem("cached-songs", array, init);
				}
			});
		}
	});
	localforage.getItem("settings").then((a) => {
		let defSet = {
			resizeImage: true,
			strictID3: false,
			artistImage: true,
			artistImageAPI: "spotify",
			repeat: "no-repeat",
			seek: 10,
		};
		let toProp = { settings: {} };
		if (a == null) {
			localforage.setItem("settings", defSet);
			toProp.settings = defSet;
		} else {
			let obj = a;
			// if there is new settings
			let keys = Object.keys(a);
			let keys_ = Object.keys(defSet);
			if (keys.length != keys_.length) {
				keys_.forEach((a) => {
					if (keys.indexOf(a) < 0) {
						obj[a] = defSet[a];
					}
				});
			}
			toProp.settings = obj;
		}
		Object.keys(toProp.settings).forEach((a) => {
			Object.defineProperty(toProp, a, {
				get() {
					return this.settings[a];
				},
				set(newValue) {
					this.settings[a] = newValue;
					localforage.setItem("settings", this.settings);
				},
			});
		});
		settings = toProp;
	});
	localforage.getItem("api-keys").then((a) => {
		let defSet = {};
		if (a == null) {
			localforage.setItem("api-keys", defSet);
			api_keys = defSet;
		} else api_keys = a;
	});
}

localforage
	.ready()
	.then(ready)
	.catch(function (e) {
		console.error(e);
		alert(e);
	});
// resize image blob
function resizer(blob, _width, _height) {
	let time = unix_epoch();
	return new Promise((res, err) => {
		try {
			let img = new Image(),
				url = URL.createObjectURL(blob);
			img.src = url;
			img.onload = () => {
				URL.revokeObjectURL(url);
				let MAX_WIDTH = _width || 240,
					MAX_HEIGHT = _height || 240,
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

function downloadBlob(blob, name) {
	let url = URL.createObjectURL(blob),
		anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = name || "file.bin";
	document.body.appendChild(anchor);
	anchor.click();
	setTimeout(() => {
		URL.revokeObjectURL(url);
		anchor.remove();
	}, 500);
}
function downloadText(text, name) {
	downloadBlob(new Blob([text]), name);
}
// sync xmlhttp is acceptable for non xhr i guess
function blob2text(b) {
	var uri = URL.createObjectURL(b),
		xhr = new XMLHttpRequest();
	xhr.open("GET", uri, false);
	xhr.send();
	URL.revokeObjectURL(uri);
	return xhr.responseText;
}
// returns estimated storage, may not be too accurate
// if only localforage had this feature already lmao
function getEstimatedStorage() {
	return new Promise((res, err) => {
		let obj = {
			artists: {
				estimate: 0,
				total: 0,
			},
			albums: {
				estimate: 0,
				total: 0,
			},
			bio: {
				estimate: 0,
				total: 0,
			},
			cache: {
				estimate: 0,
				total: 0,
			},
		};
		localforage
			.iterate(function (value, key) {
				if (/^bio-/.test(key)) {
					obj.bio.total++;
					obj.bio.estimate += new Blob([value]).size;
				} else if (/^artist-/.test(key)) {
					obj.artists.total++;
					obj.artists.estimate += value.size;
				} else if (/^album-/.test(key)) {
					obj.albums.total++;
					obj.albums.estimate += value.size;
				} else {
					obj.cache.total++;
					obj.cache.estimate += new Blob([value]).size;
				}
			})
			.then(() => {
				let est = 0,
					total = 0;
				Object.keys(obj).forEach((a) => {
					est = obj[a].estimate + est;
					total = obj[a].total + total;
				});
				obj.estimate = est;
				obj.total = total;
				res(obj);
			})
			.catch(err);
	});
}
// human readable bytes
function niceBytes(size) {
	var i = Math.floor(Math.log(size) / Math.log(1024));
	return (size / Math.pow(1024, i)).toFixed(2) * 1 + " " + ["B", "kB", "MB", "GB", "TB"][i];
}
