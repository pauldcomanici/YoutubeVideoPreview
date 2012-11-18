/**
 * @description Class for Options page 
 */
(function () {
    "use strict";
	/*global window, document, chrome, DyDomHelper, YtSettings, YtProprImageTime, YtProprViewRating, YtProprShowIcon, YtProprHideIconConfirm */
    var my = {
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
			var initTime,
				newTime;
			initTime = parseInt(this.value, 10);
			newTime = YtSettings.setPropr(YtProprImageTime, initTime);
			my.updateTimeValue(newTime);
		},
		/**
		 * 
		 * @description Setup input range for time
		 */
		setupInputRange: function setupInputRange() {
			var inputRangeEl,
				inputRangeAttr,
				imageTime;
			inputRangeEl = document.getElementById("imageTime");
			inputRangeAttr = {
				"min": 300,
				"max": 5000,
				"step": 100
			};
			DyDomHelper.setAttr(inputRangeEl, inputRangeAttr);
			imageTime = YtSettings.getPropr(YtProprImageTime);
			inputRangeEl.value = imageTime;
			inputRangeEl.addEventListener("change", my.onChangeRotateTime, false);
			my.updateTimeValue(imageTime);
		},
		/**
		 * 
		 * @description Function executed when view rating is changed
		 */
		onChangeViewRating: function onChangeViewRating() {
			YtSettings.setPropr(YtProprViewRating, this.value);
		},
		/**
		 * 
		 * @description Setup select view rating
		 */
		setupViewRating: function setupViewRating() {
			var viewRatingEl;
			viewRatingEl = document.getElementById("enableRatingView");
			viewRatingEl.value = YtSettings.getPropr(YtProprViewRating);
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
		 * @param {Event} evt
		 */
		updateShowIcon: function (evt) {
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
			YtSettings.setPropr(YtProprShowIcon, this.value);
		},
		/**
		 * 
		 * @description Setup select for show icon flag
		 */
		setupShowIcon: function setupShowIcon() {
			var showIconEl;
			showIconEl = my.getShowIconEl();
			showIconEl.value = YtSettings.getPropr(YtProprShowIcon).toString();
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
		 * @param {Event} evt
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
			YtSettings.setPropr(YtProprHideIconConfirm, this.value);
		},
		/**
		 * @description Setup select for ask before hiding icon flag
		 */
		setupHideIconConfirm: function setupHideIconConfirm() {
			var hideIconConfirmEl;
			hideIconConfirmEl = my.getHideIconConfirmEl();
			hideIconConfirmEl.value = YtSettings.getPropr(YtProprHideIconConfirm).toString();
			hideIconConfirmEl.addEventListener("change", my.onChangeHideIconConfirm, false);
		},
		/**
		 * 
		 * @description Attach events
		 */
		delegate: function () {
			window.addEventListener("updateShowIcon", my.updateShowIcon, false);
			window.addEventListener("updateHideIconConfirm", my.updateHideIconConfirm, false);
		},
		/**
		 * 
		 * @description Initialize options for site
		 */
		init: function () {
			my.delegate();
			my.setupInputRange();
			my.setupViewRating();
			my.setupShowIcon();
			my.setupHideIconConfirm();
		}
    };
	my.init();
}());