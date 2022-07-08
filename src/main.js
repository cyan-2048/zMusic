import App from "./App.svelte";

const app = new App({
	target: document.body,
});

if (PRODUCTION && !navigator.mozApps) alert("this app is meant to run on KaiOS devices!");

import * as helpers from "./lib/helper";

if (DEBUG) {
	window.app = app;
	Object.assign(window, helpers);
}

DEBUG && console.clear();
