/*// will only be using a few of the things
var // RecentTracksStream = require("./recenttracks-stream"),
	LastFmSession = require("./lastfm-session"),
	LastFmUpdate = require("./lastfm-update"),
	// LastFmInfo = require("./lastfm-info"),
	LastFmRequest = require("./lastfm-request");
*/

import LastFmSession from "./lastfm-session";
import LastFmUpdate from "./lastfm-update";
import LastFmRequest from "./lastfm-request";

export default class LastFmNode {
	constructor(options) {
		options = options || {};
		this.url = "/2.0/";
		this.host = options.host || "http://ws.audioscrobbler.com";
		this.format = "json";
		this.secret = options.secret;
		this.api_key = options.api_key;
	}
	request(method, params) {
		return new LastFmRequest(this, method, params);
	}

	update(method, session, options) {
		return new LastFmUpdate(this, method, session, options);
	}
	session(user, key) {
		return new LastFmSession(this, user, key);
	}
}

export { md5 } from "./md5";

/*
exports.md5 = require("js-md5");
exports.LastFmNode = LastFmNode;

 LastFmNode.prototype.stream = function (user, options) {
 	return new RecentTracksStream(this, user, options);
 };

 LastFmNode.prototype.info = function (type, options) {
 	return new LastFmInfo(this, type, options);
 };
*/
