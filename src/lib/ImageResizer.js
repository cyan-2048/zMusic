const canvas = document.createElement("canvas"),
	img = new Image(),
	ctx = canvas.getContext("2d");

canvas.height = 320;
canvas.width = 320;

let pending = Promise.resolve();

async function func(blob) {
	const start = new Date();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	const url = typeof blob === "string" ? blob : URL.createObjectURL(blob);
	img.src = url;
	await new Promise((res, err) => {
		img.onload = res;
		img.onerror = err;
	});
	ctx.drawImage(img, 0, 0, 320, 320);
	!typeof blob === "string" && URL.revokeObjectURL(url);
	const _blob = await new Promise((res) => canvas.toBlob(res, "image/jpg", 0.75));
	DEBUG && console.info("image resize:", new Date() - start + "ms");
	return _blob;
}

async function run(blob) {
	try {
		await pending;
	} finally {
		return func(blob);
	}
}

async function resizeImage(blob) {
	return (pending = run(blob));
}

export default resizeImage;