// ==UserScript==
// @name        FFXIV 划词
// @require     https://cdn.jsdelivr.net/npm/@thewakingsands/xivdict@0.1.2/dist/xivdict.iife.js
// @resource    css https://cdn.jsdelivr.net/npm/@thewakingsands/xivdict@0.1.2/dist/style.css
// @namespace   org.ffcafe.xivdict
// @match       *://*/*
// @grant       GM_getResourceText
// @version     0.1.2
// @author      -
// @description FFXIV 划词
// @inject-into page
// ==/UserScript==

document.body.appendChild(document.createElement('style')).innerHTML = GM_getResourceText('css')
