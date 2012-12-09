/**
 * 
 * @description Logic for background page
 */
(function () {
	"use strict";
	/*global chrome, window, CustomEvent, YtSettings, PROPR_IMAGE_TIME, PROPR_SHOW_ICON, PROPR_HIDE_ICON_CONFIRM, PROPR_VIEW_RATING */
	var my;
	my = {
		/**
		 * 
		 * @description Run content script on provided tab
		 * @param {Number} tabId
		 */
		runContentScript: function runContentScript(tabId) {
			var contentScripts = chrome.app.getDetails().content_scripts,
				contentScriptsLength,
				i;
			if (contentScripts && contentScripts[0] && contentScripts[0].js) {
				contentScripts = contentScripts[0].js;
				contentScriptsLength = contentScripts.length;
				for (i = 0; i < contentScriptsLength; i = i + 1) {
					chrome.tabs.executeScript(tabId, {file: contentScripts[i]});
				}
			}
		},
		/**
		 * 
		 * @description Toggle extension icon from location
		 * @param {Boolean} isVisible
		 * @param {Number} tabId
		 */
		toggleIcon: function (isVisible, tabId) {
			isVisible = isVisible || false;
			if (isVisible) {
				chrome.pageAction.show(tabId);
			} else {
				chrome.pageAction.hide(tabId);
			}
		},
		/**
		 * 
		 * @description Function executed when extension settings changed
		 *              and we need to do changes on all tabs where YouTube is open
		 * @param {String} callMethod
		 * @param {Array} callParams
		 * @param {Boolean} runContentScript
		 */
		updateAllYoutubeTabs: function (callMethod, callParams, runContentScript) {
			chrome.windows.getAll({populate: true}, function (windows) {
				var windowsLength,
					windowIndex,
					tabIndex,
					tabs,
					tabsLength,
					tabUrl;
				runContentScript = runContentScript || false;
				windowsLength = windows.length;
				for (windowIndex = 0; windowIndex < windowsLength; windowIndex = windowIndex + 1) {
					tabs = windows[windowIndex].tabs;
					tabsLength = tabs.length;
					for (tabIndex = 0; tabIndex < tabsLength; tabIndex = tabIndex + 1) {
						tabUrl = tabs[tabIndex].url;
						//test if is youTube url
						if (tabUrl.match(/https?:\/\/(w{3}\.)?youtube\.com/i)) {
							callParams.push(tabs[tabIndex].id);
							my[callMethod].apply(null, callParams);
							callParams.pop(); //remove tabId that was previously added
							if (runContentScript) {
								my.runContentScript(tabs[tabIndex].id);
							}
						}
					}
				}
			});
		},
		/**
		 * 
		 * @description Open options page
		 */
		openOptions: function openOptions() {
			var url = chrome.extension.getURL(chrome.app.getDetails().options_page);
			chrome.tabs.getAllInWindow(null, function (tabs) {
				var i,
					tabsLength;
				tabsLength = tabs.length;
				for (i = 0; i < tabsLength; i = i + 1) {
					if (tabs[i].url === url) {
						chrome.tabs.update(tabs[i].id, {selected: true});
						return;
					}
				}
				chrome.tabs.create({selected: true, url: url});
			});
		},
		/**
		 * 
		 * @description Called when a message is passed.
		 * @param {String} request
		 * @param sender
		 * @param {Function} sendResponse
		 */
		onRequest: function onRequest(request, sender, sendResponse) {
			var rotateTime,
				settings,
				showIconFlag;
			if (request && typeof request === "string") {
				if (request === "openOptions") {
					my.openOptions();
				} else if (request === "getImageRotateTime") {
					rotateTime = YtSettings.getPropr(PROPR_IMAGE_TIME);
					sendResponse({rotateTime: rotateTime});
				} else if (request === "getSettings") {
					settings = YtSettings.getSettings();
					sendResponse({settings: settings});
				} else if (request === "showAction") {
					showIconFlag = YtSettings.getPropr(PROPR_SHOW_ICON);
					if (showIconFlag) {
						// Show the page action
						chrome.pageAction.show(sender.tab.id);
					}
					// Return nothing to let the connection be cleaned up.
					sendResponse({});
				}
			}
		},
		/**
		 * 
		 * @description Test if linkUrl is options page
		 * @param {String} linkUrl
		 * @returns {Boolean}
		 */
		isOptionPage: function (linkUrl) {
			var onPageFlag = false,
				appDetails,
				optionsPageReg;
			appDetails = chrome.app.getDetails();
			optionsPageReg = new RegExp(chrome.extension.getURL(appDetails.options_page), "i");
			if (linkUrl.match(optionsPageReg)) {
				onPageFlag = true;
			}
			return onPageFlag;
		},
		/**
		 * 
		 * @description Send event to options
		 * @param {String} eventName
		 * @param {String} newValue
		 */
		messageOptionsPageForUpdate: function (eventName, newValue) {
			var customEvent,
				extensionView,
				extensionViews,
				extensionViewsLength,
				i,
				isOptionPage;
			extensionViews = chrome.extension.getViews(); //get all views
			extensionViewsLength = extensionViews.length;
			for (i = 0; i < extensionViewsLength; i = i + 1) {
				extensionView = extensionViews[i];
				isOptionPage = my.isOptionPage(extensionView.location.href);
				if (isOptionPage) {
					customEvent = new CustomEvent(eventName, {
						detail: {
							newValue: newValue
						}
					});
					extensionView.dispatchEvent(customEvent);
				}
			}
		},
		/**
		 * 
		 * @description Send message to tabId for updating property name
		 *              with newValue
		 * @param {String} proprName
		 * @param {String} newValue
		 * @param {Number} tabId
		 */
		messageActionPageForUpdate: function (proprName, newValue, tabId) {
			chrome.tabs.sendMessage(tabId, {proprName: proprName, newValue: newValue});
		},
		/**
		 * 
		 * @description Function executed when a storage event is triggered
		 * @param {Event} evt
		 */
		storageHandler: function storageHandler(evt) {
			var changeOn,
				newValue,
				eventForOptionsPage,
				eventForActionPage,
				isOptionPage;
			eventForActionPage = false;
			changeOn = evt.key;
			newValue = evt.newValue;
			if (changeOn === PROPR_SHOW_ICON) {
				if (newValue === "false") {
					newValue = false;
				} else {
					newValue = true;
				}
				my.updateAllYoutubeTabs("toggleIcon", [newValue]);
				//my.onShowIconUpdate(newValue);
				eventForOptionsPage = "updateShowIcon";
			} else if (changeOn === PROPR_HIDE_ICON_CONFIRM) {
				eventForOptionsPage = "updateHideIconConfirm";
			} else if (changeOn === PROPR_IMAGE_TIME) {
				eventForActionPage = true;
			} else if (changeOn === PROPR_VIEW_RATING) {
				eventForActionPage = true;
			}
			if (eventForOptionsPage) {
				//now test if event was sent from options page
				isOptionPage = my.isOptionPage(evt.url);
				if (!isOptionPage) {
					my.messageOptionsPageForUpdate(eventForOptionsPage, newValue);
				}
			}
			if (eventForActionPage) {
				my.updateAllYoutubeTabs("messageActionPageForUpdate", [changeOn, newValue]);
			}
		},
		/**
		 * 
		 * @description Attach events
		 */
		delegate: function () {
			//set storage event listener
			window.addEventListener("storage", my.storageHandler, false);
			//Listen for the content script to send a message to the background page.
			chrome.extension.onMessage.addListener(my.onRequest);
			//listener for extension install/update
			chrome.runtime.onInstalled.addListener(function(details) {
				var iconVisible;
				iconVisible = YtSettings.getPropr(PROPR_SHOW_ICON);
				my.updateAllYoutubeTabs("toggleIcon", [iconVisible], true);
			});
		},
		/**
		 * @description Initialize background page
		 */
		init: function () {
			my.delegate();
		}
	};
	my.init();
}());