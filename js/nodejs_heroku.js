// because of api secret and api key
// i decided to use a nodejs server
// here is what the server script does...
// api key may or may not be changed or randomly given
const express = require("express"),
	app = express(),
	fetch = require("node-fetch"),
	cors = require("cors"),
	cfg = {
		lastfmkey: "xxx",
		lastfm_secret: "xxx",
	};

app.get(
	"/scrobble",
	cors({
		origin: ["app://zmusic.cyankindasus.com"],
		optionsSuccessStatus: 200,
	}),
	(req, res) => {
		let api_url = "https://ws.audioscrobbler.com/2.0/";
		let my_key = cfg.lastfmkey;
		if (/album|artist/.test(req.query.type)) {
			let { type, artist, album, api_key } = req.query;
			let regex = /<a href="(.*)">Read more on Last\.fm<\/a>\. User-contributed text is available under the Creative Commons By-SA License; additional terms may apply\./;
			if (type == "album" && artist && album) {
				fetch(api_url + `?method=album.getinfo&api_key=${api_key || my_key}&artist=${artist}&album=${album}&format=json`)
					.then((r) => r.json())
					.then((r) => {
						if (r.error) return res.json(r);
						if (!r?.album?.wiki?.content) return res.json({ error: "no bio" });
						let result = r.album.wiki.content.replace(regex, "");
						res.json({ body: result });
					});
			} else if (type == "artist" && artist) {
				fetch(api_url + `?method=artist.getinfo&artist=${artist}&api_key=${api_key || my_key}&format=json`)
					.then((r) => r.json())
					.then((r) => {
						if (r.error) return res.json(r);
						if (!r?.artist?.bio?.content) return err("no bio");
						let result = r.artist.bio.content.replace(regex, "");
						res.json({ body: result });
					});
			}
		} else res.json({ error: "invalid type" });
	}
);
app.get("/scrobble/auth/", (req, res) => {
	res.redirect(`http://www.last.fm/api/auth/?api_key=${cfg.lastfmkey}&cb=https://cyan-socials.herokuapp.com/scrobble/hash/`);
});
app.get("/scrobble/hash/", (req, res) => {
	let { token } = req.query;
	if (!token) return res.json({ error: "no token" });
	let { lastfmkey, lastfm_secret } = cfg;
	res.redirect(`https://app.cyankindasus.com/zmusic/?token=${token}&api_key=${lastfmkey}&secret=${lastfm_secret}`);
});
