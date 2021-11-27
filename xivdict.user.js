// ==UserScript==
// @name        FFXIV 划词
// @require     https://cdn.jsdelivr.net/npm/@thewakingsands/xivdict@0.1.2/dist/xivdict.iife.js
// @resource    css https://cdn.jsdelivr.net/npm/@thewakingsands/xivdict@0.1.2/dist/style.css
// @namespace   org.ffcafe.xivdict
// @match       *://*/*
// @grant       GM_getResourceText
// @version     1.1
// @author      -
// @description 11/6/2021, 11:09:45 PM
// @inject-into page
// ==/UserScript==

document.body.appendChild(document.createElement('style')).innerHTML = GM_getResourceText('css')
