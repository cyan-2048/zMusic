import App from "./App.svelte";
import * as helpers from "./lib/helper";
import * as shared from "./lib/shared";
import * as database from "./lib/database";

window.location.hash = "#/";
document.documentElement.lang = navigator.language;

if (PRODUCTION && !navigator.mozApps) {
	alert("this app is meant to run on KaiOS devices!");
	throw new Error("Not KaiOS device!");
}

if (!PRODUCTION) {
	function softkey(e) {
		const { target, key, bubbles, cancelable, repeat, type } = e;
		if (!/Left|Right/.test(key) || !key.startsWith("Arrow") || !e.shiftKey) return;
		e.stopImmediatePropagation();
		e.stopPropagation();
		e.preventDefault();
		target.dispatchEvent(new KeyboardEvent(type, { key: "Soft" + key.slice(5), bubbles, cancelable, repeat }));
	}

	document.addEventListener("keyup", softkey);
	document.addEventListener("keydown", softkey);
}

const app = new App({
	target: document.body,
});

if (DEBUG) {
	window.app = app;
	Object.assign(window, helpers, { shared, database });
}