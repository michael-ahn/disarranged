!function t(e,n,r){function o(i,c){if(!n[i]){if(!e[i]){var u="function"==typeof require&&require;if(!c&&u)return u(i,!0);if(a)return a(i,!0);var f=new Error("Cannot find module '"+i+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[i]={exports:{}};e[i][0].call(l.exports,function(t){var n=e[i][1][t];return o(n?n:t)},l,l.exports,t,e,n,r)}return n[i].exports}for(var a="function"==typeof require&&require,i=0;i<r.length;i++)o(r[i]);return o}({1:[function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var o=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),a=function(){function t(){r(this,t)}return o(t,[{key:"print",value:function(){console.log("Hello from Actor!")}}]),t}();n.Actor=a},{}],2:[function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function a(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}var i=t("./actor"),c=function(t){function e(){return r(this,e),o(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return a(e,t),e}(i.Actor);n.ArenaActor=c},{"./actor":1}],3:[function(t,e,n){"use strict";function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}var o=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),a=function(){function t(){r(this,t)}return o(t,null,[{key:"getContext",value:function(){return t._attemptedInit||(t._attemptedInit=!0,t.createContext()),t._gl}},{key:"getCanvas",value:function(){return t._canvas||(t._canvas=document.getElementById("glcanvas")),t._canvas}},{key:"createContext",value:function(){t._gl=null;var e=t.getCanvas();if(e){var n=e.getContext("webgl")||e.getContext("experimental-webgl");n&&(n.viewport(0,0,e.width,e.height),t._gl=n)}}}]),t}();a._attemptedInit=!1,n.Graphics=a},{}],4:[function(t,e,n){"use strict";function r(){var t=a.Graphics.getContext();if(!t)return void alert("Unable to initialize WebGL. Your browser may not support it.");t.clearColor(0,0,0,1),t.enable(t.DEPTH_TEST),t.clear(t.COLOR_BUFFER_BIT|t.DEPTH_BUFFER_BIT);var e=new o.ArenaActor;e.print()}var o=t("./actors/arena_actor"),a=t("./graphics");r()},{"./actors/arena_actor":2,"./graphics":3}]},{},[4]);