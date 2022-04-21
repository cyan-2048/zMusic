!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{("undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this).lastfm_node=e()}}((function(){var define,module,exports,_$events_1={},ReflectOwnKeys,R="object"==typeof Reflect?Reflect:null,ReflectApply=R&&"function"==typeof R.apply?R.apply:function(e,t,r){return Function.prototype.apply.call(e,t,r)};ReflectOwnKeys=R&&"function"==typeof R.ownKeys?R.ownKeys:Object.getOwnPropertySymbols?function(e){return Object.getOwnPropertyNames(e).concat(Object.getOwnPropertySymbols(e))}:function(e){return Object.getOwnPropertyNames(e)};var NumberIsNaN=Number.isNaN||function(e){return e!=e};function EventEmitter(){EventEmitter.init.call(this)}_$events_1=EventEmitter,_$events_1.once=function(e,t){return new Promise((function(r,n){function i(r){e.removeListener(t,o),n(r)}function o(){"function"==typeof e.removeListener&&e.removeListener("error",i),r([].slice.call(arguments))}eventTargetAgnosticAddListener(e,t,o,{once:!0}),"error"!==t&&function(e,t,r){"function"==typeof e.on&&eventTargetAgnosticAddListener(e,"error",t,{once:!0})}(e,i)}))},EventEmitter.EventEmitter=EventEmitter,EventEmitter.prototype._events=void 0,EventEmitter.prototype._eventsCount=0,EventEmitter.prototype._maxListeners=void 0;var defaultMaxListeners=10;function checkListener(e){if("function"!=typeof e)throw new TypeError('The "listener" argument must be of type Function. Received type '+typeof e)}function _getMaxListeners(e){return void 0===e._maxListeners?EventEmitter.defaultMaxListeners:e._maxListeners}function _addListener(e,t,r,n){var i,o,s,u;if(checkListener(r),void 0===(o=e._events)?(o=e._events=Object.create(null),e._eventsCount=0):(void 0!==o.newListener&&(e.emit("newListener",t,r.listener?r.listener:r),o=e._events),s=o[t]),void 0===s)s=o[t]=r,++e._eventsCount;else if("function"==typeof s?s=o[t]=n?[r,s]:[s,r]:n?s.unshift(r):s.push(r),(i=_getMaxListeners(e))>0&&s.length>i&&!s.warned){s.warned=!0;var a=new Error("Possible EventEmitter memory leak detected. "+s.length+" "+String(t)+" listeners added. Use emitter.setMaxListeners() to increase limit");a.name="MaxListenersExceededWarning",a.emitter=e,a.type=t,a.count=s.length,u=a,console&&console.warn&&console.warn(u)}return e}function _onceWrap(e,t,r){var n={fired:!1,wrapFn:void 0,target:e,type:t,listener:r},i=function(){if(!this.fired)return this.target.removeListener(this.type,this.wrapFn),this.fired=!0,0===arguments.length?this.listener.call(this.target):this.listener.apply(this.target,arguments)}.bind(n);return i.listener=r,n.wrapFn=i,i}function _listeners(e,t,r){var n=e._events;if(void 0===n)return[];var i=n[t];return void 0===i?[]:"function"==typeof i?r?[i.listener||i]:[i]:r?function(e){for(var t=new Array(e.length),r=0;r<t.length;++r)t[r]=e[r].listener||e[r];return t}(i):arrayClone(i,i.length)}function listenerCount(e){var t=this._events;if(void 0!==t){var r=t[e];if("function"==typeof r)return 1;if(void 0!==r)return r.length}return 0}function arrayClone(e,t){for(var r=new Array(t),n=0;n<t;++n)r[n]=e[n];return r}function eventTargetAgnosticAddListener(e,t,r,n){if("function"==typeof e.on)n.once?e.once(t,r):e.on(t,r);else{if("function"!=typeof e.addEventListener)throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type '+typeof e);e.addEventListener(t,(function i(o){n.once&&e.removeEventListener(t,i),r(o)}))}}Object.defineProperty(EventEmitter,"defaultMaxListeners",{enumerable:!0,get:function(){return defaultMaxListeners},set:function(e){if("number"!=typeof e||e<0||NumberIsNaN(e))throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received '+e+".");defaultMaxListeners=e}}),EventEmitter.init=function(){void 0!==this._events&&this._events!==Object.getPrototypeOf(this)._events||(this._events=Object.create(null),this._eventsCount=0),this._maxListeners=this._maxListeners||void 0},EventEmitter.prototype.setMaxListeners=function(e){if("number"!=typeof e||e<0||NumberIsNaN(e))throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received '+e+".");return this._maxListeners=e,this},EventEmitter.prototype.getMaxListeners=function(){return _getMaxListeners(this)},EventEmitter.prototype.emit=function(e){for(var t=[],r=1;r<arguments.length;r++)t.push(arguments[r]);var n="error"===e,i=this._events;if(void 0!==i)n=n&&void 0===i.error;else if(!n)return!1;if(n){var o;if(t.length>0&&(o=t[0]),o instanceof Error)throw o;var s=new Error("Unhandled error."+(o?" ("+o.message+")":""));throw s.context=o,s}var u=i[e];if(void 0===u)return!1;if("function"==typeof u)ReflectApply(u,this,t);else{var a=u.length,c=arrayClone(u,a);for(r=0;r<a;++r)ReflectApply(c[r],this,t)}return!0},EventEmitter.prototype.addListener=function(e,t){return _addListener(this,e,t,!1)},EventEmitter.prototype.on=EventEmitter.prototype.addListener,EventEmitter.prototype.prependListener=function(e,t){return _addListener(this,e,t,!0)},EventEmitter.prototype.once=function(e,t){return checkListener(t),this.on(e,_onceWrap(this,e,t)),this},EventEmitter.prototype.prependOnceListener=function(e,t){return checkListener(t),this.prependListener(e,_onceWrap(this,e,t)),this},EventEmitter.prototype.removeListener=function(e,t){var r,n,i,o,s;if(checkListener(t),void 0===(n=this._events))return this;if(void 0===(r=n[e]))return this;if(r===t||r.listener===t)0==--this._eventsCount?this._events=Object.create(null):(delete n[e],n.removeListener&&this.emit("removeListener",e,r.listener||t));else if("function"!=typeof r){for(i=-1,o=r.length-1;o>=0;o--)if(r[o]===t||r[o].listener===t){s=r[o].listener,i=o;break}if(i<0)return this;0===i?r.shift():function(e,t){for(;t+1<e.length;t++)e[t]=e[t+1];e.pop()}(r,i),1===r.length&&(n[e]=r[0]),void 0!==n.removeListener&&this.emit("removeListener",e,s||t)}return this},EventEmitter.prototype.off=EventEmitter.prototype.removeListener,EventEmitter.prototype.removeAllListeners=function(e){var t,r,n;if(void 0===(r=this._events))return this;if(void 0===r.removeListener)return 0===arguments.length?(this._events=Object.create(null),this._eventsCount=0):void 0!==r[e]&&(0==--this._eventsCount?this._events=Object.create(null):delete r[e]),this;if(0===arguments.length){var i,o=Object.keys(r);for(n=0;n<o.length;++n)"removeListener"!==(i=o[n])&&this.removeAllListeners(i);return this.removeAllListeners("removeListener"),this._events=Object.create(null),this._eventsCount=0,this}if("function"==typeof(t=r[e]))this.removeListener(e,t);else if(void 0!==t)for(n=t.length-1;n>=0;n--)this.removeListener(e,t[n]);return this},EventEmitter.prototype.listeners=function(e){return _listeners(this,e,!0)},EventEmitter.prototype.rawListeners=function(e){return _listeners(this,e,!1)},EventEmitter.listenerCount=function(e,t){return"function"==typeof e.listenerCount?e.listenerCount(t):listenerCount.call(e,t)},EventEmitter.prototype.listenerCount=listenerCount,EventEmitter.prototype.eventNames=function(){return this._eventsCount>0?ReflectOwnKeys(this._events):[]};var _$lastfmBase_4={},{EventEmitter:__EventEmitter_4}=_$events_1,LastFmBase=function(){__EventEmitter_4.call(this)};function each(e,t){return Object.keys(e).forEach(r=>{t(e[r],r)})}(LastFmBase.prototype=Object.create(__EventEmitter_4.prototype)).registerHandlers=function(e){if("object"==typeof e){var t=this;each(e,(function(e,r){t.on(r,e)}))}};var defaultBlacklist=["error","success","handlers"];LastFmBase.prototype.filterParameters=function(e,t){var r={};return each(e,(function(e,n){var i;i=n,defaultBlacklist.includes(i)||(t||[]).includes(i)||(r[n]=e)})),r},LastFmBase.prototype.scheduleCallback=function(e,t){return setTimeout(e,t)},LastFmBase.prototype.cancelCallback=function(e){clearTimeout(e)},_$lastfmBase_4=LastFmBase;var _$lastfmSession_6={},LastFmSession=function(e,t,r){t=t||{};var n=this,i=!0;function o(t,r){(function(e){n.registerHandlers(e.handlers)})(r=r||{}),function t(r,o){if(o=o||{},r){var u={token:r},a=e.request("auth.getsession",u);a.on("success",s),a.on("error",(function(e){if(function(e){return 14==e.error||16==e.error||11==e.error}(e)){if(!i)return;var s=o.retryInterval||1e4;return n.emit("retrying",{error:e.error,message:e.message,delay:s}),void n.scheduleCallback((function(){t(r,o)}),s)}!function(e){n.emit("error",e)}(e)}))}else n.emit("error",new Error("No token supplied"))}(t,r)}function s(e){var t;e.session?(t=e.session,n.user=t.name,n.key=t.key,n.emit("authorised",n),n.emit("success",n)):n.emit("error",new Error("Unexpected error"))}_$lastfmBase_4.call(this),"object"!=typeof t?(this.user=t||"",this.key=r||""):(this.user=t.user||"",this.key=t.key||""),t.token&&o(t.token,t),this.authorise=function(e,t){o(e,t)},this.isAuthorised=function(){return""!==n.key},this.cancel=function(){i=!1}};LastFmSession.prototype=Object.create(_$lastfmBase_4.prototype),_$lastfmSession_6=LastFmSession;var _$lastfmUpdate_7={},retryOnErrors=[11,16,29],retrySchedule=[1e4,3e4,6e4,3e5,9e5,18e5],LastFmUpdate=function(e,t,r,n){var i=this;n=n||{},_$lastfmBase_4.call(this),function(e){i.registerHandlers(e.handlers)}(n),r.isAuthorised()?"scrobble"!==t&&"nowplaying"!==t||function(t,n){if("scrobble"!=t||n.timestamp){var o=0,s=function(e){var t=i.filterParameters(e);return t.sk=r.key,t}(n),u="scrobble"==t?"track.scrobble":"track.updateNowPlaying";a()}else i.emit("error",{error:6,message:"Invalid parameters - Timestamp is required for scrobbling"});function a(){var t=e.request(u,s);t.on("error",f),t.on("success",c)}function c(e){e&&i.emit("success",n.track)}function f(e){if(function(e){return"scrobble"==t&&retryOnErrors.includes(e.error)}(e)){var r=function(e){var t=Math.min(e,retrySchedule.length-1);return retrySchedule[t]}(o++),n={error:e.error,message:e.message,delay:r};return i.emit("retrying",n),void i.scheduleCallback(a,r)}!function(e){i.emit("error",e)}(e)}}(t,n):this.emit("error",{error:4,message:"Authentication failed"})};LastFmUpdate.prototype=Object.create(_$lastfmBase_4.prototype),_$lastfmUpdate_7=LastFmUpdate;var _$browser_2={},cachedSetTimeout,cachedClearTimeout,process=_$browser_2={};function defaultSetTimout(){throw new Error("setTimeout has not been defined")}function defaultClearTimeout(){throw new Error("clearTimeout has not been defined")}function runTimeout(e){if(cachedSetTimeout===setTimeout)return setTimeout(e,0);if((cachedSetTimeout===defaultSetTimout||!cachedSetTimeout)&&setTimeout)return cachedSetTimeout=setTimeout,setTimeout(e,0);try{return cachedSetTimeout(e,0)}catch(t){try{return cachedSetTimeout.call(null,e,0)}catch(t){return cachedSetTimeout.call(this,e,0)}}}!function(){try{cachedSetTimeout="function"==typeof setTimeout?setTimeout:defaultSetTimout}catch(e){cachedSetTimeout=defaultSetTimout}try{cachedClearTimeout="function"==typeof clearTimeout?clearTimeout:defaultClearTimeout}catch(e){cachedClearTimeout=defaultClearTimeout}}();var currentQueue,queue=[],draining=!1,queueIndex=-1;function cleanUpNextTick(){draining&&currentQueue&&(draining=!1,currentQueue.length?queue=currentQueue.concat(queue):queueIndex=-1,queue.length&&drainQueue())}function drainQueue(){if(!draining){var e=runTimeout(cleanUpNextTick);draining=!0;for(var t=queue.length;t;){for(currentQueue=queue,queue=[];++queueIndex<t;)currentQueue&&currentQueue[queueIndex].run();queueIndex=-1,t=queue.length}currentQueue=null,draining=!1,function(e){if(cachedClearTimeout===clearTimeout)return clearTimeout(e);if((cachedClearTimeout===defaultClearTimeout||!cachedClearTimeout)&&clearTimeout)return cachedClearTimeout=clearTimeout,clearTimeout(e);try{cachedClearTimeout(e)}catch(t){try{return cachedClearTimeout.call(null,e)}catch(t){return cachedClearTimeout.call(this,e)}}}(e)}}function Item(e,t){this.fun=e,this.array=t}function noop(){}process.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var r=1;r<arguments.length;r++)t[r-1]=arguments[r];queue.push(new Item(e,t)),1!==queue.length||draining||runTimeout(drainQueue)},Item.prototype.run=function(){this.fun.apply(null,this.array)},process.title="browser",process.browser=!0,process.env={},process.argv=[],process.version="",process.versions={},process.on=noop,process.addListener=noop,process.once=noop,process.off=noop,process.removeListener=noop,process.removeAllListeners=noop,process.emit=noop,process.prependListener=noop,process.prependOnceListener=noop,process.listeners=function(e){return[]},process.binding=function(e){throw new Error("process.binding is not supported")},process.cwd=function(){return"/"},process.chdir=function(e){throw new Error("process.chdir is not supported")},process.umask=function(){return 0};var _$md5_8={exports:{}};(function(process,global){(function(){!function(){"use strict";var ERROR="input is invalid type",WINDOW="object"==typeof window,root=WINDOW?window:{};root.JS_MD5_NO_WINDOW&&(WINDOW=!1);var WEB_WORKER=!WINDOW&&"object"==typeof self,NODE_JS=!root.JS_MD5_NO_NODE_JS&&"object"==typeof process&&process.versions&&process.versions.node;NODE_JS?root=global:WEB_WORKER&&(root=self);var COMMON_JS=!root.JS_MD5_NO_COMMON_JS&&_$md5_8.exports,AMD="function"==typeof define&&define.amd,ARRAY_BUFFER=!root.JS_MD5_NO_ARRAY_BUFFER&&"undefined"!=typeof ArrayBuffer,HEX_CHARS="0123456789abcdef".split(""),EXTRA=[128,32768,8388608,-2147483648],SHIFT=[0,8,16,24],OUTPUT_TYPES=["hex","array","digest","buffer","arrayBuffer","base64"],BASE64_ENCODE_CHAR="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split(""),blocks=[],buffer8;if(ARRAY_BUFFER){var buffer=new ArrayBuffer(68);buffer8=new Uint8Array(buffer),blocks=new Uint32Array(buffer)}!root.JS_MD5_NO_NODE_JS&&Array.isArray||(Array.isArray=function(e){return"[object Array]"===Object.prototype.toString.call(e)}),!ARRAY_BUFFER||!root.JS_MD5_NO_ARRAY_BUFFER_IS_VIEW&&ArrayBuffer.isView||(ArrayBuffer.isView=function(e){return"object"==typeof e&&e.buffer&&e.buffer.constructor===ArrayBuffer});var createOutputMethod=function(e){return function(t){return new Md5(!0).update(t)[e]()}},createMethod=function(){var e=createOutputMethod("hex");NODE_JS&&(e=nodeWrap(e)),e.create=function(){return new Md5},e.update=function(t){return e.create().update(t)};for(var t=0;t<OUTPUT_TYPES.length;++t){var r=OUTPUT_TYPES[t];e[r]=createOutputMethod(r)}return e},nodeWrap=function(method){var crypto=eval("require('crypto')"),Buffer=eval("require('buffer').Buffer"),nodeMethod=function(e){if("string"==typeof e)return crypto.createHash("md5").update(e,"utf8").digest("hex");if(null==e)throw ERROR;return e.constructor===ArrayBuffer&&(e=new Uint8Array(e)),Array.isArray(e)||ArrayBuffer.isView(e)||e.constructor===Buffer?crypto.createHash("md5").update(new Buffer(e)).digest("hex"):method(e)};return nodeMethod};function Md5(e){if(e)blocks[0]=blocks[16]=blocks[1]=blocks[2]=blocks[3]=blocks[4]=blocks[5]=blocks[6]=blocks[7]=blocks[8]=blocks[9]=blocks[10]=blocks[11]=blocks[12]=blocks[13]=blocks[14]=blocks[15]=0,this.blocks=blocks,this.buffer8=buffer8;else if(ARRAY_BUFFER){var t=new ArrayBuffer(68);this.buffer8=new Uint8Array(t),this.blocks=new Uint32Array(t)}else this.blocks=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];this.h0=this.h1=this.h2=this.h3=this.start=this.bytes=this.hBytes=0,this.finalized=this.hashed=!1,this.first=!0}Md5.prototype.update=function(e){if(!this.finalized){var t,r=typeof e;if("string"!==r){if("object"!==r)throw ERROR;if(null===e)throw ERROR;if(ARRAY_BUFFER&&e.constructor===ArrayBuffer)e=new Uint8Array(e);else if(!(Array.isArray(e)||ARRAY_BUFFER&&ArrayBuffer.isView(e)))throw ERROR;t=!0}for(var n,i,o=0,s=e.length,u=this.blocks,a=this.buffer8;o<s;){if(this.hashed&&(this.hashed=!1,u[0]=u[16],u[16]=u[1]=u[2]=u[3]=u[4]=u[5]=u[6]=u[7]=u[8]=u[9]=u[10]=u[11]=u[12]=u[13]=u[14]=u[15]=0),t)if(ARRAY_BUFFER)for(i=this.start;o<s&&i<64;++o)a[i++]=e[o];else for(i=this.start;o<s&&i<64;++o)u[i>>2]|=e[o]<<SHIFT[3&i++];else if(ARRAY_BUFFER)for(i=this.start;o<s&&i<64;++o)(n=e.charCodeAt(o))<128?a[i++]=n:n<2048?(a[i++]=192|n>>6,a[i++]=128|63&n):n<55296||n>=57344?(a[i++]=224|n>>12,a[i++]=128|n>>6&63,a[i++]=128|63&n):(n=65536+((1023&n)<<10|1023&e.charCodeAt(++o)),a[i++]=240|n>>18,a[i++]=128|n>>12&63,a[i++]=128|n>>6&63,a[i++]=128|63&n);else for(i=this.start;o<s&&i<64;++o)(n=e.charCodeAt(o))<128?u[i>>2]|=n<<SHIFT[3&i++]:n<2048?(u[i>>2]|=(192|n>>6)<<SHIFT[3&i++],u[i>>2]|=(128|63&n)<<SHIFT[3&i++]):n<55296||n>=57344?(u[i>>2]|=(224|n>>12)<<SHIFT[3&i++],u[i>>2]|=(128|n>>6&63)<<SHIFT[3&i++],u[i>>2]|=(128|63&n)<<SHIFT[3&i++]):(n=65536+((1023&n)<<10|1023&e.charCodeAt(++o)),u[i>>2]|=(240|n>>18)<<SHIFT[3&i++],u[i>>2]|=(128|n>>12&63)<<SHIFT[3&i++],u[i>>2]|=(128|n>>6&63)<<SHIFT[3&i++],u[i>>2]|=(128|63&n)<<SHIFT[3&i++]);this.lastByteIndex=i,this.bytes+=i-this.start,i>=64?(this.start=i-64,this.hash(),this.hashed=!0):this.start=i}return this.bytes>4294967295&&(this.hBytes+=this.bytes/4294967296<<0,this.bytes=this.bytes%4294967296),this}},Md5.prototype.finalize=function(){if(!this.finalized){this.finalized=!0;var e=this.blocks,t=this.lastByteIndex;e[t>>2]|=EXTRA[3&t],t>=56&&(this.hashed||this.hash(),e[0]=e[16],e[16]=e[1]=e[2]=e[3]=e[4]=e[5]=e[6]=e[7]=e[8]=e[9]=e[10]=e[11]=e[12]=e[13]=e[14]=e[15]=0),e[14]=this.bytes<<3,e[15]=this.hBytes<<3|this.bytes>>>29,this.hash()}},Md5.prototype.hash=function(){var e,t,r,n,i,o,s=this.blocks;this.first?t=((t=((e=((e=s[0]-680876937)<<7|e>>>25)-271733879<<0)^(r=((r=(-271733879^(n=((n=(-1732584194^2004318071&e)+s[1]-117830708)<<12|n>>>20)+e<<0)&(-271733879^e))+s[2]-1126478375)<<17|r>>>15)+n<<0)&(n^e))+s[3]-1316259209)<<22|t>>>10)+r<<0:(e=this.h0,t=this.h1,r=this.h2,t=((t+=((e=((e+=((n=this.h3)^t&(r^n))+s[0]-680876936)<<7|e>>>25)+t<<0)^(r=((r+=(t^(n=((n+=(r^e&(t^r))+s[1]-389564586)<<12|n>>>20)+e<<0)&(e^t))+s[2]+606105819)<<17|r>>>15)+n<<0)&(n^e))+s[3]-1044525330)<<22|t>>>10)+r<<0),t=((t+=((e=((e+=(n^t&(r^n))+s[4]-176418897)<<7|e>>>25)+t<<0)^(r=((r+=(t^(n=((n+=(r^e&(t^r))+s[5]+1200080426)<<12|n>>>20)+e<<0)&(e^t))+s[6]-1473231341)<<17|r>>>15)+n<<0)&(n^e))+s[7]-45705983)<<22|t>>>10)+r<<0,t=((t+=((e=((e+=(n^t&(r^n))+s[8]+1770035416)<<7|e>>>25)+t<<0)^(r=((r+=(t^(n=((n+=(r^e&(t^r))+s[9]-1958414417)<<12|n>>>20)+e<<0)&(e^t))+s[10]-42063)<<17|r>>>15)+n<<0)&(n^e))+s[11]-1990404162)<<22|t>>>10)+r<<0,t=((t+=((e=((e+=(n^t&(r^n))+s[12]+1804603682)<<7|e>>>25)+t<<0)^(r=((r+=(t^(n=((n+=(r^e&(t^r))+s[13]-40341101)<<12|n>>>20)+e<<0)&(e^t))+s[14]-1502002290)<<17|r>>>15)+n<<0)&(n^e))+s[15]+1236535329)<<22|t>>>10)+r<<0,t=((t+=((n=((n+=(t^r&((e=((e+=(r^n&(t^r))+s[1]-165796510)<<5|e>>>27)+t<<0)^t))+s[6]-1069501632)<<9|n>>>23)+e<<0)^e&((r=((r+=(e^t&(n^e))+s[11]+643717713)<<14|r>>>18)+n<<0)^n))+s[0]-373897302)<<20|t>>>12)+r<<0,t=((t+=((n=((n+=(t^r&((e=((e+=(r^n&(t^r))+s[5]-701558691)<<5|e>>>27)+t<<0)^t))+s[10]+38016083)<<9|n>>>23)+e<<0)^e&((r=((r+=(e^t&(n^e))+s[15]-660478335)<<14|r>>>18)+n<<0)^n))+s[4]-405537848)<<20|t>>>12)+r<<0,t=((t+=((n=((n+=(t^r&((e=((e+=(r^n&(t^r))+s[9]+568446438)<<5|e>>>27)+t<<0)^t))+s[14]-1019803690)<<9|n>>>23)+e<<0)^e&((r=((r+=(e^t&(n^e))+s[3]-187363961)<<14|r>>>18)+n<<0)^n))+s[8]+1163531501)<<20|t>>>12)+r<<0,t=((t+=((n=((n+=(t^r&((e=((e+=(r^n&(t^r))+s[13]-1444681467)<<5|e>>>27)+t<<0)^t))+s[2]-51403784)<<9|n>>>23)+e<<0)^e&((r=((r+=(e^t&(n^e))+s[7]+1735328473)<<14|r>>>18)+n<<0)^n))+s[12]-1926607734)<<20|t>>>12)+r<<0,t=((t+=((o=(n=((n+=((i=t^r)^(e=((e+=(i^n)+s[5]-378558)<<4|e>>>28)+t<<0))+s[8]-2022574463)<<11|n>>>21)+e<<0)^e)^(r=((r+=(o^t)+s[11]+1839030562)<<16|r>>>16)+n<<0))+s[14]-35309556)<<23|t>>>9)+r<<0,t=((t+=((o=(n=((n+=((i=t^r)^(e=((e+=(i^n)+s[1]-1530992060)<<4|e>>>28)+t<<0))+s[4]+1272893353)<<11|n>>>21)+e<<0)^e)^(r=((r+=(o^t)+s[7]-155497632)<<16|r>>>16)+n<<0))+s[10]-1094730640)<<23|t>>>9)+r<<0,t=((t+=((o=(n=((n+=((i=t^r)^(e=((e+=(i^n)+s[13]+681279174)<<4|e>>>28)+t<<0))+s[0]-358537222)<<11|n>>>21)+e<<0)^e)^(r=((r+=(o^t)+s[3]-722521979)<<16|r>>>16)+n<<0))+s[6]+76029189)<<23|t>>>9)+r<<0,t=((t+=((o=(n=((n+=((i=t^r)^(e=((e+=(i^n)+s[9]-640364487)<<4|e>>>28)+t<<0))+s[12]-421815835)<<11|n>>>21)+e<<0)^e)^(r=((r+=(o^t)+s[15]+530742520)<<16|r>>>16)+n<<0))+s[2]-995338651)<<23|t>>>9)+r<<0,t=((t+=((n=((n+=(t^((e=((e+=(r^(t|~n))+s[0]-198630844)<<6|e>>>26)+t<<0)|~r))+s[7]+1126891415)<<10|n>>>22)+e<<0)^((r=((r+=(e^(n|~t))+s[14]-1416354905)<<15|r>>>17)+n<<0)|~e))+s[5]-57434055)<<21|t>>>11)+r<<0,t=((t+=((n=((n+=(t^((e=((e+=(r^(t|~n))+s[12]+1700485571)<<6|e>>>26)+t<<0)|~r))+s[3]-1894986606)<<10|n>>>22)+e<<0)^((r=((r+=(e^(n|~t))+s[10]-1051523)<<15|r>>>17)+n<<0)|~e))+s[1]-2054922799)<<21|t>>>11)+r<<0,t=((t+=((n=((n+=(t^((e=((e+=(r^(t|~n))+s[8]+1873313359)<<6|e>>>26)+t<<0)|~r))+s[15]-30611744)<<10|n>>>22)+e<<0)^((r=((r+=(e^(n|~t))+s[6]-1560198380)<<15|r>>>17)+n<<0)|~e))+s[13]+1309151649)<<21|t>>>11)+r<<0,t=((t+=((n=((n+=(t^((e=((e+=(r^(t|~n))+s[4]-145523070)<<6|e>>>26)+t<<0)|~r))+s[11]-1120210379)<<10|n>>>22)+e<<0)^((r=((r+=(e^(n|~t))+s[2]+718787259)<<15|r>>>17)+n<<0)|~e))+s[9]-343485551)<<21|t>>>11)+r<<0,this.first?(this.h0=e+1732584193<<0,this.h1=t-271733879<<0,this.h2=r-1732584194<<0,this.h3=n+271733878<<0,this.first=!1):(this.h0=this.h0+e<<0,this.h1=this.h1+t<<0,this.h2=this.h2+r<<0,this.h3=this.h3+n<<0)},Md5.prototype.hex=function(){this.finalize();var e=this.h0,t=this.h1,r=this.h2,n=this.h3;return HEX_CHARS[e>>4&15]+HEX_CHARS[15&e]+HEX_CHARS[e>>12&15]+HEX_CHARS[e>>8&15]+HEX_CHARS[e>>20&15]+HEX_CHARS[e>>16&15]+HEX_CHARS[e>>28&15]+HEX_CHARS[e>>24&15]+HEX_CHARS[t>>4&15]+HEX_CHARS[15&t]+HEX_CHARS[t>>12&15]+HEX_CHARS[t>>8&15]+HEX_CHARS[t>>20&15]+HEX_CHARS[t>>16&15]+HEX_CHARS[t>>28&15]+HEX_CHARS[t>>24&15]+HEX_CHARS[r>>4&15]+HEX_CHARS[15&r]+HEX_CHARS[r>>12&15]+HEX_CHARS[r>>8&15]+HEX_CHARS[r>>20&15]+HEX_CHARS[r>>16&15]+HEX_CHARS[r>>28&15]+HEX_CHARS[r>>24&15]+HEX_CHARS[n>>4&15]+HEX_CHARS[15&n]+HEX_CHARS[n>>12&15]+HEX_CHARS[n>>8&15]+HEX_CHARS[n>>20&15]+HEX_CHARS[n>>16&15]+HEX_CHARS[n>>28&15]+HEX_CHARS[n>>24&15]},Md5.prototype.toString=Md5.prototype.hex,Md5.prototype.digest=function(){this.finalize();var e=this.h0,t=this.h1,r=this.h2,n=this.h3;return[255&e,e>>8&255,e>>16&255,e>>24&255,255&t,t>>8&255,t>>16&255,t>>24&255,255&r,r>>8&255,r>>16&255,r>>24&255,255&n,n>>8&255,n>>16&255,n>>24&255]},Md5.prototype.array=Md5.prototype.digest,Md5.prototype.arrayBuffer=function(){this.finalize();var e=new ArrayBuffer(16),t=new Uint32Array(e);return t[0]=this.h0,t[1]=this.h1,t[2]=this.h2,t[3]=this.h3,e},Md5.prototype.buffer=Md5.prototype.arrayBuffer,Md5.prototype.base64=function(){for(var e,t,r,n="",i=this.array(),o=0;o<15;)e=i[o++],t=i[o++],r=i[o++],n+=BASE64_ENCODE_CHAR[e>>>2]+BASE64_ENCODE_CHAR[63&(e<<4|t>>>4)]+BASE64_ENCODE_CHAR[63&(t<<2|r>>>6)]+BASE64_ENCODE_CHAR[63&r];return e=i[o],n+(BASE64_ENCODE_CHAR[e>>>2]+BASE64_ENCODE_CHAR[e<<4&63]+"==")};var exports=createMethod();COMMON_JS?_$md5_8.exports=exports:(root.md5=exports,AMD&&define((function(){return exports})))}()}).call(this)}).call(this,_$browser_2,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{}),_$md5_8=_$md5_8.exports;var _$lastfmRequest_5={},WRITE_METHODS=["track.scrobble","track.updatenowplaying"],SIGNED_METHODS=["auth.getmobilesession","auth.getsession","auth.gettoken","radio.getplaylist","user.getrecentstations","user.getrecommendedartists","user.getrecommendedevents"];(_$lastfmRequest_5=function(e,t,r){var n=this;function i(){return r.signed||o()||function(e){return e&&SIGNED_METHODS.includes(e.toLowerCase())}(t)}function o(){return r.write||function(e){return e&&WRITE_METHODS.includes(e.toLowerCase())}(t)}function s(e,t,r){var n={};return"POST"==e&&(n["Content-Length"]=r.length,n["Content-Type"]="application/x-www-form-urlencoded"),n}_$lastfmBase_4.call(this),r=r||{},n.registerHandlers(r.handlers),function(r,u,a){var c=o()?"POST":"GET",f=function(e){var t=[];for(var r in e)e.hasOwnProperty(r)&&t.push(encodeURIComponent(r)+"="+encodeURIComponent(e[r]));return t.join("&")}(function(r){var o=n.filterParameters(r,["signed","write"]);return o.method=t,o.api_key=o.api_key||e.api_key,o.format=o.format||e.format,i()&&(o.api_sig=function(e,t){var r="";return Object.keys(e).sort().forEach((function(t){if("format"!=t){var n=void 0!==e[t]&&null!==e[t]?e[t]:"";r+=t+n}})),r+=t,_$md5_8.hex(r)}(o,e.secret)),o}(a));"GET"==c&&(u+="?"+f);var h={method:c,headers:s(c,0,f),body:"POST"==c?f:null};fetch(r+u,h).then(e=>e.json()).then(e=>n.emit("success",e)).catch(e=>n.emit("error",e))}(e.host,e.url,r)}).prototype=Object.create(_$lastfmBase_4.prototype);var _$lastfm_3={};LastFmRequest=_$lastfmRequest_5;var LastFmNode=_$lastfm_3.LastFmNode=function(e){e=e||{},this.url="/2.0/",this.host=e.host||"http://ws.audioscrobbler.com",this.format="json",this.secret=e.secret,this.api_key=e.api_key};return _$lastfm_3.md5=_$md5_8,LastFmNode.prototype.request=function(e,t){return new LastFmRequest(this,e,t)},LastFmNode.prototype.session=function(e,t){return new _$lastfmSession_6(this,e,t)},LastFmNode.prototype.update=function(e,t,r){return new _$lastfmUpdate_7(this,e,t,r)},_$lastfm_3}));