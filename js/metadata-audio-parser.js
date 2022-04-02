/**
 * Copyright 2012, Mozilla Foundation
 * Copyright 2014, Nazar Mokrynskyi
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 *
 * Based on parser from Gaia project
 * https://github.com/mozilla-b2g/gaia/blob/master/apps/music/js/metadata.js
 *
 * Extended to support year, genre, rating, play counting, returns picture as blob, added several new mp4 tags, removed thumbnail generation, proper cyrillic text support
 *
 *
 */

(e=>{window.parseAudio=function(e,i,n){var r=e.name;if(n=n||function(e){console.warn(e)},r){if("DCIM/"===r.slice(0,5)&&".3gp"===r.slice(-4).toLowerCase())return void n("skipping 3gp video file");if(".m4v"===r.slice(-4).toLowerCase())return void n("skipping m4v video file")}if(e.size<128)n("file is empty or too small");else{var a="title",s="artist",o="album",d="tracknum",u="year",c=["Blues","Classic Rock","Country","Dance","Disco","Funk","Grunge","Hip-Hop","Jazz","Metal","New Age","Oldies","Other","Pop","R&B","Rap","Reggae","Rock","Techno","Industrial","Alternative","Ska","Death Metal","Pranks","Soundtrack","Euro-Techno","Ambient","Trip-Hop","Vocal","Jazz+Funk","Fusion","Trance","Classical","Instrumental","Acid","House","Game","Sound Clip","Gospel","Noise","AlternRock","Bass","Soul","Punk","Space","Meditative","Instrumental Pop","Instrumental Rock","Ethnic","Gothic","Darkwave","Techno-Industrial","Electronic","Pop-Folk","Eurodance","Dream","Southern Rock","Comedy","Cult","Gangsta Rap","Top 40","Christian Rap","Pop / Funk","Jungle","Native American","Cabaret","New Wave","Psychedelic","Rave","Showtunes","Trailer","Lo-Fi","Tribal","Acid Punk","Acid Jazz","Polka","Retro","Musical","Rock & Roll","Hard Rock","Folk","Folk-Rock","National Folk","Swing","Fast Fusion","Bebob","Latin","Revival","Celtic","Bluegrass","Avantgarde","Gothic Rock","Progressive Rock","Psychedelic Rock","Symphonic Rock","Slow Rock","Big Band","Chorus","Easy Listening","Acoustic","Humour","Speech","Chanson","Opera","Chamber Music","Sonata","Symphony","Booty Bass","Primus","Porn Groove","Satire","Slow Jam","Club","Tango","Samba","Folklore","Ballad","Power Ballad","Rhythmic Soul","Freestyle","Duet","Punk Rock","Drum Solo","A Cappella","Euro-House","Dance Hall","Goa","Drum & Bass","Club-House","Hardcore","Terror","Indie","BritPop","Negerpunk","Polsk Punk","Beat","Christian Gangsta Rap","Heavy Metal","Black Metal","Crossover","Contemporary Christian","Christian Rock","Merengue","Salsa","Thrash Metal","Anime","JPop","Synthpop","Abstract","Art Rock","Baroque","Bhangra","Big Beat","Breakbeat","Chillout","Downtempo","Dub","EBM","Eclectic","Electro","Electroclash","Emo","Experimental","Garage","Global","IDM","Illbient","Industro-Goth","Jam Band","Krautrock","Leftfield","Lounge","Math Rock","New Romantic","Nu-Breakz","Post-Punk","Post-Rock","Psytrance","Shoegaze","Space Rock","Trop Rock","World Music","Neoclassical","Audiobook","Audio Theatre","Neue Deutsche Welle","Podcast","Indie Rock","G-Funk","Dubstep","Garage Rock","Psybient"],l={TIT2:a,TT2:a,TPE1:s,TP1:s,TALB:o,TAL:o,TRCK:d,TRK:d,APIC:"picture",PIC:"picture",POPM:"rated",POP:"rated",PCNT:"played",CNT:"played",TORY:u,TDOR:u,TYER:u,TYE:u,TDRC:u,TCON:"genre",TCO:"genre"},f={title:a,artist:s,album:o,tracknumber:d},h={"©alb":o,"©art":s,"©ART":s,aART:s,"©nam":a,trkn:d,covr:"picture",Year:u},g={"M4A ":!0,"M4B ":!0,mp41:!0,mp42:!0,isom:!0,iso2:!0},v={mp4a:!0,samr:!0,sawb:!0,sawp:!0,alac:!0},x={};if(x[s]=x[o]=x[a]=x.year="",x.rated=x.played=0,r){var T=r.lastIndexOf("/"),I=r.lastIndexOf(".");-1===I&&(I=r.length),x[a]=r.substring(T+1,I)}var w=Math.min(65536,e.size);t.get(e,0,w,function(r,u){var T;if(u)n(u);else try{var I=r.getASCIIText(0,12);if("LOCKED 1 "===I.substring(0,9))return T=e,void ForwardLock.getKey(function(e){ForwardLock.unlockBlob(e,T,function(e,t){parseAudioMetadata(e,function(e){e.locked=!0,t.vendor&&(e.vendor=t.vendor),e[a]||(e[a]=t.name),i(e)},n)},n)});if("ID3"===I.substring(0,3))!function(t){t.index=3;var n=t.readUnsignedByte();if(n>4)return console.warn("mp3 file with unknown metadata version"),void i(x);t.readUnsignedByte();var r=0!=(64&t.readUnsignedByte()),a=t.readID3Uint28BE();function s(t,i,n){var r,a=t.index,s=t.readUnsignedByte();"PIC"===n?"JPG"===(r=t.readASCIIText(3))?r="image/jpeg":"PNG"===r&&(r="image/png"):r=t.readNullTerminatedLatin1Text(i-1);t.readUnsignedByte(),o(t,i-(t.index-a),s);var d=t.sliceOffset+t.viewOffset+t.index,u=i-(t.index-a);return e.slice(d,d+u,r)}function o(e,t,i){switch(void 0===i&&(i=e.readUnsignedByte(),t-=1),i){case 0:return e.readNullTerminatedLatin1Text(t);case 1:return e.readNullTerminatedUTF16Text(t,void 0);case 2:return e.readNullTerminatedUTF16Text(t,!1);case 3:return e.readNullTerminatedUTF8Text(t);default:throw Error("unknown text encoding")}}t.getMore(t.index,a,function(e){r&&e.advance(e.readUnsignedInt());for(;e.index<e.byteLength;){var t,a,d;if(0===e.getUint8(e.index))break;switch(n){case 2:t=e.readASCIIText(3),a=e.readUint24(),d=0;break;case 3:t=e.readASCIIText(4),a=e.readUnsignedInt(),d=e.readUnsignedShort();break;case 4:t=e.readASCIIText(4),a=e.readID3Uint28BE(),d=e.readUnsignedShort()}var u=e.index+a,f=l[t];if(f)if(0==(255&d)){try{var h=null;switch(t){case"TIT2":case"TT2":case"TPE1":case"TP1":case"TALB":case"TAL":case"TORY":case"TDOR":case"TYER":case"TYE":case"TDRC":h=o(e,a);break;case"TRCK":case"TRK":case"PCNT":case"CNT":h=parseInt(o(e,a));break;case"APIC":case"PIC":h=s(e,a,t);break;case"TCON":case"TCO":h=o(e,a)||"",h=new String(h).replace(/^\(?([0-9]+)\)?$/,function(e,t){return c[parseInt(t)]});break;case"POPM":case"POP":h=o(e,a,0),isNaN(parseInt(h))&&(h=e.readUnsignedByte()),h=0==h?0:h<64?1:h<128?2:h<192?3:h<255?4:5}h&&(x[f]=h)}catch(e){console.warn("Error parsing mp3 metadata tag",t,":",e)}e.index=u}else console.warn("Skipping",t,"tag with flags",d),e.index=u;else e.index=u}i(x)})}(r);else if("OggS"===I.substring(0,4))!function(e){function t(e,t){return e+t}var r=e.getUint8(26),a=e.getUnsignedByteArray(27,r),s=Array.reduce(a,t,0),o=27+r+s,d=e.getUint8(o+26),u=e.getUnsignedByteArray(o+27,d),c=Array.reduce(u,t,0),l=o+27+d;e.getMore(l,c,function(e,t){if(t)n(t);else{var i=e.readByte(),r=!1;switch(i){case 3:r="vorbis"===e.readASCIIText(6);break;case 79:r="pusTags"===e.readASCIIText(7)}if(r){var a=e.readUnsignedInt(!0);e.advance(a);for(var s=e.readUnsignedInt(!0),o={},d=0;d<s&&!(e.remaining()<4);d++){var u=e.readUnsignedInt(!0);if(u>e.remaining())break;var c=e.readUTF8Text(u),l=c.indexOf("=");if(-1!==l){var h=c.substring(0,l).toLowerCase().replace(" ",""),g=f[h];if(g){var v=c.substring(l+1);o.hasOwnProperty(g)?x[g]+=" "+v:(x[g]=v,o[g]=!0)}}}}else n("malformed ogg comment packet")}}),i(x)}(r);else if("ftyp"===I.substring(4,8)){if(function(e,t){if(e.getASCIIText(8,4)in t)return!0;for(var i=16,n=e.getUint32(0);i<n;){var r=e.getASCIIText(i,4);if(i+=4,r in t)return!0}return!1}(r,g))return void function(t){function r(e,t){var i=e.index,n=e.readUnsignedInt();for(e.advance(4);e.index<i+n;){var r=e.readUnsignedInt(),a=e.readASCIIText(4);if(a===t)return e.advance(-8),e;e.advance(r-8)}return null}function a(e,t){var i=e.index,n=r(e,t);return e.index=i,n}function s(e,t){for(;e.index<t;){var i=e.readUnsignedInt(),n=e.readASCIIText(4);if("meta"===n)return o(e,e.index+i-8),void(e.index=t);e.advance(i-8)}}function o(e,t){for(e.advance(4);e.index<t;){var i=e.readUnsignedInt(),n=e.readASCIIText(4);if("ilst"===n)return d(e,e.index+i-8),void(e.index=t);e.advance(i-8)}}function d(e,t){for(;e.index<t;){var i=e.readUnsignedInt(),n=e.readASCIIText(4),r=e.index+i-8,a=h[n];if(a)try{var s=u(e,r,n);x[a]=s}catch(e){console.warn("skipping",n,":",e)}e.index=r}}function u(t,i,n){for(;t.index<i;){var r=t.readUnsignedInt(),a=t.readASCIIText(4);if("data"===a){var s=16777215&t.readUnsignedInt();t.advance(4);var o=r-16;if("trkn"===n)return t.advance(2),t.readUnsignedShort();switch(s){case 1:return t.readUTF8Text(o);case 13:return e.slice(t.sliceOffset+t.viewOffset+t.index,t.sliceOffset+t.viewOffset+t.index+o,"image/jpeg");case 14:return e.slice(t.sliceOffset+t.viewOffset+t.index,t.sliceOffset+t.viewOffset+t.index+o,"image/png");default:throw Error("unexpected type in data atom")}}else t.advance(r-8)}throw Error("no data atom found")}!function e(t){try{var o=t.sliceOffset+t.viewOffset,d=t.readUnsignedInt(),u=t.readASCIIText(4);0===d?d=t.blob.size-o:1===d&&(d=4294967296*t.readUnsignedInt()+t.readUnsignedInt()),"moov"===u?t.getMore(o,d,function(e){try{!function(e,t){e.advance(8);for(;e.index<t;){var i=e.readUnsignedInt(),n=e.readASCIIText(4),o=e.index+i-8;if("udta"===n)s(e,t),e.index=o;else if("trak"===n){e.advance(-8);var d=r(e,"mdia");if(d){var u=r(d,"minf");if(u){a(u,"vmhd");var c=a(u,"smhd");if(c){var l=r(u,"stbl");if(l){var f=r(l,"stsd");if(f){f.advance(20);var h=f.readASCIIText(4);if(!(h in v))throw"Unsupported format in MP4 container: "+h}}}}}e.index=o}else e.advance(i-8)}}(e,d),i(x)}catch(e){n(e)}}):o+d+16<=t.blob.size?t.getMore(o+d,16,e):i(x)}catch(e){n(e)}}(t)}(r);n("Unknown MP4 file type")}else 65530==(65534&r.getUint16(0,!1))?t.get(e,e.size-128,128,function(e,t){if(t)n(t);else try{"TAG"===e.getASCIIText(0,3)?function(e){var t=e.getASCIIText(3,30),n=e.getASCIIText(33,30),r=e.getASCIIText(63,30),u=t.indexOf("\0");-1!==u&&(t=t.substring(0,u));-1!==(u=n.indexOf("\0"))&&(n=n.substring(0,u));-1!==(u=r.indexOf("\0"))&&(r=r.substring(0,u));x[a]=t||void 0,x[s]=n||void 0,x[o]=r||void 0;var c=e.getUint8(125),l=e.getUint8(126);0===c&&0!==l&&(x[d]=l);i(x)}(e):i(x)}catch(e){n(e)}}):n("Unplayable music file")}catch(e){console.error("parseAudioMetadata:",e,e.stack),n(e)}})}};var t=function(){function e(e){throw Error(e)}function t(e,t,i,n,r,a,s){this.blob=e,this.sliceOffset=t,this.sliceLength=i,this.slice=n,this.viewOffset=r,this.viewLength=a,this.littleEndian=s,this.view=new DataView(n,r,a),this.buffer=n,this.byteLength=a,this.byteOffset=r,this.index=0}return t.get=function(i,n,r,a,s){n<0&&e("negative offset"),r<0&&e("negative length"),n>i.size&&e("offset larger than blob size"),n+r>i.size&&(r=i.size-n);var o=i.slice(n,n+r),d=new FileReader;d.readAsArrayBuffer(o),d.onloadend=function(){var e=null;d.result&&(e=new t(i,n,r,d.result,0,r,s||!1)),a(e,d.error)}},t.prototype={constructor:t,getMore:function(e,i,n){e>=this.sliceOffset&&e+i<=this.sliceOffset+this.sliceLength?n(new t(this.blob,this.sliceOffset,this.sliceLength,this.slice,e-this.sliceOffset,i,this.littleEndian)):t.get(this.blob,e,i,n,this.littleEndian)},littleEndian:function(){this.littleEndian=!0},bigEndian:function(){this.littleEndian=!1},getUint8:function(e){return this.view.getUint8(e)},getInt8:function(e){return this.view.getInt8(e)},getUint16:function(e,t){return this.view.getUint16(e,void 0!==t?t:this.littleEndian)},getInt16:function(e,t){return this.view.getInt16(e,void 0!==t?t:this.littleEndian)},getUint32:function(e,t){return this.view.getUint32(e,void 0!==t?t:this.littleEndian)},getInt32:function(e,t){return this.view.getInt32(e,void 0!==t?t:this.littleEndian)},getFloat32:function(e,t){return this.view.getFloat32(e,void 0!==t?t:this.littleEndian)},getFloat64:function(e,t){return this.view.getFloat64(e,void 0!==t?t:this.littleEndian)},readByte:function(){return this.view.getInt8(this.index++)},readUnsignedByte:function(){return this.view.getUint8(this.index++)},readShort:function(e){var t=this.view.getInt16(this.index,void 0!==e?e:this.littleEndian);return this.index+=2,t},readUnsignedShort:function(e){var t=this.view.getUint16(this.index,void 0!==e?e:this.littleEndian);return this.index+=2,t},readInt:function(e){var t=this.view.getInt32(this.index,void 0!==e?e:this.littleEndian);return this.index+=4,t},readUnsignedInt:function(e){var t=this.view.getUint32(this.index,void 0!==e?e:this.littleEndian);return this.index+=4,t},readFloat:function(e){var t=this.view.getFloat32(this.index,void 0!==e?e:this.littleEndian);return this.index+=4,t},readDouble:function(e){var t=this.view.getFloat64(this.index,void 0!==e?e:this.littleEndian);return this.index+=8,t},tell:function(){return this.index},remaining:function(){return this.byteLength-this.index},seek:function(t){t<0&&e("negative index"),t>this.byteLength&&e("index greater than buffer size"),this.index=t},advance:function(t){var i=this.index+t;i<0&&e("advance past beginning of buffer"),i>this.byteLength&&e("advance past end of buffer"),this.index=i},getUnsignedByteArray:function(e,t){return new Uint8Array(this.buffer,e+this.viewOffset,t)},readUnsignedByteArray:function(e){var t=new Uint8Array(this.buffer,this.index+this.viewOffset,e);return this.index+=e,t},getBit:function(e,t){return 0!=(this.view.getUint8(e)&1<<t)},getUint24:function(e,t){var i,n,r;return(void 0!==t?t:this.littleEndian)?(i=this.view.getUint8(e),n=this.view.getUint8(e+1),r=this.view.getUint8(e+2)):(r=this.view.getUint8(e),n=this.view.getUint8(e+1),i=this.view.getUint8(e+2)),(r<<16)+(n<<8)+i},readUint24:function(e){var t=this.getUint24(this.index,e);return this.index+=3,t},getASCIIText:function(e,t){var i=new Uint8Array(this.buffer,e+this.viewOffset,t);return String.fromCharCode.apply(String,i)},readASCIIText:function(e){var t=new Uint8Array(this.buffer,this.index+this.viewOffset,e);return this.index+=e,String.fromCharCode.apply(String,t)},getUTF8Text:function(e,t){function i(){throw new Error("Illegal UTF-8")}for(var n,r,a,s,o=e,d=e+t,u="";o<d;){var c;(c=this.view.getUint8(o))<128?(u+=String.fromCharCode(c),o+=1):c<194?i():c<224?(o+1>=d&&i(),((r=this.view.getUint8(o+1))<128||r>191)&&i(),n=((31&c)<<6)+(63&r),u+=String.fromCharCode(n),o+=2):c<240?(o+2>=d&&i(),((r=this.view.getUint8(o+1))<128||r>191)&&i(),((a=this.view.getUint8(o+2))<128||a>191)&&i(),n=((15&c)<<12)+((63&r)<<6)+(63&a),u+=String.fromCharCode(n),o+=3):c<245?(o+3>=d&&i(),((r=this.view.getUint8(o+1))<128||r>191)&&i(),((a=this.view.getUint8(o+2))<128||a>191)&&i(),((s=this.view.getUint8(o+3))<128||s>191)&&i(),n=((7&c)<<18)+((63&r)<<12)+((63&a)<<6)+(63&s),n-=65536,u+=String.fromCharCode(55296+((1047552&n)>>>10)),u+=String.fromCharCode(56320+(1023&n)),o+=4):i()}return u},readUTF8Text:function(e){try{return this.getUTF8Text(this.index,e)}finally{this.index+=e}},getID3Uint28BE:function(e){return(127&this.view.getUint8(e))<<21|(127&this.view.getUint8(e+1))<<14|(127&this.view.getUint8(e+2))<<7|127&this.view.getUint8(e+3)},readID3Uint28BE:function(){var e=this.getID3Uint28BE(this.index);return this.index+=4,e},readNullTerminatedLatin1Text:function(e){for(var t,i="",n=unescape("%u0402%u0403%u201A%u0453%u201E%u2026%u2020%u2021%u20AC%u2030%u0409%u2039%u040A%u040C%u040B%u040F%u0452%u2018%u2019%u201C%u201D%u2022%u2013%u2014%u0000%u2122%u0459%u203A%u045A%u045C%u045B%u045F%u00A0%u040E%u045E%u0408%u00A4%u0490%u00A6%u00A7%u0401%u00A9%u0404%u00AB%u00AC%u00AD%u00AE%u0407%u00B0%u00B1%u0406%u0456%u0491%u00B5%u00B6%u00B7%u0451%u2116%u0454%u00BB%u0458%u0405%u0455%u0457"),r=0;r<e;r++){var a=this.view.getUint8(this.index+r);if(0===a){r++;break}i+=(t=a)>=192&&t<=255?String.fromCharCode(t-192+1040):t>=128&&t<=191?n.charAt(t-128):String.fromCharCode(t)}return this.index+=r,i},readNullTerminatedUTF8Text:function(e){for(var t=0;t<e&&0!==this.view.getUint8(this.index+t);t++);var i=this.readUTF8Text(t);return t<e&&this.advance(1),i},readNullTerminatedUTF16Text:function(e,t){null==t&&(e-=2,t=65279!==this.readUnsignedShort());for(var i="",n=0;n<e;n+=2){var r=this.getUint16(this.index+n,t);if(0===r){n+=2;break}i+=String.fromCharCode(r)}return this.index+=n,i}},{get:t.get}}()})();