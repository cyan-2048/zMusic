function hashCode(r) {
	var n,
		t = 0;
	if (0 === r.length) return t;
	for (n = 0; n < r.length; n++) (t = (t << 5) - t + r.charCodeAt(n)), (t |= 0);
	return Array.from(t.toString())
		.map((r) => "ledoshcyan"[r])
		.join("");
}
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
			this.index = 0;
			this.url = null;
			// weird bug, to fix we play a small audio file
			audio.src = "/js/test.mp3";
			let firstTime = true;
			this.onplayevent = () => {};
			audio.addEventListener("ended", () => {
				if (firstTime) {
					firstTime = false;
					return;
				}
				console.log("ended");
				this.discard();
			});
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
		discard(key) {
			if (settings.repeat == "repeat-one" && !key) {
				this.play();
				return;
			}
			URL.revokeObjectURL(this.url);
			this.url = null;
			if (this.index + 1 < this.queue.length) {
				this.index++;
				this.play();
				return;
			}
			if (this.index + 1 == this.queue.length && settings.repeat == "repeat-all") {
				this.index = 0;
				this.play();
			}
		}
		playPrevious() {
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
		play() {
			if (this.queue.length == 0) {
				this.index = 0;
				return;
			}
			let audio = this.audio;
			if (this.url == null) {
				let next = this.songs[this.index];
				audio.pause();
				getFile(next.filename).then((a) => {
					console.log("audio get file success!");
					let url = URL.createObjectURL(a);
					this.url = url;
					this.id = next.id;
					this.picture = hashCode((next.album || "Unknown Album") + (next.artist || "Unknown Artist").split(", ")[0] + next.year || "");
					this.song = next;
					audio.src = url;
					audio.load();
					setTimeout(() => {
						audio.currentTime = 0;
						audio.play();
						this.onplayevent();
					}, 50);
				});
			} else {
				audio.play();
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
	}

	return new Player();
})();

// [ "eacheolhlc", "eoncdohloe", "eoaoclds" ]
