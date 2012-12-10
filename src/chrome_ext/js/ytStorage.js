/**
 * @description Storage abstraction
 */
var YtStorage = (function () {
	"use strict";
	/*global localStorage, chrome */
	var my,
		myStorageSync,
		myLocalStorage,
		useStorage;
	/**
	 * @description Local storage
	 */
	myLocalStorage = {
		/**
		 * @description Get all items from storage
		 * @param {Array} itemNames
		 * @param {Function} cbFn
		 */
		getAll: function getAll(itemNames, cbFn) {
			var itemName,
				items,
				itemNamesLength,
				i;
			items = {};
			itemNamesLength = itemNames.length;
			for (i = 0; i < itemNamesLength; i = i + 1) {
				itemName = itemNames[i];
				if (localStorage.hasOwnPropery(itemName)) {
					items[itemName] = localStorage[itemName];
				}
			}
			if (cbFn) {
				cbFn(items);
			}
		},
		/**
		 * @description Get storage item
		 * @param {String} itemName
		 * @param {Function} cbAtGet
		 */
		getItem: function getItem(itemName, cbAtGet) {
			var proprVal;
			proprVal = localStorage[itemName];
			if (cbAtGet) {
				cbAtGet(itemName, proprVal);
			}
		},
		/**
		 * 
		 * @description Set storage item
		 * @param {String} itemName
		 * @param {Object} itemValue
		 * @param {Function} cbAtSet
		 */
		setItem: function setItem(itemName, itemValue, cbAtSet) {
			localStorage.setItem(itemName, itemValue);
			if (cbAtSet) {
				cbAtSet(itemName, itemValue);
			}
		}
	};
	/**
	 * @description Chrome storage sync
	 */
	myStorageSync = {
		/**
		 * @description Get all items from storage
		 * @param {Array} itemNames
		 * @param {Function} cbFn
		 */
		getAll: function getAll(itemNames, cbFn) {
			chrome.storage.sync.get(itemNames, function (items) {
				if (cbFn) {
					cbFn(items);
				}
			});
		},
		/**
		 * @description Get storage item
		 * @param {String} itemName
		 * @param {Function} cbAtGet
		 */
		getItem: function getItem(itemName, cbAtGet) {
			chrome.storage.sync.get(itemName, function (item) {
				if (cbAtGet) {
					cbAtGet(itemName, item[itemName]);
				}
			});
		},
		/**
		 * @description Set storage item
		 * @param {String} itemName
		 * @param {Object} itemValue
		 * @param {Function} cbAtSet
		 */
		setItem: function setItem(itemName, itemValue, cbAtSet) {
			var setObj = {};
			setObj[itemName] = itemValue;
			chrome.storage.sync.set(setObj);
			if (cbAtSet) {
				cbAtSet(itemName, itemValue);
			}
		}
	};
	/**
	 * @description Initialize
	 */
	function init() {
		if (chrome && chrome.storage && chrome.storage.sync) {
			useStorage = myStorageSync;
		} else {
			useStorage = localStorage;
		}
	}
	init();
	//return public methods
	return {
		getAll: useStorage.getAll,
		getItem: useStorage.getItem,
		setItem: useStorage.setItem
	};
}());