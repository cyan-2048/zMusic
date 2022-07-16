/*
var //http = require("http"),
	//	querystring = require("querystring"),
	md5 = require("js-md5"),
	LastFmBase = require("./lastfm-base");
*/

import fetch from "../fetch";
import md5 from "./md5";
import LastFmBase from "./lastfm-base";

export default class LastFmRequest extends LastFmBase {
	constructor(lastfm, method, params) {
		super();
		const WRITE_METHODS = ["track.removetag", "track.scrobble", "track.updatenowplaying"],
			SIGNED_METHODS = [
				"auth.getmobilesession",
				"auth.getsession",
				"auth.gettoken",
				"radio.getplaylist",
				"user.getrecentstations",
				"user.getrecommendedartists",
				"user.getrecommendedevents",
			],
			self = this;

		params = params || {};

		self.registerHandlers(params.handlers);

		function sendRequest(host, url, params) {
			var httpVerb = isWriteRequest() ? "POST" : "GET";
			var requestParams = buildRequestParams(params);

			function query(obj) {
				var str = [];
				for (var p in obj)
					if (obj.hasOwnProperty(p)) {
						str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
					}
				return str.join("&");
			}

			const data = query(requestParams);

			if (httpVerb == "GET") {
				url += "?" + data;
			}

			const options = {
				//	host: host,
				//	path: url,
				method: httpVerb,
				headers: requestHeaders(httpVerb, host, data),
				body: httpVerb == "POST" ? data : null,
			};

			fetch(host + url, options)
				.then((r) => r.json())
				.then((r) => self.emit("success", r))
				.catch((e) => self.emit("error", e));
		}

		sendRequest(lastfm.host, lastfm.url, params);

		function buildRequestParams(params) {
			var requestParams = self.filterParameters(params, ["signed", "write"]);
			requestParams.method = method;
			requestParams.api_key = requestParams.api_key || lastfm.api_key;
			requestParams.format = requestParams.format || lastfm.format;

			if (requiresSignature()) {
				requestParams.api_sig = createSignature(requestParams, lastfm.secret);
			}

			return requestParams;
		}

		function requiresSignature() {
			return params.signed || isWriteRequest() || isSignedMethod(method);
		}

		function isWriteRequest() {
			return params.write || isWriteMethod(method);
		}

		function isSignedMethod(method) {
			return !!method && SIGNED_METHODS.includes(method.toLowerCase());
		}

		function isWriteMethod(method) {
			return !!method && WRITE_METHODS.includes(method.toLowerCase());
		}

		function requestHeaders(httpVerb, host, { length }) {
			return httpVerb === "POST"
				? {
						["Content-Length"]: length,
						["Content-Type"]: "application/x-www-form-urlencoded",
				  }
				: {};
		}

		function createSignature(params, secret) {
			let sig = "";
			Object.keys(params)
				.sort()
				.forEach((key) => {
					if (key != "format") {
						const value = params[key];
						sig += key + (typeof value !== "undefined" && value !== null ? value : "");
					}
				});
			return md5(sig + secret);
		}
	}
}
