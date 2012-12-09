/**
 * @description Storage abstraction
 */
var YtStorage = (function () {
	var my,
		myStorageSync,
		myLocalStorage;
	/**
	 * @description Local storage
	 */
	myLocalStorage = {
		/**
		 * @description Get storage item
		 *   if item doesn't exist then set it to itemValue
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
		 * @param {String} itemValue
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
			 * @description Get storage item
			 *   if item doesn't exist then set it to itemValue
			 * @param {String} itemName
			 * @param {String} itemValue
			 */
			getItem: function getItem(itemName, itemValue, cbAtGet) {
				chrome.storage.sync.get(itemName, function (item) {
					if (cbAtGet) {
						cbAtGet(itemName, item[itemName]);
					}
				});
			},
			/**
			 * @description Set storage item
			 * @param {String} itemName
			 * @param {String} itemValue
			 */
			setItem: function setItem(itemName, itemValue) {
				var setObj = {};
				setObj[itemName] = itemValue;
				chrome.storage.sync.set(setObj);
			}
	};
	/**
	 * @description Initialize
	 */
	function init() {
		if (chrome && chrome.storage && chrome.storage.sync) {
			//useStorage = myStorageSync;
		} else {
			useStorage = localStorage;
		}
		useStorage = localStorage;
	}
	init();
	//return public methods
	return {
		getItem: useStorage.getItem,
		setItem: useStorage.setItem
	};
}());