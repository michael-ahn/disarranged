!function e(r,t,n){function o(u,a){if(!t[u]){if(!r[u]){var l="function"==typeof require&&require;if(!a&&l)return l(u,!0);if(i)return i(u,!0);var c=new Error("Cannot find module '"+u+"'");throw c.code="MODULE_NOT_FOUND",c}var f=t[u]={exports:{}};r[u][0].call(f.exports,function(e){var t=r[u][1][e];return o(t?t:e)},f,f.exports,e,r,t,n)}return t[u].exports}for(var i="function"==typeof require&&require,u=0;u<n.length;u++)o(n[u]);return o}({1:[function(e,r,t){"use strict";function n(){var e=document.getElementById("glcanvas");i=o(e),i&&(i.clearColor(0,0,0,1),i.enable(i.DEPTH_TEST),i.depthFunc(i.LEQUAL),i.clear(i.COLOR_BUFFER_BIT|i.DEPTH_BUFFER_BIT),i.viewport(0,0,e.width,e.height))}function o(e){return i=null,i=e.getContext("webgl")||e.getContext("experimental-webgl"),i||alert("Unable to initialize WebGL. Your browser may not support it."),i}var i;n()},{}]},{},[1]);
//# sourceMappingURL=bundle.js.map
