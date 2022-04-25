/*
 * A javascript-based implementation of Spatial Navigation.
 *
 * Copyright (c) 2022 Luke Chang.
 * https://github.com/luke-chang/js-spatial-navigation
 *
 * Licensed under the MPL 2.0.
 * 
 * code changes made by cyan-2048:
 * uglified, get rid of polyfill
 * get rid of JQuery & CommonJS support
 * preventScroll
 */

!function(){"use strict";var e={selector:"",straightOnly:!1,straightOverlapThreshold:.5,rememberSource:!1,disabled:!1,defaultElement:"",enterTo:"",leaveFor:null,restrict:"self-first",tabIndexIgnoreList:"a, input, select, textarea, button, iframe, [contentEditable=true]",navigableFilter:null},t={37:"left",38:"up",39:"right",40:"down"},r={left:"right",up:"down",right:"left",down:"up"},n="sn:",o="section-",i=0,u=!1,a=!1,f={},c=0,s="",l="",d=!1,v=Element.prototype.matches;function p(e){var t=e.getBoundingClientRect(),r={left:t.left,top:t.top,right:t.right,bottom:t.bottom,width:t.width,height:t.height};return r.element=e,r.center={x:r.left+Math.floor(r.width/2),y:r.top+Math.floor(r.height/2)},r.center.left=r.center.right=r.center.x,r.center.top=r.center.bottom=r.center.y,r}function g(e,t,r){for(var n=[[],[],[],[],[],[],[],[],[]],o=0;o<e.length;o++){var i,u,a=e[o],f=a.center;if(i=f.x<t.left?0:f.x<=t.right?1:2,n[u=3*(f.y<t.top?0:f.y<=t.bottom?1:2)+i].push(a),-1!==[0,2,6,8].indexOf(u)){var c=r;a.left<=t.right-t.width*c&&(2===u?n[1].push(a):8===u&&n[7].push(a)),a.right>=t.left+t.width*c&&(0===u?n[1].push(a):6===u&&n[7].push(a)),a.top<=t.bottom-t.height*c&&(6===u?n[3].push(a):8===u&&n[5].push(a)),a.bottom>=t.top+t.height*c&&(0===u?n[3].push(a):2===u&&n[5].push(a))}}return n}function h(e,t,r,n){if(!(e&&t&&r&&r.length))return null;for(var o=[],i=0;i<r.length;i++){var u=p(r[i]);u&&o.push(u)}if(!o.length)return null;var a=p(e);if(!a)return null;var f,c=function(e){return{nearPlumbLineIsBetter:function(t){var r;return(r=t.center.x<e.center.x?e.center.x-t.right:t.left-e.center.x)<0?0:r},nearHorizonIsBetter:function(t){var r;return(r=t.center.y<e.center.y?e.center.y-t.bottom:t.top-e.center.y)<0?0:r},nearTargetLeftIsBetter:function(t){var r;return(r=t.center.x<e.center.x?e.left-t.right:t.left-e.left)<0?0:r},nearTargetTopIsBetter:function(t){var r;return(r=t.center.y<e.center.y?e.top-t.bottom:t.top-e.top)<0?0:r},topIsBetter:function(e){return e.top},bottomIsBetter:function(e){return-1*e.bottom},leftIsBetter:function(e){return e.left},rightIsBetter:function(e){return-1*e.right}}}(a),s=g(o,a,n.straightOverlapThreshold),l=g(s[4],a.center,n.straightOverlapThreshold);switch(t){case"left":f=[{group:l[0].concat(l[3]).concat(l[6]),distance:[c.nearPlumbLineIsBetter,c.topIsBetter]},{group:s[3],distance:[c.nearPlumbLineIsBetter,c.topIsBetter]},{group:s[0].concat(s[6]),distance:[c.nearHorizonIsBetter,c.rightIsBetter,c.nearTargetTopIsBetter]}];break;case"right":f=[{group:l[2].concat(l[5]).concat(l[8]),distance:[c.nearPlumbLineIsBetter,c.topIsBetter]},{group:s[5],distance:[c.nearPlumbLineIsBetter,c.topIsBetter]},{group:s[2].concat(s[8]),distance:[c.nearHorizonIsBetter,c.leftIsBetter,c.nearTargetTopIsBetter]}];break;case"up":f=[{group:l[0].concat(l[1]).concat(l[2]),distance:[c.nearHorizonIsBetter,c.leftIsBetter]},{group:s[1],distance:[c.nearHorizonIsBetter,c.leftIsBetter]},{group:s[0].concat(s[2]),distance:[c.nearPlumbLineIsBetter,c.bottomIsBetter,c.nearTargetLeftIsBetter]}];break;case"down":f=[{group:l[6].concat(l[7]).concat(l[8]),distance:[c.nearHorizonIsBetter,c.leftIsBetter]},{group:s[7],distance:[c.nearHorizonIsBetter,c.leftIsBetter]},{group:s[6].concat(s[8]),distance:[c.nearPlumbLineIsBetter,c.topIsBetter,c.nearTargetLeftIsBetter]}];break;default:return null}n.straightOnly&&f.pop();var d=function(e){for(var t=null,r=0;r<e.length;r++)if(e[r].group.length){t=e[r];break}if(!t)return null;var n=t.distance;return t.group.sort(function(e,t){for(var r=0;r<n.length;r++){var o=n[r],i=o(e)-o(t);if(i)return i}return 0}),t.group}(f);if(!d)return null;var v=null;if(n.rememberSource&&n.previous&&n.previous.destination===e&&n.previous.reverse===t)for(var h=0;h<d.length;h++)if(d[h].element===n.previous.target){v=d[h].element;break}return v||(v=d[0].element),v}function b(e){var t=[];try{e&&("string"==typeof e?t=[].slice.call(document.querySelectorAll(e)):"object"==typeof e&&e.length?t=[].slice.call(e):"object"==typeof e&&1===e.nodeType&&(t=[e]))}catch(e){console.error(e)}return t}function m(e,t){return"string"==typeof t?v.call(e,t):"object"==typeof t&&t.length?t.indexOf(e)>=0:"object"==typeof t&&1===t.nodeType&&e===t}function y(){var e=document.activeElement;if(e&&e!==document.body)return e}function w(e){e=e||{};for(var t=1;t<arguments.length;t++)if(arguments[t])for(var r in arguments[t])arguments[t].hasOwnProperty(r)&&void 0!==arguments[t][r]&&(e[r]=arguments[t][r]);return e}function I(e,t){Array.isArray(t)||(t=[t]);for(var r,n=0;n<t.length;n++)(r=e.indexOf(t[n]))>=0&&e.splice(r,1);return e}function B(t,r,n){if(!t||!r||!f[r]||f[r].disabled)return!1;if(t.offsetWidth<=0&&t.offsetHeight<=0||t.hasAttribute("disabled"))return!1;if(n&&!m(t,f[r].selector))return!1;if("function"==typeof f[r].navigableFilter){if(!1===f[r].navigableFilter(t,r))return!1}else if("function"==typeof e.navigableFilter&&!1===e.navigableFilter(t,r))return!1;return!0}function x(e){for(var t in f)if(!f[t].disabled&&m(e,f[t].selector))return t}function E(e){return b(f[e].selector).filter(function(t){return B(t,e)})}function L(e){var t=b(f[e].defaultElement).find(function(t){return B(t,e,!0)});return t||null}function T(e){var t=f[e].lastFocusedElement;return B(t,e,!0)?t:null}function k(e,t,r,o){arguments.length<4&&(o=!0);var i=document.createEvent("CustomEvent");return i.initCustomEvent(n+t,!0,o,r),e.dispatchEvent(i)}function F(e,t,r){if(!e)return!1;var n=y(),o=function(){n&&n.blur(),e.focus({preventScroll:true}),O(e,t)};if(d)return o(),!0;if(d=!0,a)return o(),d=!1,!0;if(n){var i={nextElement:e,nextSectionId:t,direction:r,native:!1};if(!k(n,"willunfocus",i))return d=!1,!1;n.blur(),k(n,"unfocused",i,!1)}var u={previousElement:n,sectionId:t,direction:r,native:!1};return k(e,"willfocus",u)?(e.focus({preventScroll:true}),k(e,"focused",u,!1),d=!1,O(e,t),!0):(d=!1,!1)}function O(e,t){t||(t=x(e)),t&&(f[t].lastFocusedElement=e,l=t)}function P(e,t){if("@"==e.charAt(0)){return 1==e.length?S():S(e.substr(1))}else{var r=b(e)[0];if(r){var n=x(r);if(B(r,n))return F(r,n,t)}}return!1}function S(e){var t=[],r=function(e){e&&t.indexOf(e)<0&&f[e]&&!f[e].disabled&&t.push(e)};e?r(e):(r(s),r(l),Object.keys(f).map(r));for(var n=0;n<t.length;n++){var o,i=t[n];if(o="last-focused"==f[i].enterTo?T(i)||L(i)||E(i)[0]:L(i)||T(i)||E(i)[0])return F(o,i)}return!1}function j(e,t){k(e,"navigatefailed",{direction:t},!1)}function A(e,t){if(f[e].leaveFor&&void 0!==f[e].leaveFor[t]){var r=f[e].leaveFor[t];if("string"==typeof r)return""===r?null:P(r,t);var n=x(r);if(B(r,n))return F(r,n,t)}return!1}function H(t,n,o){var i=n.getAttribute("data-sn-"+t);if("string"==typeof i)return!(""===i||!P(i,t))||(j(n,t),!1);var u={},a=[];for(var c in f)u[c]=E(c),a=a.concat(u[c]);var s,l=w({},e,f[o]);if("self-only"==l.restrict||"self-first"==l.restrict){var d=u[o];(s=h(n,t,I(d,n),l))||"self-first"!=l.restrict||(s=h(n,t,I(a,d),l))}else s=h(n,t,I(a,n),l);if(s){f[o].previous={target:n,destination:s,reverse:r[t]};var v=x(s);if(o!=v){var p,g=A(o,t);if(g)return!0;if(null===g)return j(n,t),!1;switch(f[v].enterTo){case"last-focused":p=T(v)||L(v);break;case"default-element":p=L(v)}p&&(s=p)}return F(s,v,t)}return!!A(o,t)||(j(n,t),!1)}function K(e){if(!(!c||a||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey)){var r,n=function(){return e.preventDefault(),e.stopPropagation(),!1},o=t[e.keyCode];if(!o)return 13==e.keyCode&&(r=y())&&x(r)&&!k(r,"enter-down")?n():void 0;if(!(r=y())&&(l&&(r=T(l)),!r))return S(),n();var i=x(r);if(i)return k(r,"willmove",{direction:o,sectionId:i,cause:"keydown"})&&H(o,r,i),n()}}function z(e){if(!(e.altKey||e.ctrlKey||e.metaKey||e.shiftKey)&&!a&&c&&13==e.keyCode){var t=y();t&&x(t)&&(k(t,"enter-up")||(e.preventDefault(),e.stopPropagation()))}}function C(e){var t=e.target;if(t!==window&&t!==document&&c&&!d){var r=x(t);if(r){if(a)return void O(t,r);var n={sectionId:r,native:!0};k(t,"willfocus",n)?(k(t,"focused",n,!1),O(t,r)):(d=!0,t.blur(),d=!1)}}}function D(e){var t=e.target;if(t!==window&&t!==document&&!a&&c&&!d&&x(t)){var r={native:!0};k(t,"willunfocus",r)?k(t,"unfocused",r,!1):(d=!0,setTimeout(function(){t.focus({preventScroll:true}),d=!1}))}}var M={init:function(){u||(window.addEventListener("keydown",K),window.addEventListener("keyup",z),window.addEventListener("focus",C,!0),window.addEventListener("blur",D,!0),u=!0)},uninit:function(){window.removeEventListener("blur",D,!0),window.removeEventListener("focus",C,!0),window.removeEventListener("keyup",z),window.removeEventListener("keydown",K),M.clear(),i=0,u=!1},clear:function(){f={},c=0,s="",l="",d=!1},set:function(){var t,r;if("object"==typeof arguments[0])r=arguments[0];else{if("string"!=typeof arguments[0]||"object"!=typeof arguments[1])return;if(t=arguments[0],r=arguments[1],!f[t])throw new Error('Section "'+t+"\" doesn't exist!")}for(var n in r)void 0!==e[n]&&(t?f[t][n]=r[n]:void 0!==r[n]&&(e[n]=r[n]));t&&(f[t]=w({},f[t]))},add:function(){var e,t={};if("object"==typeof arguments[0]?t=arguments[0]:"string"==typeof arguments[0]&&"object"==typeof arguments[1]&&(e=arguments[0],t=arguments[1]),e||(e="string"==typeof t.id?t.id:function(){for(var e;e=o+String(++i),f[e];);return e}()),f[e])throw new Error('Section "'+e+'" has already existed!');return f[e]={},c++,M.set(e,t),e},remove:function(e){if(!e||"string"!=typeof e)throw new Error('Please assign the "sectionId"!');return!!f[e]&&(f[e]=void 0,f=w({},f),c--,l===e&&(l=""),!0)},disable:function(e){return!!f[e]&&(f[e].disabled=!0,!0)},enable:function(e){return!!f[e]&&(f[e].disabled=!1,!0)},pause:function(){a=!0},resume:function(){a=!1},focus:function(e,t){var r=!1;void 0===t&&"boolean"==typeof e&&(t=e,e=void 0);var n=!a&&t;if(n&&M.pause(),e)if("string"==typeof e)r=f[e]?S(e):P(e);else{var o=x(e);B(e,o)&&(r=F(e,o))}else r=S();return n&&M.resume(),r},move:function(e,t){if(e=e.toLowerCase(),!r[e])return!1;var n=t?b(t)[0]:y();if(!n)return!1;var o=x(n);return!!o&&(!!k(n,"willmove",{direction:e,sectionId:o,cause:"api"})&&H(e,n,o))},makeFocusable:function(t){var r=function(t){var r=void 0!==t.tabIndexIgnoreList?t.tabIndexIgnoreList:e.tabIndexIgnoreList;b(t.selector).forEach(function(e){m(e,r)||e.getAttribute("tabindex")||e.setAttribute("tabindex","-1")})};if(t){if(!f[t])throw new Error('Section "'+t+"\" doesn't exist!");r(f[t])}else for(var n in f)r(f[n])},setDefaultSection:function(e){if(e){if(!f[e])throw new Error('Section "'+e+"\" doesn't exist!");s=e}else s=""}};window.SpatialNavigation=M}();