/**
 * @description YouTube Video Preview Settings
 */
var YtSettings = (function () {
	"use strict";
	/*global localStorage, PROPR_IMAGE_TIME, PROPR_SHOW_ICON, PROPR_HIDE_ICON_CONFIRM, PROPR_VIEW_RATING */
	var my,
		publicMethods;
	my = {
		initialized: false,
		/**
		 * 
		 * @description Application properties
		 */
		propr: {},
		/**
		 * 
		 * @description Filter boolean value
		 * @param {String} val
		 * @returns {Boolean}
		 */
		filterBool: function filterBool(val) {
			if (val === false || val === "false") {
				val = false;
			} else {
				val = true;
			}
			return val;
		},
		/**
		 * 
		 * @description Filter property
		 * @param proprName
		 * @param proprVal
		 * @returns
		 */
		filterPropr: function (proprName, proprVal) {
			var boolPropr,
				intPropr,
				proprNameIndex;
			if (proprName) {
				boolPropr = [PROPR_VIEW_RATING, PROPR_SHOW_ICON, PROPR_HIDE_ICON_CONFIRM];
				proprNameIndex = boolPropr.indexOf(proprName);
				if (proprNameIndex > -1) {
					proprVal = my.filterBool(proprVal);
				} else {
					intPropr = [PROPR_IMAGE_TIME];
					proprNameIndex = intPropr.indexOf(proprName);
					if (proprNameIndex > -1) {
						proprVal = parseInt(proprVal, 10);
						if (isNaN(proprVal)) {
							proprVal = my.propr[proprName];
						}
					}
				}
			}
			return proprVal;
		},
		/**
		 * 
		 * @description Set property to localstorage
		 * @param {String} proprName
		 * @param {Object} proprVal
		 */
		setStoredProp: function (proprName, proprVal) {
			localStorage[proprName] = proprVal;
		},
		/**
		 * 
		 * @description Get stored property from localStorage
		 * @param {String} proprName
		 * @returns {Object}
		 */
		getStoredPropr: function (proprName) {
			var proprVal;
			proprVal = localStorage[proprName];
			if (proprVal === undefined) {
				if (my.initialized) {
					proprVal = my.getPropr(proprName);
				} else {
					proprVal = my.propr[proprName];
				}
				my.setStoredProp(proprName, proprVal);
			} else {
				proprVal = my.filterPropr(proprName, proprVal);
			}
			return proprVal;
		},
		/**
		 * 
		 * @description Set properties
		 * @param {String} proprName
		 * @param {String} proprVal
		 * @returns {Object}
		 */
		setPropr: function (proprName, proprVal) {
			proprVal = my.filterPropr(proprName, proprVal);
			my.propr[proprName] = proprVal;
			my.setStoredProp(proprName, proprVal);
			return proprVal;
		},
		/**
		 * 
		 * @description Initialize settings
		 */
		init: function () {
			var proprName;
			my.propr[PROPR_IMAGE_TIME] = 1000;
			my.propr[PROPR_VIEW_RATING] = true;
			my.propr[PROPR_SHOW_ICON] = true;
			my.propr[PROPR_HIDE_ICON_CONFIRM] = true;
			for (proprName in my.propr) {
				if (my.propr.hasOwnProperty(proprName)) {
					my.propr[proprName] = my.getStoredPropr(proprName);
				}
			}
		},
		/**
		 * 
		 * @description Test class initialized and if not initialize it
		 */
		testInitialized: function () {
			if (!my.initialized) {
				my.init();
			}
			my.initialized = true;
		},
		/**
		 * 
		 * @description Get properties
		 * @param {String} proprName
		 * @returns {Object}
		 */
		getPropr: function (proprName) {
			my.testInitialized();
			if (proprName) {
				return my.propr[proprName];
			}
			return my.propr;
		},
		/**
		 * 
		 * @description Get all properties
		 * @returns {Object}
		 */
		getSettings: function () {
			my.testInitialized();
			return my.propr;
		}
	};
	my.testInitialized();
	//public
	publicMethods = {
		getSettings: my.getSettings,
		getPropr: my.getPropr,
		setPropr: my.setPropr
	};
	return publicMethods;
}());
