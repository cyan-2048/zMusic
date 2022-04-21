var { LastFmNode, md5 } = lastfm_node;
var lastfm = null;
var session = null;

function isLoggedIn() {
	let { api_key, token, secret, sk } = api_keys;
	return api_key && token && secret && sk ? true : false;
}

function lastfmAuth() {
	return new Promise((res, err) => {
		let windowRef = window.open("https://cyan-socials.herokuapp.com/scrobble/auth/");
		(function interval() {
			if (windowRef.closed) {
				if (localStorage.token) {
					Object.keys(localStorage).forEach((a) => {
						api_keys[a] = localStorage[a];
					});
					localStorage.clear();
					let { api_key, secret, token } = api_keys;

					lastfm = new LastFmNode({
						api_key,
						secret,
					});
					session = lastfm.session({
						token,
						handlers: {
							success: (s) => {
								let { key, user } = s;
								api_keys.sk = key;
								api_keys.user = user;
								res("done");
							},
						},
					});
				} else err(new Error("no session found"));
			} else setTimeout(interval, 1000);
		})();
	});
}
// clean objects, get rid of falsy values
function clean(obj) {
	let _obj = {};
	Object.keys(obj).forEach((a) => {
		if (obj[a]) _obj[a] = obj[a];
	});
	return _obj;
}

function songToScrobble(song) {
	let { artist, track, album, title } = song;
	return { artist, track: title, trackNumber: track, album };
}

function lastfmNowPlaying(song) {
	let obj = songToScrobble(song);
	return lastfm.update("nowplaying", session, clean(obj));
}
function lastfmScrobble(song) {
	let obj = songToScrobble(song);
	obj.timestamp = unix_epoch() / 1000;
	return lastfm.update("scrobble", session, clean(obj));
}
