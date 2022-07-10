let firstTime = true;
// prettier-ignore
function hashCode(r){var n,o=0;if(0===r.length)return o;for(n=0;n<r.length;n++)o=(o<<5)-o+r.charCodeAt(n),o|=0;return Array.from(o.toString()).map(r=>"ledoshcyan"[r]).join("")}
function getFile(filename) {
	return new Promise((res, err) => {
		let get = navigator.getDeviceStorage("sdcard").get(filename);
		get.onsuccess = function () {
			res(this.result);
		};
		get.onerror = function (e) {
			err(e);
		};
	});
}
// returns new array that's shuffled
function shuffle(arr = []) {
	return [...arr].sort(() => 0.5 - Math.random());
}
// returns array of things of something
function spread(obj, arr) {
	return arr.map((a) => obj[a]);
}
// hashAlbum
function hashAlbum(song) {
	return hashCode((song.album || "Unknown Album") + (song.artist || "Unknown Artist").split(", ")[0] + song.year || "");
}
const player = (() => {
	function handleVolume(e) {
		let o = () => {},
			t = { requestDown: o, requestUp: o, requestShow: o },
			u = -1 == e || 1 == e;
		(navigator.volumeManager || t)[u ? "request" + (-1 == e ? "Down" : "Up") : "requestShow"]();
	}
	function convertTime(t) {
		if (isNaN(t)) return "string" == typeof t ? t.replace("00:", "") : "00:00";
		let r = "",
			e = Math.floor(t / 60);
		if (e > 59) {
			let t = Math.floor(e / 60);
			(e = Math.floor(e - Number(60 * t))), (r = t);
		}
		"" != r && (r < 10 ? (r = "0" + String(r) + ":") : (r += ":")), e < 10 && (e = "0" + String(e));
		let o = Math.floor(t % 60);
		return o < 10 && (o = "0" + String(o)), r + e + ":" + o;
	}

	class Player {
		constructor() {
			let audio = new Audio();
			audio.autoplay = true;
			audio.mozAudioChannelType = "content";
			(navigator.mozAudioChannelManager || {}).volumeControlChannel = "content";
			this.audio = audio;
			this.queue = [];
			this.unshuffled = [];
			this.shuffle = false;
			this.index = 0;
			this.url = null;
			// weird bug, to fix we play a small audio file
			audio.src = "/js/test.mp3";
			this.onplayevent = () => {};
			audio.addEventListener("ended", () => {
				if (firstTime) {
					setTimeout(() => (getId("stall").style.display = "none"), 1000);
					if (typeof firstTime == "function") firstTime();
					firstTime = false;
					return;
				}
				console.log("ended");
				if (player.audio.duration > 30 && player.song.artist !== "Unknown Artist" && isLoggedIn() && settings.scrobble) {
					lastfmScrobble(player.song);
				}
				this.discard();
			});
			let unplugged = false;
			(navigator.mozAudioChannelManager || {}).onheadphoneschange = function () {
				if (this.headphones == false) {
					unplugged = true;
					audio.pause();
				} else if (unplugged) {
					unplugged = false;
					audio.play();
				} else unplugged = false;
			};
		}

		add(arg) {
			let id = arg.id || arg;
			if (this.queue.includes(id)) {
				this.queue = this.queue.filter((a) => a != id);
			}
			this.queue.push(id);
			return this.queue;
		}
		get songs() {
			return this.queue.map((a) => sift.find((e) => e.id == a));
		}
		get currentTime() {
			return this.audio.currentTime;
		}
		set currentTime(arg) {
			this.audio.currentTime = arg;
		}
		// returns time in pretty manner
		get time() {
			let audio = this.audio;
			let current = audio.currentTime,
				duration = audio.duration;
			return {
				duration: convertTime(duration),
				remain: convertTime(duration - current),
				current: convertTime(current),
				progress: (current / duration) * 100,
			};
		}

		playNext() {
			this.audio.pause();
			setTimeout(() => {
				if (this.index == this.queue.length - 1) {
					this.index = -1;
				}
				this.discard(true);
			}, 30);
		}
		discard(key, force) {
			if (settings.repeat == "repeat-one" && !key && !force) {
				this.audio.pause();
				setTimeout(() => (this.currentTime = 0), 20);
				setTimeout(() => this.audio.play(), 500);
				return;
			}
			try {
				URL.revokeObjectURL(this.url);
			} catch (e) {}
			this.url = null;
			if (force) return;
			if (this.index + 1 < this.queue.length) {
				this.index++;
				this.play();
				return;
			}
			if (this.index + 1 == this.queue.length && (settings.repeat == "repeat-all" || this.shuffle)) {
				this.index = 0;
				this.play();
			}
		}
		playPrevious() {
			if (this.currentTime > 3) {
				return (this.currentTime = 0);
			}
			this.audio.pause();
			setTimeout(() => {
				if (this.index == 0) {
					this.index = this.queue.length - 2;
				} else {
					this.index = this.index - 2;
				}
				this.discard(true);
			}, 30);
		}

		pause() {
			this.audio.pause();
		}
		play(pause, index) {
			if (this.queue.length == 0) {
				this.index = 0;
				return;
			}
			let audio = this.audio;
			if (this.url == null) {
				if (index) this.index = index;
				let next = this.songs[this.index];
				if (!next) return this.playlist(sift, 0, true);
				audio.pause();
				getFile(next.filename)
					.then((a) => {
						let url = URL.createObjectURL(a);
						this.url = url;
						this.id = next.id;
						this.picture = hashAlbum(next);
						this.song = next;
						audio.src = url;
						audio.load();
						setTimeout(() => {
							audio.currentTime = 0;
							if (!pause) audio.play();
							else audio.pause();
							this.onplayevent();
						}, 50);
						if (history.albums.includes(this.picture)) {
							history.albums = history.albums.filter((a) => a != this.picture);
						}
						history.albums.unshift(this.picture);
						if (!this.shuffle) {
							history.queue = this.queue;
							history.index = this.index;
						} else {
							history.queue = this.unshuffled;
							history.index = this.unshuffled.indexOf(this.queue[this.index]);
						}
					})
					.catch((e) => {
						this.play(false, this.index + 1);
					});
			} else {
				audio.play();
			}
		}
		playIndex(index, pause) {
			if (index < this.queue.length && index >= 0) {
				this.discard(true, true);
				this.play(pause, index);
			}
		}
		volumeUp() {
			handleVolume(1);
		}
		volumeDown() {
			handleVolume(-1);
		}
		removeEventListener(name, func) {
			this.audio.removeEventListener(name, func);
		}
		addEventListener(name, func) {
			this.audio.addEventListener(name, func);
		}
		seek(arg) {
			if (arg > 0) {
				this.audio.currentTime = this.audio.currentTime + settings.seek;
			} else {
				this.audio.currentTime = this.audio.currentTime - settings.seek;
			}
		}
		toggle() {
			if (this.audio.paused) {
				this.play();
			} else this.pause();
		}
		playlist(array = [], index = 0, pause) {
			if (array.length == 0) return;
			this.pause();
			this.discard(false, true);
			if (array[0].id) {
				this.queue = array.map((a) => a.id);
			} else {
				this.queue = array;
			}
			this.shuffle = false;
			this.unshuffled = [];
			this.play(pause, index);
		}
		toggleShuffle() {
			if (this.shuffle) {
				this.queue = [...this.unshuffled];
				this.index = this.queue.indexOf(this.id);
				this.unshuffled = [];
				this.shuffle = false;
				let { songs, index } = this;
				getId("player_queue").innerText = ((songs[index + 1] || {}).title || "") + "\n" + ((songs[index + 2] || {}).title || "");
			} else {
				// we don't want any arrays being referenced
				this.unshuffled = [...this.queue];
				this.queue = shuffle(this.queue);
				this.index = this.queue.indexOf(this.id);
				this.shuffle = true;
				getId("player_queue").innerText = "";
			}
		}
	}

	return new Player();
})();

// [ "eacheolhlc", "eoncdohloe", "eoaoclds" ]