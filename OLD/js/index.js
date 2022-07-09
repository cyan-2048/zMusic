const sn = SpatialNavigation;
sn.init();
location.hash = "home";

let cachedImages = {},
	api_keys = {},
	history = {},
	sift = [], // or songs
	settings = {},
	genres = [],
	artists = [],
	albums = [];

function getMusic() {
	return new Promise((res, err) => {
		return res([]);
		const storages = navigator.getDeviceStorages(settings.nomedia ? "sdcard" : "music");
		let array = [],
			nomedia = [],
			scanned = 0,
			time = unix_epoch();

		function terminate() {
			if (settings.nomedia) array = array.filter((a) => !nomedia.find((e) => a.filename.startsWith(e)));
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
					if (!nomedia.find((e) => filename.startsWith(e)))
						getTags(this.result).then(
							(a) => {
								let obj = a;
								if (obj.picture) delete obj.picture;
								obj.storage = i;
								obj.filename = filename;
								if (!settings.strictID3) {
									obj.artist = obj.artist || "Unknown Artist";
									obj.title = obj.title || last(filename.split("/"));
									obj.album = obj.album || "Unknown Album";
									obj.id = hashCode(obj.title + obj.artist + obj.album + filename);
									array.push(obj);
								} else if (obj.title && obj.artist && obj.album) {
									obj.id = hashCode(obj.title + obj.artist + obj.album + filename);
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
									obj.id = hashCode(obj.title + obj.artist + obj.album + filename);
									array.push(obj);
								}
								this.continue();
							}
						);
					else this.continue();
				} else if (/.nomedia$/.test(filename)) {
					nomedia.push(filename.replace(/.nomedia$/, ""));
					this.continue();
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
// we run with workers because memory
function getTags(file) {
	return new Promise((res, err) => parseAudio(file, res, err));
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
			return res(cachedImages["album-" + hash]);
		}
		localforage
			.getItem("album-" + hash)
			.then((a) => {
				if (a == null) {
					getFile(filename)
						.then(getTags)
						.then((e) => {
							function t(blob) {
								cachedImages["album-" + hash] = URL.createObjectURL(blob);
								updateCSS();
								localforage.setItem("album-" + hash, blob, () => res(cachedImages["album-" + hash]));
							}
							if (!settings.resizeImage) t(e.picture);
							else resizer(e.picture, 240, 240).then((e) => e.toBlob(t, "image/jpg", 0.8));
						})
						.catch(err);
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

function getStorageSpace() {
	return new Promise((res, err) => {
		let storages = navigator.getDeviceStorages("sdcard");
		let len = storages.length * 2;
		let current = 0;

		let fullSpace = 0;
		let usedSpace = 0;

		function terminate() {
			current++;
			if (current == len) {
				res({ fullSpace, usedSpace });
			}
		}

		storages.forEach((storage) => {
			storage.freeSpace().onsuccess = function () {
				fullSpace += this.result;
				terminate();
			};
			storage.usedSpace().onsuccess = function () {
				fullSpace += this.result;
				usedSpace += this.result;
				terminate();
			};
		});
	});
}

// we interupt user when needed
function showLoading() {
	console.warn("loading...");
	location.hash = "loading";
}
showLoading.stop = function () {
	if (location.hash == "#loading") {
		console.log("stop loading...");
		location.hash = "home";
	}
};

function init() {
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
			return { name: a, picture: hashAlbum(obj), filename: obj.filename };
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
			return { name: a, picture: hashAlbum(obj), filename: obj.filename };
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
				picture: hashAlbum(obj),
				filename: obj.filename,
				artist: obj.artist,
			};
		});
	history.albums = history.albums.filter((a) => albums.find((e) => e.picture == a));
	history.new = history.new.filter((a) => albums.find((e) => e.picture == a));
	historyInt.newAlbums();

	let music = qs("body > #music");
	// prettier-ignore
	music.qs("tabs").innerHTML = "<div class=\"selected\">artists&nbsp;</div><div>albums&nbsp;</div><div>songs&nbsp;</div><div>genres&nbsp;</div><div>playlists&nbsp;</div>"
	music.qsa("[data-index]").forEach((a, i) => {
		a.className = i == 0 ? "focus" : "";
		a.innerHTML = "";
	});
	let _artists = music.qs('[data-index="0"]');
	let _albums = music.qs('[data-index="1"]');
	let _songs = music.qs('[data-index="2"]');
	let _genres = music.qs('[data-index="3"]');
	let _playlists = music.qs('[data-index="4"]');

	// letter
	function l(e) {
		let f = e.charAt(0).toUpperCase();
		return symbols.includes(f) ? "#" : f;
	}
	// sticky
	function s(e) {
		let el = document.createElement("sticky");
		el.dataset.letter = e;
		return el;
	}

	let letters = [];
	artists.forEach((a, i) => {
		let el = document.createElement("div");
		el.dataset.type = "artist";
		el.dataset.index = i;
		el.className = "album-" + a.picture;
		el.innerText = a.name;
		let letter = l(a.name);
		if (!letters.includes(letter)) {
			_artists.appendChild(s(letter));
			letters.push(letter);
		}
		el.tabIndex = 0;
		_artists.appendChild(el);
	});
	letters = [];
	albums.forEach((a, i) => {
		let el = document.createElement("div");
		el.dataset.type = "album";
		el.dataset.index = i;
		el.dataset.artist = a.artist;
		el.className = "album-" + a.picture;
		el.innerText = a.name;
		let letter = l(a.name);
		if (!letters.includes(letter)) {
			_albums.appendChild(s(letter));
			letters.push(letter);
		}
		el.tabIndex = 0;
		_albums.appendChild(el);
	});
	letters = [];
	sift.forEach((a, i) => {
		let el = document.createElement("div");
		el.dataset.type = "song";
		el.dataset.artist = a.artist;
		el.dataset.index = i;
		el.className = "album-" + hashAlbum(a);
		el.innerText = a.title;
		let letter = l(a.title);
		if (!letters.includes(letter)) {
			_songs.appendChild(s(letter));
			letters.push(letter);
		}
		el.tabIndex = 0;
		_songs.appendChild(el);
	});
	genres.forEach((a, i) => {
		let el = document.createElement("div");
		el.dataset.type = "genre";
		el.dataset.index = i;
		el.className = "album-" + a.picture;
		el.innerText = a.name;
		el.tabIndex = 0;
		_genres.appendChild(el);
	});
	if (!0) {
		let el = document.createElement("div");
		el.innerText = "soon";
		el.tabIndex = 0;
		_playlists.appendChild(el);
	}

	console.log("last played: " + history.time);
	const init_time = history.time;

	let func = () => {
		// temp
		let _player = (e) => document.getElementById("player_" + e);
		// location.hash = "player";
		let queue = history.queue.length != 0 ? [...history.queue] : sift.map((a) => a.id);
		let index = history.index > 0 && history.index < queue.length ? history.index : 0;
		player.playlist(queue, index || 0, true);
		let audio = player.audio;
		audio.ontimeupdate = function () {
			if (document.visibilityState == "visible") {
				let { time, song } = player,
					prog = _player("progress");
				let progress = time.progress.toFixed(0),
					{ style } = prog;
				if (style.getPropertyValue("--progress").replace(/%|px/, "") != progress) {
					prog.setAttribute("style", `--progress:${progress}%;`);
				}
				let oras = time.current + " - " + time.remain;
				if (song && song.title.length < 11 && prog.innerText != oras) prog.innerText = oras;

				let npt = qs("#nowplaying time");
				if (npt.innerText != time.current) npt.innerText = time.current;
			}
		};
		player.onplayevent = () => {
			let { songs, index, picture, song } = player;
			_player("progress").innerText = "";
			_player("progress").removeAttribute("style");
			_player("artist").innerText = song.artist;
			_player("title").innerText = song.title;
			_player("album").innerText = song.album;
			qs("#nowplaying title").innerText = song.title;

			let color = () =>
				getAverageRGB(cachedImages["album-" + picture]).then((a) => {
					let { r, g, b } = a;
					let np = getId("nowplaying");
					np.style.color = `rgb(${[r, g, b].join(",")})`;
					np.style.setProperty("--shadow", a.color ? "white" : "black");
				});

			qs("#home #nowplaying").className = "album-" + picture;
			_player("image").className = "album-" + picture;
			if (!cachedImages["album-" + picture]) {
				getImage(picture, song.filename).then(color);
			} else color();

			_player("queue").innerText = player.shuffle ? "" : ((songs[index + 1] || {}).title || "") + "\n" + ((songs[index + 2] || {}).title || "");

			let body = document.body;
			getArtistImage(song.artist.split(", ")[0])
				.then((a) => body.style.setProperty("--artist", `url(${a})`))
				.catch((e) => body.style.removeProperty("--artist"));

			setTimeout(function nowplay() {
				if (!settings.nowplay || !isLoggedIn()) return;
				let { audio, song } = player;
				if (!audio.paused && audio.duration > 30 && song.artist !== "Unknown Artist") {
					lastfmNowPlaying(song);
				}
				if (audio.paused)
					audio.addEventListener("play", function play() {
						audio.removeEventListener("play", play);
						nowplay();
					});
			}, 1000);
			console.log("playevent");
		};
		setTimeout(() => {
			audio.currentTime = init_time;
		}, 500);
	};
	if (!firstTime) func();
	else firstTime = func;

	historyInt();
	loadImages();
	showLoading.stop();
}
var switchTab = (() => {
	let ready = true;
	// nav - must be -1/1
	// tabs - tabs element to handle
	function switchTab(nav, tabs) {
		if (ready) ready = false;
		else return;
		let array = [...tabs.children].map((a) => a.innerText.replace("\xa0", ""));
		let up = () => [...tabs.children].forEach((a) => (a.style.width = a.offsetWidth + "px"));
		up();
		let container = tabs.parentElement;
		let id = "#" + container.id + " > ";
		let current = container.qs(id + ".focus");
		let next = current[nav == 1 ? "nextElementSibling" : "previousElementSibling"];
		let lastTab = container.qs(id + `[data-index="${array.length - 1}"]`);
		let firstTab = container.qs(id + "[data-index='0']");
		if ((current == lastTab && nav == 1) || (current == firstTab && nav == -1)) {
			next = nav == 1 ? firstTab : lastTab;
		}
		container.qsa(id + "[data-index]").forEach((a) => a.classList.remove("focus"));
		next.className = "focus";
		if (nav == -1) {
			let el = tabs.children[array.length - 1];
			let width = el.style.width;
			el.style.width = 0;
			el.style.transform = `translateX(-${width})`;
			array.unshift(array.pop());
			tabs.insertAdjacentHTML("afterbegin", el.outerHTML);
			el.style.display = "none";
			let to = tabs.children[0];
			setTimeout(() => {
				to.style.transform = "none";
				to.style.width = width;
			}, 50);
			current.classList.add("go-right");
			next.classList.add("in-left");
		} else {
			let to = tabs.children[0];
			to.style.transform = `translateX(-${to.offsetWidth}px)`;
			to.style.width = 0;
			array.push(array.shift());
			current.classList.add("go-left");
			next.classList.add("in-right");
		}
		setTimeout(
			() => {
				current.className = "";
				next.className = "focus";
				tabs.innerHTML = array.map((a) => `<div>${a}&nbsp;</div>`).join("");
				up();
				tabs.firstChild.className = "selected";
				ready = true;
				sn.focus();
			},
			nav == -1 ? 412 : 332
		);
	}
	return switchTab;
})();
const switchNav = ((sn) => {
	let currentNav = null;
	// null
	let nop = ["player", "loading"];
	// no tabs
	["home", "logs"].forEach((id) => sn.add({ id, selector: `body > #${id} [tabindex]`, disabled: true, rememberSource: true }));
	// with tabs
	let tabbed = ["music", "settings"];
	tabbed.forEach((id) =>
		sn.add({
			id,
			selector: `body > #${id} [data-index].focus [tabindex]`,
			disabled: true,
			rememberSource: true,
		})
	);

	function scrollParent(node) {
		if (node == null) return null;
		if (node.scrollHeight > node.clientHeight) return node;
		else return scrollParent(node.parentNode);
	}

	document.addEventListener("sn:navigatefailed", (e) => {
		let { direction } = e.detail;
		// console.log("failed:", { id: currentNav, direction });
		if (tabbed.includes(currentNav)) {
			if (/left|right/.test(direction)) {
				let prev = actEl();
				switchTab(direction == "right" ? 1 : -1, qs(`body > #${currentNav} tabs`));
				setTimeout(() => {
					if (prev) prev.parentElement.scrollTop = 0;
				}, 300);
			}
		}
	});

	document.addEventListener("sn:willunfocus", (e) => {
		let { direction, nextElement } = e.detail;
		//console.log("willunfocus:", { id: currentNav, direction, nextElement });
		if (!nextElement) return;
		if (currentNav == "home" && direction) {
			let index = Number(nextElement.closest("[data-index]").dataset.index);
			if (Number(qs("#home [data-index].focus").dataset.index) != index) {
				setTimeout(() => homeIndex(index), 10);
			}
		}
		if (/music|home/.test(currentNav)) {
			let next = nextElement;
			let types = {
				albums,
				songs: sift,
				genres,
				artists,
			};

			let hash = [...next.classList].find((a) => a.includes("album-"));
			if (hash && !cachedImages[hash]) {
				let { index, i, type } = next.dataset;
				if ((index || i) && Object.keys(types).includes(type + "s")) {
					getImage(hash.replace("album-", ""), types[type + "s"][index || i].filename);
				}
			}
		}
		let parent = scrollParent(nextElement);
		if (parent) {
			const rect = nextElement.getBoundingClientRect();
			const elY = rect.top - (tabbed.includes(currentNav) ? 30 : 0) + rect.height / 2;
			setTimeout(() => {
				parent.scrollBy({
					top: nextElement.id == "nowplaying" ? -window.innerHeight : elY - window.innerHeight / 2,
					behavior: "smooth",
				});
			}, 10);
		}
	});

	function main(arg) {
		let id = nop.includes(arg) ? null : arg;
		if (currentNav) sn.disable(currentNav);
		currentNav = id;
		if (id) {
			actEl().blur();
			sn.enable(id);
			setTimeout(() => sn.focus(), 50);
		}
	}
	main("home");
	return main;
})(SpatialNavigation);
var loadImages = (() => {
	let started = false;
	let index = -1;

	function load() {
		if (started) return;
		else started = true;
		(function interval() {
			index++;
			if (albums.length == index) return;
			let { picture, filename } = albums[index];
			if (picture && filename) {
				if (cachedImages["album-" + picture]) interval();
				else {
					getImage(picture, filename);
					setTimeout(interval, 700);
				}
			} else interval();
		})();
	}
	return load;
})();
const historyInt = (() => {
	let started = false;
	let albums_length = 0;
	let pause = false;

	function historyChange() {
		if (pause) return;
		history.time = player.currentTime;
		let current = history.albums.length;
		if (albums_length != current) {
			albums_length = current;
			let container = qs("#nowplaying+.container");
			container.innerHTML = "";
			history.albums.forEach((a, i) => {
				let el = document.createElement("div");
				el.className = "album-" + a;
				el.tabIndex = 0;

				el.dataset.type = "album";
				let index = albums.findIndex((e) => e.picture == a);
				if (index == -1) return;
				el.dataset.i = index;
				setTimeout(() => getImage(a, albums[index].filename), 1000 * i);
				container.appendChild(el);
			});
		}
	}

	function newAlbums() {
		let container = qs('#home #wrapper > [data-index="2"] .container');
		container.innerHTML = "";
		history.new.forEach((a) => {
			let el = document.createElement("div");
			el.className = "album-" + a;
			el.tabIndex = 0;
			el.dataset.type = "album";
			let index = albums.findIndex((e) => e.picture == a);
			if (index == -1) return;
			el.dataset.i = index;
			container.appendChild(el);
		});
	}

	function historyInt() {
		if (started) return;
		started = true;
		// check every 2 seconds since checking using ontimeupdate may or may not be unstable
		setInterval(historyChange, 2100);
	}
	historyInt.pause = function () {
		pause = !pause;
		return pause;
	};
	historyInt.newAlbums = newAlbums;

	return historyInt;
})();

(() => {
	let longpress = false;
	const longpress_timespan = 300;
	let timeout;
	window.addEventListener("keydown", function handleKeyDown(evt) {
		if (evt.key === "EndCall") {
			evt.preventDefault();
			window.close();
		}
		if (location.hash != "#home" && evt.key == "Backspace" && !["TEXTAREA", "INPUT"].includes(evt.target.tagName)) {
			evt.preventDefault();
		}
		if (!evt.repeat) {
			longpress = false;
			timeout = setTimeout(() => {
				longpress = true;
				keypad_handler(evt, "long");
			}, longpress_timespan);
		}
		if (evt.repeat) {
			if (evt.key == "Backspace") longpress = false;
			keypad_handler(evt, "repeat");
		}
	});
	window.addEventListener("keyup", function handleKeyUp(evt) {
		clearTimeout(timeout);
		if (!longpress) {
			keypad_handler(evt, "short");
		}
		keypad_handler(evt, "keydown");
	});
})();
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
					picture: hashAlbum(obj),
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
function getAlbum(a) {
	let hash = a;
	let album;
	if (hash.name) {
		album = a;
		hash = album.picture;
	} else album = albums.find((a) => a.picture == hash);
	if (!album) return null;
	return sift.filter((obj) => hash == hashAlbum(obj)).sort((a, b) => (a.track || 0) - (b.track || 0));
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
							(type == "artist" ? `&artist=${en(name)}` : `&artist=${en(name.artist)}&album=${en(name.album)}`)
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
// reload music database
function fullReload() {
	showLoading();
	getMusic().then((array) => {
		sift = array;
		localforage.setItem("cached-songs", array, init);
	});
}
localforage.ready().then(
	() => {
		syncForage("history", {
			albums: [],
			queue: [],
			time: 0,
			new: [],
			index: 0,
		}).then((a) => (history = a));
		syncForage("settings", {
			resizeImage: true,
			strictID3: false,
			artistImage: true,
			artistImageAPI: "spotify",
			repeat: "no-repeat",
			seek: 10,
			scrobble: false,
			nowplay: false,
			nomedia: true,
			timer: false,
			timerAmount: 60,
			bio: true,
		}).then((a) => {
			settings = a;
			let obj = Object.keys(a.settings);
			let container = qs("body > #settings");
			function set(id, val) {
				let el = container.qs("#" + id);
				if (el) el.dataset.state = val;
			}
			obj.forEach((e) => {
				let val = a.settings[e];
				if (typeof val == "boolean") set(e, val ? "on" : "off");
				else set(e, val);
			});
		});
		syncForage("api-keys", {
			api_key: null, //
			token: null,
			sk: null,
			user: null,
			secret: null, // okay fine take the secret
		}).then((a) => {
			api_keys = a;
			let { api_key, secret, sk, user } = a;
			if (isLoggedIn()) {
				lastfm = new LastFmNode({
					api_key,
					secret,
				});
				session = lastfm.session({ key: sk, user });
			}
			updateLogIn();
		});
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

							history.new = history.new
								.concat(
									found
										.map((a) => a.album)
										.filter((el, i, s) => {
											if (!el) return;
											return s.indexOf(el) === i;
										})
										.map((a) => {
											let obj = sift.find((e) => e.album.includes(a)) || {};
											return hashAlbum(obj);
										})
								)
								.filter((el, i, s) => {
									if (!el) return;
									return s.indexOf(el) === i;
								});
						}
						if (missing.length > 0) {
							console.log("missing songs :", missing.length);
							sift = sift.filter((a) => !missing.find((e) => e.filename == a.filename));
							history.queue = history.queue.filter((a) => !missing.find((e) => e.id == a));
						}
						localforage.setItem("cached-songs", array, init);
					}
				});
			}
		});
	},
	(e) => {
		console.error(e);
		alert(e);
	}
);
// returns promise with sync-ified
// localforage object...
// prettier-ignore
function syncForage(name,defSet={}){return new Promise((e,t)=>{localforage.getItem(name).then(t=>{let l={[name]:{}};if(null==t)localforage.setItem(name,defSet),l[name]=defSet;else{let e=t,r=Object.keys(t),n=Object.keys(defSet);r.length!=n.length&&n.forEach(t=>{r.indexOf(t)<0&&(e[t]=defSet[t])}),l[name]=e}Object.keys(l[name]).forEach(e=>{Object.defineProperty(l,e,{get(){return this[name][e]},set(t){this[name][e]=t,localforage.setItem(name,this[name])}})}),e(l)})})}
// resize image blob
//prettier-ignore
function resizer(e,t,n){let c=unix_epoch();return new Promise((o,r)=>{try{let i=new Image,a=URL.createObjectURL(e);i.src=a,i.onload=(()=>{URL.revokeObjectURL(a);let e=t||240,r=n||240,h=i.width,d=i.height;h>d?h>e&&(d*=e/h,h=e):d>r&&(h*=r/d,d=r);let l=document.createElement("canvas");l.width=h,l.height=d,l.getContext("2d").drawImage(i,0,0,h,d),console.log("image resize ended: "+(unix_epoch()-c)+"ms"),o(l)})}catch(e){r(e)}})}
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

