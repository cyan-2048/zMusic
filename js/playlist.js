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
// sync xmlhttp is acceptable for things stored in ram i guess
function blob2text(b) {
	var blob = b.slice(0, b.size, "text/plain"),
		uri = URL.createObjectURL(blob),
		xhr = new XMLHttpRequest();
	xhr.open("GET", uri, false);
	xhr.send();
	URL.revokeObjectURL(uri);
	return xhr.responseText;
}

function parseM3U(file) {
	if (file.constructor.name !== "File") return console.error("Not a File object");
	if (!file.name) return console.error("No filename");
	let text = blob2text(file);
	let array = text.split("\n");
	if (array[0] !== "#EXTM3U") return console.error("Not an M3U file");
	let songs = [];
	let filepath = file.name.split("/").slice(0, -1).join("/") + "/";
	array = array
		.map((a) => a.replace(/\\/g, "/"))
		.filter((a) => {
			if (a.startsWith("#") || /^(.*):\//.test(a) || a.includes("../") || a == "") return false;
			return true;
		})
		.map((a) => (a.startsWith("/") ? a : filepath + a))
		.forEach((a) => {
			let song = sift.find((e) => e.filename == a);
			if (song) songs.push(song);
		});
	return songs;
}
