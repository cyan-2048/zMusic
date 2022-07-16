import LastFmBase from "./lastfm-base";

export default class LastFmUpdate extends LastFmBase {
	constructor(lastfm, method, session, options) {
		super();
		var retryOnErrors = [
				11, // Service offline
				16, // Temporarily unavailable
				29, // Rate limit exceeded
			],
			retrySchedule = [
				10 * 1000, // 10 seconds
				30 * 1000, // 30 seconds
				60 * 1000, // 1 minute
				5 * 60 * 1000, // 5 minutes
				15 * 60 * 1000, // 15 minutes
				30 * 60 * 1000, // 30 minutes
			];

		const self = this;
		options = options || {};

		registerEventHandlers(options);

		if (!session.isAuthorised()) {
			this.emit("error", {
				error: 4,
				message: "Authentication failed",
			});
			return;
		}
		if (method !== "scrobble" && method !== "nowplaying") {
			return;
		}
		update(method, options);

		function registerEventHandlers(options) {
			self.registerHandlers(options.handlers);
		}

		function update(method, options) {
			if (method == "scrobble" && !options.timestamp) {
				self.emit("error", {
					error: 6,
					message: "Invalid parameters - Timestamp is required for scrobbling",
				});
				return;
			}

			var retryCount = 0,
				params = buildRequestParams(options),
				requestMethod = method == "scrobble" ? "track.scrobble" : "track.updateNowPlaying";
			makeRequest();

			function makeRequest() {
				var request = lastfm.request(requestMethod, params);
				request.on("error", errorCallback);
				request.on("success", successCallback);
			}

			function successCallback({ data: response }) {
				if (response) {
					self.emit("success", options.track);
				}
			}

			function errorCallback(event) {
				let error = event.data;
				if (shouldBeRetried(error)) {
					var delay = delayFor(retryCount++),
						retry = {
							error: error.error,
							message: error.message,
							delay: delay,
						};
					self.emit("retrying", retry);
					self.scheduleCallback(makeRequest, delay);
					return;
				}
				bubbleError(error);
			}

			function shouldBeRetried(error) {
				return method == "scrobble" && retryOnErrors.includes(error.error);
			}
		}

		function bubbleError(error) {
			self.emit("error", error);
		}

		function buildRequestParams(params) {
			var requestParams = self.filterParameters(params);
			requestParams.sk = session.key;
			return requestParams;
		}

		function delayFor(retryCount) {
			var index = Math.min(retryCount, retrySchedule.length - 1);
			return retrySchedule[index];
		}
	}
}