// returns estimated storage, may not be too accurate
// if only localforage had this feature already lmao
// prettier-ignore
function getEstimatedStorage(){return new Promise((t,e)=>{let a={artists:{estimate:0,total:0},albums:{estimate:0,total:0},bio:{estimate:0,total:0},cache:{estimate:0,total:0}};localforage.iterate(function(t,e){/^bio-/.test(e)?(a.bio.total++,a.bio.estimate+=new Blob([t]).size):/^artist-/.test(e)?(a.artists.total++,a.artists.estimate+=t.size):/^album-/.test(e)?(a.albums.total++,a.albums.estimate+=t.size):(a.cache.total++,a.cache.estimate+=new Blob([t]).size)}).then(()=>{let e=0,s=0;Object.keys(a).forEach(t=>{e=a[t].estimate+e,s=a[t].total+s}),a.estimate=e,a.total=s,t(a)}).catch(e)})}
// human readable bytes
function niceBytes(t) {
	var o = Math.floor(Math.log(t) / Math.log(1024));
	return 1 * (t / Math.pow(1024, o)).toFixed(2) + " " + ["B", "kB", "MB", "GB", "TB"][o];
}
function homeIndex(index) {
	qs("#home #wrapper").scrollTo({ left: (window.innerWidth - 20) * index, behavior: "smooth" });
	qsa("#home #wrapper > [data-index]").forEach((a, i) => {
		a.removeAttribute("class");
		if (i == index) a.className = "focus";
	});
	qs("#home>title").style.transform = `translateX(${[0, -88, -177][index]}px)`;
}
window.onhashchange = () => {
	let hash = location.hash.replace("#", "");
	console.log("hashchange: ", location.hash);
	qsa("body>[id]").forEach((a) => {
		if (a.id != hash) {
			a.classList.remove("selected");
			if (a.className == "") a.removeAttribute("class");
		} else a.classList.add("selected");
	});
	switchNav(hash);
};
// get color from image url
// prettier-ignore
function getAverageRGB(t){return new Promise((e,a)=>{let r=new Image;r.src=t,r.onload=(()=>{var t,a,g,n,o={r:0,g:0,b:0},d=document.createElement("canvas"),h=d.getContext&&d.getContext("2d"),c=-4,i={r:0,g:0,b:0},m=0;if(!h)return o;g=d.height=r.height,a=d.width=r.width,h.drawImage(r,0,0);try{t=h.getImageData(0,0,a,g)}catch(t){return o}for(n=t.data.length;(c+=20)<n;)++m,i.r+=t.data[c],i.g+=t.data[c+1],i.b+=t.data[c+2];i.r=~~(i.r/m),i.g=~~(i.g/m),i.b=~~(i.b/m);{let{r:t,g:e,b:a}=i,r=[t/255,e/255,a/255].map(t=>t<=.03928?t/12.92:Math.pow((t+.055)/1.055,2.4)),g=.2126*r[0]+.7152*r[1]+.0722*r[2];i.color=!(g>.179)}e(i)})})}
function factoryReset() {
	historyInt.pause();
	localforage.clear().then(() => window.close());
}
function deleteImages(type) {
	localforage.keys().then((a) => {
		a.filter((e) => e.includes(type + "-")).forEach((b) => localforage.removeItem(b));
	});
}
function deleteArtistImages() {
	return deleteImages("artist");
}
function deleteAlbumImages() {
	return deleteImages("album");
}
