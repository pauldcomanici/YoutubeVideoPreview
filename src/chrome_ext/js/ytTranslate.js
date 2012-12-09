/**
 * 
 * @description Translation class
 */
(function () {
	"use strict";
	/*global chrome, document*/
	function execute() {
		document.getElementById("headerTitle").textContent = chrome.i18n.getMessage("extensionName");
		document.getElementById("page_feedback").textContent = chrome.i18n.getMessage("feedback");
		document.getElementById("page_about").textContent = chrome.i18n.getMessage("about");
		document.getElementById("page_options").textContent = chrome.i18n.getMessage("options");
		document.getElementById("imageTimeLabel").textContent = chrome.i18n.getMessage("imageTimeLabel");
		document.getElementById("imageTimeUnit").textContent = chrome.i18n.getMessage("imageTimeDescription");
		document.getElementById("enableRatingViewLabel").textContent = chrome.i18n.getMessage("enableRatingViewLabel");
		document.getElementById("enableRatingViewTrue").textContent = chrome.i18n.getMessage("enableRatingViewTrue");
		document.getElementById("enableRatingViewFalse").textContent = chrome.i18n.getMessage("enableRatingViewFalse");
	}
	//execute translation
	execute();
}());