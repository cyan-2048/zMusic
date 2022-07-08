var { keypad_handler, modal } = (() => {
	let ded = () => {};

	let paused = false;
	function keypad_handler(e, type) {
		if (paused) return;
		const { key, target } = e,
			hash = location.hash.replace("#", "");
		if (type == "keydown") {
			if (hash == "player")
				switch (key) {
					case "Enter":
						player.toggle();
						break;
					case "ArrowUp":
						player.volumeUp();
						break;
					case "ArrowDown":
						player.volumeDown();
						break;
					case "1":
						player.seek(-1);
						break;
					case "3":
						player.seek(1);
						break;
				}
			if (hash == "settings")
				switch (key) {
					case "SoftRight":
						window.history.back();
						break;
					case "Enter":
						let href = target.getAttribute("href");
						let keys = Object.keys(settings.settings);
						if (href) {
							location.hash = href;
						} else {
							let el = target.dataset;
							if (el.type == "toggle") {
								let to = el.state == "on" ? false : true;
								el.state = to ? "on" : "off";
								if (keys.includes(target.id)) {
									settings[target.id] = to;
								}
							}
							if (el.type == "picker") {
								modal({
									type: "picker",
									title: target.innerText,
									body: el.options.split(","),
								}).then((a) => {
									el.state = a;
									settings[target.id] = a;
								}, ded);
							}
						}

						break;
					case "SoftLeft":
						settingsHelp(target.getAttribute("href") || target.id, target.innerText);
						break;
				}
		}
		if (type == "short") {
			if (hash == "player")
				switch (key) {
					case "ArrowLeft":
						player.playPrevious();
						break;
					case "ArrowRight":
						player.playNext();
						break;
				}
			if (hash != "home" && hash != "loading" && key == "Backspace") {
				window.history.back();
			}
			if (hash == "home" && key == "Enter") {
				let toHash = null;
				if (target.id == "nowplaying") toHash = "player";
				let href = target.getAttribute("href");
				if (href) toHash = href;
				if (toHash) {
					setTimeout(() => (location.hash = toHash), 100);
				}
			}
		}
		if (type == "repeat") {
			if (hash == "player")
				switch (key) {
					case "ArrowLeft":
						player.seek(-1);
						break;
					case "ArrowRight":
						player.seek(1);
						break;
				}
		}
		if (type == "long") {
		}
	}

	function settingsHelp(id, title) {
		let dict = {
			colors: "Choose an accent color, you can pick from a set of colors or specify your own using CSS.",
		};
		if (dict[id]) {
			modal({
				type: "alert",
				title,
				body: dict[id],
			});
		}
	}

	let lastActive = null;

	let modals = getId("modals");
	let footer = modals.qs("footer");

	let queue = [];

	function p() {
		lastActive = actEl();
		paused = true;
		SpatialNavigation.pause();
	}
	function r() {
		if (lastActive) lastActive.focus();
		lastActive = null;
		paused = false;
		SpatialNavigation.resume();
	}

	function softkeys(arr) {
		arr.forEach((a, i) => {
			footer.children[i].innerText = a;
		});
	}

	function systemPicker(array) {}

	function q(params) {
		let { res, err, obj } = params;
		let { title, body, placeholder, label, min, max, type, system } = obj;
		p();
		[...modals.children].forEach((a) => {
			try {
				if (a.tagName == "FOOTER") return;
				a.value = "";
				a.placeholder = "";
				a.min = "";
				a.max = "";
				a.innerHTML = "";
				a.style.display = "none";
			} catch (e) {}
		});
		function done(e, rej) {
			modals.classList.remove("open");
			setTimeout(() => {
				if (rej) err(e || "error");
				else res(e || "done");
				// if the promise makes another promise
				// only resume focus when that other one is done
				queue = queue.slice(1);
				if (queue.length > 0) {
					q(queue[0]);
				} else r();
			}, 300);
		}
		function block(e) {
			e.style.display = "block";
		}

		if (title) {
			let el = modals.qs("header");
			block(el);
			el.innerText = title;
		}
		if (label) {
			let el = modals.qs("h1");
			block(el);
			el.innerText = label;
		}

		modals.classList.add("open");
		if (/confirm|alert/.test(type)) {
			if (system) {
				window.alert(title + "\n" + body);
				res("done");
				done();
			} else {
				let el = modals.qs("#body");
				block(el);
				el.innerHTML = body;
				let isAlert = type == "alert";
				isAlert ? softkeys(["", "CLOSE", ""]) : softkeys(["CANCEL", "", "OK"]);
				let array = ["Backspace", "Enter"].concat(!isAlert ? ["SoftLeft", "SoftRight"] : []);
				window.addEventListener("keydown", function key(e) {
					let index = array.indexOf(e.key);
					if (index != -1) {
						window.removeEventListener("keydown", key);
						if (!isAlert) {
							done(null, ["Backspace", "SoftLeft"].includes(e.key));
						} else done();
					}
				});
			}
			// options returns index of array, while picker returns the option picked
		} else if (type == "options" || type == "picker") {
			if (!body instanceof Array) {
				return err("body is not array!");
			}
			if (body.length == 0) {
				return err("body is empty!");
			}
			if (system) {
			} else {
				softkeys(["", "SELECT", "CANCEL"]);
				let picker = qs("#modals #picker");
				block(picker);
				body.forEach((a, i) => {
					let el = document.createElement("div");
					el.innerText = a;
					el.tabIndex = i;
					picker.appendChild(el);
				});
				picker.children[0].focus();
				window.addEventListener("keydown", function keye(e) {
					let { key, target } = e;
					let index = Number(target.tabIndex);
					let re = () => window.removeEventListener("keydown", keye);
					if (/ArrowUp|ArrowDown/.test(key)) {
						let nav = key == "ArrowUp" ? -1 : 1;
						if ((index == 0 && nav == -1) || (index == body.length - 1 && nav == 1)) return;
						picker.children[index + nav].focus();
					} else if (key == "Enter") {
						re();
						done(type == "picker" ? body[index] : index);
					} else if (/Backspace|SoftRight/.test(key)) {
						re();
						done("cancelled", true);
					}
				});
			}
		} else if (/number|textarea|input/.test(type)) {
			let input = modals.qs(type == "input" ? "#text" : "#" + type);
			block(input);
			softkeys(["CANCEL", type == "textarea" ? "↵" : "", "OK"]);
			input.focus();
			input.oninput = function () {
				if (type == "number") {
					if (isNaN(this.value)) {
						this.value = min || 0;
						return;
					}
					if (max && Number(this.value) > max) {
						this.value = max;
					}
					if (Number(this.value) < (min || 0)) {
						this.value = min || 0;
					}
				}
			};
			window.addEventListener("keydown", function keye(e) {
				if (input.value == "" && e.key == "Backspace") e.preventDefault();
				if (type == "number") {
					if (/ArrowUp|ArrowDown/.test(e.key)) {
						input.value = Number(input.value) + (/Up/.test(e.key) ? 1 : -1);
						input.oninput();
					}
				}
				let re = () => {
					window.removeEventListener("keydown", keye);
					input.oninput = null;
				};
				if (/Soft/.test(e.key)) {
					if (/Right/.test(e.key)) {
						if (input.value != "") {
							re();
							done(input.value);
						}
					} else {
						re();
						done("cancelled", true);
					}
				}
			});
		}
	}

	function modal(obj) {
		if (typeof obj !== "object") {
			return Promise.reject("not object");
		}
		if (!obj.type) return Promise.reject("no modal type");
		return new Promise((res, err) => {
			let len = queue.length;
			queue.push({ res, obj, err });
			if (len == 0) q(queue[0]);
		});
	}

	return {
		keypad_handler,
		modal,
	};
})();
