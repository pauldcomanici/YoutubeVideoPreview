/**
 * @description Class for Options page 
 */
(function () {
    "use strict";
	/*global window, document, chrome, CustomEvent, DyDomHelper, PROPR_IMAGE_TIME, PROPR_VIEW_RATING, PROPR_SHOW_ICON, PROPR_HIDE_ICON_CONFIRM */
    var my = {
		/**
		 * @description Retrieve background page
		 */
		getBackgroundPage: function getBackgroundPage() {
			var bgPage = null;
			if (chrome && chrome.extension && chrome.extension.getBackgroundPage) {
				bgPage = chrome.extension.getBackgroundPage();
			}
			return bgPage;
		},
		/**
		 * @description Update settings
		 * @param {String} proprName
		 * @param {Object} proprVal
		 */
		updatePropr: function updatePropr(proprName, proprVal) {
			var settingsUpdated = {},
				customEvent,
				bgWindow;
			bgWindow = my.getBackgroundPage();
			if (bgWindow) {
				settingsUpdated[proprName] = proprVal;
				customEvent = new CustomEvent("setPropr", {
					detail: {
						sentFrom: "YtOptions",
						settings: settingsUpdated
					}
				});
				bgWindow.dispatchEvent(customEvent);
			}
		},
		/**
		 * 
		 * @description Update time value
		 * @param {Number} val
		 */
		updateTimeValue: function updateTimeValue(val) {
			var rangeValueEl = document.getElementById("imageTimeValue");
			rangeValueEl.textContent = val;
		},
		/**
		 * 
		 * @description Function executed when rotate time is changed
		 */
		onChangeRotateTime: function onChangeRotateTime() {
			var initTime;
			initTime = parseInt(this.value, 10);
			my.updateTimeValue(initTime);
			my.updatePropr(PROPR_IMAGE_TIME, initTime);
		},
		/**
		 * 
		 * @description Setup input range for time
		 * @param {Number} defaultVal
		 */
		setupInputRange: function setupInputRange(defaultVal) {
			var inputRangeEl,
				inputRangeAttr;
			inputRangeEl = document.getElementById("imageTime");
			inputRangeAttr = {
				"min": 300,
				"max": 5000,
				"step": 100
			};
			DyDomHelper.setAttr(inputRangeEl, inputRangeAttr);
			inputRangeEl.value = defaultVal;
			inputRangeEl.addEventListener("change", my.onChangeRotateTime, false);
			my.updateTimeValue(defaultVal);
		},
		/**
		 * 
		 * @description Function executed when view rating is changed
		 */
		onChangeViewRating: function onChangeViewRating() {
			my.updatePropr(PROPR_VIEW_RATING, this.value);
		},
		/**
		 * 
		 * @description Setup select view rating
		 * @param {Boolean} defaultVal
		 */
		setupViewRating: function setupViewRating(defaultVal) {
			var viewRatingEl;
			viewRatingEl = document.getElementById("enableRatingView");
			viewRatingEl.value = defaultVal.toString();
			viewRatingEl.addEventListener("change", my.onChangeViewRating, false);
		},
		/**
		 * 
		 * @description Get show icon element
		 * @returns {HTMLElement}
		 */
		getShowIconEl: function () {
			return document.getElementById("showIconFlag");
		},
		/**
		 * 
		 * @description Function executed when updateShowIcon event is triggered
		 * @param {CustomEvent} evt
		 */
		updateShowIcon: function updateShowIcon(evt) {
			var newValue,
				showIconEl;
			showIconEl = my.getShowIconEl();
			newValue = evt.detail.newValue.toString();
			showIconEl.value = newValue;
		},
		/**
		 * 
		 * @description Function executed when show icon flag is changed
		 */
		onChangeShowIcon: function onChangeShowIcon() {
			my.updatePropr(PROPR_SHOW_ICON, this.value);
		},
		/**
		 * 
		 * @description Setup select for show icon flag
		 * @param {Boolean} defaultVal
		 */
		setupShowIcon: function setupShowIcon(defaultVal) {
			var showIconEl;
			showIconEl = my.getShowIconEl();
			showIconEl.value = defaultVal.toString();
			showIconEl.addEventListener("change", my.onChangeShowIcon, false);
		},
		/**
		 * 
		 * @description Get hide icon confirm element
		 * @returns {HTMLElement}
		 */
		getHideIconConfirmEl: function () {
			return document.getElementById("hideIconConfirmFlag");
		},
		/**
		 * @description Function executed when updateHideIconConfirm event is triggered
		 * @param {CustomEvent} evt
		 */
		updateHideIconConfirm: function (evt) {
			var newValue,
				hideIconConfirmEl;
			hideIconConfirmEl = my.getHideIconConfirmEl();
			newValue = evt.detail.newValue.toString();
			hideIconConfirmEl.value = newValue;
		},
		/**
		 * 
		 * @description Function executed when show icon flag is changed
		 */
		onChangeHideIconConfirm: function onChangeHideIconConfirm() {
			my.updatePropr(PROPR_HIDE_ICON_CONFIRM, this.value);
		},
		/**
		 * @description Setup select for ask before hiding icon flag
		 * @param {Boolean} defaultVal
		 */
		setupHideIconConfirm: function setupHideIconConfirm(defaultVal) {
			var hideIconConfirmEl;
			hideIconConfirmEl = my.getHideIconConfirmEl();
			hideIconConfirmEl.value = defaultVal.toString();
			hideIconConfirmEl.addEventListener("change", my.onChangeHideIconConfirm, false);
		},
		/**
		 * 
		 * @description Attach events
		 */
		delegate: function () {
			window.addEventListener("updateShowIcon", my.updateShowIcon, false);
			window.addEventListener("updateHideIconConfirm", my.updateHideIconConfirm, false);
			window.addEventListener("initOptionsPage", my.initCb, false);
		},
		/**
		 * @description Callback function, called when settings are retrieved
		 * @param {CustomEvent} evt
		 */
		initCb: function initCb(evt) {
			var settings;
			settings = evt.detail.newValue;
			my.setupInputRange(settings[PROPR_IMAGE_TIME]);
			my.setupViewRating(settings[PROPR_VIEW_RATING]);
			my.setupShowIcon(settings[PROPR_SHOW_ICON]);
			my.setupHideIconConfirm(settings[PROPR_HIDE_ICON_CONFIRM]);
		},
		/**
		 * 
		 * @description Initialize options for site
		 */
		init: function () {
			var customEvent,
				bgWindow;
			//Listen for the messages
			my.delegate();
			bgWindow = my.getBackgroundPage();
			if (bgWindow) {
				customEvent = new CustomEvent("getPropr", {
					detail: {
						returnOn: "YtOptions",
						prop: "all"
					}
				});
				bgWindow.dispatchEvent(customEvent);
			}
		}
    };
	my.init();
}());